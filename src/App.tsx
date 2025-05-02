import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.tsx";
import OnBoard from "./pages/home/OnBoard";
import Nav from "./components/layout/Nav";
import Footer from "./components/layout/Footer";
import AuthPage from "./pages/auth/Login/Login";
import SignupPage from "./pages/auth/Signup/SignupPage";
import MarketPage from "./pages/product/ProductList/MarketPage";
import ProductDetail from "./pages/product/ProductDetail/ProductDetail";
import ProductUploadPage from "./pages/product/ProductUploadPage/ProductUploadPage";
import ProductEditPage from "./pages/product/ProductEditPage/ProductEditPage";
import MyPage from "./pages/user/MyPage/MyPage";
import NotificationsPage from "./pages/user/alert/NotificationsPage";
import EditProfilePage from "./pages/user/Profile/EditProfilePage";

// 비공개 라우트 컴포넌트
interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // 인증 상태 로딩 중에는 로딩 화면 표시
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 인증되지 않은 경우 로그인 페이지로 리디렉션
  return currentUser ? <>{children}</> : <Navigate to="/auth" />;
};

// 이미 로그인한 사용자가 로그인/회원가입 페이지 접근 시 리디렉션
interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 이미 로그인한 경우 마켓 페이지로 리디렉션 (마이페이지에서 수정)
  return currentUser ? <Navigate to="/market" /> : <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { currentUser } = useAuth();
  const [initializing, setInitializing] = useState(true);

  // 앱 초기화 상태 관리
  useEffect(() => {
    // 인증 상태가 확인되면 초기화 완료
    if (currentUser !== undefined) {
      setInitializing(false);
    }
  }, [currentUser]);

  // 초기화 중에는 로딩 화면 표시
  if (initializing) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        {/* 공개 라우트 */}
        <Route path="/" element={<OnBoard />} />
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />
        {/* 회원가입 페이지에서는 PublicRoute 래퍼를 제거하여 자동 리디렉션 방지 */}
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/product-detail/:id" element={<ProductDetail />} />

        {/* 비공개 라우트 (로그인 필요) */}
        <Route
          path="/product-upload"
          element={
            <PrivateRoute>
              <ProductUploadPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/product-edit/:id"
          element={
            <PrivateRoute>
              <ProductEditPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/mypage"
          element={
            <PrivateRoute>
              <MyPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <NotificationsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <PrivateRoute>
              <EditProfilePage />
            </PrivateRoute>
          }
        />

        {/* 존재하지 않는 경로는 홈으로 리디렉션 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
