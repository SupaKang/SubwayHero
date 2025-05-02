import { useState, useEffect } from "react";
import { db } from "../../../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  startAfter,
  limit,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";

import SideFilter from "./components/SideFilter";
import ProductSorter from "./components/ProductSorter";
import SearchBar from "./components/SearchBar";
import ProductList from "./components/ProductList";
import Pagination from "./components/Pagination";
import {
  Product,
  Category,
  PriceOption,
  ConditionOption,
  PriceRange,
  SortOption,
} from "./components/types";

const MarketPage = () => {
  // 상태 관리
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<PriceRange>({
    min: "",
    max: "",
  });
  const [sortOption, setSortOption] = useState<SortOption>("최신순");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastVisible, setLastVisible] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  // 필터링 관련 상태 추가
  const [activeFilters, setActiveFilters] = useState<{
    categories: string[];
    priceRange: PriceRange;
    conditions: string[];
    searchQuery: string;
  }>({
    categories: [],
    priceRange: { min: "", max: "" },
    conditions: [],
    searchQuery: "",
  });
  const [suggestions, setSuggestions] = useState<string[]>([]); // 자동완성 추천어 목록
  const [allProductNames, setAllProductNames] = useState<string[]>([]); // 모든 상품명 목록

  // 카테고리 목록
  const categories: Category[] = [
    { id: "digital", name: "디지털기기" },
    { id: "furniture", name: "생활가전" },
    { id: "interior", name: "가구/인테리어" },
    { id: "kitchen", name: "생활/주방" },
    { id: "kids", name: "유아동" },
    { id: "women", name: "여성의류" },
    { id: "fashion", name: "의류" },
    { id: "beauty", name: "뷰티/미용" },
    { id: "sports", name: "스포츠/레저" },
    { id: "hobby", name: "취미/게임/음반" },
    { id: "books", name: "도서" },
    { id: "food", name: "식품" },
    { id: "etc", name: "기타" },
  ];

  // 가격 범위 옵션
  const priceOptions: PriceOption[] = [
    { id: "under10000", name: "1만원 이하" },
    { id: "10000to50000", name: "1만원~5만원" },
    { id: "50000to100000", name: "5만원~10만원" },
    { id: "over100000", name: "10만원 이상" },
  ];

  // 상품 상태 옵션
  const conditionOptions: ConditionOption[] = [
    { id: "new", name: "새 상품" },
    { id: "almost_new", name: "거의 새 것" },
    { id: "used", name: "사용감 있음" },
    { id: "old", name: "중고" },
  ];

  // 이벤트 핸들러들

  // 정렬 옵션 선택 핸들러
  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
    setCurrentPage(1);
    setLastVisible(null);
    fetchProducts(true);
  };

  // 카테고리 선택 핸들러
  const handleCategoryChange = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(
        selectedCategories.filter((id) => id !== categoryId)
      );
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  // 가격 범위 입력 핸들러
  const handlePriceChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    setPriceRange({
      ...priceRange,
      [field]: e.target.value,
    });
  };

  // 가격 옵션 선택 핸들러
  const handlePriceOptionChange = (optionId: string) => {
    let min = "";
    let max = "";

    // 현재 선택된 옵션과 동일한 옵션을 다시 선택했는지 확인
    const isAlreadySelected =
      (optionId === "under10000" &&
        priceRange.min === "0" &&
        priceRange.max === "10000") ||
      (optionId === "10000to50000" &&
        priceRange.min === "10000" &&
        priceRange.max === "50000") ||
      (optionId === "50000to100000" &&
        priceRange.min === "50000" &&
        priceRange.max === "100000") ||
      (optionId === "over100000" &&
        priceRange.min === "100000" &&
        priceRange.max === "");

    // 이미 선택된 옵션을 다시 클릭한 경우 가격 필터 초기화
    if (isAlreadySelected) {
      min = "";
      max = "";
    } else {
      // 새로운 옵션 선택 시 해당 가격 범위 설정
      switch (optionId) {
        case "under10000":
          min = "0";
          max = "10000";
          break;
        case "10000to50000":
          min = "10000";
          max = "50000";
          break;
        case "50000to100000":
          min = "50000";
          max = "100000";
          break;
        case "over100000":
          min = "100000";
          max = "";
          break;
        default:
          break;
      }
    }

    setPriceRange({ min, max });
    // 가격 범위 변경 시 바로 필터 적용
    setCurrentPage(1);
    setLastVisible(null);
    // 필터 상태 업데이트 및 적용
    setActiveFilters((prev) => ({
      ...prev,
      priceRange: { min, max },
    }));
    // fetchProducts 호출은 useEffect로 처리
  };

  // 필터 적용 핸들러
  const handleApplyFilter = () => {
    console.log("Applying filters:", {
      price: priceRange,
      conditions: selectedConditions,
    });
    setCurrentPage(1);
    setLastVisible(null);

    // 현재 선택된 필터 상태 저장
    setActiveFilters({
      categories: selectedCategories,
      priceRange: priceRange,
      conditions: selectedConditions,
      searchQuery: searchQuery,
    });
  };

  // 검색어 입력 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // 검색어가 있을 경우 자동완성 추천어 필터링
    if (query) {
      const filteredSuggestions = allProductNames
        .filter((name) => name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5); // 최대 5개까지만 표시
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]); // 검색어가 없으면 추천 목록도 비우기
    }
  };

  // 자동완성 추천어 클릭 핸들러
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setSuggestions([]);

    // 선택한 추천어로 바로 검색 실행
    setCurrentPage(1);
    setLastVisible(null);
    setActiveFilters((prev) => ({
      ...prev,
      searchQuery: suggestion,
    }));
  };

  // 상품 상태 선택 핸들러
  const handleConditionChange = (conditionId: string) => {
    if (selectedConditions.includes(conditionId)) {
      setSelectedConditions(
        selectedConditions.filter((id) => id !== conditionId)
      );
    } else {
      setSelectedConditions([...selectedConditions, conditionId]);
    }
  };

  // 검색 제출 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setLastVisible(null);
    setActiveFilters((prev) => ({
      ...prev,
      searchQuery: searchQuery,
    }));
    // 검색어 업데이트로 인한 fetchProducts는 useEffect에서 처리됨
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    if (page < currentPage) {
      // 이전 페이지로 가는 경우, 처음부터 다시 로드
      setLastVisible(null);
      setCurrentPage(page);
    } else if (page > currentPage) {
      // 다음 페이지로 가는 경우
      setCurrentPage(page);
    }
  };

  // 이전 또는 다음 페이지 버튼 클릭 핸들러
  const handlePrevNext = (direction: "prev" | "next") => {
    if (direction === "prev" && currentPage > 1) {
      handlePageChange(currentPage - 1);
    } else if (direction === "next" && hasMore) {
      handlePageChange(currentPage + 1);
    }
  };

  // 더 불러오기 핸들러
  const handleLoadMore = () => {
    fetchProducts(false);
  };

  // 제품 목록 가져오기
  const fetchProducts = async (reset = false) => {
    console.log("Fetching products with filters:", {
      categories: activeFilters.categories,
      price: activeFilters.priceRange,
      conditions: activeFilters.conditions,
    });

    setLoading(true);
    try {
      const itemsPerPage = 12; // 페이지당 상품 수
      let allProducts = [];

      // 1. 기본 쿼리 - 제품 상태가 active인 제품 가져오기
      let baseQuery = query(
        collection(db, "products"),
        where("status", "==", "active")
      );

      // 2. 카테고리 필터링
      if (activeFilters.categories.length > 0) {
        baseQuery = query(
          baseQuery,
          where("category", "in", activeFilters.categories)
        );
      }

      // 3. 정렬 옵션 적용 - 항상 기본 정렬은 적용
      let sortedQuery;
      switch (sortOption) {
        case "최신순":
          sortedQuery = query(baseQuery, orderBy("createdAt", "desc"));
          break;
        case "가격 낮은순":
          sortedQuery = query(baseQuery, orderBy("price", "asc"));
          break;
        case "가격 높은순":
          sortedQuery = query(baseQuery, orderBy("price", "desc"));
          break;
        case "인기순":
          // 인기순은 최신순으로 대체
          sortedQuery = query(baseQuery, orderBy("createdAt", "desc"));
          break;
        default:
          sortedQuery = query(baseQuery, orderBy("createdAt", "desc"));
      }

      // 4. 페이지네이션 적용
      let paginatedQuery;
      if (lastVisible && !reset) {
        paginatedQuery = query(
          sortedQuery,
          startAfter(lastVisible),
          limit(itemsPerPage)
        );
      } else {
        paginatedQuery = query(sortedQuery, limit(itemsPerPage));
      }

      // 5. 실행 및 결과 가져오기
      const querySnapshot = await getDocs(paginatedQuery);

      if (querySnapshot.empty) {
        setHasMore(false);
        if (reset) {
          setProducts([]);
        }
        return;
      }

      // 결과 처리
      let newProducts = querySnapshot.docs.map((doc) => {
        const data = doc.data() as Product;
        return {
          id: doc.id,
          name: data.name,
          price: data.price,
          images: data.images || [],
          createdAt: data.createdAt,
          status: data.status,
          category: data.category,
          sellerId: data.sellerId,
          sellerName: data.sellerName,
          condition: data.condition,
        };
      });

      // 마지막 문서 저장
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);

      // 6. 클라이언트 측 추가 필터링 (Firestore 제한으로 인해)
      // 검색어 필터링
      if (activeFilters.searchQuery) {
        const searchTerm = activeFilters.searchQuery.toLowerCase();
        newProducts = newProducts.filter((product) =>
          product.name.toLowerCase().includes(searchTerm)
        );
      }

      // 가격 필터
      if (activeFilters.priceRange.min || activeFilters.priceRange.max) {
        newProducts = newProducts.filter((product) => {
          const price = product.price;
          const min = activeFilters.priceRange.min
            ? parseInt(activeFilters.priceRange.min)
            : 0;
          const max = activeFilters.priceRange.max
            ? parseInt(activeFilters.priceRange.max)
            : Infinity;

          return price >= min && price <= max;
        });
      }

      // 상품 상태 필터
      if (activeFilters.conditions.length > 0) {
        newProducts = newProducts.filter((product) => {
          // condition 필드가 없는 경우 대비
          if (!product.condition) return false;
          return activeFilters.conditions.includes(product.condition);
        });
      }

      // 7. 결과 업데이트
      if (reset) {
        setProducts(newProducts);
      } else {
        setProducts((prev) => [...prev, ...newProducts]);
      }

      // 다음 페이지 존재 여부
      setHasMore(
        querySnapshot.docs.length === itemsPerPage && newProducts.length > 0
      );
    } catch (error) {
      console.error("상품 목록 가져오기 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  // 모든 상품명 가져오기 (자동완성용)
  const fetchAllProductNames = async () => {
    try {
      const productsQuery = query(
        collection(db, "products"),
        where("status", "==", "active")
      );

      const querySnapshot = await getDocs(productsQuery);
      const names = querySnapshot.docs.map((doc) => doc.data().name);

      // 중복 제거
      const uniqueNames = [...new Set(names)];
      setAllProductNames(uniqueNames);
    } catch (error) {
      console.error("상품명 가져오기 오류:", error);
    }
  };

  // 카테고리, 상품 상태 선택 변경 시 activeFilters 업데이트
  useEffect(() => {
    // 선택된 필터가 변경될 때마다 activeFilters 업데이트
    setActiveFilters((prev) => ({
      ...prev,
      categories: selectedCategories,
      conditions: selectedConditions,
    }));
  }, [selectedCategories, selectedConditions]);

  // 필터나 정렬 옵션이 변경될 때마다 상품 목록 새로고침
  useEffect(() => {
    fetchProducts(true);
  }, [activeFilters, sortOption]);

  // 최초 로딩
  useEffect(() => {
    fetchProducts(true);
    fetchAllProductNames(); // 자동완성용 상품명 로드
  }, []);

  // 페이지네이션 설정
  const totalPages = Math.ceil(products.length / 12);

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        {/* 사이드 필터 */}
        <SideFilter
          categories={categories}
          selectedCategories={selectedCategories}
          priceOptions={priceOptions}
          priceRange={priceRange}
          conditionOptions={conditionOptions}
          selectedConditions={selectedConditions}
          onCategoryChange={handleCategoryChange}
          onPriceChange={handlePriceChange}
          onPriceOptionChange={handlePriceOptionChange}
          onConditionChange={handleConditionChange}
          onApplyFilter={handleApplyFilter}
        />

        {/* 메인 콘텐츠 */}
        <div className="flex-1">
          {/* 검색 및 정렬 옵션 */}
          <div className="flex justify-between items-center mb-4">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onSearch={handleSearch}
              suggestions={suggestions}
              onSuggestionClick={handleSuggestionClick}
            />
            <ProductSorter
              sortOption={sortOption}
              onSortChange={handleSortChange}
            />
          </div>

          {/* 필터 요약 표시 */}
          {(activeFilters.categories.length > 0 ||
            activeFilters.priceRange.min ||
            activeFilters.priceRange.max ||
            activeFilters.conditions.length > 0) && (
            <div className="mb-4 flex flex-wrap gap-2">
              {activeFilters.categories.map((catId) => (
                <span
                  key={catId}
                  className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded"
                >
                  {categories.find((cat) => cat.id === catId)?.name || catId}
                </span>
              ))}
              {(activeFilters.priceRange.min ||
                activeFilters.priceRange.max) && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                  가격:
                  {activeFilters.priceRange.min
                    ? ` ${parseInt(
                        activeFilters.priceRange.min
                      ).toLocaleString()}원부터`
                    : ""}
                  {activeFilters.priceRange.max
                    ? ` ${parseInt(
                        activeFilters.priceRange.max
                      ).toLocaleString()}원까지`
                    : ""}
                </span>
              )}
              {activeFilters.conditions.map((condId) => (
                <span
                  key={condId}
                  className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded"
                >
                  {conditionOptions.find((cond) => cond.id === condId)?.name ||
                    condId}
                </span>
              ))}
            </div>
          )}

          {/* 상품 목록 */}
          <ProductList
            products={products}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
          />

          {/* 페이지네이션 */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasMore={hasMore}
            onPageChange={handlePageChange}
            onPrevNext={handlePrevNext}
          />
        </div>
      </div>
    </div>
  );
};

export default MarketPage;
