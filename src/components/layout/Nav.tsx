import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Nav = () => {
  // AuthContext에서 현재 사용자 정보 가져오기
  const { currentUser } = useAuth();

  return (
    <nav className="flex items-center justify-between px-6 py-6 bg-white shadow-sm">
      {/* 로고 부분 - 로그인 상태에 따라 다른 페이지로 링크 */}
      <Link to={currentUser ? "/market" : "/"}>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
          <h1 className="ml-2 text-2xl font-bold">SubwayHero</h1>
        </div>
      </Link>

      {/* 버튼 부분 - 로그인 상태에 따라 다른 메뉴 표시 */}
      <div className="flex items-center">
        {currentUser ? (
          // 로그인된 상태: 마이페이지, 알림 목록 아이콘 표시
          <>
            <Link to="/mypage">
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>
            </Link>
            <Link to="/notifications">
              <button className="p-2 mr-2 text-gray-600 hover:text-gray-900">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>
            </Link>
          </>
        ) : (
          // 로그인되지 않은 상태: 로그인, 회원가입 버튼 표시
          <>
            <Link to="/auth">
              <button className="px-4 py-2 mr-2 text-gray-600 hover:text-gray-900">
                로그인
              </button>
            </Link>
            <Link to="/signup">
              <button className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
                회원가입
              </button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Nav;
