import { Link } from "react-router-dom";

const OnBoardPage = () => {
  return (
    <div className="font-sans ">
      {/* 헤더 섹션 */}
      <section className="w-full bg-indigo-50">
        <div className="container mx-auto px-40 py-16 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-6 md:mb-0">
            <h1 className="text-4xl font-bold mb-4">
              지하철에서 시작되는
              <br />
              중고거래의 새로운 방식
            </h1>
            <p className="text-gray-600 mb-6 text-l">
              번거로운 중고 직거래 대신 실버택배로 시간은 아끼고, 안전은 높이고!
              지하철 생활권 기반의 안전하고 편리한 중고거래를 경험하세요.
            </p>
            <Link to="/auth">
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md">
                서비스 시작하기
              </button>
            </Link>
          </div>

          <div className="md:w-1/2 flex justify-end">
            <div className="w-80 h-64 relative">
              <img src="src/assets/images/mascot00.png" alt="img02"></img>
            </div>
          </div>
          <div />
        </div>
      </section>

      {/* 소개 타이틀 */}
      <section className="py-12 text-center mt-16">
        <div className="inline-block mb-4">
          <div className="w-10 h-10 mx-auto text-blue-500">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-full h-full"
            >
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 3c0 .55.45 1 1 1h1l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h11c.55 0 1-.45 1-1s-.45-1-1-1H7l1.1-2h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.37-.66-.11-1.48-.87-1.48H5.21l-.67-1.43c-.16-.35-.52-.57-.9-.57H2c-.55 0-1 .45-1 1zm16 15c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-semibold text-blue-500 mb-4">
          SubwayHero가 해결합니다
        </h2>
        <p className="text-gray-500 text-sm">
          지하철을 통한 스마트한 커뮤니티 기반 배송 시스템
        </p>
      </section>

      {/* 특징 섹션 1: 편한 비대면 구조 */}
      <section className="container mx-auto px-40 mb-8">
        <div className="bg-gray-100 rounded-lg px-6 py-2 flex flex-col md:flex-row items-center overflow-hidden">
          <div className="md:w-1/2 mb-4 md:mb-0">
            <h3 className="text-2xl font-semibold mb-4">편한 비대면 구조</h3>
            <p className="text-gray-600">
              판매자, 구매자, 배송자 간 역할분담으로 직접적인 소통 없이 효과적인
              <br />
              언택트 거래가 가능합니다.
            </p>
          </div>
          <div className="md:w-1/2 flex justify-end">
            <div className="w-full max-w-xs h-auto p-2">
              <img
                src="src/assets/images/untact_delivery.png"
                alt="img02"
              ></img>
            </div>
          </div>
        </div>
      </section>

      {/* 특징 섹션 2: 오늘주문 당일배송 */}
      <section className="container mx-auto px-40 mb-8">
        <div className="bg-gray-100 rounded-lg px-6 py-2  flex flex-col md:flex-row items-center overflow-hidden">
          <div className="md:w-1/2 mb-4 md:mb-0">
            <h3 className="text-2xl font-semibold mb-4">오늘주문 당일배송</h3>
            <p className="text-gray-600">
              지하철 노선을 활용한 친환경적이고 효율적인 배송 시스템을
              제공합니다.
            </p>
          </div>
          <div className="md:w-1/2 flex justify-end">
            <div className="w-full max-w-xs max-h-xs p-2">
              <img
                src="src/assets/images/oneday_delivery.png"
                alt="img02"
              ></img>
            </div>
          </div>
        </div>
      </section>

      {/* 특징 섹션 3: 가격은 내리고 가치는 올리고 */}
      <section className="container mx-auto px-40 mb-12">
        <div className="bg-gray-100 rounded-lg px-6 py-2 flex flex-col md:flex-row items-center overflow-hidden">
          <div className="md:w-1/2 mb-4 md:mb-0">
            <h3 className="text-2xl font-semibold mb-4">
              가격은 내리고 가치는 올리고
            </h3>
            <p className="text-gray-600">
              고령층에게 유연한 일자리를 제공하고 세대 간 상생의 가치를
              실현합니다.
            </p>
          </div>
          <div className="md:w-1/2 flex justify-end">
            <div className="w-full max-w-xs h-auto p-2">
              <img
                src="src/assets/images/value_proposition.png"
                alt="img02"
              ></img>
            </div>
          </div>
        </div>
      </section>

      {/* 서비스 이용방법 */}
      <section className="container mx-auto px-40 py-10 text-center mt-16">
        <div className="inline-block mb-4">
          <div className="w-10 h-10 mx-auto text-blue-500">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-full h-full"
            >
              <path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z" />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-blue-500 mb-2">
          서비스 이용방법
        </h2>
        <p className="text-gray-500 text-sm mb-10">
          지하철을 통한 스마트한 커뮤니티 기반 배송 시스템
        </p>

        {/* 이용방법 아이콘 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex flex-col items-center">
            <div className="bg-blue-100 p-3 rounded-full mb-3">
              <div className="w-8 h-8 text-blue-500">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-full h-full"
                >
                  <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-8-2h2v-4h4v-2h-4V7h-2v4H7v2h4z" />
                </svg>
              </div>
            </div>
            <h4 className="font-medium text-sm mb-1">상품 등록</h4>
            <p className="text-gray-500 text-xs">
              판매할 상품을 촬영하여
              <br />
              등록하세요
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="bg-blue-100 p-3 rounded-full mb-3">
              <div className="w-8 h-8 text-blue-500">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-full h-full"
                >
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-1.45-5c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.37-.66-.11-1.48-.87-1.48H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7l1.1-2h7.45z" />
                </svg>
              </div>
            </div>
            <h4 className="font-medium text-sm mb-1">구매 및 배송 신청</h4>
            <p className="text-gray-500 text-xs">
              구매자는 상품 결제와 함께
              <br />
              배송 요청을 합니다.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="bg-blue-100 p-3 rounded-full mb-3">
              <div className="w-8 h-8 text-blue-500">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-full h-full"
                >
                  <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.06-.59-1.42zM13 20.01L4 11V4h7v-.01l9 9-7 7.02z" />
                  <circle cx="6.5" cy="6.5" r="1.5" />
                </svg>
              </div>
            </div>
            <h4 className="font-medium text-sm mb-1">실버 기사 매칭</h4>
            <p className="text-gray-500 text-xs">
              실버 택배 기사가 배송 요청을 확인하고
              <br />
              수락합니다.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="bg-blue-100 p-3 rounded-full mb-3">
              <div className="w-8 h-8 text-blue-500">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-full h-full"
                >
                  <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                </svg>
              </div>
            </div>
            <h4 className="font-medium text-sm mb-1">배송 완료</h4>
            <p className="text-gray-500 text-xs">
              다음날 퇴근 시간대에 문 앞까지
              <br />
              안전하게 배송됩니다.
            </p>
          </div>
        </div>
      </section>

      {/* 실버 딜리버리 안내 */}
      <section className="container mx-auto px-40 py-10 text-center mb-12 mt-16">
        <div className="inline-block mb-4">
          <div className="w-10 h-10 mx-auto text-blue-500">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-full h-full"
            >
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z" />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-blue-500 mb-4">
          소중한 상품을 전달해줄
          <br />
          실버 배송파트너를 미리 만나보세요
        </h2>

        {/* 실버 딜리버리 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-200 h-48 rounded-lg"></div>
          <div className="bg-gray-200 h-48 rounded-lg"></div>
          <div className="bg-gray-200 h-48 rounded-lg"></div>
        </div>
      </section>

      {/* 가입권유 섹션 */}
      <section className="bg-blue-500 text-white py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl font-semibold mb-2">지금 바로 시작하세요</h2>
          <p className="mb-8 text-sm">
            지하철만 있으면, 오늘 팔고 내일 도착합니다.
            <br />
            모두가 서로를 모르는 대신, 모두가 서로를 믿을 수 있어요.
          </p>

          <Link to="/auth">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <button className="bg-neutral-50 hover:bg-blue-300 text-blue-500 font-medium py-4 px-6 rounded-md">
                일반회원 중고거래 시작하기
              </button>
              <button className="bg-neutral-50 hover:bg-blue-300 text-blue-500 font-medium py-4 px-6 rounded-md">
                배송 파트너 지원하기
              </button>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default OnBoardPage;
