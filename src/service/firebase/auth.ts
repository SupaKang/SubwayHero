// src/service/firebase/auth.ts
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  UserCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase";

// 구글 로그인
export const signInWithGoogle = async (): Promise<UserCredential> => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

// 소셜 로그인 후 사용자 정보 저장
export const createOrUpdateUser = async (
  userCredential: UserCredential,
  role: string = "normal"
) => {
  const user = userCredential.user;
  const userRef = doc(db, "users", user.uid);

  // 사용자가 이미 등록되어 있는지 확인
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    // 새 사용자 정보 저장
    await setDoc(userRef, {
      name: user.displayName || "",
      email: user.email || "",
      phone: user.phoneNumber || "",
      role,
      createdAt: serverTimestamp(),
      isApproved: role === "normal", // 일반회원은 자동승인
    });

    // 이메일 사용 기록
    if (user.email) {
      await setDoc(doc(db, "emailUsers", user.email.toLowerCase()), {
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
    }
  }

  return user;
};
