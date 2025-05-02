import { useState } from "react";

interface CourierLoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onResetPassword: (email: string) => Promise<void>;
  isSubmitting: boolean;
}

const CourierLogin = ({
  onLogin,
  onResetPassword,
  isSubmitting,
}: CourierLoginProps) => {
  // 상태 관리
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  // 폼 제출 처리
  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  // 비밀번호 재설정 처리
  const handleResetPassword = () => {
    onResetPassword(email);
  };

  return (
    <div>
      {!showPasswordReset ? (
        // 로그인 폼
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* 이메일 입력 */}
            <div>
              <label
                htmlFor="courier-email"
                className="block text-sm font-medium text-gray-700"
              >
                이메일
              </label>
              <div className="mt-1">
                <input
                  id="courier-email"
                  name="courier-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="배송파트너 이메일을 입력하세요"
                />
              </div>
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label
                htmlFor="courier-password"
                className="block text-sm font-medium text-gray-700"
              >
                비밀번호
              </label>
              <div className="mt-1">
                <input
                  id="courier-password"
                  name="courier-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="비밀번호를 입력하세요"
                />
              </div>
            </div>

            {/* 로그인 버튼 */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "처리 중..." : "배송파트너 로그인"}
              </button>
            </div>

            {/* 비밀번호 재설정 링크 */}
            <div className="text-sm text-center">
              <button
                type="button"
                className="font-medium text-blue-500 hover:text-blue-400 focus:outline-none"
                onClick={() => setShowPasswordReset(true)}
              >
                비밀번호를 잊어버리셨나요?
              </button>
            </div>
          </div>
        </form>
      ) : (
        // 비밀번호 재설정 폼
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            배송파트너 가입시 등록한 이메일을 입력해주세요. 비밀번호 재설정
            링크를 보내드립니다.
          </p>
          <div>
            <label
              htmlFor="courier-reset-email"
              className="block text-sm font-medium text-gray-700"
            >
              이메일
            </label>
            <div className="mt-1">
              <input
                id="courier-reset-email"
                name="courier-reset-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="배송파트너 이메일을 입력하세요"
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={isSubmitting}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "처리 중..." : "재설정 링크 보내기"}
            </button>
            <button
              type="button"
              onClick={() => setShowPasswordReset(false)}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              돌아가기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourierLogin;
