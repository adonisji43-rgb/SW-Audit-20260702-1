import { useState, useEffect } from "react";
import { AuditRecord, ActionStatusType } from "./types";
import { INITIAL_AUDITS } from "./data/mockData";
import DashboardView from "./components/DashboardView";
import AuditExecutionView from "./components/AuditExecutionView";
import AuditHistoryView from "./components/AuditHistoryView";
import {
  ShieldAlert,
  Sliders,
  Database,
  Grid,
  FileCheck2,
  CalendarRange,
  ClipboardList,
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "new-audit" | "history">("dashboard");
  const [editingAudit, setEditingAudit] = useState<AuditRecord | null>(null);

  // Load from localstorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("BOBCAT_SW_AUDITS");
    if (saved) {
      try {
        setAudits(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to parse local audits, fallback to mock data.", err);
        setAudits(INITIAL_AUDITS);
      }
    } else {
      // Initalize with comprehensive mock dataset
      setAudits(INITIAL_AUDITS);
      localStorage.setItem("BOBCAT_SW_AUDITS", JSON.stringify(INITIAL_AUDITS));
    }
  }, []);

  // Sync to localstorage helper
  const syncAudits = (updatedList: AuditRecord[]) => {
    setAudits(updatedList);
    localStorage.setItem("BOBCAT_SW_AUDITS", JSON.stringify(updatedList));
  };

  // Create or Update Audit
  const handleSaveAudit = (audit: AuditRecord) => {
    const index = audits.findIndex((a) => a.id === audit.id);
    let updatedList: AuditRecord[] = [];

    if (index !== -1) {
      // Edit mode
      updatedList = [...audits];
      updatedList[index] = audit;
    } else {
      // Add new
      updatedList = [audit, ...audits];
    }

    syncAudits(updatedList);
    setEditingAudit(null);
    // Go to history if submitted, else keep in list or draft
    setActiveTab(audit.status === "Submitted" ? "history" : "history");
    alert(audit.status === "Submitted" ? "SW Audit이 성공적으로 제출 및 집계에 반영되었습니다." : "임시 보관함(Draft)에 저장되었습니다.");
  };

  // Delete Audit
  const handleDeleteAudit = (id: string) => {
    if (window.confirm("정말로 해당 SW Audit 기록을 영구 삭제하시겠습니까? 관련 지적사항 및 조치계획도 소멸됩니다.")) {
      const updatedList = audits.filter((a) => a.id !== id);
      syncAudits(updatedList);
    }
  };

  // Update corrective action status from history detail
  const handleUpdateActionStatus = (
    auditId: string,
    actionId: string,
    newStatus: ActionStatusType,
    evaluation?: string
  ) => {
    const updatedList = audits.map((audit) => {
      if (audit.id === auditId) {
        const updatedActions = audit.actions.map((act) => {
          if (act.id === actionId) {
            return {
              ...act,
              status: newStatus,
              effectivenessEvaluation: evaluation || act.effectivenessEvaluation,
            };
          }
          return act;
        });
        return {
          ...audit,
          actions: updatedActions,
        };
      }
      return audit;
    });

    syncAudits(updatedList);
  };

  // Trigger Re-audit (intelligent workflow copying header details)
  const handleTriggerReAudit = (originalAudit: AuditRecord) => {
    const today = new Date();
    const yyyymmdd = today.toISOString().split("T")[0].replace(/-/g, "");
    const rand = Math.floor(100 + Math.random() * 900);
    const newId = `SW-${yyyymmdd}-${rand}`;

    const preloadedAudit: AuditRecord = {
      id: newId,
      auditDate: today.toISOString().split("T")[0],
      site: originalAudit.site,
      area: originalAudit.area,
      line: originalAudit.line,
      station: originalAudit.station,
      shift: originalAudit.shift,
      auditor: originalAudit.auditor,
      operatorName: originalAudit.operatorName,
      trigger: "Job Rotation", // Defaulting to trigger role for re-evaluation
      swiNo: originalAudit.swiNo,
      swcNo: originalAudit.swcNo,
      status: "Draft",
      ppe: { isCompliant: "PASS", observation: `[Re-audit of ${originalAudit.id}]` },
      sequence: { swipCompliant: "PASS", sequenceCompliant: "PASS", movesCompliant: "PASS", observation: `[Re-audit of ${originalAudit.id}]` },
      keyPoints: { swiCompliant: "PASS", oplCompliant: "PASS", observation: `[Re-audit of ${originalAudit.id}]` },
      standardTime: { standardTime: originalAudit.standardTime.standardTime, measuredCycles: [], isCompliant: "PASS", observation: `[Re-audit of ${originalAudit.id}]` },
      improvement: { observation: "", idea: "", benefit: "" },
      gaps: [],
      actions: [],
      evidences: [],
      score: 100,
    };

    setEditingAudit(preloadedAudit);
    setActiveTab("new-audit");
    alert(`기존 감사 #${originalAudit.id} 연동 정보가 자동 복사되었습니다.\n재평가(Re-audit)를 시작합니다.`);
  };

  // Reset to sample initial state
  const handleResetToSamples = () => {
    if (window.confirm("현재 저장된 기록을 초기화하고 Bobcat/Doosan 표준 샘플 4건으로 리셋하시겠습니까?")) {
      setAudits(INITIAL_AUDITS);
      localStorage.setItem("BOBCAT_SW_AUDITS", JSON.stringify(INITIAL_AUDITS));
      setActiveTab("dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-[#FF6B00]/10 selection:text-[#FF6B00]">
      {/* 1. Global Premium Brand Navigation Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Bobcat Inspired Minimalist Brand Mark */}
            <div className="flex items-center">
              <span className="text-sm font-black tracking-tight bg-gradient-to-r from-[#00539B] to-[#FF6B00] text-white px-3 py-1.5 rounded-md shadow-xs font-mono">
                DOOSAN BOBCAT
              </span>
            </div>
            <div className="h-4 w-[1px] bg-gray-200"></div>
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-gray-800 tracking-wider">
                SW COMPLIANCE AUDIT SYSTEM
              </span>
              <span className="text-[9px] bg-red-100 text-red-800 font-extrabold px-1.5 py-0.5 rounded ml-2 font-mono tracking-wide">
                GLOBAL SYSTEM
              </span>
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 font-mono hidden md:inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Synced: {audits.length} Records
            </span>
            <button
              onClick={handleResetToSamples}
              className="text-[10px] text-gray-400 hover:text-[#FF6B00] border border-gray-100 hover:border-orange-100 px-2.5 py-1.5 rounded-lg font-bold transition"
            >
              Reset Samples
            </button>
          </div>
        </div>
      </header>

      {/* 2. Primary Layout Stage */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs (Sub-Header) */}
        <div className="flex border-b border-gray-200 pb-px mb-8 print:hidden">
          <div className="flex space-x-6">
            <button
              onClick={() => {
                setActiveTab("dashboard");
                setEditingAudit(null);
              }}
              className={`pb-4 text-xs font-bold tracking-wide transition relative ${
                activeTab === "dashboard" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              DASHBOARD
              {activeTab === "dashboard" && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B00]"
                />
              )}
            </button>

            <button
              onClick={() => {
                setEditingAudit(null);
                setActiveTab("new-audit");
              }}
              className={`pb-4 text-xs font-bold tracking-wide transition relative ${
                activeTab === "new-audit" && !editingAudit ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              PERFORM SW AUDIT
              {activeTab === "new-audit" && !editingAudit && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B00]"
                />
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab("history");
                setEditingAudit(null);
              }}
              className={`pb-4 text-xs font-bold tracking-wide transition relative ${
                activeTab === "history" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              AUDIT HISTORY & ACTIONS
              {activeTab === "history" && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B00]"
                />
              )}
            </button>
          </div>
        </div>

        {/* 3. Screen Views Switcher */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + (editingAudit ? "-edit" : "-normal")}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "dashboard" && <DashboardView audits={audits} />}

            {activeTab === "new-audit" && (
              <AuditExecutionView
                onSave={handleSaveAudit}
                onCancel={() => setActiveTab("history")}
                existingAudit={editingAudit}
              />
            )}

            {activeTab === "history" && (
              <AuditHistoryView
                audits={audits}
                onEdit={(audit) => {
                  setEditingAudit(audit);
                  setActiveTab("new-audit");
                }}
                onDelete={handleDeleteAudit}
                onUpdateActionStatus={handleUpdateActionStatus}
                onTriggerReAudit={handleTriggerReAudit}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 4. Humble Legal Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-[10px] text-gray-400 mt-auto print:hidden">
        <p>© 2026 Doosan Bobcat Inc. All rights reserved. Standard Work Compliance Audit Framework • DBG-P-OPS-1020</p>
      </footer>
    </div>
  );
}
