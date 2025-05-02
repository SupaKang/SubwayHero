import React from "react";
import { SortOption } from "./types";

interface ProductSorterProps {
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
}

const ProductSorter: React.FC<ProductSorterProps> = ({
  sortOption,
  onSortChange,
}) => {
  return (
    <div className="flex space-x-4">
      <button
        onClick={() => onSortChange("최신순")}
        className={`text-sm ${
          sortOption === "최신순" ? "font-bold text-blue-500" : "text-gray-500"
        }`}
      >
        최신순
      </button>
      <button
        onClick={() => onSortChange("인기순")}
        className={`text-sm ${
          sortOption === "인기순" ? "font-bold text-blue-500" : "text-gray-500"
        }`}
      >
        인기순
      </button>
      <button
        onClick={() => onSortChange("가격 낮은순")}
        className={`text-sm ${
          sortOption === "가격 낮은순"
            ? "font-bold text-blue-500"
            : "text-gray-500"
        }`}
      >
        가격 낮은순
      </button>
      <button
        onClick={() => onSortChange("가격 높은순")}
        className={`text-sm ${
          sortOption === "가격 높은순"
            ? "font-bold text-blue-500"
            : "text-gray-500"
        }`}
      >
        가격 높은순
      </button>
    </div>
  );
};

export default ProductSorter;
