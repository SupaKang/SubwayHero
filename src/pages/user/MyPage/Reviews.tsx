import React from "react";
import { Review, formatDate } from "./types";

interface ReviewsProps {
  reviews: Review[];
  loading: boolean;
}

const Reviews: React.FC<ReviewsProps> = ({ reviews, loading }) => {
  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">등록된 거래 후기가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {reviews.map((review) => (
        <div key={review.id} className="p-4">
          <div className="flex items-start">
            <div className="flex-1">
              <div className="flex items-center">
                <h3 className="font-medium">{review.productName}</h3>
                <div className="ml-2 flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-lg ${
                        star <= review.rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-1">
                {formatDate(review.createdAt)}
              </p>
              <p className="mt-2">{review.content}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Reviews;
