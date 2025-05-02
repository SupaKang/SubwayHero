import React from "react";
import { WishlistItem, formatDate } from "./types";

interface WishlistProps {
  wishlist: WishlistItem[];
  loading: boolean;
  onViewProduct: (productId: string) => void;
  onRemoveWishlist: (wishlistItemId: string) => void;
}

const Wishlist: React.FC<WishlistProps> = ({
  wishlist,
  loading,
  onViewProduct,
  onRemoveWishlist,
}) => {
  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">찜한 상품이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {wishlist.map(
          (item) =>
            item.product && (
              <div
                key={item.id}
                className="bg-white rounded-lg overflow-hidden shadow"
              >
                <div className="w-full h-48 bg-gray-200">
                  {item.product.images && item.product.images.length > 0 ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs sm:text-base">
                      이미지 없음
                    </div>
                  )}
                </div>

                <div className="p-2 sm:p-4">
                  <h3 className="text-s font-medium truncate">
                    {item.product.name}
                  </h3>
                  <p className="text-xl font-bold mt-1 sm:mt-2">
                    {item.product.price.toLocaleString()}원
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {formatDate(item.createdAt)}
                  </p>

                  {/* 액션 버튼 - 모바일에서는 세로로 배치 */}
                  <div className="flex flex-col sm:flex-row mt-2 sm:mt-4 space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={() => onViewProduct(item.product.id)}
                      className="w-full px-1 py-1 border border-blue-500 text-blue-500 rounded-md text-s text-center hover:bg-blue-50"
                    >
                      상품 보기
                    </button>
                    <button
                      onClick={() => onRemoveWishlist(item.id)}
                      className="w-full px-1 py-1 border border-gray-300 rounded-md text-s text-center hover:bg-gray-50"
                    >
                      찜 해제
                    </button>
                  </div>
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default Wishlist;
