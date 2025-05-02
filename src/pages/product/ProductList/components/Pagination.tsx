import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onPrevNext: (direction: "prev" | "next") => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  hasMore,
  onPageChange,
  onPrevNext,
}) => {
  return (
    <div className="flex justify-center mt-8">
      <div className="inline-flex">
        <button
          className={`px-3 py-1 border border-gray-300 rounded-l-md text-sm ${
            currentPage === 1
              ? "bg-gray-100 cursor-not-allowed"
              : "bg-white hover:bg-gray-50"
          }`}
          onClick={() => onPrevNext("prev")}
          disabled={currentPage === 1}
        >
          이전
        </button>
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => onPageChange(i + 1)}
            className={`px-3 py-1 border-t border-b border-r border-gray-300 text-sm ${
              i + 1 === currentPage
                ? "bg-blue-600 text-white"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          className={`px-3 py-1 border-t border-b border-r border-gray-300 rounded-r-md text-sm ${
            !hasMore
              ? "bg-gray-100 cursor-not-allowed"
              : "bg-white hover:bg-gray-50"
          }`}
          onClick={() => onPrevNext("next")}
          disabled={!hasMore}
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default Pagination;
