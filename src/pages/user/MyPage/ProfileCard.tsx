import React from "react";
import { Link } from "react-router-dom";
import { UserInfo } from "./types";

interface ProfileCardProps {
  userInfo: UserInfo;
  onLogout: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ userInfo, onLogout }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-center">
        {/* 프로필 이미지 */}
        <div className="w-20 h-20 bg-gray-200 rounded-full mb-4 sm:mb-0 sm:mr-6">
          {userInfo.avatar && (
            <img
              src={userInfo.avatar}
              alt="프로필 이미지"
              className="w-full h-full rounded-full object-cover"
            />
          )}
        </div>

        {/* 유저 정보 */}
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl font-bold">{userInfo.name}</h2>
          <p className="text-sm text-gray-500">
            {userInfo.level}{" "}
            <span className="text-blue-500">{userInfo.rating}</span>
          </p>
        </div>

        {/* 버튼 영역 */}
        <div className="flex flex-col justify-end space-y-2">
          <button
            onClick={onLogout}
            className="px-4 py-2 border border-red-300 text-red-500 rounded-md text-sm hover:bg-red-50"
          >
            로그아웃
          </button>
          <Link to="/edit-profile">
            <button className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 w-full">
              정보 수정
            </button>
          </Link>
        </div>
      </div>

      {/* 활동 통계 */}
      <div className="grid grid-cols-4 gap-4 mt-6 text-center">
        <div>
          <p className="text-2xl font-bold text-blue-500">
            {userInfo.inProgressOrders}
          </p>
          <p className="text-sm text-gray-500">진행 중</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-500">
            {userInfo.completedOrders}
          </p>
          <p className="text-sm text-gray-500">구매 완료</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-500">
            {userInfo.salesCompleted}
          </p>
          <p className="text-sm text-gray-500">판매 완료</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-500">
            {userInfo.salesInProgress}
          </p>
          <p className="text-sm text-gray-500">판매 중</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
