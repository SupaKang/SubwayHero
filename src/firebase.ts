// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase 구성 정보 (환경변수로 관리하는 것이 보안상 더 좋습니다)
const firebaseConfig = {
  apiKey: "AIzaSyCoT-yjgLffuWaVEti8D_2rNmBQQvGPN3g",
  authDomain: "subwayhero-b13ec.firebaseapp.com",
  projectId: "subwayhero-b13ec",
  storageBucket: "subwayhero-b13ec.firebasestorage.app", // 실제 Storage 버킷 이름으로 수정
  messagingSenderId: "424374052573",
  appId: "1:424374052573:web:3c0c55f8b8c94310db9d34",
  measurementId: "G-Y2TG0GTHFT",
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firebase 서비스 내보내기
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// CORS 문제 해결을 위한 Storage 설정
// Firebase Storage에 요청할 때 자동으로 토큰을 포함하도록 설정
storage.maxOperationRetryTime = 30000; // 30 seconds
storage.maxUploadRetryTime = 60000; // 60 seconds

// 개발 중에 Firebase Storage 오류 디버깅용 로깅
console.log("Firebase Storage 초기화:", {
  storageBucket: firebaseConfig.storageBucket,
  storageInstance: storage,
});

export default app;
