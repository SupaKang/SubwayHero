import { Timestamp } from "firebase/firestore";
import { UserRole } from "../../../types/user.types";

// 주문 인터페이스 정의
export interface Order {
  id: string;
  status: string;
  title: string;
  price: number;
  date: Timestamp | Date;
  image: string | null;
  productId: string;
  sellerId: string;
  buyerId: string;
  createdAt: Timestamp | Date;
  reviewed: boolean;
}

// 상품 인터페이스 정의
export interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  status: string;
  category: string;
  createdAt: Timestamp | Date;
  sellerId: string;
  sellerName: string;
}

// 찜한 상품 인터페이스 정의
export interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
  createdAt: Timestamp | Date;
  product?: Product;
}

// 리뷰 인터페이스 정의
export interface Review {
  id: string;
  orderId: string;
  productId: string;
  reviewerId: string;
  targetId: string;
  rating: number;
  productRating?: number;
  sellerRating?: number;
  satisfactionRating?: number;
  content: string;
  createdAt: Timestamp | Date;
  productName: string;
  sellerName?: string;
}

// 사용자 정보 인터페이스
export interface UserInfo {
  name: string;
  level: string;
  rating: string;
  avatar: string | null;
  inProgressOrders: number;
  completedOrders: number;
  salesCompleted: number;
  salesInProgress: number;
}

// 로딩 상태 인터페이스
export interface LoadingState {
  orders: boolean;
  products: boolean;
  wishlist: boolean;
  reviews: boolean;
}

// 별점 컴포넌트 props
export interface StarRatingProps {
  rating: number;
  setRating: (rating: number) => void;
}

// 공통 유틸리티 함수
export const formatDate = (date: Date | Timestamp | undefined) => {
  if (!date) return "";

  const d = date instanceof Timestamp ? date.toDate() : date;
  const year = d.getFullYear().toString().slice(2);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
};
