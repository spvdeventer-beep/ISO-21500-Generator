import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
  ReferenceArea
} from 'recharts';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Plus,
  Filter,
  Search,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  User,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ProjectRisk, computeRiskScore, RiskLevel } from '../utils/riskData';

interface RiskHeatmapChartProps {
  risks: ProjectRisk[];
  onUpdateRisks?: (updatedRisks: ProjectRisk[]) => void;
  title?: string;
  projectName?: string;
  compact?: boolean;
}

const PROBABILITY_LABELS: Record<number, string> = {
  1: '1 - Rare',
  2: '2 - Unlikely',
  3: '3 - Possible',
  4: '4 - Likely',
  5: '5 - Almost Certain'
};

const IMPACT_LABELS: Record<number, string> = {
  1: '1 - Negligible',
  2: '2 - Minor',
  3: '3 - Moderate',
  4: '4 - Major',
  5: '5 - Critical'
};

const CELL_COLORS: Record<string, string> = {
  LOW: 'rgba(16, 185, 129, 0.22)',      // Emerald
  MEDIUM: 'rgba(245, 158, 11, 0.25)',   // Amber
  HIGH: 'rgba(249, 115, 22, 0.32)',     // Orange
  CRITICAL: 'rgba(239, 68, 68, 0.38)'   // Rose
};

