import { AuditRecord } from "../types";

export const INITIAL_AUDITS: AuditRecord[] = [
  {
    id: "SW-20260328-001",
    auditDate: "2026-03-28",
    site: "Incheon",
    area: "Assembly",
    line: "Direct Assembly 3",
    station: "DECAL Process",
    shift: "Shift A",
    auditor: "Song Jong-wook, Kim Tae-eun",
    operatorName: "Choi Jin-seop",
    trigger: "Routine",
    swiNo: "SWI-ASSY-302",
    swcNo: "SWC-ASSY-302",
    status: "Submitted",
    ppe: {
      isCompliant: "PASS",
      observation: "작업용 안전모, 보안경, 안전화 규정대로 착용 완료."
    },
    sequence: {
      swipCompliant: "FAIL",
      sequenceCompliant: "PASS",
      movesCompliant: "PASS",
      observation: "작업 표준에 따른 시퀀스 및 동선은 양호하나, 태블릿 부족으로 셋팅 공정 단계에서 가이드 실시간 확인이 어려워 작업 표준 누락 가능성 잔존."
    },
    keyPoints: {
      swiCompliant: "FAIL",
      oplCompliant: "PASS",
      observation: "셋팅 작업 진행 시 관리 포인트 누락 발생함 (체결 정합성 확인 조건 가이드 미준수)."
    },
    standardTime: {
      standardTime: 120,
      measuredCycles: [118, 122, 125],
      isCompliant: "PASS",
      observation: "사이클타임 평균 121.6초 수준으로 5% 허용오차 범위(126초) 내 준수함."
    },
    improvement: {
      observation: "작업용 태블릿 추가 배치 필요. 셋팅 단계 관리 포인트 고도화 요망.",
      idea: "현장 간이 작업 가이드 거치대 설치 혹은 전용 태블릿 추가 증설",
      benefit: "표준 미준수율 0%화 및 오기입 예방"
    },
    gaps: [
      {
        id: "GAP-20260328-01",
        category: "Standard not followed",
        description: "태블릿 지급 부족으로 셋팅(SETTING) 작업 도중 표준서 및 작업 가이드 완벽 확인 불가하여 내용 일부 누락 발생",
        requirement: "공정 시작부터 끝까지 전 작업 표준 내용을 상시 태블릿으로 조회 가능해야 함",
        immediateAction: "작업 반장 표준 가이드 실물 프린트 즉각 임시 배치",
        rootCause: "현장 공정 모바일 장비(태블릿) 보급 지연 및 오프라인 환경 대응 부족",
        riskLevel: "Medium",
        followUpRequired: true
      }
    ],
    actions: [
      {
        id: "ACT-20260328-01",
        actionDescription: "작업 거치용 모바일 태블릿 2대 신규 구매 및 설치 완료, SETTING 공정 가이드 디지털 고도화 완료",
        type: "Tool Request",
        owner: "Kang Dong-yoon",
        dueDate: "2026-04-10",
        status: "Completed",
        effectivenessEvaluation: "태블릿 설치 후 작업자가 전 공정 표준 지침을 100% 모니터링하며 누락 없이 정상 수행함이 증명됨",
        reAuditRequired: false
      }
    ],
    evidences: [
      {
        id: "EVI-20260328-01",
        imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=60",
        description: "SETTING 공정에서 태블릿 없이 작업 가이드 수동 조회 중인 모습 (Before)",
        beforeAfter: "Before",
        evidenceType: "Sequence"
      },
      {
        id: "EVI-20260328-02",
        imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=60",
        description: "전용 태블릿 및 견고한 거치대 추가 도입 완료 (After)",
        beforeAfter: "After",
        evidenceType: "Sequence"
      }
    ],
    score: 75
  },
  {
    id: "SW-20260629-001",
    auditDate: "2026-06-29",
    site: "Dobris",
    area: "Assembly",
    line: "JB 007",
    station: "WC 02 (Clamping)",
    shift: "Shift B",
    auditor: "John",
    operatorName: "Lenonne",
    trigger: "Routine",
    swiNo: "SWI-JB007-02",
    swcNo: "SWC-JB007-02",
    status: "Submitted",
    ppe: {
      isCompliant: "PASS",
      observation: "기본 안전장비 준수 완료."
    },
    sequence: {
      swipCompliant: "FAIL",
      sequenceCompliant: "FAIL",
      movesCompliant: "FAIL",
      observation: "우측 면 클립 체결 시 2회 이상 트라이로 동선 낭비 발생. 주기적인 6초짜리 클립 부품 피킹 작업의 대기 손실 발생. 표준 재공 수량 미준수."
    },
    keyPoints: {
      swiCompliant: "FAIL",
      oplCompliant: "FAIL",
      observation: "검사 단계에서 정의된 2개의 필수 비주얼 검사 포인트 미수행. 작업 표준서 미준수."
    },
    standardTime: {
      standardTime: 57,
      measuredCycles: [61, 71, 75, 71, 69],
      isCompliant: "FAIL",
      observation: "표준시간 57초 대비 실측 사이클 타임이 61~75초로 대폭 초과함 (허용오차 5% 범위인 60초 기준 초과)."
    },
    improvement: {
      observation: "클립 조립 도구 보강 및 우측 패널 안착 지그 개선 건의. 검사 가이드 시각화 필요.",
      idea: "클립 전용 퀵-체결 툴 도입 및 검사항목 포스터 배치",
      benefit: "C/T 15초 단축 및 조립 정확도 향상"
    },
    gaps: [
      {
        id: "GAP-20260629-01",
        category: "Standard not followed",
        description: "우측 면 클립 2회 시도 조립 지연 및 비주얼 검수 포인트 2개 누락에 의한 사이클 타임 대폭 초과 (최대 75초)",
        requirement: "SWI 기준 우측 클립 1회 체결 및 조립 후 비주얼 확인 필수 포인트 2개 체크 준수",
        immediateAction: "작업자 대상 조립 요령 원포인트 레슨(OPL) 즉시 교육",
        rootCause: "체결 도구 노후화로 마찰력 발생 및 필수 비주얼 검사 표식 시인성 불량",
        riskLevel: "High",
        followUpRequired: true
      }
    ],
    actions: [
      {
        id: "ACT-20260629-01",
        actionDescription: "클립 에어 툴 체결 유닛 윤활 및 마모 부품 교체 완료, 비주얼 가이드라인 판넬 설치",
        type: "Tool Request",
        owner: "Bob & Pamela",
        dueDate: "2026-07-15",
        status: "In Progress",
        effectivenessEvaluation: "조립 시 마찰 최소화 여부 및 툴 반응 속도 측정을 통한 사이클 타임 57초 내 진입 확인 검증 예정",
        reAuditRequired: true,
        reAuditDate: "2026-07-18"
      }
    ],
    evidences: [
      {
        id: "EVI-20260629-01",
        imageUrl: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=500&auto=format&fit=crop&q=60",
        description: "작업자가 에어 툴 조작 시 흔들림으로 클립이 엇갈리는 모습 (Before)",
        beforeAfter: "Before",
        evidenceType: "StandardTime"
      }
    ],
    score: 33
  },
  {
    id: "SW-20260701-001",
    auditDate: "2026-07-01",
    site: "Bismarck",
    area: "Welding",
    line: "Robot Cell 4",
    station: "ST-04 Manual Joint",
    shift: "Shift C",
    auditor: "Michael Peterson",
    operatorName: "James Carter",
    trigger: "Routine",
    swiNo: "SWI-WELD-404",
    swcNo: "SWC-WELD-404",
    status: "Submitted",
    ppe: {
      isCompliant: "PASS",
      observation: "용접 마스크, 용접 장갑, 귀마개 및 내열 작업복 완벽 준수."
    },
    sequence: {
      swipCompliant: "PASS",
      sequenceCompliant: "PASS",
      movesCompliant: "PASS",
      observation: "용접 부품 안착 재공 수량 표준대로 보관 중이며, 수동 조인트 용접 시 시퀀스가 빈틈없이 유려함."
    },
    keyPoints: {
      swiCompliant: "PASS",
      oplCompliant: "PASS",
      observation: "용접 각도 및 루트 간격 측정 등 SWI 상의 주요 품질 관리 포인트를 게이지를 사용해 철저히 준수함."
    },
    standardTime: {
      standardTime: 90,
      measuredCycles: [87, 88, 89],
      isCompliant: "PASS",
      observation: "표준 90초 대비 평균 88초 수준으로 준수율 매우 우수함."
    },
    improvement: {
      observation: "특별한 갭 사항 발견되지 않음. 숙련도 매우 높음.",
      idea: "James Carter의 우수 작업 팁을 타 근무 조 및 작업자에게 전파하기 위한 동영상 가이드 제작 건의",
      benefit: "공장 전반 수동 용접 조립 품질 상향 평준화"
    },
    gaps: [],
    actions: [],
    evidences: [
      {
        id: "EVI-20260701-01",
        imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=60",
        description: "안전 용접장비를 100% 올바르게 착용하고 공정 완벽 수행 중",
        beforeAfter: "After",
        evidenceType: "PPE"
      }
    ],
    score: 100
  },
  {
    id: "SW-20260702-001",
    auditDate: "2026-07-02",
    site: "Incheon",
    area: "Welding",
    line: "Sub-Assy Frame",
    station: "ST-01 Base Tack",
    shift: "Shift A",
    auditor: "Lee Jun-min",
    operatorName: "Park Min-woo",
    trigger: "New Product",
    swiNo: "SWI-WELD-101",
    swcNo: "SWC-WELD-101",
    status: "Draft",
    ppe: {
      isCompliant: "PASS",
      observation: "보호구 전량 착용 확인."
    },
    sequence: {
      swipCompliant: "PASS",
      sequenceCompliant: "PASS",
      movesCompliant: "PASS",
      observation: "작업 준비상태 표준 준수."
    },
    keyPoints: {
      swiCompliant: "FAIL",
      oplCompliant: "NA",
      observation: "신제품 전용 지그에 프레임을 안착시킬 때, 가이드 블록에 완전 밀착되지 않은 채 가용접을 진행하려는 경향 관찰됨."
    },
    standardTime: {
      standardTime: 150,
      measuredCycles: [155, 162],
      isCompliant: "FAIL",
      observation: "신규 공정 숙련 미달로 2차 측정 시 162초 소요 (기준 허용 5%인 157.5초 초과)."
    },
    improvement: {
      observation: "지그 밀착 여부를 확인하는 디지털 센서 또는 마킹 컬러 가이드 신설 요망.",
      idea: "지그 완전 체결 시 시각 표시 LED 인디케이터 장착",
      benefit: "안착 미흡에 의한 오용접 사전 100% 차단"
    },
    gaps: [
      {
        id: "GAP-20260702-01",
        category: "Quality",
        description: "신제품 조립 지그 안착 시 완전 밀착 가이드 미준수로 부품 틀어짐 및 미용접 위험 상존",
        requirement: "지그 안착 클램프 완전 잠금 상태 및 에어 밀착도 표시등 확인 후 용접 스타트",
        immediateAction: "작업자 밀착 유도 선명한 마킹 부착 및 현장 1:1 밀착 코칭",
        rootCause: "지그 설계상의 클램프 완충 센서 미비 및 신제품 조립 익숙도 부족",
        riskLevel: "High",
        followUpRequired: true
      }
    ],
    actions: [
      {
        id: "ACT-20260702-01",
        actionDescription: "지그 완전 안착 보장을 위한 에어 밀착 연동 차단 리미트 스위치 증설",
        type: "Update SW Docs",
        owner: "ME",
        dueDate: "2026-07-20",
        status: "Pending",
        effectivenessEvaluation: "클램프 완전 장착 전에는 기기가 자동 대기하여 오조립을 강제 차단하는 기능 검증",
        reAuditRequired: true
      }
    ],
    evidences: [],
    score: 60
  }
];
