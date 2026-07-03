import { useState, useEffect } from "react";
import { TRANSLATIONS } from "../utils/translations";
import {
  AuditRecord,
  PPEAudit,
  SequenceAudit,
  KeyPointAudit,
  StandardTimeAudit,
  ImprovementOpportunity,
  EvidenceItem,
  GapItem,
  CorrectiveAction,
  SiteType,
  AreaType,
  ShiftType,
  TriggerType,
  GapCategoryType,
  RiskLevelType,
} from "../types";
import {
  Sparkles,
  Camera,
  Plus,
  Trash2,
  FileText,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Save,
  Send,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";

interface AuditExecutionViewProps {
  onSave: (audit: AuditRecord) => void;
  onCancel: () => void;
  existingAudit?: AuditRecord | null;
  lang: string;
}

const STOCK_EVIDENCES = [
  {
    name: "안전장비 미착용 (PPE)",
    url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=500&auto=format&fit=crop&q=60",
    type: "PPE" as const,
  },
  {
    name: "작업대 정돈 미흡 (Sequence)",
    url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=60",
    type: "Sequence" as const,
  },
  {
    name: "에어 툴 조작 (StandardTime)",
    url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=60",
    type: "StandardTime" as const,
  },
];

const STOCK_IMPROVEMENTS = [
  {
    name: "정돈 불량 공구/거치대",
    url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "지그/부품 배치 가이드 누락",
    url: "https://images.unsplash.com/photo-1537462715879-360eeb61a0bc?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "수작업 조립대 인체공학적 개선 필요",
    url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60",
  }
];

export default function AuditExecutionView({ onSave, onCancel, existingAudit, lang }: AuditExecutionViewProps) {
  const t = (key: string) => TRANSLATIONS[lang as any]?.[key] || TRANSLATIONS["en"][key] || key;

  // Generate Audit ID
  const generateAuditId = () => {
    const today = new Date();
    const yyyymmdd = today.toISOString().split("T")[0].replace(/-/g, "");
    const rand = Math.floor(100 + Math.random() * 900);
    return `SW-${yyyymmdd}-${rand}`;
  };

  // Base Info States
  const [auditId] = useState(existingAudit ? existingAudit.id : generateAuditId());
  const [auditDate, setAuditDate] = useState(existingAudit ? existingAudit.auditDate : "2026-07-02");
  const [site, setSite] = useState<SiteType>(existingAudit ? existingAudit.site : "Incheon");
  const [area, setArea] = useState<AreaType>(existingAudit ? existingAudit.area : "Assembly");
  const [line, setLine] = useState(existingAudit ? existingAudit.line : "");
  const [station, setStation] = useState(existingAudit ? existingAudit.station : "");
  const [shift, setShift] = useState<ShiftType>(existingAudit ? existingAudit.shift : "Shift A");
  const [auditor, setAuditor] = useState(existingAudit ? existingAudit.auditor : "Supervisor");
  const [operatorName, setOperatorName] = useState(existingAudit ? existingAudit.operatorName : "");
  const [trigger, setTrigger] = useState<TriggerType>(existingAudit ? existingAudit.trigger : "Routine");
  const [swiNo, setSwiNo] = useState(existingAudit ? existingAudit.swiNo : "");
  const [swcNo, setSwcNo] = useState(existingAudit ? existingAudit.swcNo : "");

  // Dynamic Options States
  const [sitesList, setSitesList] = useState<string[]>(() => {
    const saved = localStorage.getItem("sw_audit_sites");
    const list = saved ? JSON.parse(saved) : ["Incheon", "Bismarck", "Dobris", "Chennai"];
    if (existingAudit && existingAudit.site && !list.includes(existingAudit.site)) {
      list.push(existingAudit.site);
    }
    return list;
  });
  const [customSite, setCustomSite] = useState("");
  const [isAddingSite, setIsAddingSite] = useState(false);

  const [areasList, setAreasList] = useState<string[]>(() => {
    const saved = localStorage.getItem("sw_audit_areas");
    const list = saved ? JSON.parse(saved) : ["Assembly", "Welding", "Machining", "Paint", "Logistics"];
    if (existingAudit && existingAudit.area && !list.includes(existingAudit.area)) {
      list.push(existingAudit.area);
    }
    return list;
  });
  const [customArea, setCustomArea] = useState("");
  const [isAddingArea, setIsAddingArea] = useState(false);

  const [shiftsList, setShiftsList] = useState<string[]>(() => {
    const saved = localStorage.getItem("sw_audit_shifts");
    const list = saved ? JSON.parse(saved) : ["Shift A", "Shift B", "Shift C"];
    if (existingAudit && existingAudit.shift && !list.includes(existingAudit.shift)) {
      list.push(existingAudit.shift);
    }
    return list;
  });
  const [customShift, setCustomShift] = useState("");
  const [isAddingShift, setIsAddingShift] = useState(false);

  const handleAddCustomSite = () => {
    if (customSite.trim()) {
      const val = customSite.trim();
      if (!sitesList.includes(val)) {
        const newList = [...sitesList, val];
        setSitesList(newList);
        localStorage.setItem("sw_audit_sites", JSON.stringify(newList));
      }
      setSite(val);
      setCustomSite("");
      setIsAddingSite(false);
    }
  };

  const handleAddCustomArea = () => {
    if (customArea.trim()) {
      const val = customArea.trim();
      if (!areasList.includes(val)) {
        const newList = [...areasList, val];
        setAreasList(newList);
        localStorage.setItem("sw_audit_areas", JSON.stringify(newList));
      }
      setArea(val);
      setCustomArea("");
      setIsAddingArea(false);
    }
  };

  const handleAddCustomShift = () => {
    if (customShift.trim()) {
      const val = customShift.trim();
      if (!shiftsList.includes(val)) {
        const newList = [...shiftsList, val];
        setShiftsList(newList);
        localStorage.setItem("sw_audit_shifts", JSON.stringify(newList));
      }
      setShift(val);
      setCustomShift("");
      setIsAddingShift(false);
    }
  };

  // Audit evaluation states
  const [ppe, setPpe] = useState<PPEAudit>(() => {
    if (existingAudit) {
      return {
        isCompliant: existingAudit.ppe.isCompliant,
        attempt1: existingAudit.ppe.attempt1 || existingAudit.ppe.isCompliant,
        attempt2: existingAudit.ppe.attempt2,
        observation: existingAudit.ppe.observation,
      };
    }
    return { isCompliant: "PASS", attempt1: "PASS", attempt2: undefined, observation: "" };
  });

  const [sequence, setSequence] = useState<SequenceAudit>(() => {
    if (existingAudit) {
      return {
        swipCompliant: existingAudit.sequence.swipCompliant,
        swipAttempt1: existingAudit.sequence.swipAttempt1 || existingAudit.sequence.swipCompliant,
        swipAttempt2: existingAudit.sequence.swipAttempt2,
        sequenceCompliant: existingAudit.sequence.sequenceCompliant,
        sequenceAttempt1: existingAudit.sequence.sequenceAttempt1 || existingAudit.sequence.sequenceCompliant,
        sequenceAttempt2: existingAudit.sequence.sequenceAttempt2,
        movesCompliant: existingAudit.sequence.movesCompliant,
        movesAttempt1: existingAudit.sequence.movesAttempt1 || existingAudit.sequence.movesCompliant,
        movesAttempt2: existingAudit.sequence.movesAttempt2,
        observation: existingAudit.sequence.observation,
      };
    }
    return {
      swipCompliant: "PASS",
      swipAttempt1: "PASS",
      sequenceCompliant: "PASS",
      sequenceAttempt1: "PASS",
      movesCompliant: "PASS",
      movesAttempt1: "PASS",
      observation: "",
    };
  });

  const [keyPoints, setKeyPoints] = useState<KeyPointAudit>(() => {
    if (existingAudit) {
      const kp = existingAudit.keyPoints;
      let items = kp.items;
      if (!items || items.length === 0) {
        items = [
          { id: "kp-1", name: "SWI 품질/안전 주요 포인트 준수", isCompliant: kp.swiCompliant || "PASS" },
          { id: "kp-2", name: "OPL (원포인트 레슨) 중요 조립 수칙 만족", isCompliant: kp.oplCompliant || "PASS" },
        ];
      }
      return {
        ...kp,
        items,
      };
    }
    return {
      items: [
        { id: "kp-1", name: "SWI 품질/안전 주요 포인트 준수", isCompliant: "PASS" },
        { id: "kp-2", name: "OPL (원포인트 레슨) 중요 조립 수칙 만족", isCompliant: "PASS" },
      ],
      observation: "",
    };
  });

  const [newKeyPointName, setNewKeyPointName] = useState("");

  const addKeyPoint = () => {
    if (!newKeyPointName.trim()) return;
    const newItem = {
      id: `kp-${Date.now()}`,
      name: newKeyPointName.trim(),
      isCompliant: "PASS" as const,
    };
    setKeyPoints((prev) => ({
      ...prev,
      items: [...(prev.items || []), newItem],
    }));
    setNewKeyPointName("");
  };

  const removeKeyPoint = (id: string) => {
    setKeyPoints((prev) => ({
      ...prev,
      items: (prev.items || []).filter((item) => item.id !== id),
    }));
  };

  const updateKeyPointStatus = (id: string, isCompliant: "PASS" | "FAIL" | "NA") => {
    setKeyPoints((prev) => ({
      ...prev,
      items: (prev.items || []).map((item) =>
        item.id === id ? { ...item, isCompliant } : item
      ),
    }));
  };

  // Dual attempt state handlers for 2.1 (PPE) and 2.2 (Work Sequence)
  const handlePpeAttempt1 = (opt: "PASS" | "FAIL" | "NA") => {
    setPpe((prev) => {
      const isCompliant = opt === "FAIL" ? (prev.attempt2 === "PASS" ? "PASS" : "FAIL") : opt;
      return {
        ...prev,
        attempt1: opt,
        isCompliant,
        attempt2: opt === "FAIL" ? prev.attempt2 : undefined,
      };
    });
  };

  const handlePpeAttempt2 = (opt: "PASS" | "FAIL" | "NA") => {
    setPpe((prev) => ({
      ...prev,
      attempt2: opt,
      isCompliant: opt,
    }));
  };

  const handleSwipAttempt1 = (opt: "PASS" | "FAIL" | "NA") => {
    setSequence((prev) => {
      const swipCompliant = opt === "FAIL" ? (prev.swipAttempt2 === "PASS" ? "PASS" : "FAIL") : opt;
      return {
        ...prev,
        swipAttempt1: opt,
        swipCompliant,
        swipAttempt2: opt === "FAIL" ? prev.swipAttempt2 : undefined,
      };
    });
  };

  const handleSwipAttempt2 = (opt: "PASS" | "FAIL" | "NA") => {
    setSequence((prev) => ({
      ...prev,
      swipAttempt2: opt,
      swipCompliant: opt,
    }));
  };

  const handleSequenceAttempt1 = (opt: "PASS" | "FAIL" | "NA") => {
    setSequence((prev) => {
      const sequenceCompliant = opt === "FAIL" ? (prev.sequenceAttempt2 === "PASS" ? "PASS" : "FAIL") : opt;
      return {
        ...prev,
        sequenceAttempt1: opt,
        sequenceCompliant,
        sequenceAttempt2: opt === "FAIL" ? prev.sequenceAttempt2 : undefined,
      };
    });
  };

  const handleSequenceAttempt2 = (opt: "PASS" | "FAIL" | "NA") => {
    setSequence((prev) => ({
      ...prev,
      sequenceAttempt2: opt,
      sequenceCompliant: opt,
    }));
  };

  const handleMovesAttempt1 = (opt: "PASS" | "FAIL" | "NA") => {
    setSequence((prev) => {
      const movesCompliant = opt === "FAIL" ? (prev.movesAttempt2 === "PASS" ? "PASS" : "FAIL") : opt;
      return {
        ...prev,
        movesAttempt1: opt,
        movesCompliant,
        movesAttempt2: opt === "FAIL" ? prev.movesAttempt2 : undefined,
      };
    });
  };

  const handleMovesAttempt2 = (opt: "PASS" | "FAIL" | "NA") => {
    setSequence((prev) => ({
      ...prev,
      movesAttempt2: opt,
      movesCompliant: opt,
    }));
  };

  const [standardTime, setStandardTime] = useState<StandardTimeAudit>(
    existingAudit
      ? existingAudit.standardTime
      : { standardTime: 60, measuredCycles: [], isCompliant: "PASS", observation: "" }
  );

  const [newCycle, setNewCycle] = useState<string>("");

  const [improvement, setImprovement] = useState<ImprovementOpportunity>(
    existingAudit ? existingAudit.improvement : { observation: "", idea: "", benefit: "" }
  );

  // Improvement photo states
  const [impEvidenceDesc, setImpEvidenceDesc] = useState("");

  // Gaps, Actions & Evidences
  const [gaps, setGaps] = useState<GapItem[]>(existingAudit ? existingAudit.gaps : []);
  const [actions, setActions] = useState<CorrectiveAction[]>(existingAudit ? existingAudit.actions : []);
  const [evidences, setEvidences] = useState<EvidenceItem[]>(existingAudit ? existingAudit.evidences : []);

  // Evidence UI states
  const [evidenceDesc, setEvidenceDesc] = useState("");
  const [evidenceBeforeAfter, setEvidenceBeforeAfter] = useState<"Before" | "After">("Before");
  const [evidenceType, setEvidenceType] = useState<"PPE" | "Sequence" | "KeyPoints" | "StandardTime" | "Improvement">(
    "Sequence"
  );

  // AI Loading state
  const [aiAnalyzingSection, setAiAnalyzingSection] = useState<string | null>(null);

  // Check standard time auto pass/fail
  useEffect(() => {
    if (standardTime.measuredCycles.length > 0) {
      const sum = standardTime.measuredCycles.reduce((a, b) => a + b, 0);
      const avg = sum / standardTime.measuredCycles.length;
      const limit = standardTime.standardTime * 1.05; // 5% Tolerance
      const compliant = avg <= limit ? "PASS" : "FAIL";

      setStandardTime((prev) => ({
        ...prev,
        isCompliant: compliant,
        observation: prev.observation || `측정 평균 ${avg.toFixed(1)}초 (기준 ${prev.standardTime}초 + 5% 허용오차 ${limit.toFixed(1)}초) -> ${compliant === "PASS" ? "기준 만족" : "시간 초과"}`,
      }));
    }
  }, [standardTime.measuredCycles, standardTime.standardTime]);

  // Handle auto gap generation when a section fails
  useEffect(() => {
    const activeGaps: GapItem[] = [...gaps];

    // PPE Gap (registered ONLY when 1st attempt AND 2nd attempt both fail)
    const ppeGapIndex = activeGaps.findIndex((g) => g.id.startsWith("GAP-PPE-"));
    const isPpeGapNeeded = ppe.attempt1 === "FAIL" && ppe.attempt2 === "FAIL";
    if (isPpeGapNeeded) {
      if (ppeGapIndex === -1) {
        activeGaps.push({
          id: `GAP-PPE-${Date.now()}`,
          category: "Safety",
          description: ppe.observation || "2차 평가에서도 안전 보호구 준수 상태 미흡 발견 (최종 NOK)",
          requirement: "공정 내 규정된 필수 개인보호구(PPE) 100% 정상 착용",
          immediateAction: "작업자 대상 즉각 올바른 보호구 착용 조치 및 지시",
          rootCause: "현장 표준 PPE 착용 안내 부재 및 본인 인지 미흡",
          riskLevel: "High",
          followUpRequired: true,
        });
      }
    } else {
      if (ppeGapIndex !== -1) {
        activeGaps.splice(ppeGapIndex, 1);
      }
    }

    // Sequence Gap (registered ONLY when 1st attempt AND 2nd attempt both fail for any item)
    const seqGapIndex = activeGaps.findIndex((g) => g.id.startsWith("GAP-SEQ-"));
    const isSwipFail = sequence.swipAttempt1 === "FAIL" && sequence.swipAttempt2 === "FAIL";
    const isSequenceFail = sequence.sequenceAttempt1 === "FAIL" && sequence.sequenceAttempt2 === "FAIL";
    const isMovesFail = sequence.movesAttempt1 === "FAIL" && sequence.movesAttempt2 === "FAIL";
    const isSeqGapNeeded = isSwipFail || isSequenceFail || isMovesFail;

    if (isSeqGapNeeded) {
      if (seqGapIndex === -1) {
        // Build descriptions for what failed
        const details: string[] = [];
        if (isSwipFail) details.push("표준 재공 수량(SWIP) 미준수");
        if (isSequenceFail) details.push("작업 시퀀스 미준수");
        if (isMovesFail) details.push("작업자 보행동선 불일치");

        activeGaps.push({
          id: `GAP-SEQ-${Date.now()}`,
          category: "Standard not followed",
          description: sequence.observation || `공정 순서/동선 준수성 2차 재평가 최종 실패: [${details.join(", ")}]`,
          requirement: "SWC에 표시된 표준 재공(SWIP) 유지, 지정 시퀀스 및 보행 경로 일치",
          immediateAction: "즉시 과대 재공 반출 조치 및 표준 노선 복귀 교육",
          rootCause: "작업 영역의 원자재 적재 위치 불분명 및 공정 레이아웃 편차",
          riskLevel: "Medium",
          followUpRequired: true,
        });
      }
    } else {
      if (seqGapIndex !== -1) {
        activeGaps.splice(seqGapIndex, 1);
      }
    }

    // Key Point Gap (any item fails)
    const kpGapIndex = activeGaps.findIndex((g) => g.id.startsWith("GAP-KP-"));
    const failedKps = (keyPoints.items || []).filter((item) => item.isCompliant === "FAIL").map((item) => item.name);
    const isKpFail = failedKps.length > 0;
    if (isKpFail) {
      if (kpGapIndex === -1) {
        activeGaps.push({
          id: `GAP-KP-${Date.now()}`,
          category: "Quality",
          description: keyPoints.observation || `SWI/OPL 필수 체크포인트 불준수 발견: [${failedKps.join(", ")}]`,
          requirement: "작업 표준에 지정된 주요 포인트(Key Point) 절차 철저 준수",
          immediateAction: "조립 불량 유발 체크포인트 일대일 재검증",
          rootCause: "중요 오조립 방지 가이드 미숙지 및 품질 체크 게이지 조작 미숙",
          riskLevel: "High",
          followUpRequired: true,
        });
      }
    } else {
      if (kpGapIndex !== -1) {
        activeGaps.splice(kpGapIndex, 1);
      }
    }

    // Standard Time Gap
    const stGapIndex = activeGaps.findIndex((g) => g.id.startsWith("GAP-ST-"));
    if (standardTime.isCompliant === "FAIL") {
      if (stGapIndex === -1) {
        activeGaps.push({
          id: `GAP-ST-${Date.now()}`,
          category: "Standard not followed",
          description: standardTime.observation || "실측 사이클타임이 표준시간 및 5% 허용 한계를 초과함",
          requirement: "표준 시간(SW.T) 및 허용오차 규격 범위 이내 작업 완료",
          immediateAction: "작업 동요 유무 확인 및 낭비 요소 진단 조치",
          rootCause: "조립 조작의 불필요한 이중 동작 및 체결 툴 오작동 지연",
          riskLevel: "Medium",
          followUpRequired: true,
        });
      }
    } else {
      if (stGapIndex !== -1) {
        activeGaps.splice(stGapIndex, 1);
      }
    }

    // Check if lengths are actually different to avoid infinite loop
    const idString = (g: GapItem[]) => g.map((x) => x.id).join(",");
    if (idString(gaps) !== idString(activeGaps)) {
      setGaps(activeGaps);
    }
  }, [
    ppe.attempt1,
    ppe.attempt2,
    ppe.isCompliant,
    sequence.swipAttempt1,
    sequence.swipAttempt2,
    sequence.sequenceAttempt1,
    sequence.sequenceAttempt2,
    sequence.movesAttempt1,
    sequence.movesAttempt2,
    sequence.swipCompliant,
    sequence.sequenceCompliant,
    sequence.movesCompliant,
    keyPoints.items,
    standardTime.isCompliant
  ]);

  // Sync Actions with Gaps automatically
  useEffect(() => {
    const updatedActions = [...actions];

    gaps.forEach((gap) => {
      const exists = updatedActions.some((a) => a.id === `ACT-AUTO-${gap.id}`);
      if (exists) return;

      // Add default corrective action recommendation
      updatedActions.push({
        id: `ACT-AUTO-${gap.id}`,
        actionDescription: `[시정조치] ${gap.description}의 재발방지를 위한 영구적 표준 프로세스 정착화 조치`,
        type: gap.category === "Safety" ? "Training" : "Update SW Docs",
        owner: gap.category === "Safety" ? "EHS" : "Supervisor",
        dueDate: "2026-07-09", // Default 7 days later
        status: "Pending",
        effectivenessEvaluation: "재평가(Re-audit)를 통한 해당 준수율 및 표준 사이클타임 확보 측정 검증",
        reAuditRequired: true,
      });
    });

    // Remove actions of deleted gaps
    const gapIds = gaps.map((g) => `ACT-AUTO-${g.id}`);
    const filteredActions = updatedActions.filter(
      (a) => !a.id.startsWith("ACT-AUTO-") || gapIds.includes(a.id)
    );

    const actionIdString = (ac: CorrectiveAction[]) => ac.map((x) => x.id).join(",");
    if (actionIdString(actions) !== actionIdString(filteredActions)) {
      setActions(filteredActions);
    }
  }, [gaps]);

  // Call server-side Gemini AI for intelligent gap analysis and corrective actions
  const triggerAiAnalysis = async (gapId: string, sectionName: string, observationText: string) => {
    if (!observationText.trim()) {
      alert("AI 분석을 수행하기 전에 관찰 사항(Observation)을 입력해 주세요.");
      return;
    }

    setAiAnalyzingSection(gapId);
    try {
      const response = await fetch("/api/gemini/analyze-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: sectionName,
          observation: observationText,
          extraContext: { site, area, line, station, swiNo },
        }),
      });

      if (!response.ok) {
        throw new Error("AI 분석 요청에 실패했습니다.");
      }

      const aiResult = await response.json();

      // Update the specific gap
      setGaps((prevGaps) =>
        prevGaps.map((g) => {
          if (g.id === gapId) {
            return {
              ...g,
              category: aiResult.gapCategory as GapCategoryType,
              riskLevel: aiResult.riskLevel as RiskLevelType,
              rootCause: aiResult.rootCause,
              immediateAction: aiResult.immediateAction,
              description: `[AI 고도화] ${g.description}\n- 상세분석: ${aiResult.rootCause.substring(0, 80)}...`,
            };
          }
          return g;
        })
      );

      // Update the linked corrective action
      setActions((prevActions) =>
        prevActions.map((a) => {
          if (a.id === `ACT-AUTO-${gapId}`) {
            return {
              ...a,
              actionDescription: aiResult.correctiveAction.action,
              type: aiResult.correctiveAction.type,
              owner: aiResult.correctiveAction.owner,
              dueDate: new Date(Date.now() + aiResult.correctiveAction.dueDays * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              effectivenessEvaluation: aiResult.correctiveAction.effectivenessCriteria,
            };
          }
          return a;
        })
      );
    } catch (err: any) {
      console.error(err);
      alert("Gemini AI 연동 오류가 발생했습니다. 오프라인 백업 조치 데이터로 변환합니다.");
    } finally {
      setAiAnalyzingSection(null);
    }
  };

  // Add Measured Cycle Time
  const addCycle = () => {
    const val = parseFloat(newCycle);
    if (!isNaN(val) && val > 0) {
      setStandardTime((prev) => ({
        ...prev,
        measuredCycles: [...prev.measuredCycles, val],
      }));
      setNewCycle("");
    }
  };

  // Delete Measured Cycle Time
  const removeCycle = (index: number) => {
    setStandardTime((prev) => ({
      ...prev,
      measuredCycles: prev.measuredCycles.filter((_, idx) => idx !== index),
    }));
  };

  // Mock photo upload or Unsplash insert
  const insertStockPhoto = (url: string, typeName: string) => {
    const newItem: EvidenceItem = {
      id: `EVI-${Date.now()}`,
      imageUrl: url,
      description: evidenceDesc || `현장 ${typeName} 지적 증빙 사항 사진 등록`,
      beforeAfter: evidenceBeforeAfter,
      evidenceType: evidenceType,
    };
    setEvidences([...evidences, newItem]);
    setEvidenceDesc("");
  };

  const attachImprovementPhoto = (url: string, name: string) => {
    const newItem: EvidenceItem = {
      id: `EVI-${Date.now()}`,
      imageUrl: url,
      description: impEvidenceDesc || `개선 제안 현장 사진: ${name}`,
      beforeAfter: "Before",
      evidenceType: "Improvement",
    };
    setEvidences((prev) => [...prev, newItem]);
    setImpEvidenceDesc("");
  };

  // Save as Draft or Submit
  const handleSaveOrSubmit = (status: "Draft" | "Submitted") => {
    if (!line.trim() || !station.trim() || !operatorName.trim()) {
      alert("Line, Station, Operator Name은 필수 작성 항목입니다.");
      return;
    }

    // Score Calculation
    let scoreParts = 0;
    let scoreTotal = 0;

    // 1. PPE Score
    if (ppe.isCompliant !== "NA") {
      scoreParts++;
      scoreTotal += ppe.isCompliant === "PASS" ? 100 : 0;
    }

    // 2. Sequence Score
    let seqParts = 0;
    let seqSum = 0;
    if (sequence.swipCompliant !== "NA") {
      seqParts++;
      seqSum += sequence.swipCompliant === "PASS" ? 100 : 0;
    }
    if (sequence.sequenceCompliant !== "NA") {
      seqParts++;
      seqSum += sequence.sequenceCompliant === "PASS" ? 100 : 0;
    }
    if (sequence.movesCompliant !== "NA") {
      seqParts++;
      seqSum += sequence.movesCompliant === "PASS" ? 100 : 0;
    }
    if (seqParts > 0) {
      scoreParts++;
      scoreTotal += seqSum / seqParts;
    }

    // 3. Key Point Score
    let kpParts = 0;
    let kpSum = 0;
    (keyPoints.items || []).forEach((item) => {
      if (item.isCompliant !== "NA") {
        kpParts++;
        kpSum += item.isCompliant === "PASS" ? 100 : 0;
      }
    });
    if (kpParts > 0) {
      scoreParts++;
      scoreTotal += kpSum / kpParts;
    }

    // 4. Standard Time Score
    if (standardTime.isCompliant !== "NA") {
      scoreParts++;
      scoreTotal += standardTime.isCompliant === "PASS" ? 100 : 0;
    }

    const calculatedScore = scoreParts > 0 ? Math.round(scoreTotal / scoreParts) : 100;

    const finalRecord: AuditRecord = {
      id: auditId,
      auditDate,
      site,
      area,
      line,
      station,
      shift,
      auditor,
      operatorName,
      trigger,
      swiNo,
      swcNo,
      status,
      ppe,
      sequence,
      keyPoints,
      standardTime,
      improvement,
      gaps,
      actions,
      evidences,
      score: calculatedScore,
    };

    onSave(finalRecord);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* 1. Header Navigation */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-5.5 w-5.5 text-[#005EB8]" />
            {existingAudit ? t("ex_edit_title") : t("ex_new_title")}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {auditId} • {t("ex_subtitle")}
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            {t("ex_cancel")}
          </button>
          <button
            onClick={() => handleSaveOrSubmit("Draft")}
            className="px-4 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 flex items-center gap-1.5 transition"
          >
            <Save className="h-4 w-4" /> {t("ex_save_draft")}
          </button>
          <button
            onClick={() => handleSaveOrSubmit("Submitted")}
            className="px-5 py-2 text-xs font-bold text-white bg-[#005EB8] hover:bg-[#004B93] rounded-lg flex items-center gap-1.5 shadow-sm transition"
          >
            <Send className="h-4 w-4" /> {t("ex_submit")}
          </button>
        </div>
      </div>

      {/* 2. Basic Metadata Input Form */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-base md:text-lg font-bold text-[#005EB8] uppercase tracking-wider mb-2 border-b border-gray-100 pb-3">
          {t("ex_sec_basic")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">{t("ex_date")}</label>
            <input
              type="date"
              value={auditDate}
              onChange={(e) => setAuditDate(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-md p-2 focus:ring-1 focus:ring-[#005EB8] focus:border-[#005EB8]"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] font-bold text-gray-700">{t("ex_site")}</label>
              <button
                type="button"
                onClick={() => {
                  setIsAddingSite(!isAddingSite);
                  setCustomSite("");
                }}
                className="text-[9px] text-[#005EB8] hover:underline font-bold"
              >
                {isAddingSite ? t("ex_cancel") : t("ex_add_custom_site")}
              </button>
            </div>
            {isAddingSite ? (
              <div className="flex gap-1">
                <input
                  type="text"
                  placeholder={t("ex_new_site_placeholder")}
                  value={customSite}
                  onChange={(e) => setCustomSite(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-md p-1.5 focus:ring-1 focus:ring-[#005EB8] focus:border-[#005EB8]"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSite}
                  className="px-2 py-1 bg-[#005EB8] text-white text-[10px] font-bold rounded hover:bg-[#004B93] shrink-0"
                >
                  {t("ex_add")}
                </button>
              </div>
            ) : (
              <select
                value={site}
                onChange={(e) => setSite(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-md p-2 focus:ring-1 focus:ring-[#005EB8] focus:border-[#005EB8]"
              >
                {sitesList.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] font-bold text-gray-700">{t("ex_area")}</label>
              <button
                type="button"
                onClick={() => {
                  setIsAddingArea(!isAddingArea);
                  setCustomArea("");
                }}
                className="text-[9px] text-[#005EB8] hover:underline font-bold"
              >
                {isAddingArea ? t("ex_cancel") : t("ex_add_custom_area")}
              </button>
            </div>
            {isAddingArea ? (
              <div className="flex gap-1">
                <input
                  type="text"
                  placeholder={t("ex_new_area_placeholder")}
                  value={customArea}
                  onChange={(e) => setCustomArea(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-md p-1.5 focus:ring-1 focus:ring-[#005EB8] focus:border-[#005EB8]"
                />
                <button
                  type="button"
                  onClick={handleAddCustomArea}
                  className="px-2 py-1 bg-[#005EB8] text-white text-[10px] font-bold rounded hover:bg-[#004B93] shrink-0"
                >
                  {t("ex_add")}
                </button>
              </div>
            ) : (
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-md p-2 focus:ring-1 focus:ring-[#005EB8] focus:border-[#005EB8]"
              >
                {areasList.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] font-bold text-gray-700">{t("ex_shift")}</label>
              <button
                type="button"
                onClick={() => {
                  setIsAddingShift(!isAddingShift);
                  setCustomShift("");
                }}
                className="text-[9px] text-[#005EB8] hover:underline font-bold"
              >
                {isAddingShift ? t("ex_cancel") : t("ex_add_custom_shift")}
              </button>
            </div>
            {isAddingShift ? (
              <div className="flex gap-1">
                <input
                  type="text"
                  placeholder={t("ex_new_shift_placeholder")}
                  value={customShift}
                  onChange={(e) => setCustomShift(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-md p-1.5 focus:ring-1 focus:ring-[#005EB8] focus:border-[#005EB8]"
                />
                <button
                  type="button"
                  onClick={handleAddCustomShift}
                  className="px-2 py-1 bg-[#005EB8] text-white text-[10px] font-bold rounded hover:bg-[#004B93] shrink-0"
                >
                  {t("ex_add")}
                </button>
              </div>
            ) : (
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-md p-2 focus:ring-1 focus:ring-[#005EB8] focus:border-[#005EB8]"
              >
                {shiftsList.map((sh) => (
                  <option key={sh} value={sh}>{sh}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">{t("ex_line")} *</label>
            <input
              type="text"
              placeholder={t("ex_line_placeholder")}
              value={line}
              onChange={(e) => setLine(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-md p-2 focus:ring-1 focus:ring-[#005EB8]"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">{t("ex_station")} *</label>
            <input
              type="text"
              placeholder={t("ex_station_placeholder")}
              value={station}
              onChange={(e) => setStation(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-md p-2 focus:ring-1 focus:ring-[#005EB8]"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">{t("ex_auditor")}</label>
            <input
              type="text"
              placeholder={t("ex_auditor_placeholder")}
              value={auditor}
              onChange={(e) => setAuditor(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">{t("ex_operator")} *</label>
            <input
              type="text"
              placeholder={t("ex_operator_placeholder")}
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-md p-2 focus:ring-1 focus:ring-[#005EB8]"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">{t("ex_trigger")}</label>
            <select
              value={trigger}
              onChange={(e) => setTrigger(e.target.value as TriggerType)}
              className="w-full text-xs border border-gray-200 rounded-md p-2"
            >
              <option value="Routine">{lang === "ko" ? "Routine (정기 감사)" : "Routine (Regular Audit)"}</option>
              <option value="New Product">{lang === "ko" ? "New Product (신제품 도입)" : "New Product introduction"}</option>
              <option value="Process Change">{lang === "ko" ? "Process Change (공정 변경)" : "Process Change"}</option>
              <option value="Issue/Incident">{lang === "ko" ? "Issue/Incident (이슈/품질 사고 발생)" : "Issue/Incident"}</option>
              <option value="Job Rotation">{lang === "ko" ? "Job Rotation (교대/보직 교대)" : "Job Rotation"}</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">{t("ex_swi_no")}</label>
            <input
              type="text"
              placeholder="e.g. SWI-ASSY-302"
              value={swiNo}
              onChange={(e) => setSwiNo(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">{t("ex_swc_no")}</label>
            <input
              type="text"
              placeholder="e.g. SWC-ASSY-302"
              value={swcNo}
              onChange={(e) => setSwcNo(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-md p-2"
            />
          </div>
        </div>
      </div>

      {/* 3. Detailed Checklist Audit Areas Block */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
        <h2 className="text-base md:text-lg font-bold text-[#005EB8] uppercase tracking-wider mb-2 border-b border-gray-100 pb-3">
          {t("ex_sec_compliance")}
        </h2>

        {/* 2.1 PPE Audit */}
        <div className="bg-gray-50/45 p-5 rounded-xl border border-gray-200/50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-2.5 rounded-lg border border-gray-100 gap-3">
            <div>
              <h3 className="text-xs font-bold text-gray-800">2.1 {t("ex_ppe_title")}</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">{t("ex_ppe_desc")}</p>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-500">{t("ex_first_attempt")}:</span>
                <div className="flex gap-1">
                  {(["PASS", "FAIL", "NA"] as const).map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => handlePpeAttempt1(opt)}
                      className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${
                        ppe.attempt1 === opt
                          ? opt === "PASS"
                            ? "bg-emerald-500 text-white"
                            : opt === "FAIL"
                            ? "bg-rose-500 text-white"
                            : "bg-gray-400 text-white"
                          : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {ppe.attempt1 === "FAIL" && (
                <div className="flex items-center gap-2 animate-fade-in bg-rose-50 p-1.5 rounded-md border border-rose-100">
                  <span className="text-[10px] font-bold text-rose-700">{t("ex_second_attempt_req")}</span>
                  <div className="flex gap-1">
                    {(["PASS", "FAIL"] as const).map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => handlePpeAttempt2(opt)}
                        className={`px-2.5 py-0.5 text-[9px] font-bold rounded transition ${
                          ppe.attempt2 === opt
                            ? opt === "PASS"
                              ? "bg-emerald-600 text-white"
                              : "bg-rose-600 text-white"
                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {opt === "PASS" ? t("ex_pass_upgrade") : t("ex_fail_gap")}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-semibold block">{t("ex_ppe_guide")}</span>
            <textarea
              rows={2}
              placeholder={t("ex_placeholder_obs")}
              value={ppe.observation}
              onChange={(e) => setPpe((prev) => ({ ...prev, observation: e.target.value }))}
              className="w-full text-xs border border-gray-200 rounded-md p-2.5 bg-white focus:ring-1 focus:ring-[#005EB8]"
            />
          </div>
        </div>

        {/* 2.2 Work Sequence Audit */}
        <div className="bg-gray-50/45 p-5 rounded-xl border border-gray-200/50 space-y-4">
          <h3 className="text-xs font-bold text-gray-800 bg-white p-2.5 rounded-lg border border-gray-100">
            2.2 {t("ex_seq_title")}
          </h3>
          <p className="text-[10px] text-gray-500 -mt-2 px-1">{t("ex_seq_desc")}</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* SWIP */}
            <div className="bg-white border border-gray-150 p-3 rounded-lg space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-600 block">{t("ex_swip_label")}</span>
                <span className="text-[9px] text-gray-400 block mt-0.5">{t("ex_swip_desc")}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[9px] text-gray-400 font-bold">{t("ex_first_attempt")}:</span>
                  <div className="flex gap-0.5 flex-1 max-w-[130px]">
                    {(["PASS", "FAIL", "NA"] as const).map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => handleSwipAttempt1(opt)}
                        className={`flex-1 py-1 text-[9px] font-bold rounded transition ${
                          sequence.swipAttempt1 === opt
                            ? opt === "PASS"
                              ? "bg-emerald-500 text-white"
                              : opt === "FAIL"
                              ? "bg-rose-500 text-white"
                              : "bg-gray-400 text-white"
                            : "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                {sequence.swipAttempt1 === "FAIL" && (
                  <div className="flex items-center justify-between gap-1 animate-fade-in bg-rose-50/50 p-1 rounded border border-rose-100">
                    <span className="text-[8px] text-rose-700 font-bold">2차:</span>
                    <div className="flex gap-0.5 flex-1 max-w-[110px]">
                      {(["PASS", "FAIL"] as const).map((opt) => (
                        <button
                          type="button"
                          key={opt}
                          onClick={() => handleSwipAttempt2(opt)}
                          className={`flex-1 py-0.5 text-[8px] font-bold rounded transition ${
                            sequence.swipAttempt2 === opt
                              ? opt === "PASS"
                                ? "bg-emerald-600 text-white"
                                : "bg-rose-600 text-white"
                              : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sequence */}
            <div className="bg-white border border-gray-150 p-3 rounded-lg space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-600 block">{t("ex_seq_label")}</span>
                <span className="text-[9px] text-gray-400 block mt-0.5">{t("ex_seq_desc")}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[9px] text-gray-400 font-bold">{t("ex_first_attempt")}:</span>
                  <div className="flex gap-0.5 flex-1 max-w-[130px]">
                    {(["PASS", "FAIL", "NA"] as const).map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => handleSequenceAttempt1(opt)}
                        className={`flex-1 py-1 text-[9px] font-bold rounded transition ${
                          sequence.sequenceAttempt1 === opt
                            ? opt === "PASS"
                              ? "bg-emerald-500 text-white"
                              : opt === "FAIL"
                              ? "bg-rose-500 text-white"
                              : "bg-gray-400 text-white"
                            : "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                {sequence.sequenceAttempt1 === "FAIL" && (
                  <div className="flex items-center justify-between gap-1 animate-fade-in bg-rose-50/50 p-1 rounded border border-rose-100">
                    <span className="text-[8px] text-rose-700 font-bold">2차:</span>
                    <div className="flex gap-0.5 flex-1 max-w-[110px]">
                      {(["PASS", "FAIL"] as const).map((opt) => (
                        <button
                          type="button"
                          key={opt}
                          onClick={() => handleSequenceAttempt2(opt)}
                          className={`flex-1 py-0.5 text-[8px] font-bold rounded transition ${
                            sequence.sequenceAttempt2 === opt
                              ? opt === "PASS"
                                ? "bg-emerald-600 text-white"
                                : "bg-rose-600 text-white"
                              : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Moves */}
            <div className="bg-white border border-gray-150 p-3 rounded-lg space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-600 block">{t("ex_walk_label")}</span>
                <span className="text-[9px] text-gray-400 block mt-0.5">{t("ex_walk_desc")}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[9px] text-gray-400 font-bold">{t("ex_first_attempt")}:</span>
                  <div className="flex gap-0.5 flex-1 max-w-[130px]">
                    {(["PASS", "FAIL", "NA"] as const).map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => handleMovesAttempt1(opt)}
                        className={`flex-1 py-1 text-[9px] font-bold rounded transition ${
                          sequence.movesAttempt1 === opt
                            ? opt === "PASS"
                              ? "bg-emerald-500 text-white"
                              : opt === "FAIL"
                              ? "bg-rose-500 text-white"
                              : "bg-gray-400 text-white"
                            : "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                {sequence.movesAttempt1 === "FAIL" && (
                  <div className="flex items-center justify-between gap-1 animate-fade-in bg-rose-50/50 p-1 rounded border border-rose-100">
                    <span className="text-[8px] text-rose-700 font-bold">2차:</span>
                    <div className="flex gap-0.5 flex-1 max-w-[110px]">
                      {(["PASS", "FAIL"] as const).map((opt) => (
                        <button
                          type="button"
                          key={opt}
                          onClick={() => handleMovesAttempt2(opt)}
                          className={`flex-1 py-0.5 text-[8px] font-bold rounded transition ${
                            sequence.movesAttempt2 === opt
                              ? opt === "PASS"
                                ? "bg-emerald-600 text-white"
                                : "bg-rose-600 text-white"
                              : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-semibold block">{t("ex_seq_guide")}</span>
            <textarea
              rows={2}
              placeholder={t("ex_placeholder_obs")}
              value={sequence.observation}
              onChange={(e) => setSequence((prev) => ({ ...prev, observation: e.target.value }))}
              className="w-full text-xs border border-gray-200 rounded-md p-2.5 bg-white focus:ring-1 focus:ring-[#005EB8]"
            />
          </div>
        </div>

        {/* 2.3 Key Point Audit */}
        <div className="bg-gray-50/45 p-5 rounded-xl border border-gray-200/50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 bg-white p-3 rounded-lg border border-gray-100 gap-2">
            <div>
              <h3 className="text-xs font-bold text-gray-800">
                2.3 {t("ex_kp_title")}
              </h3>
              <p className="text-[10px] text-gray-500 mt-0.5">{t("ex_kp_desc")}</p>
            </div>
            
            {/* Key Point addition form */}
            <div className="flex gap-1.5 items-center">
              <input
                type="text"
                placeholder={t("ex_add_point_placeholder")}
                value={newKeyPointName}
                onChange={(e) => setNewKeyPointName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyPoint())}
                className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#005EB8] min-w-[180px]"
              />
              <button
                type="button"
                onClick={addKeyPoint}
                className="px-3 py-1.5 bg-[#005EB8] hover:bg-[#004B93] text-white text-xs font-bold rounded-lg flex items-center gap-1 transition shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" /> {t("ex_add")}
              </button>
            </div>
          </div>

          {/* Key point evaluation items list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(keyPoints.items || []).map((item, idx) => (
              <div key={item.id} className="border border-gray-100 p-3.5 rounded-xl space-y-2.5 bg-white hover:shadow-xs transition duration-150 flex flex-col justify-between">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-bold text-gray-700 leading-tight">
                    {idx + 1}. {item.name}
                  </span>
                  {/* Remove custom key points (except default first 2) */}
                  {item.id !== "kp-1" && item.id !== "kp-2" && (
                    <button
                      type="button"
                      onClick={() => removeKeyPoint(item.id)}
                      className="text-gray-400 hover:text-rose-600 transition"
                      title="체크포인트 삭제"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex gap-1.5">
                  {(["PASS", "FAIL", "NA"] as const).map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => updateKeyPointStatus(item.id, opt)}
                      className={`flex-1 py-1.5 text-[10px] font-bold rounded transition ${
                        item.isCompliant === opt
                          ? opt === "PASS"
                            ? "bg-emerald-500 text-white"
                            : opt === "FAIL"
                            ? "bg-rose-500 text-white"
                            : "bg-gray-400 text-white"
                          : "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-semibold block">{t("ex_kp_guide")}</span>
            <textarea
              rows={2}
              placeholder={t("ex_placeholder_obs")}
              value={keyPoints.observation}
              onChange={(e) => setKeyPoints((prev) => ({ ...prev, observation: e.target.value }))}
              className="w-full text-xs border border-gray-200 rounded-md p-2.5 bg-white focus:ring-1 focus:ring-[#005EB8]"
            />
          </div>
        </div>

        {/* 2.4 Standard Time Audit */}
        <div className="bg-gray-50/45 p-5 rounded-xl border border-gray-200/50 space-y-4">
          <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-gray-100">
            <h3 className="text-xs font-bold text-gray-800">2.4 {t("ex_st_title")}</h3>
            <span
              className={`px-3 py-1 text-[10px] font-bold rounded-md ${
                standardTime.isCompliant === "PASS"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {t("ex_status_label")}: {standardTime.isCompliant}
            </span>
          </div>
          <p className="text-[10px] text-gray-500 -mt-2 px-1">{t("ex_st_desc")}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded-lg border border-gray-100">
              <label className="block text-[10px] font-bold text-gray-600 mb-1">{t("ex_standard_time")}</label>
              <input
                type="number"
                value={standardTime.standardTime}
                onChange={(e) => setStandardTime((prev) => ({ ...prev, standardTime: parseInt(e.target.value) || 0 }))}
                className="w-full text-xs border border-gray-200 rounded-md p-2 bg-gray-50 focus:bg-white"
              />
              <span className="text-[9px] text-gray-400 mt-1 block">5% 허용 한계: {(standardTime.standardTime * 1.05).toFixed(1)}초</span>
            </div>

            <div className="md:col-span-2 bg-white p-3 rounded-lg border border-gray-100">
              <label className="block text-[10px] font-bold text-gray-600 mb-1">{t("ex_cycle_time_label")}</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="측정값 입력 (단위: 초)"
                  value={newCycle}
                  onChange={(e) => setNewCycle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCycle()}
                  className="flex-1 text-xs border border-gray-200 rounded-md p-2 bg-gray-50 focus:bg-white"
                />
                <button
                  onClick={addCycle}
                  className="px-4 py-2 text-xs font-bold bg-[#005EB8] hover:bg-[#004B93] text-white rounded-md transition"
                >
                  {t("ex_add")}
                </button>
              </div>

              {/* Measured cycle lists */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {standardTime.measuredCycles.map((cycle, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-md border border-gray-200"
                  >
                    {index + 1}회: {cycle}초
                    <button onClick={() => removeCycle(index)} className="text-gray-400 hover:text-rose-600 ml-1">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-semibold block">{t("ex_st_guide")}</span>
            <textarea
              rows={2}
              placeholder={t("ex_placeholder_obs")}
              value={standardTime.observation}
              onChange={(e) => setStandardTime((prev) => ({ ...prev, observation: e.target.value }))}
              className="w-full text-xs border border-gray-200 rounded-md p-2.5 bg-white focus:ring-1 focus:ring-[#005EB8]"
            />
          </div>
        </div>
      </div>

      {/* 3. Improvement Opportunities */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-base md:text-lg font-bold text-[#005EB8] uppercase tracking-wider mb-2 border-b border-gray-100 pb-3">
          {t("ex_sec_improvement")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-600 mb-1">{t("ex_sec3_obs_label")}</label>
              <textarea
                rows={3}
                placeholder={t("ex_sec3_obs_placeholder")}
                value={improvement.observation}
                onChange={(e) => setImprovement((prev) => ({ ...prev, observation: e.target.value }))}
                className="w-full text-xs border border-gray-200 rounded-md p-2.5"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-600 mb-1">{t("ex_sec3_idea_label")}</label>
              <textarea
                rows={3}
                placeholder={t("ex_sec3_idea_placeholder")}
                value={improvement.idea}
                onChange={(e) => setImprovement((prev) => ({ ...prev, idea: e.target.value }))}
                className="w-full text-xs border border-gray-200 rounded-md p-2.5"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-600 mb-1">{t("ex_sec3_benefit_label")}</label>
              <textarea
                rows={3}
                placeholder={t("ex_sec3_benefit_placeholder")}
                value={improvement.benefit}
                onChange={(e) => setImprovement((prev) => ({ ...prev, benefit: e.target.value }))}
                className="w-full text-xs border border-gray-200 rounded-md p-2.5"
              />
            </div>
          </div>

          {/* Inline Photo Attachment for Improvement */}
          <div className="border-t border-gray-100 pt-4 mt-4 space-y-3">
            <span className="text-[10px] font-bold text-gray-700 block">{t("ex_sec3_photo_attach")}</span>
            
            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <div>
                <label className="block text-[9px] text-gray-500 mb-1">{t("ex_evidence_desc")}</label>
                <input
                  type="text"
                  placeholder={t("ex_sec3_photo_placeholder")}
                  value={impEvidenceDesc}
                  onChange={(e) => setImpEvidenceDesc(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-md p-2 bg-white"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[9px] font-bold text-gray-400">{t("ex_stock_photo")}:</span>
                {STOCK_IMPROVEMENTS.map((stock) => (
                  <button
                    type="button"
                    key={stock.name}
                    onClick={() => attachImprovementPhoto(stock.url, stock.name)}
                    className="px-2.5 py-1 text-[9px] bg-white border border-gray-200 hover:bg-gray-100 rounded-md font-medium text-gray-600 flex items-center gap-1 transition"
                  >
                    <Camera className="h-3 w-3 text-gray-400" />
                    {stock.name}
                  </button>
                ))}
              </div>

              <div>
                <label className="px-3.5 py-1.5 text-xs font-bold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg cursor-pointer flex items-center gap-1.5 transition">
                  <ImageIcon className="h-4 w-4" /> {t("ex_pc_upload")}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            attachImprovementPhoto(event.target.result as string, file.name);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Improvement attached photos display */}
            {evidences.filter((e) => e.evidenceType === "Improvement").length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 animate-fade-in">
                {evidences
                  .filter((e) => e.evidenceType === "Improvement")
                  .map((evi) => (
                    <div key={evi.id} className="border border-gray-100 rounded-lg overflow-hidden relative group bg-white shadow-xs">
                      <div className="h-28 overflow-hidden relative">
                        <img referrerPolicy="no-referrer" src={evi.imageUrl} alt={evi.description} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-2 space-y-1">
                        <p className="text-[10px] text-gray-600 line-clamp-1">{evi.description}</p>
                        <button
                          type="button"
                          onClick={() => setEvidences((prev) => prev.filter((e) => e.id !== evi.id))}
                          className="text-rose-500 hover:text-rose-700 text-[9px] font-bold flex items-center gap-0.5 transition"
                        >
                          <Trash2 className="h-2.5 w-2.5" /> {t("hi_delete")}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-[10px] text-gray-400 italic bg-gray-50/50 p-3 rounded-lg text-center">
                {t("ex_no_imp_photos")}
              </p>
            )}
          </div>
        </div>

      {/* 4. Gap Management with Intelligent Gemini Analysis */}
      {gaps.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-amber-200/60 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-amber-800 flex items-center gap-1.5">
              <AlertTriangle className="h-5 w-5 text-amber-500 animate-pulse" />
              Gap & Action Tracking (NOK 평가에 따른 시정 조치 수립)
            </h2>
            <span className="text-[10px] bg-amber-50 text-amber-800 font-semibold px-2.5 py-1 rounded-full border border-amber-100">
              총 {gaps.length}개 분야 결함 개선 추적 대상
            </span>
          </div>

          <div className="space-y-6 divide-y divide-gray-100">
            {gaps.map((gap, index) => {
              const linkedAction = actions.find((a) => a.id === `ACT-AUTO-${gap.id}`);
              return (
                <div key={gap.id} className={`pt-4 ${index === 0 ? "pt-0" : ""} space-y-4`}>
                  {/* Gap details header with Gemini AI Trigger */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-rose-50/50 p-3 rounded-lg">
                    <div>
                      <span className="text-xs font-bold text-rose-700 font-mono">#{index + 1} GAP ({gap.category})</span>
                      <p className="text-xs font-medium text-gray-700 mt-0.5">{gap.description}</p>
                    </div>
                    <button
                      onClick={() => triggerAiAnalysis(gap.id, gap.category, gap.description)}
                      disabled={aiAnalyzingSection !== null}
                      className="px-3.5 py-1.5 text-[10px] font-bold text-white bg-[#005EB8] hover:bg-[#004B93] rounded-md flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
                    >
                      {aiAnalyzingSection === gap.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3" />
                      )}
                      Gemini AI 추천대책 수립
                    </button>
                  </div>

                  {/* Editable Gap Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">Standard Requirement (표준 규격 조건)</label>
                      <input
                        type="text"
                        value={gap.requirement}
                        onChange={(e) =>
                          setGaps((prev) =>
                            prev.map((g) => (g.id === gap.id ? { ...g, requirement: e.target.value } : g))
                          )
                        }
                        className="w-full text-xs border border-gray-200 rounded-md p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">Immediate Action (현장 즉각 한시적 조치)</label>
                      <input
                        type="text"
                        value={gap.immediateAction}
                        onChange={(e) =>
                          setGaps((prev) =>
                            prev.map((g) => (g.id === gap.id ? { ...g, immediateAction: e.target.value } : g))
                          )
                        }
                        className="w-full text-xs border border-gray-200 rounded-md p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">Root Cause (AI / 심층 근본원인 분석)</label>
                      <input
                        type="text"
                        value={gap.rootCause}
                        onChange={(e) =>
                          setGaps((prev) =>
                            prev.map((g) => (g.id === gap.id ? { ...g, rootCause: e.target.value } : g))
                          )
                        }
                        className="w-full text-xs border border-gray-200 rounded-md p-2 focus:ring-1 focus:ring-[#005EB8]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">Risk Level</label>
                      <select
                        value={gap.riskLevel}
                        onChange={(e) =>
                          setGaps((prev) =>
                            prev.map((g) => (g.id === gap.id ? { ...g, riskLevel: e.target.value as RiskLevelType } : g))
                          )
                        }
                        className="w-full text-xs border border-gray-200 rounded-md p-2"
                      >
                        <option value="High">High (중대 리스크)</option>
                        <option value="Medium">Medium (일반 수준)</option>
                        <option value="Low">Low (경미 지적)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">Follow-up Action 여부</label>
                      <select
                        value={gap.followUpRequired ? "true" : "false"}
                        onChange={(e) =>
                          setGaps((prev) =>
                            prev.map((g) => (g.id === gap.id ? { ...g, followUpRequired: e.target.value === "true" } : g))
                          )
                        }
                        className="w-full text-xs border border-gray-200 rounded-md p-2"
                      >
                        <option value="true">추적 조치 필요 (Yes)</option>
                        <option value="false">현장 즉시 시정 완료 (No)</option>
                      </select>
                    </div>
                  </div>

                  {/* Associated Corrective Action (자동 연동 및 수정) */}
                  {linkedAction && (
                    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-3 mt-2">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                        Linked Corrective Action Plan (영구 대책 시정조치 등록)
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="lg:col-span-2">
                          <label className="block text-[9px] font-semibold text-gray-500 mb-0.5">Permanent Action Description (대책 수립안)</label>
                          <input
                            type="text"
                            value={linkedAction.actionDescription}
                            onChange={(e) =>
                              setActions((prev) =>
                                prev.map((a) => (a.id === linkedAction.id ? { ...a, actionDescription: e.target.value } : a))
                              )
                            }
                            className="w-full text-xs border border-gray-200 rounded-md p-1.5 focus:ring-1 focus:ring-[#005EB8]"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-semibold text-gray-500 mb-0.5">Action Type</label>
                          <select
                            value={linkedAction.type}
                            onChange={(e) =>
                              setActions((prev) =>
                                prev.map((a) => (a.id === linkedAction.id ? { ...a, type: e.target.value as any } : a))
                              )
                            }
                            className="w-full text-xs border border-gray-200 rounded-md p-1.5"
                          >
                            <option value="Training">Training (훈련/코칭)</option>
                            <option value="Update SW Docs">Update SW Docs (표준 개정)</option>
                            <option value="5S Layout Improvement">5S Layout (현장개선)</option>
                            <option value="Tool Request">Tool Request (장비/치구 구비)</option>
                            <option value="Standard Update">Standard Update (글로벌 표준)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-semibold text-gray-500 mb-0.5">Owner (담당 역할)</label>
                          <input
                            type="text"
                            value={linkedAction.owner}
                            onChange={(e) =>
                              setActions((prev) =>
                                prev.map((a) => (a.id === linkedAction.id ? { ...a, owner: e.target.value } : a))
                              )
                            }
                            className="w-full text-xs border border-gray-200 rounded-md p-1.5"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-semibold text-gray-500 mb-0.5">Due Date (조치 기한)</label>
                          <input
                            type="date"
                            value={linkedAction.dueDate}
                            onChange={(e) =>
                              setActions((prev) =>
                                prev.map((a) => (a.id === linkedAction.id ? { ...a, dueDate: e.target.value } : a))
                              )
                            }
                            className="w-full text-xs border border-gray-200 rounded-md p-1.5"
                          />
                        </div>
                        <div className="lg:col-span-2">
                          <label className="block text-[9px] font-semibold text-gray-500 mb-0.5">Effectiveness Evaluation (효과성 평가 검증 방안)</label>
                          <input
                            type="text"
                            value={linkedAction.effectivenessEvaluation}
                            onChange={(e) =>
                              setActions((prev) =>
                                prev.map((a) => (a.id === linkedAction.id ? { ...a, effectivenessEvaluation: e.target.value } : a))
                              )
                            }
                            className="w-full text-xs border border-gray-200 rounded-md p-1.5"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-semibold text-gray-500 mb-0.5">Re-audit 필수 여부</label>
                          <select
                            value={linkedAction.reAuditRequired ? "true" : "false"}
                            onChange={(e) =>
                              setActions((prev) =>
                                prev.map((a) => (a.id === linkedAction.id ? { ...a, reAuditRequired: e.target.value === "true" } : a))
                              )
                            }
                            className="w-full text-xs border border-gray-200 rounded-md p-1.5"
                          >
                            <option value="true">Re-audit 검증 필요</option>
                            <option value="false">일반 마감 처리</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Evidence & Photo Registration Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-base md:text-lg font-bold text-[#005EB8] uppercase tracking-wider mb-2 border-b border-gray-100 pb-3">
          {t("ex_sec_evidence")}
        </h2>

        {/* Form to insert quick mock photo */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
          <span className="text-[10px] font-bold text-gray-600 block">
            {lang === "ko" ? "새로운 현장 증빙 사진 등록 (모의 카메라/파일 연동)" : "Register New Field Evidence Photo (Mock Camera/File Integration)"}
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-[9px] text-gray-500 mb-0.5">{t("ex_evidence_desc")}</label>
              <input
                type="text"
                placeholder={lang === "ko" ? "예: 클립 툴 오작동 상황 상세 조절 전" : "e.g., Clip tool malfunction before adjustment details"}
                value={evidenceDesc}
                onChange={(e) => setEvidenceDesc(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-md p-2 bg-white"
              />
            </div>
            <div>
              <label className="block text-[9px] text-gray-500 mb-0.5">{lang === "ko" ? "구분" : "Category"}</label>
              <select
                value={evidenceBeforeAfter}
                onChange={(e) => setEvidenceBeforeAfter(e.target.value as any)}
                className="w-full text-xs border border-gray-200 rounded-md p-2 bg-white"
              >
                <option value="Before">{lang === "ko" ? "Before (조치 전)" : "Before (Pre-correction)"}</option>
                <option value="After">{lang === "ko" ? "After (조치 후/양호)" : "After (Post-correction)"}</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] text-gray-500 mb-0.5">{lang === "ko" ? "연결 평가 영역" : "Linked Area"}</label>
              <select
                value={evidenceType}
                onChange={(e) => setEvidenceType(e.target.value as any)}
                className="w-full text-xs border border-gray-200 rounded-md p-2 bg-white"
              >
                <option value="PPE">PPE</option>
                <option value="Sequence">Sequence</option>
                <option value="KeyPoints">KeyPoints</option>
                <option value="StandardTime">StandardTime</option>
                <option value="Improvement">Improvement</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mt-2 pt-2 border-t border-gray-100">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[9px] font-bold text-gray-400">{t("ex_stock_photo")}:</span>
              {STOCK_EVIDENCES.map((stock) => (
                <button
                  key={stock.name}
                  onClick={() => insertStockPhoto(stock.url, stock.name)}
                  className="px-2.5 py-1 text-[9px] bg-white border border-gray-200 hover:bg-gray-100 rounded-md font-medium text-gray-600 flex items-center gap-1 transition"
                >
                  <Camera className="h-3 w-3 text-gray-400" />
                  {stock.name}
                </button>
              ))}
            </div>

            <div className="relative">
              <label className="px-4 py-2 text-xs font-bold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg cursor-pointer flex items-center gap-1.5 transition">
                <ImageIcon className="h-4 w-4" /> {t("ex_evidence_pc")}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          insertStockPhoto(event.target.result as string, file.name);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Evidence List display */}
        {evidences.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {evidences.map((evi) => (
              <div key={evi.id} className="border border-gray-100 rounded-xl overflow-hidden shadow-xs relative group bg-gray-50/20">
                <div className="h-40 overflow-hidden relative">
                  <img referrerPolicy="no-referrer" src={evi.imageUrl} alt={evi.description} className="w-full h-full object-cover" />
                  <span
                    className={`absolute top-2 left-2 px-2 py-0.5 text-[9px] font-bold rounded-md ${
                      evi.beforeAfter === "Before" ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
                    }`}
                  >
                    {evi.beforeAfter}
                  </span>
                  <span className="absolute top-2 right-2 px-2 py-0.5 text-[9px] font-bold bg-gray-800/80 text-white rounded-md">
                    {evi.evidenceType}
                  </span>
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-xs text-gray-700 font-medium leading-relaxed">{evi.description}</p>
                  <button
                    onClick={() => setEvidences(evidences.filter((e) => e.id !== evi.id))}
                    className="text-rose-500 hover:text-rose-700 text-[10px] font-bold flex items-center gap-0.5 pt-1.5 transition"
                  >
                    <Trash2 className="h-3 w-3" /> {t("hi_delete")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-400 p-8 border border-dashed border-gray-200 rounded-xl text-center">
            {t("ex_evidence_no_photos")}
          </div>
        )}
      </div>
    </div>
  );
}
