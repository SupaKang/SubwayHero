import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { db } from "../../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  orderBy,
  deleteDoc,
  addDoc,
  Timestamp,
  getDoc,
} from "firebase/firestore";

// 공통 컴포넌트 및 타입 임포트
import ProfileCard from "./ProfileCard";
import TabMenu from "./TabMenu";
import OrderHistory from "./OrderHistory";
import ProductManagement from "./ProductManagement";
import Wishlist from "./Wishlist";
import Reviews from "./Reviews";
import ReviewPopup from "./ReviewPopup";
import {
  Order,
  Product,
  WishlistItem,
  Review,
  UserInfo,
  LoadingState,
} from "./types";

const MyPage = () => {
  const location = useLocation();
  // location.state에서 activeTab 값을 가져오거나, 기본값으로 "주문내역" 사용
  const initialTab = location.state?.activeTab || "주문내역";

  // 탭 상태 관리 - location.state의 activeTab 값으로 초기화
  const [activeTab, setActiveTab] = useState(initialTab);
  const { logout, currentUser, userRole, userData } = useAuth();
  const navigate = useNavigate();

  // 데이터 상태 관리
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    orders: true,
    products: true,
    wishlist: true,
    reviews: true,
  });
  const [searchQuery, setSearchQuery] = useState("");

  // 리뷰 팝업 상태 관리
  const [isReviewPopupOpen, setIsReviewPopupOpen] = useState(false);
  const [currentReviewOrder, setCurrentReviewOrder] = useState<Order | null>(
    null
  );

  // location.state가 변경될 때마다 activeTab 업데이트
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // 상태를 사용한 후 history를 정리하여 뒤로가기 시 상태가 다시 적용되는 것 방지
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await logout();
      // 로그아웃 후 온보딩 페이지로 이동
      navigate("/");
    } catch (error) {
      console.error("로그아웃 에러:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  // 주문 내역 가져오기
  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;

      try {
        setLoading((prev) => ({ ...prev, orders: true }));

        // 사용자의 주문 내역 가져오기
        const ordersQuery = query(
          collection(db, "orders"),
          where("buyerId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );

        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersData: Order[] = [];

        for (const docSnapshot of ordersSnapshot.docs) {
          const orderData = docSnapshot.data() as Order;

          // 주문과 관련된 상품 정보 가져오기
          const productDoc = await getDocs(
            query(
              collection(db, "products"),
              where("id", "==", orderData.productId)
            )
          );

          if (!productDoc.empty) {
            const productData = productDoc.docs[0].data();
            ordersData.push({
              ...orderData,
              id: docSnapshot.id,
              title: productData.name,
              image:
                productData.images?.length > 0 ? productData.images[0] : null,
            });
          } else {
            ordersData.push({
              ...orderData,
              id: docSnapshot.id,
            });
          }
        }

        setOrders(ordersData);
      } catch (error) {
        console.error("주문 내역 가져오기 오류:", error);
      } finally {
        setLoading((prev) => ({ ...prev, orders: false }));
      }
    };

    if (activeTab === "주문내역") {
      fetchOrders();
    }
  }, [currentUser, activeTab]);

  // 판매글 가져오기
  useEffect(() => {
    const fetchProducts = async () => {
      if (!currentUser) return;

      try {
        setLoading((prev) => ({ ...prev, products: true }));

        // 사용자가 등록한 상품 가져오기
        const productsQuery = query(
          collection(db, "products"),
          where("sellerId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );

        const productsSnapshot = await getDocs(productsQuery);
        const productsData = productsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          name: doc.data().name,
          price: doc.data().price,
          images: doc.data().images || [],
        })) as Product[];

        setProducts(productsData);
      } catch (error) {
        console.error("판매글 가져오기 오류:", error);
      } finally {
        setLoading((prev) => ({ ...prev, products: false }));
      }
    };

    if (activeTab === "판매글관리") {
      fetchProducts();
    }
  }, [currentUser, activeTab]);

  // 찜한 상품 가져오기
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!currentUser) return;

      try {
        setLoading((prev) => ({ ...prev, wishlist: true }));

        // 사용자의 찜 목록 가져오기
        const wishlistQuery = query(
          collection(db, "wishlist"),
          where("userId", "==", currentUser.uid)
        );

        const wishlistSnapshot = await getDocs(wishlistQuery);
        const wishlistData: WishlistItem[] = [];

        for (const docSnapshot of wishlistSnapshot.docs) {
          const wishlistItem = docSnapshot.data() as WishlistItem;
          wishlistItem.id = docSnapshot.id; // 문서 ID 추가

          // 각 찜 항목에 해당하는 상품 정보 가져오기
          try {
            const productRef = doc(db, "products", wishlistItem.productId);
            const productSnap = await getDoc(productRef);

            if (productSnap.exists()) {
              const productData = productSnap.data();
              wishlistData.push({
                ...wishlistItem,
                product: {
                  id: productSnap.id, // 상품 ID를 직접 설정
                  name: productData.name || "상품명 없음",
                  price: productData.price || 0,
                  images: productData.images || [],
                  status: productData.status || "active",
                  category: productData.category || "",
                  createdAt: productData.createdAt || new Date(),
                  sellerId: productData.sellerId || "",
                  sellerName: productData.sellerName || "",
                } as Product,
              });
            }
          } catch (error) {
            console.error("상품 정보 가져오기 오류:", error);
          }
        }

        console.log("찜한 상품 목록:", wishlistData);
        setWishlist(wishlistData);
      } catch (error) {
        console.error("찜 목록 가져오기 오류:", error);
      } finally {
        setLoading((prev) => ({ ...prev, wishlist: false }));
      }
    };

    if (activeTab === "찜한상품") {
      fetchWishlist();
    }
  }, [currentUser, activeTab]);

  // 리뷰 가져오기
  useEffect(() => {
    const fetchReviews = async () => {
      if (!currentUser) return;

      try {
        setLoading((prev) => ({ ...prev, reviews: true }));

        // 사용자의 리뷰 가져오기 (사용자가 작성한 리뷰 & 사용자에게 작성된 리뷰)
        const reviewsQuery = query(
          collection(db, "reviews"),
          where("reviewerId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );

        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviewsData = reviewsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Review[];

        // 사용자에게 작성된 리뷰 가져오기
        const receivedReviewsQuery = query(
          collection(db, "reviews"),
          where("targetId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );

        const receivedReviewsSnapshot = await getDocs(receivedReviewsQuery);
        const receivedReviewsData = receivedReviewsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Review[];

        // 두 리뷰 목록 합치기 (중복 제거)
        const allReviews = [...reviewsData, ...receivedReviewsData];
        const uniqueReviews = Array.from(
          new Map(allReviews.map((review) => [review.id, review])).values()
        );

        setReviews(uniqueReviews);
      } catch (error) {
        console.error("리뷰 가져오기 오류:", error);
      } finally {
        setLoading((prev) => ({ ...prev, reviews: false }));
      }
    };

    if (activeTab === "거래후기") {
      fetchReviews();
    }
  }, [currentUser, activeTab]);

  // 탭 변경 핸들러
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery(""); // 탭 변경 시 검색어 초기화
  };

  // 배송조회 핸들러
  const handleDeliveryTracking = (orderId: string) => {
    // 배송조회 페이지로 이동하는 로직 구현
    navigate(`/delivery-tracking/${orderId}`);
  };

  // 반품, 환불 신청 핸들러
  const handleReturnRefund = (orderId: string) => {
    // 반품, 환불 신청 페이지로 이동하는 로직 구현
    navigate(`/return-refund/${orderId}`);
  };

  // 검색 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 각 탭에 맞는 검색 로직 구현
    // 현재 상태에 이미 필터링 로직이 getFilteredData 함수에 구현되어 있음
  };

  // 판매글 수정 핸들러
  const handleEditProduct = (productId: string) => {
    navigate(`/product-edit/${productId}`);
  };

  // 상품 삭제 핸들러
  const handleDeleteProduct = async (productId: string) => {
    if (
      !window.confirm(
        "상품을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      )
    )
      return;

    try {
      setLoading((prev) => ({ ...prev, products: true }));

      // 1. 상품에 관련된 위시리스트(찜) 항목 삭제
      const wishlistQuery = query(
        collection(db, "wishlist"),
        where("productId", "==", productId)
      );
      const wishlistSnapshot = await getDocs(wishlistQuery);

      const wishlistDeletePromises = wishlistSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(wishlistDeletePromises);

      // 2. 상품과 관련된 주문이 있는지 확인하고 처리
      const ordersQuery = query(
        collection(db, "orders"),
        where("productId", "==", productId)
      );
      const ordersSnapshot = await getDocs(ordersQuery);

      // 주문이 있는 경우 삭제하지 않고 경고
      if (!ordersSnapshot.empty) {
        alert(
          "이 상품과 관련된 주문 내역이 있어 삭제할 수 없습니다. 판매 중지 상태로 변경합니다."
        );

        // 상품 상태를 "inactive"로 변경
        const productRef = doc(db, "products", productId);
        await updateDoc(productRef, {
          status: "inactive",
          updatedAt: new Date(),
        });

        setProducts(
          products.map((product) =>
            product.id === productId
              ? { ...product, status: "inactive" }
              : product
          )
        );

        setLoading((prev) => ({ ...prev, products: false }));
        return;
      }

      // 3. 상품 문서 삭제
      await deleteDoc(doc(db, "products", productId));

      // 4. UI에서 상품 제거
      setProducts(products.filter((product) => product.id !== productId));

      alert("상품이 성공적으로 삭제되었습니다.");
    } catch (error) {
      console.error("상품 삭제 오류:", error);
      alert("상품 삭제 중 오류가 발생했습니다.");
    } finally {
      setLoading((prev) => ({ ...prev, products: false }));
    }
  };

  // 찜 해제 핸들러
  const handleRemoveWishlist = async (wishlistItemId: string) => {
    if (!window.confirm("찜 목록에서 제거하시겠습니까?")) return;

    try {
      // 찜 목록에서 삭제
      await deleteDoc(doc(db, "wishlist", wishlistItemId));

      // 찜 목록 상태 업데이트
      setWishlist(wishlist.filter((item) => item.id !== wishlistItemId));

      alert("찜 목록에서 제거되었습니다.");
    } catch (error) {
      console.error("찜 해제 오류:", error);
      alert("찜 해제 처리 중 오류가 발생했습니다.");
    }
  };

  // 상품 보기 핸들러
  const handleViewProduct = (productId: string) => {
    navigate(`/product-detail/${productId}`);
  };

  // 리뷰 작성 핸들러
  const handleWriteReview = (order: Order) => {
    setCurrentReviewOrder(order);
    setIsReviewPopupOpen(true);
  };

  // 리뷰 제출 핸들러
  const handleSubmitReview = async (
    productRating: number,
    sellerRating: number,
    satisfactionRating: number,
    content: string
  ) => {
    if (!currentReviewOrder || !currentUser) return;

    try {
      // 평균 별점 계산
      const averageRating =
        (productRating + sellerRating + satisfactionRating) / 3;

      // 리뷰 데이터 생성
      const reviewData = {
        orderId: currentReviewOrder.id,
        productId: currentReviewOrder.productId,
        reviewerId: currentUser.uid,
        targetId: currentReviewOrder.sellerId,
        rating: averageRating,
        productRating,
        sellerRating,
        satisfactionRating,
        content,
        createdAt: new Date(),
        productName: currentReviewOrder.title,
      };

      // Firestore에 리뷰 추가
      await addDoc(collection(db, "reviews"), reviewData);

      // 주문의 reviewed 상태 업데이트
      await updateDoc(doc(db, "orders", currentReviewOrder.id), {
        reviewed: true,
      });

      // 주문 목록 상태 업데이트
      setOrders(
        orders.map((order) =>
          order.id === currentReviewOrder.id
            ? { ...order, reviewed: true }
            : order
        )
      );

      alert("리뷰가 성공적으로 등록되었습니다.");

      // 리뷰 팝업 초기화 및 닫기
      setIsReviewPopupOpen(false);
      setCurrentReviewOrder(null);
    } catch (error) {
      console.error("리뷰 등록 오류:", error);
      alert("리뷰 등록 중 오류가 발생했습니다.");
    }
  };

  // 검색 필터링 함수
  const getFilteredData = () => {
    if (!searchQuery) {
      switch (activeTab) {
        case "주문내역":
          return orders;
        case "판매글관리":
          return products;
        case "찜한상품":
          return wishlist;
        case "거래후기":
          return reviews;
        default:
          return [];
      }
    }

    const query = searchQuery.toLowerCase();

    switch (activeTab) {
      case "주문내역":
        return orders.filter(
          (order) =>
            order.title.toLowerCase().includes(query) ||
            order.status.toLowerCase().includes(query)
        );
      case "판매글관리":
        return products.filter(
          (product) =>
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
        );
      case "찜한상품":
        return wishlist.filter((item) =>
          item.product?.name.toLowerCase().includes(query)
        );
      case "거래후기":
        return reviews.filter(
          (review) =>
            review.productName.toLowerCase().includes(query) ||
            review.content?.toLowerCase().includes(query)
        );
      default:
        return [];
    }
  };

  // 사용자 정보
  const userInfo: UserInfo = {
    name: currentUser?.displayName || "사용자",
    level: "종합 판매평가",
    rating:
      reviews.length > 0
        ? reviews.reduce((acc, review) => acc + review.rating, 0) /
            reviews.length >=
          4.5
          ? "매우 좋아요"
          : "좋아요"
        : "평가없음",
    avatar: currentUser?.photoURL || null,
    inProgressOrders: orders.filter(
      (o) => o.status === "배송중" || o.status === "배송 예정"
    ).length,
    completedOrders: orders.filter((o) => o.status === "배송완료").length,
    salesCompleted: products.filter((p) => p.status === "sold").length,
    salesInProgress: products.filter((p) => p.status === "active").length,
  };

  return (
    <div className="bg-gray-200 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 프로필 카드 */}
        <ProfileCard userInfo={userInfo} onLogout={handleLogout} />

        {/* 탭 메뉴 */}
        <TabMenu activeTab={activeTab} onTabChange={handleTabChange} />

        {/* 섹션 제목 및 검색 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-2xl font-bold mb-4 sm:mb-0">{activeTab}</h2>
          <div className="w-full sm:w-auto">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
            </form>
          </div>
        </div>

        {/* 탭 내용 */}
        <div className="bg-white rounded-lg shadow">
          {/* 주문 내역 탭 */}
          {activeTab === "주문내역" && (
            <OrderHistory
              orders={getFilteredData() as Order[]}
              loading={loading.orders}
              onDeliveryTracking={handleDeliveryTracking}
              onReturnRefund={handleReturnRefund}
              onWriteReview={handleWriteReview}
            />
          )}

          {/* 판매글 관리 탭 */}
          {activeTab === "판매글관리" && (
            <ProductManagement
              products={getFilteredData() as Product[]}
              loading={loading.products}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {/* 찜한 상품 탭 */}
          {activeTab === "찜한상품" && (
            <Wishlist
              wishlist={getFilteredData() as WishlistItem[]}
              loading={loading.wishlist}
              onViewProduct={handleViewProduct}
              onRemoveWishlist={handleRemoveWishlist}
            />
          )}

          {/* 거래 후기 탭 */}
          {activeTab === "거래후기" && (
            <Reviews
              reviews={getFilteredData() as Review[]}
              loading={loading.reviews}
            />
          )}
        </div>

        {/* 리뷰 작성 팝업 */}
        {isReviewPopupOpen && currentReviewOrder && (
          <ReviewPopup
            order={currentReviewOrder}
            onClose={() => setIsReviewPopupOpen(false)}
            onSubmit={handleSubmitReview}
          />
        )}
      </div>
    </div>
  );
};

export default MyPage;
