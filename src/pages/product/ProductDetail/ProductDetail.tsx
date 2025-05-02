import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  Timestamp,
  orderBy,
  limit,
  avg,
} from "firebase/firestore";
import { useAuth } from "../../../context/AuthContext";
import { getRatingSentiment } from "../../../utils/nickname";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  category: string;
  condition: string;
  sellerId: string;
  sellerName: string;
  packageCondition?: string;
  createdAt: Timestamp;
  status: string;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isDeliveryPopupOpen, setIsDeliveryPopupOpen] = useState(false);
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [wishlistId, setWishlistId] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [sellerInfo, setSellerInfo] = useState<{
    name: string;
    avatar?: string;
  }>({ name: "판매자" });
  const [sellerRating, setSellerRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);

  // 상품 상태 매핑
  const conditionMap = {
    new: "새 상품",
    almost_new: "거의 새 것",
    used: "사용감 있음",
    old: "중고",
  };

  // 포장 상태 매핑
  const packageConditionMap = {
    original: "정품 포장",
    boxed: "박스 포장",
    simple: "간단 포장",
    none: "포장 없음",
  };

  // 카테고리 매핑
  const categoryMap = {
    digital: "디지털기기",
    furniture: "생활가전",
    interior: "가구/인테리어",
    kitchen: "생활/주방",
    kids: "유아동",
    women: "여성의류",
    fashion: "의류",
    beauty: "뷰티/미용",
    sports: "스포츠/레저",
    hobby: "취미/게임/음반",
    books: "도서",
    food: "식품",
    etc: "기타",
  };

  // 페이지 상단으로 스크롤
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 상품 정보 로드
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const productRef = doc(db, "products", id);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const productData = productSnap.data() as Product;
          setProduct({
            id: productSnap.id,
            ...productData,
          });

          // 판매자의 리뷰 정보 가져오기
          if (productData.sellerId) {
            try {
              // 판매자에 대한 리뷰 가져오기
              const reviewsQuery = query(
                collection(db, "reviews"),
                where("sellerId", "==", productData.sellerId),
                orderBy("createdAt", "desc")
              );

              const reviewsSnapshot = await getDocs(reviewsQuery);
              const reviews = reviewsSnapshot.docs.map((doc) => doc.data());

              // 리뷰 수 설정
              setReviewCount(reviews.length);

              // 평균 평점 계산
              if (reviews.length > 0) {
                const totalRating = reviews.reduce(
                  (acc, review) => acc + (review.sellerRating || 0),
                  0
                );
                const avgRating = totalRating / reviews.length;
                setSellerRating(avgRating);
              }
            } catch (error) {
              console.error("판매자 리뷰 정보 가져오기 오류:", error);
            }
          }

          // 관련 상품 (같은 카테고리) 불러오기
          if (productData.category) {
            const relatedProductsQuery = query(
              collection(db, "products"),
              where("category", "==", productData.category),
              where("status", "==", "active")
            );
            const relatedProductsSnapshot = await getDocs(relatedProductsQuery);
            const relatedProductsList = relatedProductsSnapshot.docs
              .filter((doc) => doc.id !== id) // 현재 상품 제외
              .map(
                (doc) =>
                  ({
                    id: doc.id,
                    ...doc.data(),
                  } as Product)
              )
              .slice(0, 5); // 최대 5개까지만

            setRelatedProducts(relatedProductsList);
          }

          // 이미 찜한 상품인지 확인
          if (currentUser) {
            const wishlistQuery = query(
              collection(db, "wishlist"),
              where("userId", "==", currentUser.uid),
              where("productId", "==", id)
            );
            const wishlistSnap = await getDocs(wishlistQuery);

            if (!wishlistSnap.empty) {
              setIsBookmarked(true);
              setWishlistId(wishlistSnap.docs[0].id);
            }
          }
        } else {
          console.error("상품을 찾을 수 없습니다!");
        }
      } catch (error) {
        console.error("상품 정보 로드 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, currentUser]);

  // 날짜 포맷팅 함수
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return "";

    const date = timestamp.toDate();
    const year = date.getFullYear().toString().slice(2);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}.${month}.${day}`;
  };

  // 북마크(찜하기) 토글 함수
  const toggleBookmark = async () => {
    if (!currentUser) {
      alert("로그인이 필요한 서비스입니다.");
      return;
    }

    if (!product) return;

    try {
      if (isBookmarked && wishlistId) {
        // 찜 해제
        await deleteDoc(doc(db, "wishlist", wishlistId));
        setIsBookmarked(false);
        setWishlistId(null);
      } else {
        // 찜하기
        const wishlistRef = collection(db, "wishlist");
        const newWishlistDoc = await addDoc(wishlistRef, {
          userId: currentUser.uid,
          productId: product.id,
          createdAt: new Date(),
        });
        setIsBookmarked(true);
        setWishlistId(newWishlistDoc.id);
      }
    } catch (error) {
      console.error("찜하기 처리 오류:", error);
    }
  };

  // 구매하기 버튼 클릭 핸들러
  const handlePurchase = (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("로그인이 필요한 서비스입니다.");
      return;
    }
    setIsDeliveryPopupOpen(true);
  };

  // 배송 요청 핸들러
  const handleDeliveryRequest = async () => {
    if (!isTermsAgreed) {
      alert("이용약관에 동의해주세요.");
      return;
    }

    if (!currentUser || !product) {
      alert("로그인이 필요하거나 상품 정보가 올바르지 않습니다.");
      return;
    }

    try {
      // 주문 정보 저장
      await addDoc(collection(db, "orders"), {
        buyerId: currentUser.uid,
        sellerId: product.sellerId,
        productId: product.id,
        price: product.price,
        status: "결제완료",
        createdAt: new Date(),
        date: new Date(),
        reviewed: false,
      });

      setIsDeliveryPopupOpen(false);
      setIsTermsAgreed(false);
      alert("구매가 완료되었습니다. 배송이 요청되었습니다.");
    } catch (error) {
      console.error("주문 처리 오류:", error);
      alert("주문 처리 중 오류가 발생했습니다.");
    }
  };

  // 팝업 닫기 핸들러
  const handleClosePopup = () => {
    setIsDeliveryPopupOpen(false);
    setIsTermsAgreed(false);
  };

  if (loading) {
    return (
      <div className="container min-h-screen mx-auto px-4 max-w-4xl flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container min-h-screen mx-auto px-4 max-w-4xl flex justify-center items-center">
        <p className="text-xl text-red-500">상품을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="container min-h-screen mx-auto px-4 max-w-4xl">
      {/* 경로 표시 */}
      <div className="text-sm text-gray-500 py-8">
        <button className="hover:text-blue-500">홈</button>
        <span className="mx-2">&gt;</span>
        <button className="hover:text-blue-500">중고거래</button>
        <span className="mx-2">&gt;</span>
        <span>{categoryMap[product.category] || product.category}</span>
      </div>

      {/* 상품 기본 정보 */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* 상품 이미지 */}
        <div className="w-full md:w-1/2">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full aspect-square rounded-md object-cover"
            />
          ) : (
            <div className="bg-gray-300 aspect-square rounded-md"></div>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="w-full md:w-1/2">
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-500 text-sm mb-4">
            {categoryMap[product.category] || product.category} ·{" "}
            {formatDate(product.createdAt)}
          </p>

          <div className="text-3xl font-bold text-blue-600 mb-6">
            {product.price.toLocaleString()}원
          </div>

          <div className="border-t border-b py-4 mb-6">
            <div className="flex justify-between py-2">
              <span className="text-sm text-blue-600">상품 상태</span>
              <span className="text-sm">
                {conditionMap[product.condition] || "정보 없음"}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-blue-600">포장상태</span>
              <span className="text-sm">
                {packageConditionMap[product.packageCondition] || "정보 없음"}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-blue-600">배송비</span>
              <span className="text-sm">{(3000).toLocaleString()}원</span>
            </div>
          </div>

          {/* 판매자 정보 */}
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
            <div className="ml-3">
              <p className="font-medium">{product.sellerName}</p>
              <p className="text-xs text-gray-500">
                <span
                  className={`${
                    sellerRating > 3
                      ? "text-blue-500 font-semibold"
                      : "text-gray-500"
                  }`}
                >
                  {getRatingSentiment(sellerRating)}
                </span>
                <span className="ml-1">
                  ·{" "}
                  {reviewCount > 0
                    ? `리뷰 ${reviewCount}개`
                    : "아직 리뷰가 없습니다"}
                </span>
              </p>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-2">
            <button
              onClick={handlePurchase}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium"
            >
              구매하기
            </button>
            <button
              onClick={toggleBookmark}
              className={`flex items-center w-100 justify-center px-4 py-3 border rounded-md hover:bg-gray-50 ${
                isBookmarked ? "border-pink-300 bg-pink-50" : "border-gray-300"
              }`}
            >
              {isBookmarked ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-pink-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-400 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span>찜하기</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 상세 설명 */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-6">상세설명</h2>
        <div className="whitespace-pre-line text-gray-700">
          {product.description}
        </div>
      </div>

      <div className="my-6 flex items-center mt-8 mb-12">
        <hr className="flex-grow border-t border-gray-300" />
      </div>

      {/* 관련 상품 */}
      <div>
        <h2 className="text-xl font-bold mb-6">비슷한 상품</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {relatedProducts.map((item) => (
            <a
              href={`/product-detail/${item.id}`}
              key={item.id}
              className="block bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-gray-300">
                {item.images && item.images.length > 0 && (
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium mb-1 truncate">
                  {item.name}
                </h3>
                <p className="font-bold">{item.price.toLocaleString()}원</p>
                <p className="text-xs text-gray-500">
                  {formatDate(item.createdAt)}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* 배송 안내 팝업 */}
      {isDeliveryPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl relative">
            {/* 닫기 버튼 */}
            <button
              onClick={handleClosePopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 className="text-xl font-bold mb-8">SubwayHero 배송 안내</h2>

            {/* 안전한 비대면 거래 */}
            <div className="flex mb-8">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 shrink-0">
                <div className="w-8 h-8 bg-blue-200 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">안전한 비대면 거래</h3>
                <p className="text-sm text-gray-700">
                  SubwayHero 배송을 통해 지하철 라이더가 상품을 배송합니다.
                  판매자와 직접 만나지 않아도 안전하게 거래할 수 있습니다.
                </p>
              </div>
            </div>

            {/* 당일 배송 가능 */}
            <div className="flex mb-8">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 shrink-0">
                <div className="w-8 h-8 bg-blue-200 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">당일 배송 가능</h3>
                <p className="text-sm text-gray-700">
                  오늘 구매하면 내일 받아볼 수 있습니다. 지하철 운영 시간 내에
                  배송이 이루어집니다.
                </p>
              </div>
            </div>

            {/* 지하철역 기반 배송 */}
            <div className="flex mb-8">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 shrink-0">
                <div className="w-8 h-8 bg-blue-200 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">지하철역 기반 배송</h3>
                <p className="text-sm text-gray-700">
                  지하철역을 중심으로 배송이 이루어집니다. 역에서 도보 15분 이내
                  지역까지 배송 가능합니다.
                </p>
              </div>
            </div>

            <div className="border-t my-6"></div>

            {/* 이용약관 동의 */}
            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="terms-checkbox"
                checked={isTermsAgreed}
                onChange={() => setIsTermsAgreed(!isTermsAgreed)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="terms-checkbox"
                className="ml-2 text-sm text-gray-700"
              >
                SubwayHero를 통한 실버택배 이용에 동의합니다
              </label>
            </div>

            {/* 배송 요청 버튼 */}
            <button
              onClick={handleDeliveryRequest}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-md"
            >
              배송요청
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
