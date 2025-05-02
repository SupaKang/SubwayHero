import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import RegularUserLogin from "./components/RegularUserLogin";
import CourierLogin from "./components/CourierLogin";

const AuthPage = () => {
  // 상태 관리
  const [activeTab, setActiveTab] = useState<"normal" | "courier">("normal");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  // 탭 전환 함수
  const handleTabChange = (tab: "normal" | "courier") => {
    setActiveTab(tab);
    setError("");
    setResetEmailSent(false);
  };

  // 회원가입 페이지로 이동
  const goToSignup = () => {
    navigate("/signup", { state: { role: activeTab } });
  };

  // 비밀번호 재설정 메일 발송
  const handleResetPassword = async (email: string) => {
    if (!email) {
      setError("이메일을 입력해주세요");
      return;
    }

    try {
      setIsSubmitting(true);
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
      setError("");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setError("등록되지 않은 이메일입니다");
      } else {
        setError("비밀번호 재설정 이메일 발송에 실패했습니다");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로그인 처리
  const handleLogin = async (email: string, password: string) => {
    setError("");

    try {
      setIsSubmitting(true);
      console.log("로그인 시도:", email);

      // 먼저 사용자의 이메일이 어떤 역할로 등록되어 있는지 확인
      const emailLowerCase = email.toLowerCase();
      const emailUserRef = doc(db, "emailUsers", emailLowerCase);
      const emailSnapshot = await getDoc(emailUserRef);

      // 사용자가 존재하지 않는 경우
      if (!emailSnapshot.exists()) {
        console.log("이메일 문서가 존재하지 않습니다:", emailLowerCase);
        // 로그인 시도 - 오류는 catch 블록에서 처리됨
        await login(email, password);
        return;
      }

      const emailData = emailSnapshot.data();
      const userRole = emailData.role;
      console.log("확인된 사용자 역할:", userRole);

      // 선택한 탭과 실제 사용자 역할이 일치하는지 확인
      if (
        (activeTab === "normal" &&
          userRole !== "regular" &&
          userRole !== "normal") ||
        (activeTab === "courier" && userRole !== "courier")
      ) {
        console.log(
          `역할 불일치: 선택한 탭 ${activeTab}, 사용자 역할 ${userRole}`
        );
        setError(
          `선택한 역할(${
            activeTab === "normal" ? "일반회원" : "배송파트너"
          })과 가입된 계정 유형이 일치하지 않습니다`
        );
        return;
      }

      // 배송파트너인 경우, 승인 상태 미리 확인
      if (userRole === "courier") {
        console.log("[handleLogin] 배송파트너 계정 확인 중...");
        const courierRef = doc(db, "couriers", emailData.userId);
        const courierSnapshot = await getDoc(courierRef);

        if (courierSnapshot.exists()) {
          const courierData = courierSnapshot.data();
          console.log("[handleLogin] 배송파트너 상태:", 
            courierData.status, 
            "승인여부:", courierData.isApproved === true ? "승인됨" : "미승인"
          );

          // Firebase 승인 상태 확인 - 명시적으로 두 필드 모두 확인
          const isApproved = courierData.isApproved === true;
          const hasApprovedStatus = courierData.status === "approved";
          
          if (isApproved || hasApprovedStatus) {
            console.log("[handleLogin] 배송파트너 승인 확인됨. 로그인 진행...");
          } else if (courierData.status === "unapproved") {
            console.log("[handleLogin] 승인되지 않은 배송파트너 계정");
            setError(
              "아직 승인되지 않은 배송파트너 계정입니다. 담당자 승인을 기다려주세요."
            );
            return;
          } else if (courierData.status === "rejected") {
            console.log("[handleLogin] 거부된 배송파트너 계정");
            setError(
              "배송파트너 신청이 거절되었습니다. 자세한 내용은 이메일을 확인하세요."
            );
            return;
          } else {
            console.log("[handleLogin] 계정 상태 문제:", courierData.status);
            setError(
              "배송파트너 계정에 문제가 있습니다. 고객센터에 문의하세요."
            );
            return;
          }
        } else {
          console.error("[handleLogin] 배송파트너 문서를 찾을 수 없음:", emailData.userId);
          setError(
            "배송파트너 계정 정보를 찾을 수 없습니다. 회원가입을 다시 진행하세요."
          );
          return;
        }
      }

      // 로그인 시도 - 여기까지 왔다면 계정 유형과 상태가 올바르게 확인됨
      console.log("[handleLogin] Firebase 인증 로그인 시도");
      const userCredential = await login(email, password);

      // 로그인 성공 - 추가적인 처리 필요 없음, AuthContext에서 리디렉션 처리
      console.log("로그인 성공:", userCredential.user.uid);
    } catch (error) {
      console.error("로그인 오류:", error);

      if (error.message?.includes("승인되지 않았습니다")) {
        // AuthContext에서 발생한 배송파트너 승인 관련 오류
        setError(
          "아직 승인되지 않은 배송파트너 계정입니다. 담당자 승인을 기다려주세요."
        );
      } else if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential" // 새로 추가된 오류 코드
      ) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다");
      } else if (error.code === "auth/too-many-requests") {
        setError(
          "로그인 시도 횟수가 너무 많습니다. 잠시 후 다시 시도해주세요."
        );
      } else if (error.code === "auth/network-request-failed") {
        setError("네트워크 연결을 확인해주세요.");
      } else {
        setError(
          "로그인 중 오류가 발생했습니다" +
            (error.message ? `: ${error.message}` : "")
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col py-20 sm:px- lg:px-8 bg-indigo-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* 로고 */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          로그인
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          SubwayHero에 오신 것을 환영합니다!
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* 역할 선택 탭 */}
          <div className="mb-6">
            <div className="flex rounded-md shadow-sm">
              <button
                type="button"
                className={`w-1/2 py-2 px-4 text-sm font-medium rounded-l-md ${
                  activeTab === "normal"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => handleTabChange("normal")}
              >
                일반회원
              </button>
              <button
                type="button"
                className={`w-1/2 py-2 px-4 text-sm font-medium rounded-r-md ${
                  activeTab === "courier"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => handleTabChange("courier")}
              >
                배송파트너
              </button>
            </div>
          </div>

          {/* 오류 메시지 표시 */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* 비밀번호 재설정 이메일 성공 메시지 */}
          {resetEmailSent && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
              비밀번호 재설정 이메일이 발송되었습니다. 이메일을 확인해주세요.
            </div>
          )}

          {/* 로그인 컴포넌트 */}
          {activeTab === "normal" ? (
            <RegularUserLogin
              onLogin={handleLogin}
              onResetPassword={handleResetPassword}
              isSubmitting={isSubmitting}
            />
          ) : (
            <CourierLogin
              onLogin={handleLogin}
              onResetPassword={handleResetPassword}
              isSubmitting={isSubmitting}
            />
          )}

          {/* 로그인/회원가입 전환 링크 */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  계정이 없으신가요?
                </span>
              </div>
            </div>

            <div className="mt-2 text-center">
              <button
                type="button"
                className="font-medium text-blue-600 hover:text-blue-500"
                onClick={goToSignup}
              >
                회원가입하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
