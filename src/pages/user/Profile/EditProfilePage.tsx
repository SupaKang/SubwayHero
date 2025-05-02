import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EditProfilePage = () => {
  const navigate = useNavigate();

  // 상태 관리
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    phoneNumber: "",
  });

  // 더미 데이터 - 실제 구현 시 API에서 사용자 정보를 가져오게 됨
  const [userData, setUserData] = useState({
    username: "날렵한 다람쥐",
    email: "user@example.com",
    phoneNumber: "010-1234-5678",
  });

  // 페이지 로딩 시 현재 전화번호 설정
  useEffect(() => {
    setFormData((prevState) => ({
      ...prevState,
      phoneNumber: userData.phoneNumber,
    }));
  }, [userData.phoneNumber]);

  // 입력 변경 핸들러에 비밀번호 복잡성 검증 추가
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // 오류 초기화
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }

    // 비밀번호 실시간 유효성 검사
    if (name === "newPassword" && value) {
      const hasLetter = /[a-zA-Z]/.test(value);
      const hasNumber = /\d/.test(value);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);

      if (value.length < 8) {
        setErrors((prev) => ({
          ...prev,
          newPassword: "비밀번호는 8자 이상이어야 합니다",
        }));
      } else if (!(hasLetter && hasNumber && hasSpecial)) {
        setErrors((prev) => ({
          ...prev,
          newPassword: "비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다",
        }));
      }
    }

    // 비밀번호 확인 일치 여부 검사
    if (name === "confirmPassword" || name === "newPassword") {
      if (
        formData.confirmPassword &&
        (name === "newPassword" ? value : formData.newPassword) !==
          (name === "confirmPassword" ? value : formData.confirmPassword)
      ) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "비밀번호가 일치하지 않습니다",
        }));
      }
    }
  };

  // 폼 제출 처리
  const handleSubmit = (e) => {
    e.preventDefault();

    // 폼 유효성 검사
    const newErrors = {};

    // 비밀번호 변경 시 유효성 검사
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = "현재 비밀번호를 입력해주세요";
      }

      if (!formData.newPassword) {
        newErrors.newPassword = "새 비밀번호를 입력해주세요";
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
      }
    }

    // 전화번호 유효성 검사
    const phoneRegex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "올바른 전화번호 형식이 아닙니다";
    }

    // 오류가 있으면 제출하지 않음
    if (Object.keys(newErrors).length > 0) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        ...newErrors,
      }));
      return;
    }

    // 실제 API 요청 부분 (여기서는 더미 구현)
    alert("정보가 성공적으로 업데이트되었습니다!");

    // 전화번호 업데이트
    setUserData((prev) => ({
      ...prev,
      phoneNumber: formData.phoneNumber,
    }));

    // 비밀번호 필드 초기화
    setFormData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  // 취소 버튼 핸들러
  const handleCancel = () => {
    navigate(-1); // 이전 페이지로 돌아가기
  };

  return (
    <div className="bg-gray-200 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-2xl font-bold mb-6">정보 수정</h1>

          <form onSubmit={handleSubmit}>
            {/* 사용자 기본 정보 표시 (수정 불가) */}
            <div className="mb-8">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  닉네임
                </label>
                <input
                  type="text"
                  disabled
                  value={userData.username}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <input
                  type="email"
                  disabled
                  value={userData.email}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-4">비밀번호 변경</h2>
            <div className="mb-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  현재 비밀번호
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="현재 비밀번호 입력"
                />
                {errors.currentPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  새 비밀번호
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="새 비밀번호 입력"
                />
                <p className="text-gray-500 text-xs mt-1">
                  영문, 숫자, 특수문자 조합으로 8자 이상 입력해주세요
                </p>
                {errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  새 비밀번호 확인
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="새 비밀번호 확인"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-4">연락처 정보</h2>
            <div className="mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  전화번호
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 010-1234-5678"
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
              >
                저장하기
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
