import { useState, useMemo } from "react";
import { AuditRecord, ActionStatusType, CorrectiveAction, GapItem, EvidenceItem } from "../types";
import { TRANSLATIONS } from "../utils/translations";
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  Printer,
  ChevronDown,
  ArrowRight,
  Repeat,
  X,
  FileCheck,
} from "lucide-react";

interface AuditHistoryViewProps {
  audits: AuditRecord[];
  onEdit: (audit: AuditRecord) => void;
  onDelete: (id: string) => void;
  onUpdateActionStatus: (auditId: string, actionId: string, newStatus: ActionStatusType, evaluation?: string) => void;
  onTriggerReAudit: (audit: AuditRecord) => void;
  lang: string;
}

export default function AuditHistoryView({
  audits,
  onEdit,
  onDelete,
  onUpdateActionStatus,
  onTriggerReAudit,
  lang,
}: AuditHistoryViewProps) {
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const t = (key: string) => TRANSLATIONS[lang as any]?.[key] || TRANSLATIONS["en"][key] || key;
  const [selectedSite, setSelectedSite] = useState<string>("All");
  const [selectedArea, setSelectedArea] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedResult, setSelectedResult] = useState<string>("All"); // All, Pass, Fail

  // Dynamic unique lists for filtering
  const uniqueSites = useMemo(() => {
    const sites = new Set(audits.map((a) => a.site).filter(Boolean));
    return ["All", ...Array.from(sites)];
  }, [audits]);

  const uniqueAreas = useMemo(() => {
    const areas = new Set(audits.map((a) => a.area).filter(Boolean));
    return ["All", ...Array.from(areas)];
  }, [audits]);

  // Detail View Modal State
  const [selectedAudit, setSelectedAudit] = useState<AuditRecord | null>(null);
  
  // Effectiveness Input for completion
  const [completingActionId, setCompletingActionId] = useState<string | null>(null);
  const [effectivenessEval, setEffectivenessEval] = useState("");

  // Filters application
  const filteredAudits = useMemo(() => {
    return audits.filter((audit) => {
      const matchSearch =
        audit.line.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audit.station.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audit.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audit.auditor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audit.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchSite = selectedSite === "All" || audit.site === selectedSite;
      const matchArea = selectedArea === "All" || audit.area === selectedArea;
      const matchStatus = selectedStatus === "All" || audit.status === selectedStatus;
      
      let matchResult = true;
      if (selectedResult === "Pass") {
        matchResult = audit.score >= 80;
      } else if (selectedResult === "Fail") {
        matchResult = audit.score < 80;
      }

      return matchSearch && matchSite && matchArea && matchStatus && matchResult;
    });
  }, [audits, searchTerm, selectedSite, selectedArea, selectedStatus, selectedResult]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredAudits.length === 0) return;
    
    const escapeCsv = (str: string | undefined | null) => {
      if (!str) return '""';
      return `"${str.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
    };

    const headers = "Audit ID,Date,Site,Area,Line,Station,Auditor,Operator,Trigger,SWI No.,SWC No.,Status,Score (%),PPE Note,Sequence Note,Key Points Note,Standard Time Note,Improvement Observation,Improvement Idea,Improvement Benefit\n";
    const rows = filteredAudits
      .map((a) => {
        const id = escapeCsv(a.id);
        const date = escapeCsv(a.auditDate);
        const site = escapeCsv(a.site);
        const area = escapeCsv(a.area);
        const line = escapeCsv(a.line);
        const station = escapeCsv(a.station);
        const auditor = escapeCsv(a.auditor);
        const operator = escapeCsv(a.operatorName);
        const trigger = escapeCsv(a.trigger);
        const swiNo = escapeCsv(a.swiNo);
        const swcNo = escapeCsv(a.swcNo);
        const status = escapeCsv(a.status);
        const score = a.score;

        const ppeNote = escapeCsv(a.ppe?.observation);
        const seqNote = escapeCsv(a.sequence?.observation);
        const kpNote = escapeCsv(a.keyPoints?.observation);
        const stNote = escapeCsv(a.standardTime?.observation);
        const impObs = escapeCsv(a.improvement?.observation);
        const impIdea = escapeCsv(a.improvement?.idea);
        const impBen = escapeCsv(a.improvement?.benefit);

        return `${id},${date},${site},${area},${line},${station},${auditor},${operator},${trigger},${swiNo},${swcNo},${status},${score},${ppeNote},${seqNote},${kpNote},${stNote},${impObs},${impIdea},${impBen}`;
      })
      .join("\n");

    const csvContent = "\uFEFF" + headers + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `SW_Audit_Records_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger HTML Print for the detail modal
  const handlePrint = () => {
    window.print();
  };

  // Open completion form
  const startCompleteAction = (actId: string) => {
    setCompletingActionId(actId);
    setEffectivenessEval("");
  };

  // Submit action completion
  const submitCompleteAction = (auditId: string, actId: string) => {
    if (!effectivenessEval.trim()) {
      alert("효과성 평가 검증 방안 및 결과를 입력해 주세요.");
      return;
    }
    onUpdateActionStatus(auditId, actId, "Completed", effectivenessEval);
    setCompletingActionId(null);
    setEffectivenessEval("");
    
    // Refresh modal audit context if open
    const updatedAudit = audits.find((a) => a.id === auditId);
    if (updatedAudit) {
      setSelectedAudit(updatedAudit);
    }
  };

  return (
    <div id="history-view-container" className="space-y-6 animate-fade-in print:p-0">
      {/* 1. Header and quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileCheck className="h-5.5 w-5.5 text-[#005EB8]" />
            {t("hi_title")}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {t("hi_subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg flex items-center gap-1.5 shadow-xs transition"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Export CSV
          </button>
        </div>
      </div>

      {/* 2. Filters Grid Panel */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-wrap gap-4 items-center print:hidden">
        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder={t("hi_search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#005EB8] focus:border-[#005EB8]"
          />
        </div>

        {/* Site */}
        <div className="w-[120px]">
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none"
          >
            {uniqueSites.map((s) => (
              <option key={s} value={s}>{s === "All" ? t("db_all_sites") : s}</option>
            ))}
          </select>
        </div>

        {/* Area */}
        <div className="w-[120px]">
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none"
          >
            {uniqueAreas.map((a) => (
              <option key={a} value={a}>{a === "All" ? t("db_all_areas") : a}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="w-[120px]">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft (임시)</option>
            <option value="Submitted">Submitted (제출됨)</option>
          </select>
        </div>

        {/* Pass / Fail Result */}
        <div className="w-[120px]">
          <select
            value={selectedResult}
            onChange={(e) => setSelectedResult(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none"
          >
            <option value="All">All Results</option>
            <option value="Pass">Pass (≥80점)</option>
            <option value="Fail">Fail (&lt;80점)</option>
          </select>
        </div>
      </div>

      {/* 3. Main Data Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider text-[10px] font-bold border-b border-gray-100">
              <tr>
                <th className="p-4">{t("hi_audit_id")}</th>
                <th className="p-4">{t("ex_date")}</th>
                <th className="p-4">{lang === "ko" ? "공장 / 공정영역" : "Site / Area"}</th>
                <th className="p-4">{lang === "ko" ? "라인 / 공정" : "Line / Station"}</th>
                <th className="p-4">{lang === "ko" ? "작업자 / 진단자" : "Operator / Auditor"}</th>
                <th className="p-4 text-center">{t("hi_score")}</th>
                <th className="p-4 text-center">Gaps</th>
                <th className="p-4">{t("hi_status")}</th>
                <th className="p-4 text-right">{t("hi_actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAudits.map((audit) => {
                const isPass = audit.score >= 80;
                return (
                  <tr key={audit.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 font-semibold text-gray-900 font-mono">{audit.id}</td>
                    <td className="p-4 text-gray-500 font-medium font-mono">{audit.auditDate}</td>
                    <td className="p-4">
                      <span className="font-semibold text-[#005EB8]">{audit.site}</span>
                      <span className="block text-[10px] text-gray-400 font-medium mt-0.5">{audit.area}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-gray-800">{audit.line}</span>
                      <span className="block text-[10px] text-gray-400 font-medium mt-0.5 truncate max-w-[150px]">{audit.station}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-gray-800">{audit.operatorName}</span>
                      <span className="block text-[10px] text-gray-400 mt-0.5">Auditor: {audit.auditor}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                          isPass
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {audit.score}%
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {audit.gaps.length > 0 ? (
                        <span className="inline-flex items-center justify-center bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded font-mono text-[10px]">
                          {audit.gaps.length} Gaps
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-medium font-sans">0</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          audit.status === "Draft"
                            ? "bg-gray-100 text-gray-600 border border-gray-200"
                            : "bg-[#BFD5EA]/30 text-[#005EB8] border border-[#BFD5EA]/50"
                        }`}
                      >
                        {audit.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex gap-1.5">
                        <button
                          onClick={() => setSelectedAudit(audit)}
                          className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition"
                          title="상세조회 및 마감"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => onEdit(audit)}
                          className="p-1.5 text-gray-500 hover:text-[#005EB8] hover:bg-blue-50/50 rounded transition"
                          title="편집"
                        >
                          <Edit className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => onDelete(audit.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                          title="삭제"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredAudits.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-400">
                    필터 조건에 부합하는 SW Audit 이력이 존재하지 않습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Detail Modal (Fully optimized for viewing, printing and Follow-up action closures) */}
      {selectedAudit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:relative print:bg-white print:p-0">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col print:max-h-full print:shadow-none print:w-full">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 print:hidden">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-[#005EB8]" />
                <h2 className="text-sm font-bold text-gray-900 font-mono">SW Audit 상세 레포트 ({selectedAudit.id})</h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg flex items-center gap-1.5 transition"
                >
                  <Printer className="h-4 w-4" /> Print Report
                </button>
                <button
                  onClick={() => {
                    setSelectedAudit(null);
                    setCompletingActionId(null);
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Printable Report Content */}
            <div className="p-8 space-y-8 flex-1 print:p-0">
              {/* Report Header (Visible in print) */}
              <div className="hidden print:block text-center border-b-2 border-gray-800 pb-4 mb-6">
                <h1 className="text-xl font-bold uppercase tracking-wide">Standard Work Compliance Audit Report</h1>
                <p className="text-xs text-gray-500 mt-1 font-mono">DBG-P-OPS-1020 • Global standard</p>
              </div>

              {/* Grid 1: Basic Info */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 print:bg-white print:border print:rounded-none">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Audit ID</span>
                  <span className="text-xs font-bold text-gray-900 font-mono">{selectedAudit.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Audit Date</span>
                  <span className="text-xs font-semibold text-gray-900 font-mono">{selectedAudit.auditDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Site & Area</span>
                  <span className="text-xs font-bold text-gray-900">{selectedAudit.site} • {selectedAudit.area}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Shift</span>
                  <span className="text-xs font-semibold text-gray-900 font-mono">{selectedAudit.shift}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Line / Station</span>
                  <span className="text-xs font-semibold text-gray-900">{selectedAudit.line} / {selectedAudit.station}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Operator Name</span>
                  <span className="text-xs font-semibold text-gray-900">{selectedAudit.operatorName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Auditor Name</span>
                  <span className="text-xs font-semibold text-gray-900">{selectedAudit.auditor}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Compliance Score</span>
                  <span
                    className={`text-xs font-bold font-mono ${
                      selectedAudit.score >= 80 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {selectedAudit.score}% ({selectedAudit.score >= 80 ? "PASS" : "FAIL"})
                  </span>
                </div>
              </div>

              {/* Grid 2: Evaluated Checklist results */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-900 border-l-2 border-[#005EB8] pl-2 uppercase tracking-wider">
                  1. Checklist Area Evaluation (평가 상세 기록)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* PPE */}
                  <div className="border border-gray-100 p-4 rounded-xl space-y-2 bg-white print:border print:rounded-none">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-800">Conformity to PPE</span>
                      <div className="flex flex-col items-end">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            selectedAudit.ppe.isCompliant === "PASS"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {selectedAudit.ppe.isCompliant}
                        </span>
                        {selectedAudit.ppe.attempt1 && (
                          <span className="text-[9px] text-gray-400 mt-0.5">
                            (1차: {selectedAudit.ppe.attempt1}
                            {selectedAudit.ppe.attempt2 ? ` | 2차: ${selectedAudit.ppe.attempt2}` : ""})
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      <span className="font-semibold block text-[10px] text-gray-400">Observation:</span>
                      {selectedAudit.ppe.observation || "N/A (특이사항 없음)"}
                    </p>
                  </div>

                  {/* Work Sequence */}
                  <div className="border border-gray-100 p-4 rounded-xl space-y-2 bg-white print:border print:rounded-none">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-gray-800">Adherence to Work Sequence</span>
                      <div className="text-[10px] text-gray-400 font-bold font-mono text-right space-y-0.5">
                        <div>
                          SWIP: {selectedAudit.sequence.swipCompliant} 
                          {selectedAudit.sequence.swipAttempt1 && (
                            <span className="text-[8px] font-normal text-gray-400 ml-1">
                              (1차:{selectedAudit.sequence.swipAttempt1}{selectedAudit.sequence.swipAttempt2 ? `, 2차:${selectedAudit.sequence.swipAttempt2}` : ""})
                            </span>
                          )}
                        </div>
                        <div>
                          SEQ: {selectedAudit.sequence.sequenceCompliant}
                          {selectedAudit.sequence.sequenceAttempt1 && (
                            <span className="text-[8px] font-normal text-gray-400 ml-1">
                              (1차:{selectedAudit.sequence.sequenceAttempt1}{selectedAudit.sequence.sequenceAttempt2 ? `, 2차:${selectedAudit.sequence.sequenceAttempt2}` : ""})
                            </span>
                          )}
                        </div>
                        <div>
                          MOVES: {selectedAudit.sequence.movesCompliant}
                          {selectedAudit.sequence.movesAttempt1 && (
                            <span className="text-[8px] font-normal text-gray-400 ml-1">
                              (1차:{selectedAudit.sequence.movesAttempt1}{selectedAudit.sequence.movesAttempt2 ? `, 2차:${selectedAudit.sequence.movesAttempt2}` : ""})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 font-medium pt-1">
                      <span className="font-semibold block text-[10px] text-gray-400">Observation:</span>
                      {selectedAudit.sequence.observation || "N/A (특이사항 없음)"}
                    </p>
                  </div>

                  {/* Key Points */}
                  <div className="border border-gray-100 p-4 rounded-xl space-y-2 bg-white print:border print:rounded-none">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-800">Adherence to Key Points</span>
                      <span className="text-[10px] text-gray-400 font-bold font-mono">
                        {selectedAudit.keyPoints.items && selectedAudit.keyPoints.items.length > 0
                          ? `${selectedAudit.keyPoints.items.length} Points Evaluated`
                          : `SWI: ${selectedAudit.keyPoints.swiCompliant} | OPL: ${selectedAudit.keyPoints.oplCompliant}`}
                      </span>
                    </div>
                    
                    {/* If items exist, render them as a mini checklist */}
                    {selectedAudit.keyPoints.items && selectedAudit.keyPoints.items.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-50">
                        {selectedAudit.keyPoints.items.map((item, idx) => (
                          <div key={item.id} className="flex justify-between items-center p-1.5 rounded bg-gray-50/50 text-[11px]">
                            <span className="text-gray-600 font-medium truncate max-w-[80%]">
                              {idx + 1}. {item.name}
                            </span>
                            <span className={`px-1.5 py-0.5 font-bold rounded text-[9px] ${
                              item.isCompliant === "PASS"
                                ? "bg-emerald-100 text-emerald-800"
                                : item.isCompliant === "FAIL"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {item.isCompliant}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-gray-500 font-medium mt-1">
                      <span className="font-semibold block text-[10px] text-gray-400">Observation:</span>
                      {selectedAudit.keyPoints.observation || "N/A (특이사항 없음)"}
                    </p>
                  </div>

                  {/* Standard Time */}
                  <div className="border border-gray-100 p-4 rounded-xl space-y-2 bg-white print:border print:rounded-none">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-800">Adherence to Standard Time</span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          selectedAudit.standardTime.isCompliant === "PASS"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {selectedAudit.standardTime.isCompliant}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      <span className="font-semibold block text-[10px] text-[#005EB8]">수치 수집:</span>
                      기준 {selectedAudit.standardTime.standardTime}초 | 실측: [
                      {selectedAudit.standardTime.measuredCycles.join(", ")}초]
                    </p>
                    <p className="text-xs text-gray-500 font-medium italic mt-1">
                      {selectedAudit.standardTime.observation}
                    </p>
                  </div>
                </div>

                {/* Improvement Opportunity */}
                {selectedAudit.improvement && (selectedAudit.improvement.observation || selectedAudit.improvement.idea) && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3 print:bg-white print:border print:rounded-none">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">지속적 현장 개선 기회 (Continuous Improvement Opportunity)</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="font-bold text-gray-700 block">관찰상황</span>
                        <p className="text-gray-600 mt-1">{selectedAudit.improvement.observation}</p>
                      </div>
                      <div>
                        <span className="font-bold text-gray-700 block">제안 아이디어</span>
                        <p className="text-gray-600 mt-1">{selectedAudit.improvement.idea}</p>
                      </div>
                      <div>
                        <span className="font-bold text-gray-700 block">기대 효과 (Benefit)</span>
                        <p className="text-gray-600 mt-1">{selectedAudit.improvement.benefit}</p>
                      </div>
                    </div>

                    {/* Improvement Attached Photos */}
                    {selectedAudit.evidences && selectedAudit.evidences.filter(e => e.evidenceType === "Improvement").length > 0 && (
                      <div className="border-t border-gray-200/60 pt-3 mt-2">
                        <span className="text-[10px] font-bold text-gray-500 block mb-2">📸 첨부된 개선 제안 사진</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {selectedAudit.evidences
                            .filter(e => e.evidenceType === "Improvement")
                            .map(evi => (
                              <div key={evi.id} className="border border-gray-200/50 rounded-lg overflow-hidden bg-white relative">
                                <img referrerPolicy="no-referrer" src={evi.imageUrl} alt={evi.description} className="w-full h-24 object-cover" />
                                <div className="p-1.5 bg-gray-50/50">
                                  <p className="text-[9px] text-gray-500 truncate mt-1" title={evi.description}>{evi.description}</p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Grid 3: Gaps and Action Closure Trackers */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-900 border-l-2 border-[#005EB8] pl-2 uppercase tracking-wider">
                  2. Gap & Corrective Action Tracking (지적사항 및 시정대책 대장)
                </h3>

                {selectedAudit.gaps.length > 0 ? (
                  <div className="space-y-4">
                    {selectedAudit.gaps.map((gap, index) => {
                      const action = selectedAudit.actions.find((a) => a.id === `ACT-AUTO-${gap.id}`);
                      return (
                        <div key={gap.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-xs bg-white print:border print:rounded-none">
                          {/* Gap Head */}
                          <div className="bg-rose-50/70 p-3 flex justify-between items-center border-b border-gray-100 print:bg-white">
                            <span className="text-xs font-bold text-rose-800">
                              #{index + 1} Gap: {gap.category}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                                gap.riskLevel === "High"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              Risk: {gap.riskLevel}
                            </span>
                          </div>

                          {/* Gap Details */}
                          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs border-b border-gray-100">
                            <div>
                              <span className="font-bold text-gray-500 text-[10px] block">상세 결함 설명</span>
                              <p className="text-gray-700 font-medium mt-1">{gap.description}</p>
                            </div>
                            <div>
                              <span className="font-bold text-gray-500 text-[10px] block">표준 규격 요구사안</span>
                              <p className="text-gray-700 font-medium mt-1">{gap.requirement}</p>
                            </div>
                            <div>
                              <span className="font-bold text-gray-500 text-[10px] block">근본 원인 (Root Cause)</span>
                              <p className="text-gray-700 font-medium mt-1 italic">{gap.rootCause}</p>
                            </div>
                            <div>
                              <span className="font-bold text-gray-500 text-[10px] block">즉각조치사항</span>
                              <p className="text-gray-700 font-medium mt-1">{gap.immediateAction}</p>
                            </div>
                          </div>

                          {/* Action Details */}
                          {action && (
                            <div className="p-4 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 print:bg-white">
                              <div className="space-y-1 max-w-xl">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                  시정 대책 수립안 (Corrective Action Plan)
                                </span>
                                <p className="text-xs font-semibold text-gray-800">{action.actionDescription}</p>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-500">
                                  <span>담당역할: <strong className="text-gray-700">{action.owner}</strong></span>
                                  <span>기한: <strong className="text-gray-700">{action.dueDate}</strong></span>
                                  <span>대책유형: <strong className="text-gray-700">{action.type}</strong></span>
                                  {action.status === "Completed" && (
                                    <span className="text-emerald-600 font-bold block">
                                      효과성검증: {action.effectivenessEvaluation}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Action status controller */}
                              <div className="text-right print:hidden">
                                {action.status !== "Completed" ? (
                                  completingActionId === action.id ? (
                                    <div className="space-y-2 text-left">
                                      <textarea
                                        rows={2}
                                        placeholder="효과성 평가 수치 및 검증 결과를 최종 기재하세요..."
                                        value={effectivenessEval}
                                        onChange={(e) => setEffectivenessEval(e.target.value)}
                                        className="w-48 text-xs border border-gray-300 rounded p-1.5 bg-white"
                                      />
                                      <div className="flex gap-1 justify-end">
                                        <button
                                          onClick={() => setCompletingActionId(null)}
                                          className="px-2 py-1 text-[9px] bg-gray-200 text-gray-600 font-bold rounded"
                                        >
                                          취소
                                        </button>
                                        <button
                                          onClick={() => submitCompleteAction(selectedAudit.id, action.id)}
                                          className="px-2.5 py-1 text-[9px] bg-emerald-600 text-white font-bold rounded"
                                        >
                                          완료확정
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-end gap-1.5">
                                      <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded border border-amber-200 inline-block">
                                        {action.status} (미해결)
                                      </span>
                                      <button
                                        onClick={() => startCompleteAction(action.id)}
                                        className="px-3 py-1 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition flex items-center gap-1"
                                      >
                                        <CheckCircle className="h-3 w-3" /> 완료 처리하기
                                      </button>
                                    </div>
                                  )
                                ) : (
                                  <div className="flex flex-col items-end gap-1.5">
                                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                                      <CheckCircle className="h-3 w-3 text-emerald-600" /> Completed (시정조치마감)
                                    </span>
                                    {action.reAuditRequired && (
                                      <button
                                        onClick={() => {
                                          setSelectedAudit(null);
                                          onTriggerReAudit(selectedAudit);
                                        }}
                                        className="px-3 py-1 text-[10px] font-bold text-white bg-[#005EB8] hover:bg-[#004B93] rounded transition flex items-center gap-1"
                                      >
                                        <Repeat className="h-3 w-3" /> Re-audit 수행하기
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-emerald-800 bg-emerald-50 p-4 rounded-xl font-medium border border-emerald-100">
                    지적 및 검출된 Gap 항목이 없는 완전 무결공정입니다. (PASS)
                  </div>
                )}
              </div>

              {/* Grid 4: Evidence Photos Display */}
              {selectedAudit.evidences.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-900 border-l-2 border-[#005EB8] pl-2 uppercase tracking-wider">
                    3. Uploaded Evidence Photos (지적 현장 증빙 사진 대장)
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedAudit.evidences.map((evi) => (
                      <div key={evi.id} className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50/50">
                        <img referrerPolicy="no-referrer" src={evi.imageUrl} alt={evi.description} className="w-full h-32 object-cover" />
                        <div className="p-2.5">
                          <span
                            className={`px-1.5 py-0.5 text-[8px] font-bold rounded ${
                              evi.beforeAfter === "Before" ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
                            }`}
                          >
                            {evi.beforeAfter}
                          </span>
                          <span className="text-[9px] text-gray-400 font-bold ml-2">{evi.evidenceType}</span>
                          <p className="text-[11px] text-gray-600 font-medium mt-1Leading-relaxed truncate">{evi.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer (Hidden in print) */}
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50 print:hidden">
              <button
                onClick={() => {
                  setSelectedAudit(null);
                  setCompletingActionId(null);
                }}
                className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg transition"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
