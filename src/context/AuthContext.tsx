// src/contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  User,
  UserCredential,
} from "firebase/auth";
import { auth, db } from "../firebase";
import {
  saveUserData,
  getUserData,
  updateUserData,
  getUserRole,
  changeUserRole,
} from "../service/firebase/user.service";
import { UserRole, UserData } from "../types/user.types";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// Context 타입 정의 확장 - 사용자 역할 정보 추가
interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  userRole: UserRole | null;
  loading: boolean;
  signup: (
    email: string,
    password: string,
    role: UserRole,
    additionalData?: Partial<UserData>
  ) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (
    user: User,
    data: { displayName?: string; photoURL?: string }
  ) => Promise<void>;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
  changeUserRole: (
    newRole: UserRole,
    additionalData?: Partial<UserData>
  ) => Promise<void>;
  isSilverCourier: () => boolean;
}

// Context 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Provider Props 타입
interface AuthProviderProps {
  children: ReactNode;
}

// 로그인 성공 후 사용자 계정 상태 확인
const checkAccountStatus = async (user: User) => {
  try {
    console.log("[checkAccountStatus] 계정 상태 확인 시작", user.uid);

    // 1. 먼저 사용자의 이메일로 역할 확인
    const emailUsersRef = doc(
      db,
      "emailUsers",
      user.email?.toLowerCase() || ""
    );
    const emailSnapshot = await getDoc(emailUsersRef);

    if (emailSnapshot.exists()) {
      const userData = emailSnapshot.data();
      const userRole = userData.role;
      console.log("[checkAccountStatus] 사용자 역할:", userRole);

      // 2. 배송파트너인 경우 승인 상태 확인
      if (userRole === "courier") {
        console.log("[checkAccountStatus] 배송파트너 승인 상태 확인");
        const courierRef = doc(db, "couriers", user.uid);
        const courierSnapshot = await getDoc(courierRef);

        if (courierSnapshot.exists()) {
          const courierData = courierSnapshot.data();
          console.log(
            "[checkAccountStatus] 배송파트너 상태:",
            courierData.status
          );

          // courierData.status 외에 isApproved도 함께 확인
          const isApproved = courierData.isApproved === true;
          const hasApprovedStatus = courierData.status === "approved";

          console.log("[checkAccountStatus] 승인 상태 확인:", {
            isApproved,
            hasApprovedStatus,
            status: courierData.status,
          });

          // 두 조건 중 하나라도 승인을 의미하면 로그인 허용
          if (isApproved || hasApprovedStatus) {
            console.log("[checkAccountStatus] 배송파트너 승인 확인됨");
            return true;
          }

          // 승인되지 않은 배송파트너는 로그인 불가
          if (
            courierData.status === "unapproved" ||
            courierData.isApproved === false
          ) {
            await signOut(auth);
            throw new Error(
              "배송파트너 계정이 아직 승인되지 않았습니다. 관리자의 승인을 기다려주세요."
            );
          }

          // 거부된 배송파트너도 로그인 불가
          if (courierData.status === "rejected") {
            await signOut(auth);
            throw new Error(
              "배송파트너 신청이 거절되었습니다. 자세한 내용은 이메일을 확인해주세요."
            );
          }

          // status가 approved가 아닌 다른 상태인 경우 로그인 불가
          await signOut(auth);
          throw new Error(
            "배송파트너 계정에 문제가 있습니다. 고객센터에 문의하세요."
          );
        } else {
          // couriers 컬렉션에 문서가 없는 경우 (비정상적인 경우)
          await signOut(auth);
          throw new Error(
            "배송파트너 계정 정보를 찾을 수 없습니다. 회원가입을 다시 진행해주세요."
          );
        }
      } else if (userRole === "regular" || userRole === "normal") {
        // 3. 일반 사용자인 경우 users 컬렉션에 문서가 있는지만 확인
        // 일반 사용자는 더 관대한 검사를 수행 (회원가입 오류 방지)
        console.log("[checkAccountStatus] 일반 사용자 확인");
        const userRef = doc(db, "users", user.uid);

        try {
          const userSnapshot = await getDoc(userRef);

          // users 컬렉션에 문서가 없어도 계정 생성 직후에는 일시적으로 없을 수 있으므로
          // 오류를 발생시키지 않고 경고만 출력
          if (!userSnapshot.exists()) {
            console.warn(
              "[checkAccountStatus] 사용자 문서가 없습니다. 회원가입이 완전히 완료되지 않았을 수 있습니다.",
              user.uid
            );
          }
        } catch (err) {
          console.error("[checkAccountStatus] 사용자 문서 조회 오류:", err);
          // 오류가 발생해도 로그인은 허용
        }
      }
    } else {
      // emailUsers에 문서가 없더라도 로그인 허용 (첫 로그인 또는 마이그레이션 케이스를 위함)
      console.warn(
        "[checkAccountStatus] 이메일 문서가 없습니다. 신규 회원가입 또는 소셜 로그인일 수 있습니다.",
        user.email
      );

      // 이메일이 있는 경우 자동으로 emailUsers 문서 생성
      if (user.email) {
        try {
          await setDoc(doc(db, "emailUsers", user.email.toLowerCase()), {
            userId: user.uid,
            role: "regular", // 기본값은 일반 사용자
            createdAt: serverTimestamp(),
          });
          console.log("[checkAccountStatus] 자동으로 이메일 문서 생성됨");
        } catch (e) {
          console.error("[checkAccountStatus] 이메일 문서 자동 생성 실패:", e);
        }
      }
    }

    console.log("[checkAccountStatus] 계정 상태 확인 완료");
    return true;
  } catch (error) {
    console.error("계정 상태 확인 중 오류:", error);
    throw error;
  }
};