export const RiskHeatmapChart: React.FC<RiskHeatmapChartProps> = ({
  risks,
  onUpdateRisks,
  title = 'ISO 31000 Risk Probability vs Impact Heatmap',
  projectName = 'Advannotech IoT Strategic Telemetry Program',
  compact = false
}) => {
  const [selectedRisk, setSelectedRisk] = useState<ProjectRisk | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCell, setSelectedCell] = useState<{ p: number; i: number } | null>(null);
  const [isAddingRisk, setIsAddingRisk] = useState(false);

  // New Risk State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ProjectRisk['category']>('Technical');
  const [newProb, setNewProb] = useState<number>(3);
  const [newImp, setNewImp] = useState<number>(3);
  const [newOwner, setNewOwner] = useState('Valiant Khoza (Lead Software Engineer)');
  const [newMitigation, setNewMitigation] = useState('');

  // Count summaries
  const criticalCount = risks.filter((r) => r.level === 'CRITICAL').length;
  const highCount = risks.filter((r) => r.level === 'HIGH').length;
  const mediumCount = risks.filter((r) => r.level === 'MEDIUM').length;
  const lowCount = risks.filter((r) => r.level === 'LOW').length;

  const totalScore = risks.reduce((acc, r) => acc + r.score, 0);
  const averageScore = risks.length > 0 ? (totalScore / risks.length).toFixed(1) : '0';

  // Format risks for Recharts Scatter plot
  // We add slight jitter so overlapping points in the same cell are visible
  const scatterData = useMemo(() => {
    // Group by cell to apply deterministic offset
    const cellGroups: Record<string, ProjectRisk[]> = {};
    risks.forEach((r) => {
      const key = `${r.impact}-${r.probability}`;
      if (!cellGroups[key]) cellGroups[key] = [];
      cellGroups[key].push(r);
    });

    return risks.map((r) => {
      const key = `${r.impact}-${r.probability}`;
      const group = cellGroups[key] || [r];
      const indexInGroup = group.indexOf(r);
      const groupSize = group.length;

      // Small jitter between -0.18 and +0.18
      const jitterX = groupSize > 1 ? ((indexInGroup / (groupSize - 1 || 1)) - 0.5) * 0.35 : 0;
      const jitterY = groupSize > 1 ? (((indexInGroup % 2) - 0.5) * 0.25) : 0;

      return {
        ...r,
        x: r.impact + jitterX,
        y: r.probability + jitterY,
        z: r.score * 10
      };
    });
  }, [risks]);

  // Filtered risks
  const filteredRisks = useMemo(() => {
    return risks.filter((r) => {
      const matchesLevel = filterLevel === 'ALL' || r.level === filterLevel;
      const matchesCell = !selectedCell || (r.probability === selectedCell.p && r.impact === selectedCell.i);
      const matchesSearch =
        !searchQuery ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.owner.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesLevel && matchesCell && matchesSearch;
    });
  }, [risks, filterLevel, selectedCell, searchQuery]);

  // Handle adding new risk
  const handleCreateRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const { score, level, ragStatus } = computeRiskScore(newProb, newImp);
    const newRisk: ProjectRisk = {
      id: `RSK-${String(risks.length + 1).padStart(2, '0')}`,
      title: newTitle.trim(),
      category: newCategory,
      probability: newProb,
      impact: newImp,
      score,
      level,
      ragStatus,
      owner: newOwner.trim() || 'Sarel van Deventer (PMO Director)',
      sourceOrigin: 'User Input / Risk Assessment',
      mitigationStrategy: newMitigation.trim() || 'Implement standard PMBOK prevention strategy and reserve tracking.',
      contingencyPlan: 'Management contingency allocation and bi-weekly SteerCo monitoring.',
      status: 'Identified'
    };

    if (onUpdateRisks) {
      onUpdateRisks([...risks, newRisk]);
    }

    setNewTitle('');
    setNewMitigation('');
    setIsAddingRisk(false);
    setSelectedRisk(newRisk);
  };

  const handleCellClick = (p: number, i: number) => {
    if (selectedCell && selectedCell.p === p && selectedCell.i === i) {
      setSelectedCell(null);
    } else {
      setSelectedCell({ p, i });
    }
  };

  // Custom Tooltip for Recharts Scatter
  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: ProjectRisk = payload[0].payload;
      return (
        <div className="bg-[#0B1528] border border-cyan-500/50 p-3 rounded-xl shadow-2xl text-xs max-w-xs space-y-1.5 z-50">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1">
            <span className="font-mono font-bold text-cyan-300">{data.id}</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                data.level === 'CRITICAL'
                  ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                  : data.level === 'HIGH'
                  ? 'bg-orange-950 text-orange-300 border border-orange-500/50'
                  : data.level === 'MEDIUM'
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
              }`}
            >
              {data.level} ({data.score}/25)
            </span>
          </div>

          <div className="font-semibold text-white leading-snug">{data.title}</div>
          <div className="text-[11px] text-slate-400">
            Probability: <strong className="text-slate-200">{PROBABILITY_LABELS[data.probability]}</strong>
            <br />
            Impact: <strong className="text-slate-200">{IMPACT_LABELS[data.impact]}</strong>
          </div>
          <div className="text-[10px] text-cyan-400 font-mono">Owner: {data.owner}</div>
          <p className="text-[11px] text-slate-300 italic pt-1 border-t border-slate-800/80">
            {data.mitigationStrategy}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-6 text-slate-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-800 text-slate-400 font-mono">
              ISO 31000 & PMBOK 7th Ed
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated 5x5 Probability vs Impact heatmap matrix processing risks from source documents, audit advisories, and user inputs.
          </p>
        </div>

        {/* Quick Stats Pills */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Critical: {criticalCount}</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-orange-950/60 border border-orange-500/40 text-orange-300 text-xs font-mono font-bold">
            High: {highCount}
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
            Med: {mediumCount}
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
            Low: {lowCount}
          </div>
        </div>
      </div>

      {/* Main Heatmap Visualizer (2 Columns: Recharts Scatter Matrix + Interactive 5x5 Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Col: Recharts Scatter Plot inside 5x5 Matrix */}
        <div className="lg:col-span-7 bg-[#0B1528] border border-slate-800 rounded-xl p-4 shadow-inner space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Automated Recharts Scatter Matrix ({risks.length} Risks)
            </span>
            <span className="text-[10px] text-cyan-300 font-mono">
              Avg Exposure: {averageScore} / 25
            </span>
          </div>

          {/* Recharts Chart Area */}
          <div className="h-[340px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 25, bottom: 25, left: 10 }}>
                {/* 5x5 Colored Heatmap Zones as ReferenceAreas */}
                {/* Critical Zone (Top Right) */}
                <ReferenceArea x1={3.5} x2={5.5} y1={3.5} y2={5.5} fill={CELL_COLORS.CRITICAL} stroke="none" />
                {/* High Zone */}
                <ReferenceArea x1={1.5} x2={3.5} y1={3.5} y2={5.5} fill={CELL_COLORS.HIGH} stroke="none" />
                <ReferenceArea x1={3.5} x2={5.5} y1={1.5} y2={3.5} fill={CELL_COLORS.HIGH} stroke="none" />
                {/* Medium Zone */}
                <ReferenceArea x1={0.5} x2={2.5} y1={2.5} y2={4.5} fill={CELL_COLORS.MEDIUM} stroke="none" />
                <ReferenceArea x1={2.5} x2={4.5} y1={0.5} y2={2.5} fill={CELL_COLORS.MEDIUM} stroke="none" />
                {/* Low Zone (Bottom Left) */}
                <ReferenceArea x1={0.5} x2={2.5} y1={0.5} y2={2.5} fill={CELL_COLORS.LOW} stroke="none" />

                <XAxis
                  type="number"
                  dataKey="x"
                  domain={[0.5, 5.5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tickFormatter={(val) => IMPACT_LABELS[val]?.split(' - ')[1] || val}
                  stroke="#64748B"
                  fontSize={10}
                  tickLine={false}
                  label={{ value: 'Impact →', position: 'bottom', fill: '#94A3B8', fontSize: 11, offset: 5 }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  domain={[0.5, 5.5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tickFormatter={(val) => PROBABILITY_LABELS[val]?.split(' - ')[1] || val}
                  stroke="#64748B"
                  fontSize={10}
                  tickLine={false}
                  label={{ value: '↑ Probability', angle: -90, position: 'left', fill: '#94A3B8', fontSize: 11, offset: 5 }}
                />
                <ZAxis type="number" dataKey="z" range={[120, 280]} />
                <Tooltip content={<CustomScatterTooltip />} />
                <Scatter
                  name="Project Risks"
                  data={scatterData}
                  onClick={(entry: any) => {
                    const r = (entry && (entry.payload || entry)) as ProjectRisk;
                    setSelectedRisk(r);
                  }}
                  cursor="pointer"
                >
                  {scatterData.map((entry, index) => {
                    const fillColor =
                      entry.level === 'CRITICAL'
                        ? '#EF4444'
                        : entry.level === 'HIGH'
                        ? '#F97316'
                        : entry.level === 'MEDIUM'
                        ? '#F59E0B'
                        : '#10B981';
                    const isSelected = selectedRisk?.id === entry.id;

                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={fillColor}
                        stroke={isSelected ? '#FFFFFF' : '#0B1528'}
                        strokeWidth={isSelected ? 3 : 1.5}
                      />
                    );
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Legend */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Critical (15-25)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span>High (10-14)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Medium (5-9)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Low (1-4)</span>
              </span>
            </div>
            <span className="text-slate-500 font-mono text-[10px]">Click any node to inspect risk</span>
          </div>
        </div>

        {/* Right Col: Interactive 5x5 Matrix Cell Grid + Selected Risk Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0B1528] border border-slate-800 rounded-xl p-4 shadow-inner space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                5x5 Risk Cell Distribution
              </span>
              {selectedCell && (
                <button
                  onClick={() => setSelectedCell(null)}
                  className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                >
                  Clear Cell Filter
                </button>
              )}
            </div>

            {/* 5x5 Visual Grid */}
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map((p) => (
                <div key={p} className="flex items-center gap-1">
                  <span className="w-16 text-[9px] text-slate-400 font-mono text-right pr-1 truncate">
                    P{p} {PROBABILITY_LABELS[p]?.split(' - ')[1]}
                  </span>
                  <div className="grid grid-cols-5 gap-1 flex-1">
                    {[1, 2, 3, 4, 5].map((i) => {
                      const { score, level } = computeRiskScore(p, i);
                      const matchingRisks = risks.filter((r) => r.probability === p && r.impact === i);
                      const isCellActive = selectedCell?.p === p && selectedCell?.i === i;

                      let bgClass = 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300';
                      if (level === 'CRITICAL') bgClass = 'bg-rose-950/40 border-rose-500/40 text-rose-300';
                      else if (level === 'HIGH') bgClass = 'bg-orange-950/40 border-orange-500/40 text-orange-300';
                      else if (level === 'MEDIUM') bgClass = 'bg-amber-950/40 border-amber-500/40 text-amber-300';

                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleCellClick(p, i)}
                          className={`h-7 rounded text-[10px] font-mono font-bold border transition-all cursor-pointer flex items-center justify-center relative ${bgClass} ${
                            isCellActive
                              ? 'ring-2 ring-cyan-400 scale-105 z-10 shadow-md'
                              : 'hover:scale-102 hover:border-cyan-400/60'
                          }`}
                          title={`Probability ${p} × Impact ${i} = ${score} (${level}). ${matchingRisks.length} risk(s).`}
                        >
                          <span>{score}</span>
                          {matchingRisks.length > 0 && (
                            <span className="absolute -top-1 -right-1 px-1 rounded-full bg-cyan-400 text-slate-950 text-[8px] font-black leading-tight shadow-xs">
                              {matchingRisks.length}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {/* Impact axis label */}
              <div className="flex items-center gap-1 pt-1">
                <span className="w-16" />
                <div className="grid grid-cols-5 gap-1 flex-1 text-center text-[9px] text-slate-400 font-mono">
                  <span>I1</span>
                  <span>I2</span>
                  <span>I3</span>
                  <span>I4</span>
                  <span>I5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Risk Inspection Drawer */}
          {selectedRisk ? (
            <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/40 shadow-xl space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-300">{selectedRisk.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      selectedRisk.level === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300 border-rose-500/50'
                        : selectedRisk.level === 'HIGH'
                        ? 'bg-orange-950 text-orange-300 border-orange-500/50'
                        : selectedRisk.level === 'MEDIUM'
                        ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                    }`}
                  >
                    {selectedRisk.level} ({selectedRisk.score}/25)
                  </span>
                </div>
                <button
                  onClick={() => setSelectedRisk(null)}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  &times; Close
                </button>
              </div>

              <h4 className="text-sm font-bold text-white">{selectedRisk.title}</h4>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                <div>Category: <strong className="text-slate-200">{selectedRisk.category}</strong></div>
                <div>Status: <strong className="text-cyan-300">{selectedRisk.status}</strong></div>
                <div>Probability: <strong className="text-slate-200">{selectedRisk.probability}/5</strong></div>
                <div>Impact: <strong className="text-slate-200">{selectedRisk.impact}/5</strong></div>
                <div className="col-span-2">Owner: <strong className="text-slate-200">{selectedRisk.owner}</strong></div>
                <div className="col-span-2">Origin: <span className="font-mono text-[10px] text-slate-400">{selectedRisk.sourceOrigin}</span></div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                <strong className="text-cyan-400 block text-[10px] uppercase font-mono tracking-wider">Mitigation Strategy:</strong>
                <p className="text-slate-300 leading-relaxed text-[11px]">{selectedRisk.mitigationStrategy}</p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                <strong className="text-amber-400 block text-[10px] uppercase font-mono tracking-wider">Contingency Protocol:</strong>
                <p className="text-slate-300 leading-relaxed text-[11px]">{selectedRisk.contingencyPlan}</p>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-1.5">
              <Info className="w-5 h-5 text-slate-500" />
              <span>Select any risk from the matrix or list to inspect its mitigation plan and contingency protocol.</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search risks by title, ID, or owner..."
              className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-56"
            />
          </div>

          {/* Level Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  filterLevel === lvl
                    ? 'bg-cyan-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIsAddingRisk(!isAddingRisk)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAddingRisk ? 'Cancel Add Risk' : 'Add Project Risk'}</span>
        </button>
      </div>

      {/* Add Risk Drawer Form */}
      {isAddingRisk && (
        <form
          onSubmit={handleCreateRisk}
          className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 space-y-3 animate-fade-in"
        >
          <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Add New Risk to Assessment Register</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="md:col-span-2">
              <label className="text-slate-300 block mb-1 font-semibold">Risk Title & Description:</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Fiber backhaul installation permit delay from provincial municipality"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Risk Category:</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="Technical">Technical</option>
                <option value="Schedule">Schedule</option>
                <option value="Cost">Cost</option>
                <option value="Governance">Governance</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Operational">Operational</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Assigned Risk Owner:</label>
              <input
                type="text"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">
                Probability: <strong className="text-cyan-300">{PROBABILITY_LABELS[newProb]}</strong>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={newProb}
                onChange={(e) => setNewProb(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">
                Impact: <strong className="text-cyan-300">{IMPACT_LABELS[newImp]}</strong>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={newImp}
                onChange={(e) => setNewImp(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-slate-300 block mb-1 font-semibold">Mitigation Strategy:</label>
              <input
                type="text"
                value={newMitigation}
                onChange={(e) => setNewMitigation(e.target.value)}
                placeholder="Specific preventive controls, vendor backup plans, or technical failovers..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingRisk(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer shadow-md shadow-cyan-500/20"
            >
              Save Risk to Heatmap
            </button>
          </div>
        </form>
      )}

      {/* Filtered Risk Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Risk Title</th>
              <th className="p-3">Category</th>
              <th className="p-3">Probability</th>
              <th className="p-3">Impact</th>
              <th className="p-3">Score</th>
              <th className="p-3">Level</th>
              <th className="p-3">Owner</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-300">
            {filteredRisks.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-slate-500 italic">
                  No risks match the current filter or search criteria.
                </td>
              </tr>
            ) : (
              filteredRisks.map((risk) => {
                const isSelected = selectedRisk?.id === risk.id;

                return (
                  <tr
                    key={risk.id}
                    onClick={() => setSelectedRisk(risk)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-cyan-950/40 text-white' : 'hover:bg-slate-900/50'
                    }`}
                  >
                    <td className="p-3 font-mono font-bold text-cyan-300 whitespace-nowrap">{risk.id}</td>
                    <td className="p-3 font-semibold text-white max-w-xs truncate">{risk.title}</td>
                    <td className="p-3 text-slate-400">{risk.category}</td>
                    <td className="p-3 font-mono">{risk.probability}/5</td>
                    <td className="p-3 font-mono">{risk.impact}/5</td>
                    <td className="p-3 font-mono font-bold text-white">{risk.score}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                          risk.level === 'CRITICAL'
                            ? 'bg-rose-950 text-rose-300 border-rose-500/50'
                            : risk.level === 'HIGH'
                            ? 'bg-orange-950 text-orange-300 border-orange-500/50'
                            : risk.level === 'MEDIUM'
                            ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                        }`}
                      >
                        {risk.level}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300 max-w-[140px] truncate">{risk.owner}</td>
                    <td className="p-3">
                      <span className="text-[10px] font-mono text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {risk.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
