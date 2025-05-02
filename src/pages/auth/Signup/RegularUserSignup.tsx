import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  fetchSignInMethodsForEmail,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../firebase";

const RegularUserSignup = () => {
  // 상태 관리
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneVerificationCode, setPhoneVerificationCode] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [phoneVerificationError, setPhoneVerificationError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 이메일 변경 핸들러
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailVerified(false);
    setEmailError("");
  };

  // 이메일 중복 확인 함수
  const checkEmailDuplicate = async () => {
    // 이메일 형식 검증
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError("유효한 이메일 주소를 입력해주세요");
      setEmailVerified(false);
      return;
    }

    setEmailError("");
    setEmailVerified(false);
    setEmailChecking(true);

    try {
      // 1. Firebase Authentication의 fetchSignInMethodsForEmail 메서드 사용
      console.log("이메일 중복 확인 시작:", email);
      const methods = await fetchSignInMethodsForEmail(auth, email);
      console.log("이메일 확인 결과 - 로그인 방법:", methods);

      // 로그인 방법이 있다면 (배열 길이 > 0) 이미 가입된 이메일
      if (methods && methods.length > 0) {
        setEmailError("이미 사용 중인 이메일입니다");
        console.log("이메일 중복 검증 결과: 사용 중인 이메일");
        return;
      }

      // 2. 추가로 Firestore의 emailUsers 컬렉션에서도 확인
      try {
        const emailUsersRef = doc(db, "emailUsers", email.toLowerCase());
        const emailSnapshot = await getDoc(emailUsersRef);

        if (emailSnapshot.exists()) {
          setEmailError("이미 사용 중인 이메일입니다");
          console.log("Firestore 검증 결과: 사용 중인 이메일");
          return;
        }

        // 두 검증을 모두 통과하면 사용 가능한 이메일
        console.log("이메일 중복 검증 완료: 사용 가능한 이메일");
        setEmailVerified(true);
      } catch (firestoreError) {
        console.error("Firestore 이메일 확인 오류:", firestoreError);
        // Firestore 오류가 발생하더라도 Auth 확인이 성공했으면 계속 진행
        setEmailVerified(true);
      }
    } catch (error) {
      console.error("이메일 확인 오류:", error);

      // 오류 코드별 처리
      if (error.code === "auth/invalid-email") {
        setEmailError("유효하지 않은 이메일 형식입니다");
      } else if (error.code === "auth/network-request-failed") {
        setEmailError(
          "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요."
        );
      } else {
        setEmailError(
          `이메일 확인 중 오류가 발생했습니다 (${
            error.code || "알 수 없는 오류"
          })`
        );
      }
    } finally {
      setEmailChecking(false);
    }
  };

  // 비밀번호 일치 검증
  const validatePassword = () => {
    // 비밀번호 복잡성 검사 추가
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < 8) {
      setPasswordError("비밀번호는 8자 이상이어야 합니다");
      return false;
    }

    if (!(hasLetter && hasNumber && hasSpecial)) {
      setPasswordError(
        "비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다"
      );
      return false;
    }

    if (password !== confirmPassword) {
      setPasswordError("비밀번호가 일치하지 않습니다");
      return false;
    }

    setPasswordError("");
    return true;
  };

  // 전화번호 변경 핸들러
  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
    setPhoneVerified(false);
    setPhoneError("");
    setShowPhoneVerification(false);
  };

  // 전화번호 인증번호 요청 함수
  const requestPhoneVerification = () => {
    // 전화번호 형식 검증 (한국 전화번호 형식: 010-1234-5678)
    const phoneRegex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
    if (!phone || !phoneRegex.test(phone)) {
      setPhoneError("유효한 전화번호를 입력해주세요 (예: 010-1234-5678)");
      return;
    }

    setPhoneError("");

    // Firebase에서는 전화번호 인증을 위해 Firebase Auth phone verification 사용 가능
    // 여기서는 간단한 시뮬레이션만 구현

    // 인증번호 입력 폼 표시
    setShowPhoneVerification(true);

    // 실제 구현에서는 Firebase Auth를 통해 SMS 발송
    console.log("전화번호 인증 요청:", phone);
  };

  // 전화번호 인증번호 확인 함수
  const verifyPhoneCode = () => {
    if (!phoneVerificationCode || phoneVerificationCode.length !== 6) {
      setPhoneVerificationError("6자리 인증번호를 입력해주세요");
      return;
    }

    setPhoneVerificationError("");

    // 실제 구현에서는 Firebase Auth를 통해 인증코드 검증
    console.log("인증번호 확인 요청:", phoneVerificationCode);

    // 데모용 인증코드 검증
    if (phoneVerificationCode === "123456") {
      setPhoneVerified(true);
      setPhoneVerificationError("");
    } else {
      setPhoneVerificationError("인증번호가 일치하지 않습니다");
    }
  };

  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      // 이메일 중복 확인 여부 체크
      if (!emailVerified) {
        setFormError("이메일 중복 확인을 완료해주세요");
        setIsSubmitting(false);
        return;
      }

      // 비밀번호 검증
      if (!validatePassword()) {
        setIsSubmitting(false);
        return;
      }

      // 전화번호 인증 여부 체크
      if (!phoneVerified) {
        setFormError("전화번호 인증을 완료해주세요");
        setIsSubmitting(false);
        return;
      }

      // 약관 동의 검증
      if (!agreeTerms) {
        setFormError("이용약관 및 개인정보처리방침에 동의해주세요");
        setIsSubmitting(false);
        return;
      }

      console.log("회원가입 처리 시작...");

      // Firebase Authentication으로 사용자 생성
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      console.log("Firebase 사용자 생성 완료:", user.uid);

      // 사용자 프로필 업데이트 (이름 설정)
      await updateProfile(user, {
        displayName: name,
      });

      console.log("사용자 프로필 업데이트 완료");

      // 기본 사용자 정보 객체 생성
      const baseUserData = {
        name,
        email: email.toLowerCase(),
        phone,
        role: "regular", // "normal"에서 "regular"로 변경
        createdAt: serverTimestamp(),
        registrationDate: new Date().toISOString(),
        isApproved: true, // 일반회원은 자동승인
        agreeTerms, // 약관 동의 여부 저장
        phoneVerified, // 전화번호 인증 여부
        status: "active", // 계정 상태
        lastLoginAt: serverTimestamp(), // 마지막 로그인 시간
        // 시스템 정보
        system: {
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastPasswordChange: serverTimestamp(),
          accountVersion: 1,
          registrationIPAddress: "", // 실제 구현시 IP 주소 수집
          deviceInfo: navigator.userAgent, // 디바이스 정보
        },
      };

      // 일반회원 정보는 users 컬렉션에 저장
      await setDoc(doc(db, "users", user.uid), {
        ...baseUserData,
        userInfo: {
          displayName: name,
          phone: phone,
          email: email.toLowerCase(),
          phoneVerificationDate: new Date().toISOString(),
          profileCompleted: true,
        },
        customerInfo: {
          defaultAddress: "",
          savedAddresses: [],
          favoriteStores: [],
          orderCount: 0,
          totalSpent: 0,
          membershipLevel: "basic",
        },
      });
      console.log("Firestore에 일반회원 정보 저장 완료 (users 컬렉션)");

      // 이메일 사용 기록
      await setDoc(doc(db, "emailUsers", email.toLowerCase()), {
        userId: user.uid,
        role: "regular", // "normal"에서 "regular"로 변경
        createdAt: serverTimestamp(),
      });

      console.log("이메일 사용 기록 저장 완료");

      // 확실한 로그아웃 처리
      try {
        console.log("회원가입 후 로그아웃 처리 시작...");
        await signOut(auth);
        console.log("로그아웃 완료");

        // Auth 상태 초기화를 위한 추가 조치
        localStorage.removeItem(
          "firebase:authUser:AIzaSyAse8ut22SdReRPAFJTzK21VVcAZGFWw14:[DEFAULT]"
        );
        sessionStorage.removeItem(
          "firebase:authUser:AIzaSyAse8ut22SdReRPAFJTzK21VVcAZGFWw14:[DEFAULT]"
        );
        console.log("로컬 인증 데이터 초기화 완료");

        // 일반회원용 상세 알림 메시지
        alert(
          "🎉 회원가입이 완료되었습니다! 🎉\n\n" +
            name +
            "님, SubwayHero의 회원이 되신 것을 환영합니다!\n" +
            "지금 바로 로그인하여 SubwayHero의 다양한 서비스를 이용해보세요.\n\n" +
            "로그인 페이지로 이동합니다."
        );

        // 로그인 페이지로 강제 이동 (리디렉션)
        console.log("로그인 페이지로 강제 이동합니다...");
        setTimeout(() => {
          window.location.href = "/auth";
        }, 100); // 약간의 지연을 두고 이동
      } catch (logoutError) {
        console.error("로그아웃 중 오류:", logoutError);
        // 오류가 발생하더라도 로그인 페이지로 이동
        window.location.href = "/auth";
      }
    } catch (error) {
      console.error("회원가입 오류:", error);

      // Firebase 인증 오류 처리
      if (error.code === "auth/email-already-in-use") {
        setFormError("이미 사용 중인 이메일입니다");
      } else if (error.code === "auth/invalid-email") {
        setFormError("유효하지 않은 이메일 형식입니다");
      } else if (error.code === "auth/weak-password") {
        setFormError("비밀번호가 너무 약합니다");
      } else {
        setFormError("회원가입 중 오류가 발생했습니다: " + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* 이메일 입력 (중복확인 버튼 추가) */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          이메일 <span className="text-red-500">*</span>
        </label>
        <div className="mt-1 flex">
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={handleEmailChange}
            className="appearance-none flex-grow w-3/4 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="your@email.com"
          />
          <button
            type="button"
            onClick={checkEmailDuplicate}
            disabled={emailChecking || !email}
            className="w-1/4 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-r-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
          >
            {emailChecking ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                확인중
              </span>
            ) : (
              "중복확인"
            )}
          </button>
        </div>
        {emailError && (
          <p className="mt-1 text-xs text-red-500">{emailError}</p>
        )}
        {emailVerified && (
          <p className="mt-1 text-xs text-green-500">
            사용 가능한 이메일입니다.
          </p>
        )}
      </div>

      {/* 비밀번호 입력 */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          비밀번호 <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="8자 이상 입력"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          영문, 숫자, 특수문자 조합으로 8자 이상 입력해주세요
        </p>
      </div>

      {/* 비밀번호 확인 */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700"
        >
          비밀번호 확인 <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={validatePassword}
            className={`appearance-none block w-full px-3 py-2 border ${
              passwordError ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            placeholder="비밀번호 확인"
          />
        </div>
        {passwordError && (
          <p className="mt-1 text-xs text-red-500">{passwordError}</p>
        )}
      </div>

      {/* 이름 입력 */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          이름 <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="이름을 입력하세요"
          />
        </div>
      </div>

      {/* 전화번호 입력 (인증 버튼 추가) */}
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700"
        >
          전화번호 <span className="text-red-500">*</span>
        </label>
        <div className="mt-1 flex">
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={handlePhoneChange}
            className="appearance-none flex-grow w-3/4 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="010-0000-0000"
          />
          <button
            type="button"
            onClick={requestPhoneVerification}
            disabled={phoneVerified}
            className={`w-1/4 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-r-md ${
              phoneVerified
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            }`}
          >
            {phoneVerified ? "인증완료" : "인증요청"}
          </button>
        </div>
        {phoneError && (
          <p className="mt-1 text-xs text-red-500">{phoneError}</p>
        )}

        {/* 전화번호 인증 코드 입력 */}
        {showPhoneVerification && !phoneVerified && (
          <div className="mt-3">
            <div className="flex">
              <input
                type="text"
                maxLength={6}
                value={phoneVerificationCode}
                onChange={(e) => setPhoneVerificationCode(e.target.value)}
                className="appearance-none flex-grow w-3/4 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="인증번호 6자리"
              />
              <button
                type="button"
                onClick={verifyPhoneCode}
                className="w-1/4 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-r-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                확인
              </button>
            </div>
            {phoneVerificationError && (
              <p className="mt-1 text-xs text-red-500">
                {phoneVerificationError}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              인증번호 123456을 입력하시면 인증이 완료됩니다. (데모용)
            </p>
          </div>
        )}

        {phoneVerified && (
          <p className="mt-1 text-xs text-green-500">
            전화번호 인증이 완료되었습니다.
          </p>
        )}
      </div>

      {/* 약관 동의 체크박스 */}
      <div className="flex items-center">
        <input
          id="agreeTerms"
          name="agreeTerms"
          type="checkbox"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label
          htmlFor="agreeTerms"
          className="ml-2 block text-sm text-gray-900"
        >
          <span className="text-blue-600 hover:text-blue-500 cursor-pointer">
            이용약관
          </span>
          과{" "}
          <span className="text-blue-600 hover:text-blue-500 cursor-pointer">
            개인정보처리방침
          </span>
          에 동의합니다
          <span className="text-red-500"> *</span>
        </label>
      </div>

      {/* 폼 오류 메시지 */}
      {formError && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{formError}</h3>
            </div>
          </div>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              처리중...
            </span>
          ) : (
            "회원가입"
          )}
        </button>
      </div>
    </form>
  );
};

export default RegularUserSignup;