// Provider 구현 - 역할 지원 추가
export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // 확장된 회원가입 함수 - 역할에 따라 다른 컬렉션에 저장
  const signup = async (
    email: string,
    password: string,
    role: UserRole = UserRole.REGULAR,
    additionalData: Partial<UserData> = {}
  ): Promise<UserCredential> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 회원가입 후 사용자 데이터 저장 (역할에 따라 컬렉션 결정)
      await saveUserData(userCredential.user, additionalData, role);

      return userCredential;
    } catch (error) {
      console.error("회원가입 오류:", error);
      throw error;
    }
  };

  // 로그인 함수에 계정 상태 확인 로직 추가
  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 로그인 성공 후 계정 상태 확인
      await checkAccountStatus(userCredential.user);

      return userCredential;
    } catch (error) {
      console.error("로그인 오류:", error);

      // 사용자 지정 오류 메시지가 있는 경우 그대로 전달
      if (error instanceof Error) {
        throw error;
      }

      // 기타 Firebase 오류
      throw error;
    }
  };

  // 로그아웃 함수
  const logout = () => signOut(auth);

  // 비밀번호 재설정 함수
  const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);

  // 사용자 프로필 업데이트 함수
  const updateUserProfile = async (
    user: User,
    data: { displayName?: string; photoURL?: string }
  ) => {
    await updateProfile(user, data);

    // Firestore의 사용자 정보도 업데이트
    if (userRole) {
      await updateUserData(user.uid, userRole, data);
    }
  };

  // 사용자 데이터 업데이트 함수
  const updateUserDataFn = async (data: Partial<UserData>) => {
    if (!currentUser || !userRole) {
      throw new Error("로그인이 필요합니다");
    }

    await updateUserData(currentUser.uid, userRole, data);

    // 로컬 상태도 업데이트
    if (userData) {
      setUserData({ ...userData, ...data });
    }
  };

  // 사용자 역할 변경 함수
  const changeUserRoleFn = async (
    newRole: UserRole,
    additionalData: Partial<UserData> = {}
  ) => {
    if (!currentUser || !userRole) {
      throw new Error("로그인이 필요합니다");
    }

    await changeUserRole(currentUser.uid, userRole, newRole, additionalData);

    // 역할 변경 후 로컬 상태 업데이트
    setUserRole(newRole);

    // 사용자 데이터 다시 로드
    const newUserData = await getUserData(currentUser.uid, newRole);
    if (newUserData) {
      setUserData(newUserData);
    }
  };

  // 실버택배 파트너 여부 확인 함수
  const isSilverCourier = () => userRole === UserRole.SILVER_COURIER;

  // 인증 상태 변화 감지 및 사용자 데이터 로드
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          try {
            // 회원가입 직후 상태 확인을 위한 지연
            // Firestore에 데이터가 저장되는 시간을 고려
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // 로그인 시 계정 상태 확인
            try {
              await checkAccountStatus(user);
            } catch (statusError) {
              console.warn(
                "계정 상태 확인 중 문제가 발생했으나 로그인은 계속 진행합니다:",
                statusError
              );
              // 계정 상태 확인 오류가 발생해도 로그인 처리 계속 진행
            }

            // 사용자 역할 가져오기 (어느 컬렉션에 있는지)
            let role;
            try {
              role = await getUserRole(user.uid);
            } catch (roleError) {
              console.warn("사용자 역할 가져오기 실패:", roleError);
              // 역할을 가져올 수 없는 경우 기본 역할 설정
              role = UserRole.REGULAR;
            }

            setUserRole(role);

            // 역할에 맞는 컬렉션에서 사용자 데이터 가져오기
            if (role) {
              try {
                const data = await getUserData(user.uid, role);
                setUserData(data);
              } catch (dataError) {
                console.warn("사용자 데이터 로드 실패:", dataError);
                // 데이터를 가져올 수 없어도 기본 사용자 정보 유지
              }
            }

            setCurrentUser(user);
          } catch (error) {
            // 치명적인 오류가 아닌 경우 로그인 유지
            console.error("사용자 데이터 로드 중 오류 발생:", error);

            // 실패해도 사용자는 설정 (기본 정보만이라도 유지)
            setCurrentUser(user);

            // 배송파트너 계정이 승인되지 않은 경우 알림
            if (
              error instanceof Error &&
              error.message.includes("승인되지 않았습니다")
            ) {
              await signOut(auth);
              setCurrentUser(null);
              setUserData(null);
              setUserRole(null);
              alert(error.message);
            }
          }
        } else {
          setCurrentUser(null);
          setUserData(null);
          setUserRole(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userData,
    userRole,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    updateUserData: updateUserDataFn,
    changeUserRole: changeUserRoleFn,
    isSilverCourier,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
