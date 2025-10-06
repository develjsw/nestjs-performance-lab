import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // 테스트 시나리오 설정
  vus: 1,              // 동시에 실행할 가상 유저 수 (병렬 요청 개수)
  iterations: 10000,   // 전체 요청 횟수 (VU × 반복 횟수 아님)
  thresholds: {
    // thresholds에 설정된 조건을 모두 충족해야, k6 실행 결과에서 "Thresholds Failed" 항목이 실패로 표시되지 않음
    http_req_duration: ['p(95)<2000'], // 전체 요청 중 95%는 2초 이내에 완료되어야 함
    http_req_failed: ['rate<0.01'],    // 전체 요청 중 실패율은 1% 미만이어야 함
  },
};

export default function () {
  // --- 요청 대상 API ---
  const url = 'http://localhost:3000/users';

  // --- 요청 본문 (각 요청마다 고유 name 부여) ---
  const body = JSON.stringify({
    name: `홍길동_${__ITER}`, // __ITER : k6가 각 반복마다 자동으로 부여하는 순번(0부터 시작), 현재 몇 번째 요청인지를 구분하기 위한 인덱스
    password: '123456789',
    phone: '010-0000-0000',
  });

  // --- 요청 헤더 ---
  const header = {
    headers: { 'Content-Type': 'application/json' },
  };

  // --- HTTP POST 요청 ---
  const response = http.post(url, body, header);

  // --- 응답 상태 확인 ---
  const success = check(response, {
    '응답 상태 코드 201': (res) => res.status === 201,
  });

  // --- 실패 시 로그 ---
  if (!success) {
    console.error(`요청 실패 [ITER=${__ITER}] Status: ${response.status} Body: ${response.body}`);
  }

  // --- 요청 간 지연 시킬 시간 ---
  sleep(0.1);
}
