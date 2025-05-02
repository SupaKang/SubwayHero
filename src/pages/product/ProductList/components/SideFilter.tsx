import React from "react";
import { Link } from "react-router-dom";
import { Category, PriceOption, PriceRange, ConditionOption } from "./types";

interface SideFilterProps {
  categories: Category[];
  selectedCategories: string[];
  priceOptions: PriceOption[];
  priceRange: PriceRange;
  conditionOptions: ConditionOption[];
  selectedConditions: string[];
  onCategoryChange: (categoryId: string) => void;
  onPriceChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => void;
  onPriceOptionChange: (optionId: string) => void;
  onConditionChange: (conditionId: string) => void;
  onApplyFilter: () => void;
}

const SideFilter: React.FC<SideFilterProps> = ({
  categories,
  selectedCategories,
  priceOptions,
  priceRange,
  conditionOptions,
  selectedConditions,
  onCategoryChange,
  onPriceChange,
  onPriceOptionChange,
  onConditionChange,
  onApplyFilter,
}) => {
  // 가격 옵션이 현재 선택된 가격 범위와 일치하는지 확인하는 함수
  const isPriceOptionSelected = (optionId: string): boolean => {
    switch (optionId) {
      case "under10000":
        return priceRange.min === "0" && priceRange.max === "10000";
      case "10000to50000":
        return priceRange.min === "10000" && priceRange.max === "50000";
      case "50000to100000":
        return priceRange.min === "50000" && priceRange.max === "100000";
      case "over100000":
        return priceRange.min === "100000" && priceRange.max === "";
      default:
        return false;
    }
  };

  // 입력 필드에서 엔터 키 누를 때 필터 적용
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault(); // 폼 제출 방지
      onApplyFilter();
    }
  };

  // 카테고리 변경 핸들러
  const handleCategoryChangeAndApply = (categoryId: string) => {
    onCategoryChange(categoryId);
    // 카테고리는 자동으로 적용됨 (부모 컴포넌트에서 useEffect로 처리)
  };

  // 상품 상태 변경 핸들러
  const handleConditionChangeAndApply = (conditionId: string) => {
    onConditionChange(conditionId);
    // 즉시 필터 적용 (부모 컴포넌트에서 useEffect로 처리)
  };

  return (
    <div className="w-full md:w-60 bg-white border border-gray-300 rounded-xl p-6 h-fit">
      <h2 className="text-xl font-bold mb-4">필터</h2>

      {/* 카테고리 필터 */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">카테고리</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center">
              <input
                type="checkbox"
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleCategoryChangeAndApply(category.id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor={`category-${category.id}`}
                className="ml-2 text-sm text-gray-700"
              >
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* 가격 필터 */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">가격</h3>
        <div className="flex items-center mb-3">
          <input
            type="number"
            placeholder="최소"
            value={priceRange.min}
            onChange={(e) => onPriceChange(e, "min")}
            onKeyPress={handleKeyPress}
            className="w-20 p-1 border border-gray-300 rounded text-sm"
            min="0"
          />
          <span className="mx-2">~</span>
          <input
            type="number"
            placeholder="최대"
            value={priceRange.max}
            onChange={(e) => onPriceChange(e, "max")}
            onKeyPress={handleKeyPress}
            className="w-20 p-1 border border-gray-300 rounded text-sm"
            min="0"
          />
          <button
            onClick={(e) => {
              e.preventDefault(); // 폼 제출 방지
              onApplyFilter();
            }}
            className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
          >
            적용
          </button>
        </div>

        <div className="space-y-2">
          {priceOptions.map((option) => (
            <div key={option.id} className="flex items-center">
              <input
                type="checkbox"
                id={`price-${option.id}`}
                checked={isPriceOptionSelected(option.id)}
                onChange={() => onPriceOptionChange(option.id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor={`price-${option.id}`}
                className="ml-2 text-sm text-gray-700"
              >
                {option.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* 상품 상태 필터 */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">상품 상태</h3>
        <div className="space-y-2">
          {conditionOptions.map((option) => (
            <div key={option.id} className="flex items-center">
              <input
                type="checkbox"
                id={`condition-${option.id}`}
                checked={selectedConditions.includes(option.id)}
                onChange={() => handleConditionChangeAndApply(option.id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor={`condition-${option.id}`}
                className="ml-2 text-sm text-gray-700"
              >
                {option.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* 상품 등록 버튼 */}
      <Link to="/product-upload">
        <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm">
          상품 등록
        </button>
      </Link>
    </div>
  );
};

export default SideFilter;
