import React from "react";
import { Product, formatDate } from "./types";

interface ProductManagementProps {
  products: Product[];
  loading: boolean;
  onEditProduct: (productId: string) => void;
  onDeleteProduct: (productId: string) => void;
}

const ProductManagement: React.FC<ProductManagementProps> = ({
  products,
  loading,
  onEditProduct,
  onDeleteProduct,
}) => {
  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">등록된 판매글이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {products.map((product) => (
        <div key={product.id}>
          <div className="p-4 flex flex-col sm:flex-row">
            <div className="sm:w-1/4 mb-4 sm:mb-0">
              {/* 상태 표시 */}
              <div
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  product.status === "active"
                    ? "bg-green-100 text-green-800"
                    : product.status === "sold"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {product.status === "active"
                  ? "판매중"
                  : product.status === "sold"
                  ? "판매완료"
                  : product.status === "inactive"
                  ? "판매중지"
                  : product.status}
              </div>

              {/* 상품 이미지 */}
              <div className="mt-2 w-24 h-24 bg-gray-200">
                {product.images && product.images.length > 0 && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>

            {/* 판매글 정보 */}
            <div className="sm:w-2/4 mb-4 sm:mb-0">
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-xl font-bold mt-1">
                {product.price.toLocaleString()}원
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {formatDate(product.createdAt)}
              </p>
            </div>

            {/* 판매글 액션 버튼 */}
            <div className="sm:w-1/4 flex flex-col space-y-2 sm:items-end">
              <button
                onClick={() => onEditProduct(product.id)}
                className="w-full sm:w-32 px-4 py-2 border border-gray-300 rounded-md text-sm text-center hover:bg-gray-50"
              >
                수정하기
              </button>
              <button
                onClick={() => onDeleteProduct(product.id)}
                className="w-full sm:w-32 px-4 py-2 border border-red-500 text-red-500 rounded-md text-sm hover:bg-red-50 text-center"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductManagement;
