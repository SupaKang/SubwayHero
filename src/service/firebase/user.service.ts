// src/service/firebase/user.service.ts
import { FirebaseError } from "firebase/app";
import { User } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import {
  UserRole,
  RegularUserData,
  SilverUserData,
  UserData,
} from "../../types/user.types";

// 컬렉션 경로 상수 - 사용자 타입별로 다른 컬렉션 사용
const USERS_COLLECTION = "users";
const COURIERS_COLLECTION = "couriers";
const ADMINS_COLLECTION = "admins";

/**
 * 사용자 역할에 따라 적절한 컬렉션 경로 반환
 */
export const getUserCollectionPath = (role: UserRole): string => {
  switch (role) {
    case UserRole.SILVER_COURIER:
      return COURIERS_COLLECTION;
    case UserRole.ADMIN:
      return ADMINS_COLLECTION;
    case UserRole.REGULAR:
    default:
      return USERS_COLLECTION;
  }
};

/**
 * 사용자 역할에 따라 사용자 정보를 적절한 컬렉션에 저장
 */
export const saveUserData = async (
  user: User,
  additionalData: Partial<UserData> = {},
  role: UserRole = UserRole.REGULAR
): Promise<void> => {
  try {
    const collectionPath = getUserCollectionPath(role);

    // 기본 사용자 데이터 생성
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || additionalData.displayName || "사용자",
      photoURL: user.photoURL || additionalData.photoURL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      role,
      ...additionalData,
    };

    // 배송파트너인 경우 추가 필드 설정
    if (role === UserRole.SILVER_COURIER) {
      userData.isApproved = false; // 기본적으로 승인 대기 상태
      userData.approvalStatus = "pending"; // pending, approved, rejected
      userData.isVerified = false;
      userData.availableAreas = additionalData.availableAreas || [];
      userData.availableTime = additionalData.availableTime || [];
      userData.deliveryCount = 0;
      userData.rating = 0;
    }

    await setDoc(doc(db, collectionPath, user.uid), userData);
  } catch (error) {
    console.error("사용자 정보 저장 오류:", error);
    throw error;
  }
};

/**
 * 사용자 정보 업데이트 (역할에 맞는 컬렉션에)
 */
export const updateUserData = async (
  uid: string,
  role: UserRole,
  data: Partial<UserData>
): Promise<void> => {
  try {
    const collectionPath = getUserCollectionPath(role);
    const userRef = doc(db, collectionPath, uid);

    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("사용자 정보 업데이트 오류:", error);
    throw error;
  }
};

/**
 * 사용자 정보 가져오기 (역할에 따라 적절한 컬렉션에서)
 */
export const getUserData = async (
  uid: string,
  role?: UserRole
): Promise<UserData | null> => {
  try {
    // 역할을 모를 경우 모든 컬렉션 검색
    if (!role) {
      // 일반 사용자 컬렉션에서 검색
      const regularUserDoc = await getDoc(doc(db, USERS_COLLECTION, uid));
      if (regularUserDoc.exists()) {
        return regularUserDoc.data() as RegularUserData;
      }

      // 배송파트너 컬렉션에서 검색
      const courierUserDoc = await getDoc(doc(db, COURIERS_COLLECTION, uid));
      if (courierUserDoc.exists()) {
        return courierUserDoc.data() as SilverUserData;
      }

      // 관리자 컬렉션에서 검색
      const adminUserDoc = await getDoc(doc(db, ADMINS_COLLECTION, uid));
      if (adminUserDoc.exists()) {
        return adminUserDoc.data() as UserData;
      }

      return null;
    }

    // 역할을 알고 있는 경우 해당 컬렉션에서만 검색
    const collectionPath = getUserCollectionPath(role);
    const userDoc = await getDoc(doc(db, collectionPath, uid));

    if (!userDoc.exists()) {
      return null;
    }

    return userDoc.data() as UserData;
  } catch (error) {
    console.error("사용자 정보 조회 오류:", error);
    throw error;
  }
};

/**
 * 사용자 역할 변경 (컬렉션 간 이동)
 */
export const changeUserRole = async (
  uid: string,
  currentRole: UserRole,
  newRole: UserRole,
  additionalData: Partial<UserData> = {}
): Promise<void> => {
  try {
    // 현재 사용자 데이터 가져오기
    const userData = await getUserData(uid, currentRole);
    if (!userData) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    // 새 역할에 맞는 사용자 데이터 준비
    const newUserData = {
      ...userData,
      role: newRole,
      updatedAt: serverTimestamp(),
      ...additionalData,
    };

    // 새 컬렉션에 사용자 데이터 저장
    const newCollection = getUserCollectionPath(newRole);
    await setDoc(doc(db, newCollection, uid), newUserData);

    // 이전 컬렉션에서 사용자 데이터 삭제
    const currentCollection = getUserCollectionPath(currentRole);
    await deleteUserData(uid, currentRole);
  } catch (error) {
    console.error("사용자 역할 변경 오류:", error);
    throw error;
  }
};

/**
 * 사용자 정보 삭제
 */
export const deleteUserData = async (
  uid: string,
  role: UserRole
): Promise<void> => {
  try {
    const collectionPath = getUserCollectionPath(role);
    await setDoc(
      doc(db, collectionPath, uid),
      { deleted: true, updatedAt: serverTimestamp() },
      { merge: true }
    );
  } catch (error) {
    console.error("사용자 정보 삭제 오류:", error);
    throw error;
  }
};

/**
 * 사용자 역할 확인 (어느 컬렉션에 있는지 확인)
 */
export const getUserRole = async (uid: string): Promise<UserRole | null> => {
  try {
    // 일반 사용자 컬렉션에서 확인
    const regularUserDoc = await getDoc(doc(db, USERS_COLLECTION, uid));
    if (regularUserDoc.exists()) {
      return UserRole.REGULAR;
    }

    // 배송 파트너 컬렉션에서 확인
    const courierUserDoc = await getDoc(doc(db, COURIERS_COLLECTION, uid));
    if (courierUserDoc.exists()) {
      return UserRole.SILVER_COURIER;
    }

    // 관리자 컬렉션에서 확인
    const adminUserDoc = await getDoc(doc(db, ADMINS_COLLECTION, uid));
    if (adminUserDoc.exists()) {
      return UserRole.ADMIN;
    }

    return null;
  } catch (error) {
    console.error("사용자 역할 확인 오류:", error);
    throw error;
  }
};
