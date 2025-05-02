import {
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase/firestore";

export interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  createdAt: Date | Timestamp;
  status: string;
  category: string;
  sellerId: string;
  sellerName: string;
  condition?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface PriceOption {
  id: string;
  name: string;
}

export interface ConditionOption {
  id: string;
  name: string;
}

export interface PriceRange {
  min: string;
  max: string;
}

export type SortOption = "최신순" | "인기순" | "가격 낮은순" | "가격 높은순";

// 날짜 포맷팅 함수
export const formatDate = (date: Date | Timestamp) => {
  if (!date) return "";

  const d = date instanceof Timestamp ? date.toDate() : date;
  const year = d.getFullYear().toString().slice(2);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
};
