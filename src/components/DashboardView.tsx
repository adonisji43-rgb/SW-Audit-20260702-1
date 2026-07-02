import { useMemo } from "react";
import { AuditRecord, ActionStatusType } from "../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Award,
  AlertOctagon,
  Activity,
  FileSpreadsheet,
} from "lucide-react";

interface DashboardViewProps {
  audits: AuditRecord[];
}

export default function DashboardView({ audits }: DashboardViewProps) {
  const submittedAudits = useMemo(() => {
    return audits.filter((a) => a.status === "Submitted");
  }, [audits]);

  // Current System Date
  const currentDate = new Date("2026-07-02");

  // KPI Calculations
  const kpis = useMemo(() => {
    const total = submittedAudits.length;
    if (total === 0) {
      return {
        complianceRate: 0,
        gapRate: 0,
        passRate: 0,
        actionClosureRate: 0,
        overdueActionRate: 0,
        repeatGapRate: 0,
        totalActions: 0,
        completedActions: 0,
        overdueActions: 0,
      };
    }

    // 1. Compliance Rate (Average Audit Score)
    const totalScore = submittedAudits.reduce((acc, curr) => acc + curr.score, 0);
    const complianceRate = Math.round(totalScore / total);

    // 2. Gap Rate (Percentage of Audits with Gaps)
    const auditsWithGaps = submittedAudits.filter((a) => a.gaps.length > 0).length;
    const gapRate = Math.round((auditsWithGaps / total) * 100);

    // 3. Audit Pass Rate (Audits with score >= 80% based on ICN rule)
    const passedAudits = submittedAudits.filter((a) => a.score >= 80).length;
    const passRate = Math.round((passedAudits / total) * 100);

    // Collect all actions from submitted audits
    const allActions = submittedAudits.flatMap((a) => a.actions);
    const totalActions = allActions.length;
    const completedActions = allActions.filter((act) => act.status === "Completed").length;
    const actionClosureRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 100;

    // Overdue Actions: due date < 2026-07-02 and not Completed
    const overdueActions = allActions.filter((act) => {
      if (act.status === "Completed") return false;
      const due = new Date(act.dueDate);
      return due < currentDate;
    }).length;
    const overdueActionRate = totalActions > 0 ? Math.round((overdueActions / totalActions) * 100) : 0;

    // Repeat Gap Rate: approximate by checking if same Line and same Gap Category appears more than once
    const gapKeys = submittedAudits.flatMap((a) =>
      a.gaps.map((g) => `${a.line}-${g.category}`)
    );
    const uniqueGapKeys = new Set(gapKeys);
    const repeatGapCount = gapKeys.length - uniqueGapKeys.size;
    const repeatGapRate = gapKeys.length > 0 ? Math.round((repeatGapCount / gapKeys.length) * 100) : 0;

    return {
      complianceRate,
      gapRate,
      passRate,
      actionClosureRate,
      overdueActionRate,
      repeatGapRate,
      totalActions,
      completedActions,
      overdueActions,
    };
  }, [submittedAudits]);

  // Chart 1: Site-specific Average Compliance Score
  const siteChartData = useMemo(() => {
    const sites = ["Incheon", "Bismarck", "Dobris", "Chennai"] as const;
    return sites.map((site) => {
      const siteAudits = submittedAudits.filter((a) => a.site === site);
      const avg =
        siteAudits.length > 0
          ? Math.round(siteAudits.reduce((acc, curr) => acc + curr.score, 0) / siteAudits.length)
          : 0;
      return { name: site, Score: avg, Count: siteAudits.length };
    });
  }, [submittedAudits]);

  // Chart 2: Area-specific Findings
  const areaChartData = useMemo(() => {
    const areas = ["Assembly", "Welding", "Machining", "Paint", "Logistics"] as const;
    const colors = ["#005EB8", "#00A5D7", "#00AD83", "#F26B43", "#C00000"];
    return areas.map((area, index) => {
      const count = submittedAudits.filter((a) => a.area === area).length;
      return { name: area, value: count, color: colors[index] };
    }).filter((item) => item.value > 0);
  }, [submittedAudits]);

  // Chart 3: Monthly Trend
  const trendChartData = useMemo(() => {
    // Group by month of auditDate
    const monthlyData: { [key: string]: { totalScore: number; count: number } } = {};
    submittedAudits.forEach((audit) => {
      const date = new Date(audit.auditDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyData[key]) {
        monthlyData[key] = { totalScore: 0, count: 0 };
      }
      monthlyData[key].totalScore += audit.score;
      monthlyData[key].count += 1;
    });

    return Object.keys(monthlyData)
      .sort()
      .map((key) => {
        return {
          month: key,
          "Compliance Rate": Math.round(monthlyData[key].totalScore / monthlyData[key].count),
          Audits: monthlyData[key].count,
        };
      });
  }, [submittedAudits]);

  // Gap Category Breakdown
  const gapBreakdown = useMemo(() => {
    const categories: { [key: string]: number } = {
      Safety: 0,
      Quality: 0,
      "Standard not followed": 0,
      "Improvement Idea": 0,
    };
    submittedAudits.flatMap((a) => a.gaps).forEach((g) => {
      if (categories[g.category] !== undefined) {
        categories[g.category] += 1;
      }
    });
    return Object.keys(categories).map((key) => ({
      name: key,
      Count: categories[key],
    }));
  }, [submittedAudits]);

  // Outstanding Actions
  const pendingActions = useMemo(() => {
    return submittedAudits
      .flatMap((a) =>
        a.actions.map((act) => ({
          ...act,
          auditId: a.id,
          line: a.line,
          station: a.station,
        }))
      )
      .filter((act) => act.status !== "Completed");
  }, [submittedAudits]);

  // Top Performers Ranking (Audit Pass Rate > 80%)
  const topPerformers = useMemo(() => {
    return [...submittedAudits]
      .filter((a) => a.score >= 80)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [submittedAudits]);

  return (
    <div id="dashboard-view-container" className="space-y-8 animate-fade-in">
      {/* 1. Brand Intro Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Activity className="h-6 w-6 text-[#005EB8]" />
            SW Compliance Audit Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            두산밥캣 글로벌 공장 표준 작업 준수 모니터링 및 실시간 KPI 분석 플랫폼
          </p>
        </div>
        <div className="text-xs text-gray-400 mt-2 md:mt-0 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100 font-mono">
          기준일자: 2026-07-02
        </div>
      </div>

      {/* 2. Key KPI Scoreboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Compliance Rate */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm transition hover:shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Compliance Rate
            </span>
            <span className="bg-[#BFD5EA]/30 text-[#005EB8] p-1.5 rounded-lg">
              <TrendingUp className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{kpis.complianceRate}%</span>
            <span
              className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                kpis.complianceRate >= 80
                  ? "bg-[#B2E6DA]/40 text-[#00AD83]"
                  : kpis.complianceRate >= 60
                  ? "bg-orange-50 text-[#F26B43]"
                  : "bg-red-50 text-[#C00000]"
              }`}
            >
              {kpis.complianceRate >= 80 ? "Pass Target" : "Under Target"}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">전체 평가 항목 합계 점수 평균</p>
        </div>

        {/* KPI 2: Audit Pass Rate */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm transition hover:shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Audit Pass Rate
            </span>
            <span className="bg-[#B2E6DA]/40 text-[#00AD83] p-1.5 rounded-lg">
              <Award className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{kpis.passRate}%</span>
            <span className="text-xs text-[#00AD83] font-semibold">(80점 이상)</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">전체 Audit 중 합격점 획득 비율</p>
        </div>

        {/* KPI 3: Action Closure Rate */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm transition hover:shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Action Closure Rate
            </span>
            <span className="bg-orange-50 text-[#F26B43] p-1.5 rounded-lg">
              <CheckCircle2 className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{kpis.actionClosureRate}%</span>
            <span className="text-xs text-gray-400">
              ({kpis.completedActions}/{kpis.totalActions})
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">갭 개선 조치사항(Corrective Action) 완료율</p>
        </div>

        {/* KPI 4: Overdue Action Rate */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm transition hover:shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Overdue Action Rate
            </span>
            <span className="bg-red-50 text-[#C00000] p-1.5 rounded-lg">
              <AlertTriangle className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{kpis.overdueActionRate}%</span>
            {kpis.overdueActions > 0 && (
              <span className="text-xs font-bold text-[#C00000] bg-red-50 px-1.5 py-0.5 rounded">
                {kpis.overdueActions}건 지연
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">목표일 도과 미조치 개선 조치 비율</p>
        </div>
      </div>

      {/* Auxiliary Mini KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 text-amber-800 p-2 rounded-lg font-bold text-sm">
            {kpis.gapRate}%
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-700">Gap Occurrence Rate (갭 발견율)</div>
            <div className="text-[11px] text-gray-400">Audit 당 최소 1개 이상 갭 발견된 비율</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 text-purple-800 p-2 rounded-lg font-bold text-sm">
            {kpis.repeatGapRate}%
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-700">Repeat Gap Rate (동일 갭 재발률)</div>
            <div className="text-[11px] text-gray-400">동일 라인/공정에서 반복 지적된 갭 비율</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-sky-100 text-sky-800 p-2 rounded-lg font-bold text-sm">
            {submittedAudits.length}건
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-700">Total Audits Performed</div>
            <div className="text-[11px] text-gray-400">제출 및 KPI 산출에 반영된 총 누적 횟수</div>
          </div>
        </div>
      </div>

      {/* 3. Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Site Comparison */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#005EB8]"></span>
            Site별 평균 Compliance Rate 현황 (%)
          </h3>
          <div className="h-64">
            {siteChartData.some((d) => d.Count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={siteChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={11} stroke="#6B7280" />
                  <YAxis domain={[0, 100]} fontSize={11} stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{ background: "#222", border: "none", borderRadius: "8px", color: "#fff" }}
                    formatter={(value) => [`${value}% 평균`, "점수"]}
                  />
                  <Bar dataKey="Score" radius={[4, 4, 0, 0]}>
                    {siteChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.Score >= 80 ? "#00AD83" : entry.Score >= 60 ? "#F26B43" : "#C00000"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                제출 완료된 데이터가 없습니다.
              </div>
            )}
          </div>
          <div className="flex justify-center gap-4 mt-2 text-[10px] text-gray-500 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00AD83]"></span> 우수 (≥80)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F26B43]"></span> 주의 (60~79)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C00000]"></span> 미흡 (&lt;60)
            </span>
          </div>
        </div>

        {/* Chart 2: Area Breakdown Pie */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#005EB8]"></span>
            공정 영역(Area)별 Audit 수행 비중
          </h3>
          <div className="h-64 flex items-center justify-center">
            {areaChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={areaChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {areaChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}회 수행`, "비중"]} />
                  <Legend verticalAlign="bottom" height={36} iconSize={10} iconType="circle" wrapperStyle={{ fontSize: "10px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-gray-400">데이터가 존재하지 않습니다.</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend & Category Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-sky-600" />
            월별 SW Audit 점수 추세 및 누적 건수
          </h3>
          <div className="h-60">
            {trendChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" fontSize={11} stroke="#6B7280" />
                  <YAxis domain={[0, 100]} fontSize={11} stroke="#6B7280" />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <Line
                    type="monotone"
                    dataKey="Compliance Rate"
                    stroke="#005EB8"
                    strokeWidth={2.5}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                트렌드 데이터 축적을 위해 Audit 기록을 생성해 주세요.
              </div>
            )}
          </div>
        </div>

        {/* Gap Category Analysis */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 text-[#C00000]" />
            지적된 Gap 원인 분야 TOP 4
          </h3>
          <div className="h-60">
            {gapBreakdown.some((d) => d.Count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={gapBreakdown}
                  margin={{ top: 10, right: 10, left: 30, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" fontSize={10} stroke="#6B7280" />
                  <YAxis type="category" dataKey="name" fontSize={10} stroke="#6B7280" width={110} />
                  <Tooltip />
                  <Bar dataKey="Count" fill="#C00000" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                발견 및 등록된 Gap 지적 사항이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Action Tracker / Overdue Actions List */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
            미결 개선조치 추적 현황 (Follow-up Actions List)
          </h3>
          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
            미해결 {pendingActions.length}건
          </span>
        </div>

        {pendingActions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-500">
              <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Audit ID</th>
                  <th className="p-3">Line / Station</th>
                  <th className="p-3">조치사항 (Corrective Action)</th>
                  <th className="p-3">담당자 (Owner)</th>
                  <th className="p-3">기한 (Due Date)</th>
                  <th className="p-3">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingActions.map((action) => {
                  const isOverdue = new Date(action.dueDate) < currentDate;
                  return (
                    <tr key={action.id} className="hover:bg-gray-50/50 transition">
                      <td className="p-3 font-semibold text-gray-900 font-mono">{action.auditId}</td>
                      <td className="p-3">
                        <span className="font-medium text-gray-700">{action.line}</span>
                        <br />
                        <span className="text-[10px] text-gray-400">{action.station}</span>
                      </td>
                      <td className="p-3 max-w-xs truncate font-medium text-gray-700" title={action.actionDescription}>
                        {action.actionDescription}
                      </td>
                      <td className="p-3 font-medium text-gray-800">{action.owner}</td>
                      <td className="p-3">
                        <span
                          className={`font-semibold font-mono px-2 py-0.5 rounded ${
                            isOverdue ? "bg-red-50 text-[#C00000]" : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {action.dueDate}
                        </span>
                        {isOverdue && (
                          <span className="text-[10px] text-[#C00000] block mt-1 font-bold">● Overdue!</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            action.status === "Pending"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-sky-50 text-sky-700 border border-sky-200"
                          }`}
                        >
                          {action.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-[#B2E6DA]/20 text-[#00AD83] p-4 rounded-lg flex items-center gap-2 text-xs font-medium border border-[#B2E6DA]/50">
            <CheckCircle2 className="h-4 w-4" />
            지연 및 미완료된 개선조치가 없습니다. 모든 공정이 원활하게 follow-up되고 있습니다.
          </div>
        )}
      </div>

      {/* 5. Best Performance Ranking Panel */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="h-4.5 w-4.5 text-amber-500" />
          공정 우수 라인 & 작업자 (Top Performers Audit Ranking)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topPerformers.map((audit, idx) => (
            <div
              key={audit.id}
              className="p-4 rounded-xl bg-gradient-to-br from-white to-gray-50/50 border border-gray-100 flex items-center gap-4 shadow-xs"
            >
              <div className="text-xl font-bold font-sans text-gray-300 w-6">0{idx + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-900 truncate">
                  {audit.line} - {audit.station}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  작업자: {audit.operatorName} | 심사원: {audit.auditor}
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-[#00AD83] font-mono">{audit.score}%</span>
                <span className="block text-[8px] text-gray-400 font-bold tracking-wider">COMPLIANCE</span>
              </div>
            </div>
          ))}
          {topPerformers.length === 0 && (
            <div className="text-xs text-gray-400 p-4 lg:col-span-3 text-center">
              합격 기준(80점) 이상을 충족한 Audit이 아직 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
