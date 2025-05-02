import React from "react";
import { Order, formatDate } from "./types";

interface OrderHistoryProps {
  orders: Order[];
  loading: boolean;
  onDeliveryTracking: (orderId: string) => void;
  onReturnRefund: (orderId: string) => void;
  onWriteReview: (order: Order) => void;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({
  orders,
  loading,
  onDeliveryTracking,
  onReturnRefund,
  onWriteReview,
}) => {
  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">주문 내역이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {orders.map((order) => (
        <div key={order.id}>
          <div className="p-4 flex flex-col sm:flex-row">
            <div className="sm:w-1/4 mb-4 sm:mb-0">
              {/* 상태 표시 */}
              <div
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  order.status === "배송완료"
                    ? "bg-blue-100 text-blue-800"
                    : order.status === "배송중"
                    ? "bg-blue-200 text-blue-800"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {order.status}
              </div>

              {/* 상품 이미지 */}
              <div className="mt-2 w-24 h-24 bg-gray-200">
                {order.image && (
                  <img
                    src={order.image}
                    alt={order.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>

            {/* 주문 정보 */}
            <div className="sm:w-2/4 mb-4 sm:mb-0">
              <h3 className="font-medium">{order.title}</h3>
              <p className="text-xl font-bold mt-1">
                {order.price.toLocaleString()}원
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {formatDate(order.date)}
              </p>
            </div>

            {/* 주문 액션 버튼 */}
            <div className="sm:w-1/4 flex flex-col space-y-2 sm:items-end">
              <button
                onClick={() => onDeliveryTracking(order.id)}
                className="w-full sm:w-32 px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 text-center"
              >
                배송조회
              </button>
              <button
                onClick={() => onReturnRefund(order.id)}
                className="w-full sm:w-32 px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 text-center"
              >
                반품, 환불 신청
              </button>
              {order.status === "배송완료" && !order.reviewed && (
                <button
                  onClick={() => onWriteReview(order)}
                  className="w-full sm:w-32 px-4 py-2 border border-blue-500 text-blue-500 rounded-md text-sm hover:bg-blue-50 text-center"
                >
                  리뷰 작성하기
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderHistory;
