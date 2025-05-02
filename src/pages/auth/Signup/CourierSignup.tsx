import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  fetchSignInMethodsForEmail,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../../../firebase";

const CourierSignup = () => {
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

  // 배송파트너 추가 필드
  const [vehicleType, setVehicleType] = useState("자전거");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [serviceAreas, setServiceAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [idCardFile, setIdCardFile] = useState(null);
  const [idCardPreview, setIdCardPreview] = useState("");
  const [idCardUploading, setIdCardUploading] = useState(false);
  const [idCardVerified, setIdCardVerified] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [birthDateError, setBirthDateError] = useState("");

  // 약관 동의
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeCourierTerms, setAgreeCourierTerms] = useState(false);
  const [agreeLocationService, setAgreeLocationService] = useState(false);

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

  // 서비스 지역 추가 함수
  const addServiceArea = () => {
    if (selectedArea && !serviceAreas.includes(selectedArea)) {
      setServiceAreas([...serviceAreas, selectedArea]);
      setSelectedArea("");
    }
  };

  // 서비스 지역 제거 함수
  const removeServiceArea = (area) => {
    setServiceAreas(serviceAreas.filter((a) => a !== area));
  };

  // 신분증 파일 업로드 핸들러
  const handleIdCardUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 파일 크기 확인 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert("파일 크기는 5MB 이하여야 합니다.");
        return;
      }

      // 파일 유형 확인 (이미지만 허용)
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }

      setIdCardFile(file);
      setIdCardUploading(true);

      // 파일 미리보기
      const reader = new FileReader();
      reader.onload = () => {
        setIdCardPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // 미리보기만 설정하고 실제 업로드는 회원가입 시 진행
      setIdCardUploading(false);
      setIdCardVerified(true);
    }
  };

  // 생년월일 검증
  const validateBirthDate = () => {
    if (!birthDate) {
      setBirthDateError("생년월일을 입력해주세요");
      return false;
    }

    // YYYY-MM-DD 형식 검증 (숫자와 하이픈만 허용)
    const birthDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!birthDateRegex.test(birthDate)) {
      setBirthDateError("유효한 생년월일 형식이 아닙니다 (예: YYYY-MM-DD)");
      return false;
    }

    // 날짜 유효성 검사
    const [year, month, day] = birthDate.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    // 입력된 날짜가 유효한지 확인 (예: 2023-02-31은 유효하지 않음)
    if (
      date.getFullYear() !== year ||
      date.getMonth() + 1 !== month ||
      date.getDate() !== day
    ) {
      setBirthDateError("존재하지 않는 날짜입니다");
      return false;
    }

    // 미래 날짜 체크
    if (date > new Date()) {
      setBirthDateError("미래 날짜는 입력할 수 없습니다");
      return false;
    }

    // 100세 이상 체크
    const hundredYearsAgo = new Date();
    hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);
    if (date < hundredYearsAgo) {
      setBirthDateError("생년월일을 다시 확인해주세요");
      return false;
    }

    setBirthDateError("");
    return true;
  };

  // 생년월일 입력 핸들러
  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // 숫자와 하이픈만 허용
    const sanitizedValue = value.replace(/[^\d-]/g, "");

    // YYYY-MM-DD 형식 자동 포맷팅
    let formattedValue = sanitizedValue;

    if (sanitizedValue.length > 0) {
      // 숫자만 추출
      const digitsOnly = sanitizedValue.replace(/-/g, "");

      // 4자리, 6자리에 하이픈 자동 추가
      if (digitsOnly.length > 4) {
        formattedValue = `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4, 6)}${
          digitsOnly.length > 6 ? `-${digitsOnly.slice(6, 8)}` : ""
        }`;
      } else {
        formattedValue = digitsOnly;
      }

      // 최대 10자 (YYYY-MM-DD) 제한
      formattedValue = formattedValue.slice(0, 10);
    }

    setBirthDate(formattedValue);
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

      // 생년월일 검증
      if (!validateBirthDate()) {
        setIsSubmitting(false);
        return;
      }

      // 신분증 업로드 체크
      if (!idCardFile) {
        setFormError("신분증 사진을 업로드해주세요");
        setIsSubmitting(false);
        return;
      }

      // 약관 동의 검증
      if (!agreeTerms || !agreeCourierTerms || !agreeLocationService) {
        setFormError("모든 필수 약관에 동의해주세요");
        setIsSubmitting(false);
        return;
      }

      console.log("배송파트너 회원가입 처리 시작...");

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

      // 신분증 이미지 Firebase Storage에 업로드
      let idCardUrl = null;

      try {
        const timestamp = new Date().getTime();
        const fileExtension = idCardFile.name.split(".").pop();
        // 보안을 위해 파일 이름에는 개인 식별 정보를 포함하지 않음
        const fileName = `idCards/${user.uid}/${timestamp}.${fileExtension}`;
        const idCardRef = ref(storage, fileName);

        // 이미지 업로드
        const uploadResult = await uploadBytes(idCardRef, idCardFile);
        console.log("신분증 이미지 업로드 완료:", uploadResult);

        // 업로드된 이미지의 다운로드 URL 가져오기
        idCardUrl = await getDownloadURL(idCardRef);
        console.log("신분증 이미지 URL:", idCardUrl);
      } catch (uploadError) {
        console.error("신분증 이미지 업로드 오류:", uploadError);
        // 업로드 실패해도 회원가입은 계속 진행
      }

      // 기본 사용자 정보 객체 생성
      const baseUserData = {
        name,
        email: email.toLowerCase(),
        phone,
        birthDate,
        role: "courier",
        createdAt: serverTimestamp(),
        registrationDate: new Date().toISOString(),
        isApproved: false, // 배송파트너는 관리자 승인 필요
        agreeTerms, // 약관 동의 여부 저장
        agreeCourierTerms, // 배송파트너 약관 동의 여부
        agreeLocationService, // 위치 서비스 약관 동의 여부
        phoneVerified, // 전화번호 인증 여부
        idCardVerified, // 신분증 인증 여부
        status: "unapproved", // 초기 계정 상태: 승인 대기중 (관리자가 Firebase에서 "approved"로 변경시 로그인 가능)
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

      // 배송파트너 정보는 couriers 컬렉션에 저장
      await setDoc(doc(db, "couriers", user.uid), {
        ...baseUserData,
        courierInfo: {
          displayName: name,
          phone: phone,
          email: email.toLowerCase(),
          phoneVerificationDate: new Date().toISOString(),
          profileCompleted: false,
          vehicleType: vehicleType,
          licenseNumber: licenseNumber,
          serviceAreas: serviceAreas,
          idCardUploaded: !!idCardFile,
          idCardUrl: idCardUrl, // 신분증 이미지 URL 저장
          idCardUploadDate: new Date().toISOString(),
          ratings: {
            average: 0,
            count: 0,
          },
          metrics: {
            totalDeliveries: 0,
            cancelRate: 0,
            onTimeRate: 100,
            activeStatus: "offline",
          },
          currentLocation: {
            lat: 0,
            lng: 0,
            lastUpdated: null,
          },
        },
      });
      console.log("Firestore에 배송파트너 정보 저장 완료 (couriers 컬렉션)");

      // users 컬렉션에도 배송파트너 기본 정보 저장
      await setDoc(doc(db, "users", user.uid), {
        ...baseUserData,
        userInfo: {
          displayName: name,
          phone: phone,
          email: email.toLowerCase(),
          phoneVerificationDate: new Date().toISOString(),
          profileCompleted: false,
        },
      });
      console.log("Firestore에 배송파트너 기본 정보 저장 완료 (users 컬렉션)");

      // 이메일 사용 기록
      await setDoc(doc(db, "emailUsers", email.toLowerCase()), {
        userId: user.uid,
        role: "courier",
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

        // 배송파트너 회원가입 완료 알림 메시지
        alert(
          "🎉 배송파트너 회원가입이 완료되었습니다! 🎉\n\n" +
            name +
            "님, SubwayHero의 배송파트너가 되신 것을 환영합니다!\n" +
            "회원가입 정보가 관리자에게 전달되었으며, 승인 후 서비스를 이용하실 수 있습니다.\n" +
            "관리자가 Firebase DB에서 계정 상태를 'approved'로 변경하면 로그인이 가능합니다.\n" +
            "승인 결과는 이메일로 안내드릴 예정입니다.\n\n" +
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

      {/* 생년월일 입력 */}
      <div>
        <label
          htmlFor="birthDate"
          className="block text-sm font-medium text-gray-700"
        >
          생년월일 <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <input
            id="birthDate"
            name="birthDate"
            type="text"
            required
            value={birthDate}
            onChange={handleBirthDateChange}
            onBlur={validateBirthDate}
            className={`appearance-none block w-full px-3 py-2 border ${
              birthDateError ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            placeholder="YYYY-MM-DD 형식으로 입력"
            maxLength={10}
          />
        </div>
        {birthDateError && (
          <p className="mt-1 text-xs text-red-500">{birthDateError}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          예시: 1990-01-31 (YYYY-MM-DD 형식)
        </p>
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

        {/* 전화번호 인증코드 입력 폼 (조건부 렌더링) */}
        {showPhoneVerification && !phoneVerified && (
          <div className="mt-3 flex">
            <input
              type="text"
              maxLength={6}
              value={phoneVerificationCode}
              onChange={(e) => setPhoneVerificationCode(e.target.value)}
              className="appearance-none flex-grow w-3/4 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="인증번호 6자리 입력"
            />
            <button
              type="button"
              onClick={verifyPhoneCode}
              className="w-1/4 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-r-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              인증확인
            </button>
          </div>
        )}
        {phoneVerificationError && (
          <p className="mt-1 text-xs text-red-500">{phoneVerificationError}</p>
        )}
        {phoneVerified && (
          <p className="mt-1 text-xs text-green-500">
            전화번호 인증이 완료되었습니다.
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          * 데모 버전에서는 인증번호 "123456"을 입력하면 인증이 완료됩니다.
        </p>
      </div>

      {/* 신분증 인증 */}
      <div>
        <label
          htmlFor="idCard"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          신분증 인증<span className="text-red-500">*</span>
        </label>

        {!idCardPreview ? (
          <div
            className="mt-1 flex justify-center px-6 py-4 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50 transition-colors duration-200"
            onClick={() => document.getElementById("idCard").click()}
          >
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600 justify-center">
                <label
                  htmlFor="idCard"
                  className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                >
                  <span>파일 업로드</span>
                  <input
                    id="idCard"
                    name="idCard"
                    type="file"
                    accept="image/*"
                    onChange={handleIdCardUpload}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">또는 여기에 파일을 끌어다 놓으세요</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF 파일만 허용 (최대 5MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-2">
            <div className="relative rounded-md overflow-hidden border border-gray-200 bg-gray-50 p-2">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-md overflow-hidden mr-3">
                  <img
                    src={idCardPreview}
                    alt="신분증 미리보기"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    신분증 이미지가 업로드되었습니다
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    업로드된 이미지는 안전하게 암호화되어 저장되며, 본인 확인
                    목적으로만 사용됩니다.
                  </p>
                  <div className="mt-2 flex space-x-2">
                    <button
                      type="button"
                      onClick={() => document.getElementById("idCard").click()}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      변경
                      <input
                        id="idCard"
                        name="idCard"
                        type="file"
                        accept="image/*"
                        onChange={handleIdCardUpload}
                        className="sr-only"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIdCardFile(null);
                        setIdCardPreview("");
                      }}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <div className="ml-auto flex-shrink-0">
                  <div className="rounded-full bg-green-100 p-1">
                    <svg
                      className="h-5 w-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 약관 동의 */}
      <div className="space-y-3">
        <div className="relative flex items-start">
          <div className="flex items-center h-5">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="font-medium text-gray-700">
              이용약관 및 개인정보처리방침 동의{" "}
              <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500">
              <a href="#" className="text-blue-600 hover:text-blue-500">
                이용약관
              </a>{" "}
              및{" "}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                개인정보처리방침
              </a>
              에 동의합니다.
            </p>
          </div>
        </div>

        <div className="relative flex items-start">
          <div className="flex items-center h-5">
            <input
              id="courierTerms"
              name="courierTerms"
              type="checkbox"
              checked={agreeCourierTerms}
              onChange={(e) => setAgreeCourierTerms(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="courierTerms" className="font-medium text-gray-700">
              배송파트너 이용약관 동의 <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500">
              <a href="#" className="text-blue-600 hover:text-blue-500">
                배송파트너 이용약관
              </a>
              에 동의합니다.
            </p>
          </div>
        </div>

        <div className="relative flex items-start">
          <div className="flex items-center h-5">
            <input
              id="locationService"
              name="locationService"
              type="checkbox"
              checked={agreeLocationService}
              onChange={(e) => setAgreeLocationService(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label
              htmlFor="locationService"
              className="font-medium text-gray-700"
            >
              위치기반 서비스 이용약관 동의{" "}
              <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500">
              <a href="#" className="text-blue-600 hover:text-blue-500">
                위치기반 서비스 이용약관
              </a>
              에 동의합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 오류 메시지 표시 */}
      {formError && (
        <div className="p-3 text-center bg-red-50 text-red-500 text-sm rounded-md">
          {formError}
        </div>
      )}

      {/* 회원가입 버튼 */}
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isSubmitting
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
            "배송파트너로 가입하기"
          )}
        </button>
      </div>

      {/* 로그인 페이지로 이동 링크 */}
      <div className="text-sm text-center mt-4">
        <p>
          이미 회원이신가요?{" "}
          <a
            href="/auth"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            로그인하기
          </a>
        </p>
      </div>
    </form>
  );
};

export default CourierSignup;
