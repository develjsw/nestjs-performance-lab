import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // --- 테스트 시나리오 설정 ---
  scenarios: {
    user_create_test: {
      // executor : k6가 부하를 주는 방식
      //  - shared-iterations     : 전체 반복 횟수를 지정하고, 지정된 VU들이 그 횟수를 나눠 수행 (VU=1이면 순차 실행)
      //  - constant-vus          : 고정된 VU 수로 일정 시간 동안 지속 부하 (시간 기반)
      //  - ramping-vus           : VU 수를 점진적으로 늘리거나 줄이면서 부하 변화 시뮬레이션
      //  - constant-arrival-rate : 초당 일정한 요청 비율(RPS)을 유지 (RPS 기반 부하 제어)
      executor: 'shared-iterations',
      vus: 50,                       // 동시에 실행할 가상 유저 수 (병렬 요청 개수)
      iterations: 10000,             // 전체 요청 횟수
      maxDuration: '25m',            // 테스트 제한 시간 25분
    }
  },
  // --- 성능 지표 기준 ---
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

/*
    [결과 요약]
    - 가상 유저(VU) 50명으로 병렬 실행
    - 회원 생성 API (POST /users) 총 10,000회 요청
    - 평균 응답 시간: 77.28ms
    - 95% 응답 시간(p95): 135.46ms
    - 실패율: 0%
    - 평균 처리 속도: 약 279.1 req/s
    - 총 실행 시간: 약 35.8초
    - 전송 데이터량: 2.0 MB (요청) / 1.5 MB (응답)

    [결과]
    execution: local
        script: .\load-test\user-create-concurrent-test.js
        output: InfluxDBv1 (http://localhost:8086)

    scenarios: (100.00%) 1 scenario, 50 max VUs, 25m30s max duration (incl. graceful stop):
              * user_create_test: 10000 iterations shared among 50 VUs (maxDuration: 25m0s, gracefulStop: 30s)

    █ THRESHOLDS

    http_req_duration
    ✓ 'p(95)<2000' p(95)=135.46ms

    http_req_failed
    ✓ 'rate<0.01' rate=0.00%

    █ TOTAL RESULTS

    checks_total.......: 10000   279.107245/s
    checks_succeeded...: 100.00% 10000 out of 10000
    checks_failed......: 0.00%   0 out of 10000

    ✓ 응답 상태 코드 201

    HTTP
    http_req_duration..............: avg=77.28ms  min=7.82ms   med=74.05ms  max=871.62ms p(90)=119.56ms p(95)=135.46ms
      { expected_response:true }...: avg=77.28ms  min=7.82ms   med=74.05ms  max=871.62ms p(90)=119.56ms p(95)=135.46ms
    http_req_failed................: 0.00%  0 out of 10000
    http_reqs......................: 10000  279.107245/s

    EXECUTION
    iteration_duration.............: avg=178.81ms min=108.72ms med=175.22ms max=972.23ms p(90)=221.05ms p(95)=237.96ms
    iterations.....................: 10000  279.107245/s
    vus............................: 50     min=50         max=50
    vus_max........................: 50     min=50         max=50

    NETWORK
    data_received..................: 1.5 MB 42 kB/s
    data_sent......................: 2.0 MB 55 kB/s

    running (00m35.8s), 00/50 VUs, 10000 complete and 0 interrupted iterations
    user_create_test ✓ [======================================] 50 VUs  00m35.8s/25m0s  10000/10000 shared iters
*/

/*
    [DB 스레드 커넥션 확인 결과]
    - 확인 명령어 : SHOW STATUS LIKE 'Threads_connected';
    - 측정 시점 : 테스트 중간 (VU=50, 동시 요청 상태)
    - 확인 결과 : 10개 연결 (MySQL 서버와의 활성 커넥션 수)
*/