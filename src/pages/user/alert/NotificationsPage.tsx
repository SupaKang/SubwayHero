import { useState } from "react";

const NotificationsPage = () => {
  // 알림 필터 상태
  const [filter, setFilter] = useState("all"); // 'all', 'transaction', 'delivery', 'system'

  // 알림 읽음 상태 관리
  const [readStatus, setReadStatus] = useState({});

  // 더미 데이터 - 알림 목록
  const notifications = [
    {
      id: "noti-001",
      type: "transaction",
      title: "상품 판매 완료",
      content:
        "베베드피노 바람막이 세트 100 상품이 판매되었습니다. 배송 기사가 상품을 수거하러 갑니다.",
      date: "2025-04-24 14:30",
      isRead: false,
      link: "/transactions/TRX-20250424-001",
      image: "https://via.placeholder.com/50/FFD700/000000?text=아동의류",
    },
    {
      id: "noti-002",
      type: "delivery",
      title: "배송 시작",
      content:
        "판매하신 상품 배송이 시작되었습니다. 현재 배송기사가 상품을 수령했습니다.",
      date: "2025-04-24 16:45",
      isRead: false,
      link: "/delivery/DEL-20250424-001",
      image: "https://via.placeholder.com/50/FFD700/000000?text=아동의류",
    },
    {
      id: "noti-003",
      type: "transaction",
      title: "상품 구매 완료",
      content:
        "MLB 어린이 운동화 상품 구매가 완료되었습니다. 내일 도착 예정입니다.",
      date: "2025-04-23 11:20",
      isRead: true,
      link: "/transactions/TRX-20250423-002",
      image: "https://via.placeholder.com/50/000000/FFFFFF?text=운동화",
    },
    {
      id: "noti-004",
      type: "delivery",
      title: "배송 완료",
      content:
        "주문하신 상품이 배송 완료되었습니다. 상품은 문앞에 안전하게 전달되었습니다.",
      date: "2025-04-23 18:10",
      isRead: true,
      link: "/delivery/DEL-20250423-002",
      image: "https://via.placeholder.com/50/000000/FFFFFF?text=운동화",
    },
    {
      id: "noti-005",
      type: "system",
      title: "5월 배송료 인상 안내",
      content:
        "5월 1일부터 기본 배송료가 3,500원으로 인상됩니다. 자세한 내용은 공지사항을 확인해주세요.",
      date: "2025-04-22 09:00",
      isRead: false,
      link: "/notices/1234",
      icon: "announcement",
    },
    {
      id: "noti-006",
      type: "transaction",
      title: "새로운 후기가 등록되었습니다",
      content: "판매하신 상품에 새로운 후기가 등록되었습니다. 확인해보세요!",
      date: "2025-04-21 15:30",
      isRead: true,
      link: "/reviews/REV-20250421-001",
      icon: "review",
    },
    {
      id: "noti-007",
      type: "system",
      title: "앱 업데이트 안내",
      content:
        "SubwayHero 앱이 새롭게 업데이트 되었습니다. 더 나은 서비스를 이용해보세요.",
      date: "2025-04-20 10:15",
      isRead: true,
      link: "/notices/1233",
      icon: "update",
    },
  ];

  // 필터링된 알림 목록
  const filteredNotifications =
    filter === "all"
      ? notifications
      : notifications.filter((noti) => noti.type === filter);

  // 알림 읽음 처리
  const markAsRead = (id) => {
    setReadStatus({
      ...readStatus,
      [id]: true,
    });
  };

  // 알림의 최종 읽음 상태 확인
  const isNotificationRead = (notification) => {
    return readStatus[notification.id] !== undefined
      ? readStatus[notification.id]
      : notification.isRead;
  };

  // 모든 알림 읽음 처리
  const markAllAsRead = () => {
    const newReadStatus = {};
    notifications.forEach((noti) => {
      newReadStatus[noti.id] = true;
    });
    setReadStatus(newReadStatus);
  };

  // 알림 타입에 따른 아이콘 렌더링
  const renderIcon = (notification) => {
    if (notification.image) {
      return (
        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
          <img
            src={notification.image}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    // 시스템 알림 아이콘
    switch (notification.icon) {
      case "announcement":
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 07 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
              />
            </svg>
          </div>
        );
      case "review":
        return (
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </div>
        );
      case "update":
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      // 오늘
      return dateString.split(" ")[1];
    } else if (diffInDays === 1) {
      // 어제
      return "어제";
    } else if (diffInDays < 7) {
      // 일주일 이내
      return `${diffInDays}일 전`;
    } else {
      // 날짜 표시
      return dateString.split(" ")[0];
    }
  };

  return (
    <div className="bg-gray-200 min-h-screen">
      {/* 상단 헤더 */}
      <div>
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-xl font-bold mt-8">알림 목록</h1>
          <button
            className="text-sm mt-10 text-blue-500 font-medium hover:text-blue-600 transition-colors"
            onClick={markAllAsRead}
          >
            모두 읽음 처리
          </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4">
        {/* 필터 탭 */}
        <div className="bg-white rounded-lg shadow-sm mb-4">
          <div className="flex">
            <button
              className={`flex-1 py-3 text-center font-medium ${
                filter === "all"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setFilter("all")}
            >
              전체
            </button>
            <button
              className={`flex-1 py-3 text-center font-medium ${
                filter === "transaction"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setFilter("transaction")}
            >
              거래
            </button>
            <button
              className={`flex-1 py-3 text-center font-medium ${
                filter === "delivery"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setFilter("delivery")}
            >
              배송
            </button>
            <button
              className={`flex-1 py-3 text-center font-medium ${
                filter === "system"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setFilter("system")}
            >
              시스템
            </button>
          </div>
        </div>

        {/* 알림 목록 */}
        {filteredNotifications.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {filteredNotifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`p-4 ${
                  index !== filteredNotifications.length - 1 ? "border-b" : ""
                } ${!isNotificationRead(notification) ? "bg-blue-50" : ""}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex">
                  {renderIcon(notification)}
                  <div className="ml-3 flex-grow">
                    <div className="flex justify-between items-start">
                      <h3
                        className={`font-medium ${
                          !isNotificationRead(notification)
                            ? "text-blue-700"
                            : "text-gray-800"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-500 ml-2">
                        {formatDate(notification.date)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      {notification.content}
                    </p>
                  </div>
                  {!isNotificationRead(notification) && (
                    <div className="ml-2 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">알림이 없습니다</h3>
            <p className="text-gray-500">
              {filter === "all"
                ? "아직 받은 알림이 없습니다."
                : `${
                    filter === "transaction"
                      ? "거래"
                      : filter === "delivery"
                      ? "배송"
                      : "시스템"
                  } 관련 알림이 없습니다.`}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationsPage;
