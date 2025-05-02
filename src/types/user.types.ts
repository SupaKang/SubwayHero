// src/types/user.types.ts

// 사용자 역할 타입
export enum UserRole {
  REGULAR = "regular", // 일반 사용자
  SILVER_COURIER = "silver_courier", // 배송파트너(실버택배)
  ADMIN = "admin", // 관리자
}

// 기본 사용자 정보 인터페이스 (두 사용자 타입의 공통 속성)
export interface BaseUserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  phoneNumber?: string;
  address?: string;
  role: UserRole;
}

// 일반 사용자 정보 인터페이스
export interface RegularUserData extends BaseUserData {
  role: UserRole.REGULAR;
  preferredLocations?: string[]; // 선호 거래 장소 (지하철역 등)
  wishlist?: string[]; // 찜한 상품 ID 목록
}

// 배송파트너(실버택배) 사용자 정보 인터페이스
export interface SilverUserData extends BaseUserData {
  role: UserRole.SILVER_COURIER;
  isVerified: boolean; // 배송파트너 인증 여부
  availableAreas: string[]; // 활동 가능 지역 (지하철 노선 등)
  availableTime: {
    start: string; // 활동 시작 시간 (HH:MM 형식)
    end: string; // 활동 종료 시간 (HH:MM 형식)
  }[];
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  idCardVerified?: boolean; // 신분증 인증 여부
  rating?: number; // 평점 (0-5)
  deliveryCount?: number; // 배송 완료 건수
}

// 사용자 타입 구분을 위한 유니온 타입
export type UserData = RegularUserData | SilverUserData;
