/**
 * 랜덤 닉네임 생성 유틸리티
 * 형식: '형용사 + 명사'로 구성된 익명 닉네임 생성
 * 예시: '재빠른 다람쥐', '즐거운 고양이' 등
 */

// 형용사 배열
const adjectives = [
  "귀여운",
  "행복한",
  "즐거운",
  "재빠른",
  "날쌘",
  "슬기로운",
  "멋진",
  "화려한",
  "용감한",
  "따뜻한",
  "시원한",
  "진지한",
  "활기찬",
  "조용한",
  "현명한",
  "푸른",
  "빨간",
  "신비한",
  "친절한",
  "유쾌한",
  "느긋한",
  "예쁜",
  "우아한",
  "사랑스러운",
];

// 명사 배열
const nouns = [
  "다람쥐",
  "고양이",
  "강아지",
  "토끼",
  "사자",
  "호랑이",
  "기린",
  "코끼리",
  "팬더",
  "늑대",
  "여우",
  "곰",
  "원숭이",
  "참새",
  "독수리",
  "물고기",
  "거북이",
  "뱀",
  "사슴",
  "돌고래",
  "캥거루",
  "아기",
  "학생",
  "교수",
];

/**
 * 랜덤 닉네임 생성 함수
 * @returns 랜덤 형용사 + 랜덤 명사 형태의 닉네임 문자열
 */
export const generateRandomNickname = (): string => {
  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${randomAdjective} ${randomNoun}`;
};

/**
 * 거래 만족도를 문구로 표현하는 함수
 * @param rating - 숫자 평점 (1-5)
 * @returns 만족도를 설명하는 문구
 */
export const getRatingSentiment = (rating: number): string => {
  if (!rating) return "평가 없음";

  switch (Math.round(rating)) {
    case 5:
      return "매우 좋아요";
    case 4:
      return "좋아요";
    case 3:
      return "보통이에요";
    case 2:
      return "아쉬워요";
    case 1:
      return "많이 아쉬워요";
    default:
      return "평가 없음";
  }
};
