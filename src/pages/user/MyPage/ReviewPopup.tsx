import React, { useState } from "react";
import { Order, formatDate } from "./types";
import StarRating from "./StarRating";

interface ReviewPopupProps {
  order: Order;
  onClose: () => void;
  onSubmit: (
    productRating: number,
    sellerRating: number,
    satisfactionRating: number,
    content: string
  ) => void;
}

const ReviewPopup: React.FC<ReviewPopupProps> = ({
  order,
  onClose,
  onSubmit,
}) => {
  const [productRating, setProductRating] = useState(0);
  const [sellerRating, setSellerRating] = useState(0);
  const [satisfactionRating, setSatisfactionRating] = useState(0);
  const [reviewContent, setReviewContent] = useState("");

  const handleSubmit = () => {
    if (productRating === 0 || sellerRating === 0 || satisfactionRating === 0) {
      alert("모든 항목에 별점을 매겨주세요.");
      return;
    }

    onSubmit(productRating, sellerRating, satisfactionRating, reviewContent);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">주문정보</h2>

        <div className="flex mb-6">
          {/* 상품 이미지 */}
          <div className="w-24 h-24 bg-gray-200 mr-4">
            {order.image && (
              <img
                src={order.image}
                alt={order.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* 상품 정보 */}
          <div>
            <h3 className="font-medium">{order.title}</h3>
            <p className="text-xl font-bold mt-1">
              {order.price.toLocaleString()}원
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {formatDate(order.date)}
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-bold mb-4">상품은 어떠셨나요?</h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">상품 상태</span>
              <StarRating rating={productRating} setRating={setProductRating} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">판매자 상태</span>
              <StarRating rating={sellerRating} setRating={setSellerRating} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">거래 만족도</span>
              <StarRating
                rating={satisfactionRating}
                setRating={setSatisfactionRating}
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-2">상세 후기</label>
              <textarea
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                placeholder="상품과 거래에 대한 후기를 작성해주세요."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={4}
              />
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600"
            >
              등록
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPopup;
