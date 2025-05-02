import { useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  AuthProvider as FirebaseAuthProvider,
} from "firebase/auth";
import { auth } from "../../../../firebase";

interface RegularUserLoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onResetPassword: (email: string) => Promise<void>;
  isSubmitting: boolean;
}

const RegularUserLogin = ({
  onLogin,
  onResetPassword,
  isSubmitting,
}: RegularUserLoginProps) => {
  // 상태 관리
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  // 폼 제출 처리
  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  // 비밀번호 재설정 처리
  const handleResetPassword = () => {
    onResetPassword(email);
  };

  // 소셜 로그인 처리
  const handleSocialLogin = async (providerName: string) => {
    let provider: FirebaseAuthProvider;

    if (providerName === "google") {
      provider = new GoogleAuthProvider();
    } else if (providerName === "kakao") {
      console.error("카카오 로그인은 아직 구현되지 않았습니다.");
      return;
    } else if (providerName === "naver") {
      console.error("네이버 로그인은 아직 구현되지 않았습니다.");
      return;
    } else {
      console.error("지원하지 않는 소셜 로그인 제공자입니다.");
      return;
    }

    try {
      setSocialLoading(true);
      await signInWithPopup(auth, provider);
      // 로그인 성공 처리는 AuthContext에서 처리
    } catch (error) {
      console.error("소셜 로그인 오류:", error);
    } finally {
      setSocialLoading(false);
    }
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
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                이메일
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="이메일을 입력하세요"
                />
              </div>
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                비밀번호
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="비밀번호를 입력하세요"
                />
              </div>
              {/* 비밀번호 재설정 링크 */}
              <div className="text-sm text-center mt-4">
                <button
                  type="button"
                  className="font-medium text-blue-500 hover:text-blue-400 focus:outline-none"
                  onClick={() => setShowPasswordReset(true)}
                >
                  비밀번호를 잊어버리셨나요?
                </button>
              </div>
            </div>

            {/* 로그인 버튼 */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting || socialLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting || socialLoading
                    ? "opacity-70 cursor-not-allowed"
                    : ""
                }`}
              >
                {isSubmitting ? "처리 중..." : "로그인"}
              </button>
            </div>

            {/* 소셜 로그인 버튼 */}
            <div className="mt-8">
              <div className="flex items-center">
                <hr className="flex-grow border-t border-gray-300" />
                <span className="px-4 text-gray-500 text sm">
                  소셜 계정으로 로그인
                </span>
                <hr className="flex-grow border-t border-gray-300" />
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3">
                <div>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("google")}
                    disabled={isSubmitting || socialLoading}
                    className={`w-full inline-flex flex gap-3 items-center justify-center py-3 px-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      isSubmitting || socialLoading
                        ? "opacity-70 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <svg
                      className="h-5 w-5 mb-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                    </svg>
                    <span className="text-xs">구글 계정으로 로그인</span>
                  </button>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("kakao")}
                    disabled={isSubmitting || socialLoading}
                    className={`w-full inline-flex flex gap-3 items-center justify-center py-3 px-2 border border-transparent rounded-md shadow-sm bg-yellow-400 text-sm font-medium text-gray-800 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 ${
                      isSubmitting || socialLoading
                        ? "opacity-70 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 208 191"
                      className="mb-1"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M104 0C46.5618 0 0 36.6355 0 81.8298C0 110.251 19.1617 135.09 48.4638 148.687C45.9496 159.754 37.7091 185.31 36.493 189.551C36.493 189.551 36.1109 191.17 37.2111 191.621C38.3112 192.071 39.4113 191.63 39.4113 191.63C39.4113 191.63 68.8133 171.133 71.1198 169.267C81.9274 172.001 92.7349 173.246 104 173.246C161.438 173.246 208 136.61 208 91.4159C208 46.2213 161.438 0 104 0Z"
                      />
                    </svg>
                    <span className="text-xs">카카오 계정으로 로그인</span>
                  </button>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("naver")}
                    disabled={isSubmitting || socialLoading}
                    className={`w-full inline-flex flex gap-3 items-center justify-center py-3 px-2 border border-transparent rounded-md shadow-sm bg-green-500 text-sm font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                      isSubmitting || socialLoading
                        ? "opacity-70 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <svg
                      width="20"
                      height="20"
                      className="mb-1"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.5615 10.704L6.16777 0H0V20H6.43846V9.296L13.8322 20H20V0H13.5615V10.704Z"
                        fill="white"
                      />
                    </svg>
                    <span className="text-xs">네이버 계정으로 로그인</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : (
        // 비밀번호 재설정 폼
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            가입하신 이메일을 입력해주세요. 비밀번호 재설정 링크를 보내드립니다.
          </p>
          <div>
            <label
              htmlFor="reset-email"
              className="block text-sm font-medium text-gray-700"
            >
              이메일
            </label>
            <div className="mt-1">
              <input
                id="reset-email"
                name="reset-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="이메일을 입력하세요"
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

export default RegularUserLogin;
