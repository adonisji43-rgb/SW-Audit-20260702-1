export type SiteType = string;
export type AreaType = string;
export type ShiftType = string;
export type TriggerType = "Routine" | "New Product" | "Process Change" | "Issue/Incident" | "Job Rotation";
export type GapCategoryType = "Safety" | "Quality" | "Standard not followed" | "Improvement Idea";
export type RiskLevelType = "High" | "Medium" | "Low";
export type ActionStatusType = "Pending" | "In Progress" | "Completed";

export interface PPEAudit {
  isCompliant: "PASS" | "FAIL" | "NA";
  attempt1?: "PASS" | "FAIL" | "NA";
  attempt2?: "PASS" | "FAIL" | "NA";
  observation: string;
}

export interface SequenceAudit {
  swipCompliant: "PASS" | "FAIL" | "NA";
  swipAttempt1?: "PASS" | "FAIL" | "NA";
  swipAttempt2?: "PASS" | "FAIL" | "NA";

  sequenceCompliant: "PASS" | "FAIL" | "NA";
  sequenceAttempt1?: "PASS" | "FAIL" | "NA";
  sequenceAttempt2?: "PASS" | "FAIL" | "NA";

  movesCompliant: "PASS" | "FAIL" | "NA";
  movesAttempt1?: "PASS" | "FAIL" | "NA";
  movesAttempt2?: "PASS" | "FAIL" | "NA";

  observation: string;
}

export interface KeyPointItem {
  id: string;
  name: string;
  isCompliant: "PASS" | "FAIL" | "NA";
}

export interface KeyPointAudit {
  swiCompliant?: "PASS" | "FAIL" | "NA";
  oplCompliant?: "PASS" | "FAIL" | "NA";
  items?: KeyPointItem[];
  observation: string;
}

export interface StandardTimeAudit {
  standardTime: number; // in seconds
  measuredCycles: number[]; // e.g., [65, 68]
  isCompliant: "PASS" | "FAIL" | "NA";
  observation: string;
}

export interface ImprovementOpportunity {
  observation: string;
  idea: string;
  benefit: string;
}

export interface EvidenceItem {
  id: string;
  imageUrl: string;
  description: string;
  beforeAfter: "Before" | "After";
  evidenceType: "PPE" | "Sequence" | "KeyPoints" | "StandardTime" | "Improvement";
}

export interface GapItem {
  id: string;
  category: GapCategoryType;
  description: string;
  requirement: string;
  immediateAction: string;
  rootCause: string;
  riskLevel: RiskLevelType;
  followUpRequired: boolean;
}

export interface CorrectiveAction {
  id: string;
  actionDescription: string;
  type: "Training" | "Update SW Docs" | "5S Layout Improvement" | "Tool Request" | "Standard Update";
  owner: string; // e.g., 'ME', 'Lead', 'Supervisor', 'Quality'
  dueDate: string;
  status: ActionStatusType;
  effectivenessEvaluation: string;
  reAuditRequired: boolean;
  reAuditDate?: string;
}

export interface AuditRecord {
  id: string; // SW-YYYYMMDD-XXXX
  auditDate: string;
  site: SiteType;
  area: AreaType;
  line: string;
  station: string;
  shift: ShiftType;
  auditor: string;
  operatorName: string;
  trigger: TriggerType;
  swiNo: string;
  swcNo: string;
  status: "Draft" | "Submitted";
  
  // Audits
  ppe: PPEAudit;
  sequence: SequenceAudit;
  keyPoints: KeyPointAudit;
  standardTime: StandardTimeAudit;
  improvement: ImprovementOpportunity;
  
  // Gaps & Actions & Evidences
  gaps: GapItem[];
  actions: CorrectiveAction[];
  evidences: EvidenceItem[];
  
  // Calculated Score
  score: number; // 0 ~ 100 PASS rate
}
