import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { db, storage } from "../../../firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { useNavigate, useParams } from "react-router-dom";

const ProductEditPage = () => {
  // URL 파라미터에서 상품 ID 가져오기
  const { id } = useParams<{ id: string }>();

  // 인증 컨텍스트와 네비게이션 훅
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // 상태 관리
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [productCondition, setProductCondition] = useState("");
  const [packageCondition, setPackageCondition] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<Array<string | File>>([]);
  const [location, setLocation] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(true); // 수정 시에는 기본적으로 true
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  // 파일 입력용 ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 카테고리 옵션
  const categoryOptions = [
    { value: "digital", label: "디지털기기" },
    { value: "furniture", label: "생활가전" },
    { value: "interior", label: "가구/인테리어" },
    { value: "kitchen", label: "생활/주방" },
    { value: "kids", label: "유아동" },
    { value: "women", label: "여성의류" },
    { value: "fashion", label: "의류" },
    { value: "beauty", label: "뷰티/미용" },
    { value: "sports", label: "스포츠/레저" },
    { value: "hobby", label: "취미/게임/음반" },
    { value: "books", label: "도서" },
    { value: "food", label: "식품" },
    { value: "etc", label: "기타" },
  ];

  // 상품 상태 옵션
  const conditionOptions = [
    { value: "new", label: "새 상품" },
    { value: "almost_new", label: "거의 새 것" },
    { value: "used", label: "사용감 있음" },
    { value: "old", label: "오래됨" },
  ];

  // 포장 상태 옵션
  const packageOptions = [
    { value: "original", label: "제품 박스 포장" },
    { value: "simple", label: "소포장 포장" },
    { value: "none", label: "포장 없음" },
  ];

  // 상품 정보 불러오기
  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const productRef = doc(db, "products", id);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const productData = productSnap.data();

          // 현재 유저가 판매자인지 확인
          if (productData.sellerId !== currentUser?.uid) {
            alert("상품 수정 권한이 없습니다.");
            navigate("/mypage");
            return;
          }

          // 기존 상품 데이터로 폼 초기화
          setProductName(productData.name || "");
          setPrice(productData.price?.toString() || "");
          setCategory(productData.category || "");
          setProductCondition(productData.condition || "");
          setPackageCondition(productData.packageCondition || "");
          setDescription(productData.description || "");
          setLocation(productData.location || "");

          // 이미지 처리
          if (productData.images && productData.images.length > 0) {
            setExistingImages(productData.images);
            setImages(productData.images);
            setImagePreview(productData.images[0]);
          }
        } else {
          alert("상품 정보를 찾을 수 없습니다.");
          navigate("/mypage");
        }
      } catch (error) {
        console.error("상품 정보 로드 오류:", error);
        alert("상품 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [id, currentUser, navigate]);

  // 이미지 업로드 핸들러
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 이미지 파일 유효성 검사
      if (!file.type.match("image.*")) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }

      // 파일 크기 제한 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("파일 크기는 5MB 이하여야 합니다.");
        return;
      }

      // 이미지 미리보기 생성
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // 이미지 추가 (최대 5개까지)
      if (existingImages.length + newImages.length < 5) {
        setNewImages([...newImages, file]);
      } else {
        alert("이미지는 최대 5개까지 업로드 가능합니다.");
      }
    }
  };

  // 이미지 업로드 버튼 클릭 핸들러
  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  // 위치 찾기 핸들러
  const handleFindLocation = () => {
    // 위치 검색 기능 구현
    alert("위치 검색 기능이 실행됩니다.");
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 로그인 확인
    if (!currentUser) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/auth");
      return;
    }

    if (!id) {
      alert("상품 ID가 유효하지 않습니다.");
      return;
    }

    // 필수 항목 검증
    if (
      !productName ||
      !price ||
      !category ||
      !productCondition ||
      !packageCondition ||
      !description ||
      (existingImages.length === 0 && newImages.length === 0)
    ) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }

    if (!agreeToTerms) {
      alert("이용약관에 동의해주세요.");
      return;
    }

    try {
      setIsLoading(true);

      // 새 이미지가 있는 경우 업로드
      let allImageUrls = [...existingImages];

      if (newImages.length > 0) {
        const newImageUrls = await Promise.all(
          newImages.map(async (image) => {
            const filename = `${uuidv4()}-${image.name}`;
            const storageRef = ref(storage, `products/${filename}`);
            await uploadBytes(storageRef, image);
            return getDownloadURL(storageRef);
          })
        );

        allImageUrls = [...existingImages, ...newImageUrls];
      }

      // 상품 데이터 준비
      const productData = {
        name: productName,
        price: parseInt(price),
        category,
        condition: productCondition,
        packageCondition,
        description,
        images: allImageUrls,
        location,
        updatedAt: serverTimestamp(),
      };

      // Firestore에서 상품 데이터 업데이트
      const productRef = doc(db, "products", id);
      await updateDoc(productRef, productData);

      alert("상품이 성공적으로 수정되었습니다.");

      // 마이페이지의 판매글 관리 탭으로 이동
      navigate("/mypage", { state: { activeTab: "판매글관리" } });
    } catch (error) {
      console.error("상품 수정 오류:", error);
      alert("상품 수정에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // 이미지 제거 핸들러
  const handleRemoveImage = (index: number) => {
    // 이미지가 하나라도 있어야 함
    if (existingImages.length + newImages.length <= 1) {
      alert("이미지는 최소 한 개 이상 필요합니다.");
      return;
    }

    // 기존 이미지인 경우
    if (index < existingImages.length) {
      const newExistingImages = [...existingImages];
      newExistingImages.splice(index, 1);
      setExistingImages(newExistingImages);
      setImages(newExistingImages.concat(newImages));

      // 첫 번째 이미지가 제거되는 경우 미리보기 업데이트
      if (index === 0 && newExistingImages.length > 0) {
        setImagePreview(newExistingImages[0]);
      } else if (index === 0 && newImages.length > 0) {
        // 미리보기를 첫 번째 새 이미지로 설정
        const reader = new FileReader();
        reader.onload = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(newImages[0]);
      }
    }
    // 새 이미지인 경우
    else {
      const newImagesIndex = index - existingImages.length;
      const updatedNewImages = [...newImages];
      updatedNewImages.splice(newImagesIndex, 1);
      setNewImages(updatedNewImages);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 mt-8 mb-24">
      <h1 className="text-2xl font-bold mb-6">상품 수정</h1>

      {isLoading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!isLoading && (
        <div className="space-y-6">
          {/* 상품 이미지 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상품 이미지
              <span className="text-red-500">*</span>
            </label>
            <div
              className="border-2 border-gray-300 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
              onClick={handleImageButtonClick}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="상품 이미지 미리보기"
                  className="w-full max-h-64 object-contain mb-4"
                />
              ) : (
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="mt-1 text-sm text-gray-500">
                    최대 5장까지 업로드 가능합니다. 첫 번째 이미지가 대표
                    이미지로 설정됩니다.
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* 이미지 목록 및 삭제 기능 */}
            {(existingImages.length > 0 || newImages.length > 0) && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  업로드된 이미지
                </p>
                <div className="flex flex-wrap gap-2">
                  {existingImages.map((img, index) => (
                    <div key={`existing-${index}`} className="relative">
                      <img
                        src={img}
                        alt={`상품 이미지 ${index + 1}`}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {newImages.map((_, index) => (
                    <div key={`new-${index}`} className="relative">
                      <div className="w-16 h-16 bg-blue-100 flex items-center justify-center rounded">
                        <span className="text-xs text-blue-500">새 이미지</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveImage(existingImages.length + index)
                        }
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="mt-2 text-xs text-gray-500">
              {existingImages.length + newImages.length > 0
                ? `${
                    existingImages.length + newImages.length
                  }개의 이미지가 선택됨`
                : ""}
            </p>
          </div>

          {/* 상품명 */}
          <div>
            <label
              htmlFor="productName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              상품명<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="상품명을 입력하세요"
            />
          </div>

          {/* 가격 */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              가격<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="가격을 입력하세요"
              min="0"
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              카테고리<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="" disabled>
                  카테고리 선택
                </option>
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* 제품 상태 */}
          <div>
            <label
              htmlFor="productCondition"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              제품 상태<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="productCondition"
                value={productCondition}
                onChange={(e) => setProductCondition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="" disabled>
                  상태 선택
                </option>
                {conditionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* 포장 상태 */}
          <div>
            <label
              htmlFor="packageCondition"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              포장 상태<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="packageCondition"
                value={packageCondition}
                onChange={(e) => setPackageCondition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="" disabled>
                  포장 상태 선택
                </option>
                {packageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* 상품 수거장소 */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              상품 수거장소<span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="수거 장소를 입력하세요"
              />
              <button
                type="button"
                onClick={handleFindLocation}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                주소 찾기
              </button>
            </div>
          </div>

          {/* 상품 상세설명 */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              상품 상세설명<span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={6}
              placeholder="상품에 대한 자세한 설명을 입력하세요"
            ></textarea>
          </div>

          {/* 서비스 안내 */}
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="text-blue-600 font-medium mb-2">
              SubwayHero 실버택배 서비스 안내
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>- 지하철을 이용한 친환경 배송 서비스입니다.</li>
              <li>
                - 등록한 상품이 판매되면 선택한 시간대에 실버 배송기사가
                방문하여 상품을 수거합니다.
              </li>
              <li>
                - 배송비는 3,000원부터 시작하며, 거리에 따라 추가 비용이 발생할
                수 있습니다.
              </li>
              <li>
                - 당일 수거 후 다음날 배송이 원칙이며, 구매자 요청에 따라 변경될
                수 있습니다.
              </li>
            </ul>
          </div>

          {/* 이용약관 동의 */}
          <div>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="agreeToTerms"
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agreeToTerms" className="text-gray-700">
                  SubwayHero를 통한 실버택배 이용에 동의합니다
                </label>
                <span className="text-red-500">*</span>
              </div>
            </div>
          </div>

          {/* 수정 버튼 */}
          <div className="flex gap-4">
            <button
              onClick={() =>
                navigate("/mypage", { state: { activeTab: "판매글관리" } })
              }
              className="w-1/3 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-2/3 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
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
                  처리 중...
                </span>
              ) : (
                "상품 수정하기"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductEditPage;
