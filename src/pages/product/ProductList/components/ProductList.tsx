import { Link } from "react-router-dom";
import { Product } from "./types";
import ProductCard from "./ProductCard";

interface ProductListProps {
  products: Product[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  loading,
  hasMore,
  onLoadMore,
}) => {
  return (
    <div>
      {/* 로딩 상태 표시 */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* 상품이 없을 때 표시 */}
      {!loading && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-gray-500 mb-4">등록된 상품이 없습니다.</p>
          <Link to="/product-upload">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              상품 등록하기
            </button>
          </Link>
        </div>
      )}

      {/* 상품 그리드 */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* 더 불러오기 버튼 */}
      {!loading && products.length > 0 && hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
          >
            더 보기
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
