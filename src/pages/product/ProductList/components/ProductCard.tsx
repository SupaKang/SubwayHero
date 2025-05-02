import { Link } from "react-router-dom";
import { Product, formatDate } from "./types";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Link to={`/product-detail/${product.id}`}>
      <div className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
        <div className="aspect-square bg-gray-100 overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              이미지 없음
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium mb-1 truncate">{product.name}</h3>
          <p className="font-bold text-lg">
            {product.price.toLocaleString()}원
          </p>
          <p className="text-xs text-gray-500">
            {formatDate(product.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
