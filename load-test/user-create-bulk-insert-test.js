import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    // --- 테스트 시나리오 설정 ---
    scenarios: {
        user_create_bulk_test: {
            // executor : k6가 부하를 주는 방식
            //  - shared-iterations     : 전체 반복 횟수를 지정하고, 지정된 VU들이 그 횟수를 나눠 수행 (VU=1이면 순차 실행)
            //  - constant-vus          : 고정된 VU 수로 일정 시간 동안 지속 부하 (시간 기반)
            //  - ramping-vus           : VU 수를 점진적으로 늘리거나 줄이면서 부하 변화 시뮬레이션
            //  - constant-arrival-rate : 초당 일정한 요청 비율(RPS)을 유지 (RPS 기반 부하 제어)
            executor: 'constant-vus',
            vus: 1000,                     // 동시에 실행할 가상 유저 수 (병렬 요청 개수)
            duration: '5m'                 // 5분간 지속 부하 발생
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
    - 가상 유저(VU) 1000명으로 병렬 실행
    - 회원 생성 API (POST /users) 5분간 지속 부하
    - 총 요청 수: 79,445회
    - 평균 응답 시간: 3.68초
    - 중앙값(median): 3.36초
    - 90% 응답 시간(p90): 5.39초
    - 95% 응답 시간(p95): 5.94초 (⚠️ 기준 2초 초과)
    - 최소 응답 시간(min): 0초
    - 최대 응답 시간(max): 8.07초
    - 실패율: 0.39% (314건)
    - 평균 처리 속도: 262.25 req/s
    - 총 실행 시간: 5분 2.9초
    - 전송 데이터량: 16 MB (요청) / 12 MB (응답)

    [결과]
    execution: local
        script: .\load-test\user-create-bulk-insert-test.js
        output: InfluxDBv1 (http://localhost:8086)

     scenarios: (100.00%) 1 scenario, 1000 max VUs, 5m30s max duration (incl. graceful stop):
              * user_create_bulk_test: 1000 looping VUs for 5m0s (gracefulStop: 30s)

    WARN[0000] Request Failed                                error="Post \"http://localhost:3000/users\": dial tcp 127.0.0.1:3000: connectex: No connection could be made because the target machine actively refused it."
    WARN[0000] Request Failed                                error="Post \"http://localhost:3000/users\": dial tcp 127.0.0.1:3000: connectex: No connection could be made because the target machine actively refused it."
    WARN[0000] Request Failed                                error="Post \"http://localhost:3000/users\": dial tcp 127.0.0.1:3000: connectex: No connection could be made because the target machine actively refused it."
    WARN[0000] Request Failed                                error="Post \"http://localhost:3000/users\": dial tcp 127.0.0.1:3000: connectex: No connection could be made because the target machine actively refused it."
    WARN[0000] Request Failed                                error="Post \"http://localhost:3000/users\": dial tcp 127.0.0.1:3000: connectex: No connection could be made because the target machine actively refused it."
    ERRO[0000] 요청 실패 [ITER=0] Status: 0 Body: null           source=console
    WARN[0000] Request Failed                                error="Post \"http://localhost:3000/users\": dial tcp 127.0.0.1:3000: connectex: No connection could be made because the target machine actively refused it."
    ERRO[0000] 요청 실패 [ITER=0] Status: 0 Body: null           source=console
    WARN[0000] Request Failed                                error="Post \"http://localhost:3000/users\": dial tcp 127.0.0.1:3000: connectex: No connection could be made because the target machine actively refused it."

    ...
    ....

    ERRO[0000] 요청 실패 [ITER=0] Status: 0 Body: null           source=console
    WARN[0000] Request Failed                                error="Post \"http://localhost:3000/users\": dial tcp 127.0.0.1:3000: connectex: No connection could be made because the target machine actively refused it."
    ERRO[0000] 요청 실패 [ITER=0] Status: 0 Body: null           source=console
    ERRO[0000] 요청 실패 [ITER=0] Status: 0 Body: null           source=console
    ERRO[0000] 요청 실패 [ITER=0] Status: 0 Body: null           source=console
    ERRO[0000] 요청 실패 [ITER=0] Status: 0 Body: null           source=console
    ERRO[0000] 요청 실패 [ITER=0] Status: 0 Body: null           source=console
    ERRO[0000] 요청 실패 [ITER=0] Status: 0 Body: null           source=console

    ...
    ....

    █ THRESHOLDS

    http_req_duration
    ✗ 'p(95)<2000' p(95)=5.94s

    http_req_failed
    ✓ 'rate<0.01' rate=0.39%

    █ TOTAL RESULTS

    checks_total.......: 79445  262.250472/s
    checks_succeeded...: 99.60% 79131 out of 79445
    checks_failed......: 0.39%  314 out of 79445

    ✗ 응답 상태 코드 201
      ↳  99% — ✓ 79131 / ✗ 314

    HTTP
    http_req_duration..............: avg=3.68s min=0s       med=3.36s max=8.07s p(90)=5.39s p(95)=5.94s
      { expected_response:true }...: avg=3.69s min=1s       med=3.37s max=8.07s p(90)=5.4s  p(95)=5.95s
    http_req_failed................: 0.39% 314 out of 79445
    http_reqs......................: 79445 262.250472/s

    EXECUTION
    iteration_duration.............: avg=3.79s min=167.57ms med=3.47s max=8.17s p(90)=5.5s  p(95)=6.04s
    iterations.....................: 79445 262.250472/s
    vus............................: 61    min=61           max=1000
    vus_max........................: 1000  min=1000         max=1000

    NETWORK
    data_received..................: 12 MB 39 kB/s
    data_sent......................: 16 MB 52 kB/s

    running (5m02.9s), 0000/1000 VUs, 79445 complete and 0 interrupted iterations
    user_create_bulk_test ✓ [======================================] 1000 VUs  5m0s
    ERRO[0303] thresholds on metrics 'http_req_duration' have been crossed
*/

/*
    [로그에서 확인된 주요 현상]
    - WARN[0000] "connectex: No connection could be made because the target machine actively refused it."
        → 서버(127.0.0.1:3000)가 TCP 연결 요청을 수락하지 못함
    - ERRO[0000] 요청 실패 [ITER=0] Status: 0 Body: null
        → 클라이언트(k6) 측에서 연결 수립 실패 상태 다수 발생
    - http_reqs: 79,445  (262.25 req/s)
        → API 서버가 안정적으로 처리 가능한 요청 수는 초당 약 262건 수준으로 확인됨
        → API 서버 인스턴스를 4개로 확장(Scale-out)하여 약 1,000건/초 수준의 부하를 처리할 수 있도록 추가 테스트 필요
    - 총 실패 요청 수: 314건 (0.39%)
    - http_req_duration 임계값 초과로 Thresholds Failed 발생

    [결론]
    - 테스트는 정상 종료됨 (5분간 지속 부하 완료)
    - 95% 응답 시간(p95)이 5.94초로 설정 기준(2초)을 초과하여 성능 저하 발생
    - 서버 연결 거부 로그 다수 발생으로, 요청 처리량 대비 수용 한계 도달로 추정
    - http_req_failed (0.39%)는 기준(1%) 내로 통과, 요청 자체 실패율은 낮음
    - 최종 상태: thresholds 중 1개 항목 실패 (http_req_duration)
    - Prisma의 기본 DB Connection Pool 10개 → 30개로 변경하여 다시 테스트하였으나, 결과는 큰 차이 없음
        → 이는 API 서버 자체가 초당 약 262건만 처리 가능한 구조적 한계에 도달했기 때문임
        → 따라서 DB Connection Pool 확장보다는, API 서버 인스턴스 확장(Scale-out)을 통해 병렬 처리량을 늘리는 방향이 적절함
*/