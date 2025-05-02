import React from "react";

interface TabMenuProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabMenu: React.FC<TabMenuProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="grid grid-cols-4 border-b">
        <button
          className={`py-4 text-center font-medium text-sm ${
            activeTab === "주문내역"
              ? "text-blue-600 bg-blue-100"
              : "text-gray-500 hover:bg-gray-50"
          }`}
          onClick={() => onTabChange("주문내역")}
        >
          주문 내역
        </button>
        <button
          className={`py-4 text-center font-medium text-sm ${
            activeTab === "판매글관리"
              ? "text-blue-600 bg-blue-100"
              : "text-gray-500 hover:bg-gray-50"
          }`}
          onClick={() => onTabChange("판매글관리")}
        >
          판매글 관리
        </button>
        <button
          className={`py-4 text-center font-medium text-sm ${
            activeTab === "찜한상품"
              ? "text-blue-600 bg-blue-100"
              : "text-gray-500 hover:bg-gray-50"
          }`}
          onClick={() => onTabChange("찜한상품")}
        >
          찜한 상품
        </button>
        <button
          className={`py-4 text-center font-medium text-sm ${
            activeTab === "거래후기"
              ? "text-blue-600 bg-blue-100"
              : "text-gray-500 hover:bg-gray-50"
          }`}
          onClick={() => onTabChange("거래후기")}
        >
          거래 후기
        </button>
      </div>
    </div>
  );
};

export default TabMenu;
