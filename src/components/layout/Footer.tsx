const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        {/* 상단 네비게이션 메뉴 */}
        <div className="flex justify-center space-x-8 mb-12 flex-wrap text-sm">
          <div className="cursor-pointer hover:text-gray-300 my-2">
            이용약관
          </div>
          <div className="cursor-pointer hover:text-gray-300 my-2">
            개인정보처리방침
          </div>
          <div className="cursor-pointer hover:text-gray-300 my-2">
            위치기반서비스 이용약관
          </div>
          <div className="cursor-pointer hover:text-gray-300 my-2">
            운송약관
          </div>
        </div>

        {/* 메인 푸터 콘텐츠 */}
        <div className="max-w-4xl mx-auto">
          {/* 로고 및 슬로건 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-2">SubwayHero</h2>
            <p className="text-gray-400">
              Connecting neighbors, delivering trust.
            </p>
          </div>

          {/* 푸터 메뉴 섹션들 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* 서비스 섹션 */}
            <div>
              <h3 className="text-lg mb-4">서비스</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="cursor-pointer hover:text-gray-300">
                  서비스 소개
                </li>
                <li className="cursor-pointer hover:text-gray-300">
                  이용 방법
                </li>
                <li className="cursor-pointer hover:text-gray-300">
                  서비스 지역
                </li>
                <li className="cursor-pointer hover:text-gray-300">
                  자주 묻는 질문
                </li>
                <li className="cursor-pointer hover:text-gray-300">신고하기</li>
              </ul>
            </div>

            {/* 실버 딜리버리 섹션 */}
            <div>
              <h3 className="text-lg mb-4">실버 딜리버리</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="cursor-pointer hover:text-gray-300">
                  배송 파트너
                </li>
              </ul>
            </div>
          </div>

          {/* 소셜 미디어 아이콘 */}
          <div className="flex space-x-4 mb-8">
            <a>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="fill-current"
              >
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
              </svg>
            </a>
            <a>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="fill-current"
              >
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
              </svg>
            </a>
            <a>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="fill-current"
              >
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
              </svg>
            </a>
          </div>

          {/* 저작권 */}
          <div className="text-sm text-gray-400">
            © 2025 SubwayHero All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
