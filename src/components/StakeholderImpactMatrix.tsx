import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  Users,
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Building,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info,
  Sliders,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { 
  MatrixStakeholder, 
  StakeholderQuadrant, 
  RaciRole, 
  computeQuadrant, 
  INITIAL_STAKEHOLDERS 
} from '../data/projectRegisters';

interface StakeholderImpactMatrixProps {
  stakeholders?: MatrixStakeholder[];
  onUpdateStakeholders?: (stakeholders: MatrixStakeholder[]) => void;
  projectName?: string;
}

export const StakeholderImpactMatrix: React.FC<StakeholderImpactMatrixProps> = ({
  stakeholders = INITIAL_STAKEHOLDERS,
  onUpdateStakeholders,
  projectName = 'Advannotech IoT Strategic Telemetry Program'
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [data, setData] = useState<MatrixStakeholder[]>(stakeholders);
  const [selectedStakeholder, setSelectedStakeholder] = useState<MatrixStakeholder | null>(data[0] || null);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // New Stakeholder form state
  const [newName, setNewName] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDept, setNewDept] = useState('Engineering & IoT');
  const [newPower, setNewPower] = useState(70);
  const [newInterest, setNewInterest] = useState(75);
  const [newRaci, setNewRaci] = useState<RaciRole>('Responsible');
  const [newExpectation, setNewExpectation] = useState('');

  // Synchronize when prop changes
  useEffect(() => {
    setData(stakeholders);
  }, [stakeholders]);

  // Quadrant Counts
  const manageCloselyCount = data.filter((s) => s.quadrant === 'Manage Closely').length;
  const keepSatisfiedCount = data.filter((s) => s.quadrant === 'Keep Satisfied').length;
  const keepInformedCount = data.filter((s) => s.quadrant === 'Keep Informed').length;
  const monitorCount = data.filter((s) => s.quadrant === 'Monitor').length;

  // Filtered Stakeholders
  const filteredData = useMemo(() => {
    return data.filter((s) => {
      const matchesFilter = activeFilter === 'ALL' || s.quadrant === activeFilter;
      const matchesSearch =
        !searchQuery ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.department.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [data, activeFilter, searchQuery]);

  // Render D3 Interactive Visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 640;
    const height = 480;
    const margin = { top: 40, right: 40, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Scales
    const xScale = d3.scaleLinear().domain([0, 100]).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);

    // Definitions (Gradients & Glow Filters)
    const defs = svg.append('defs');

    // Glow filter
    const filter = defs.append('filter').attr('id', 'd3-glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // 4 Quadrant Background Rectangles
    const halfX = innerWidth / 2;
    const halfY = innerHeight / 2;

    // Quadrant 2: Keep Satisfied (Top-Left: Interest < 50%, Power >= 50%)
    g.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', halfX)
      .attr('height', halfY)
      .attr('fill', 'rgba(245, 158, 11, 0.08)')
      .attr('stroke', 'rgba(245, 158, 11, 0.25)')
      .attr('stroke-width', 1);

    // Quadrant 1: Manage Closely (Top-Right: Interest >= 50%, Power >= 50%)
    g.append('rect')
      .attr('x', halfX)
      .attr('y', 0)
      .attr('width', halfX)
      .attr('height', halfY)
      .attr('fill', 'rgba(6, 182, 212, 0.12)')
      .attr('stroke', 'rgba(6, 182, 212, 0.35)')
      .attr('stroke-width', 1);

    // Quadrant 4: Monitor (Bottom-Left: Interest < 50%, Power < 50%)
    g.append('rect')
      .attr('x', 0)
      .attr('y', halfY)
      .attr('width', halfX)
      .attr('height', halfY)
      .attr('fill', 'rgba(100, 116, 139, 0.06)')
      .attr('stroke', 'rgba(100, 116, 139, 0.2)')
      .attr('stroke-width', 1);

    // Quadrant 3: Keep Informed (Bottom-Right: Interest >= 50%, Power < 50%)
    g.append('rect')
      .attr('x', halfX)
      .attr('y', halfY)
      .attr('width', halfX)
      .attr('height', halfY)
      .attr('fill', 'rgba(99, 102, 241, 0.09)')
      .attr('stroke', 'rgba(99, 102, 241, 0.25)')
      .attr('stroke-width', 1);

    // Midpoint Threshold Lines (50% Power & 50% Interest)
    g.append('line')
      .attr('x1', halfX)
      .attr('y1', 0)
      .attr('x2', halfX)
      .attr('y2', innerHeight)
      .attr('stroke', '#334155')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4 4');

    g.append('line')
      .attr('x1', 0)
      .attr('y1', halfY)
      .attr('x2', innerWidth)
      .attr('y2', halfY)
      .attr('stroke', '#334155')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4 4');

    // Quadrant Strategy Watermark Labels
    g.append('text')
      .attr('x', halfX + 16)
      .attr('y', 24)
      .attr('fill', '#22D3EE')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '0.05em')
      .text('MANAGE CLOSELY (KEY PLAYERS)');

    g.append('text')
      .attr('x', 16)
      .attr('y', 24)
      .attr('fill', '#FBBF24')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '0.05em')
      .text('KEEP SATISFIED');

    g.append('text')
      .attr('x', halfX + 16)
      .attr('y', halfY + 24)
      .attr('fill', '#818CF8')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '0.05em')
      .text('KEEP INFORMED');

    g.append('text')
      .attr('x', 16)
      .attr('y', halfY + 24)
      .attr('fill', '#94A3B8')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '0.05em')
      .text('MONITOR (MINIMUM EFFORT)');

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat((d) => `${d}%`);
    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat((d) => `${d}%`);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('color', '#64748B')
      .attr('font-size', '10px');

    g.append('g')
      .call(yAxis)
      .attr('color', '#64748B')
      .attr('font-size', '10px');

    // Axis Labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .attr('fill', '#94A3B8')
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .text('Stakeholder Interest Level (0% → 100%)');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -42)
      .attr('fill', '#94A3B8')
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .text('Stakeholder Power / Influence (0% ↑ 100%)');

    // Render Stakeholder Nodes with Dragging & Interactions
    const drag = d3.drag<SVGGElement, MatrixStakeholder>()
      .on('start', function () {
        d3.select(this).raise().select('circle').attr('stroke', '#FFFFFF').attr('stroke-width', 3);
      })
      .on('drag', function (event, d) {
        // Constrain to matrix coordinates
        const newX = Math.max(0, Math.min(innerWidth, event.x));
        const newY = Math.max(0, Math.min(innerHeight, event.y));

        const updatedInterest = Math.round(xScale.invert(newX));
        const updatedPower = Math.round(yScale.invert(newY));

        d.interest = updatedInterest;
        d.power = updatedPower;
        d.quadrant = computeQuadrant(updatedPower, updatedInterest);

        d3.select(this).attr('transform', `translate(${newX},${newY})`);

        // Real-time update selected stakeholder if it's the one dragging
        setSelectedStakeholder({ ...d });
      })
      .on('end', function (event, d) {
        d3.select(this).select('circle').attr('stroke', '#0B1528').attr('stroke-width', 2);
        // Persist position update
        setData((prev) => {
          const updated = prev.map((item) => (item.id === d.id ? { ...d } : item));
          if (onUpdateStakeholders) onUpdateStakeholders(updated);
          return updated;
        });
      });

    const nodes = g.selectAll('.stk-node')
      .data(filteredData, (d: any) => d.id)
      .enter()
      .append('g')
      .attr('class', 'stk-node')
      .attr('transform', (d) => `translate(${xScale(d.interest)},${yScale(d.power)})`)
      .style('cursor', 'grab')
      .call(drag as any);

    // Color by Quadrant
    const getNodeColor = (quadrant: StakeholderQuadrant) => {
      switch (quadrant) {
        case 'Manage Closely': return '#06B6D4'; // Cyan
        case 'Keep Satisfied': return '#F59E0B'; // Amber
        case 'Keep Informed': return '#6366F1';  // Indigo
        case 'Monitor': return '#64748B';        // Slate
      }
    };

    // Outer Halo Circle for High Power Nodes
    nodes.filter((d) => d.power >= 80)
      .append('circle')
      .attr('r', 18)
      .attr('fill', 'none')
      .attr('stroke', (d) => getNodeColor(d.quadrant))
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.4)
      .attr('stroke-dasharray', '3 3');

    // Main Circle
    nodes.append('circle')
      .attr('r', (d) => (d.raci === 'Accountable' ? 14 : d.raci === 'Responsible' ? 12 : 10))
      .attr('fill', (d) => getNodeColor(d.quadrant))
      .attr('stroke', '#0B1528')
      .attr('stroke-width', 2)
      .attr('filter', (d) => (d.id === selectedStakeholder?.id ? 'url(#d3-glow)' : 'none'))
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedStakeholder(d);
      });

    // Node Initials or RACI Badge
    nodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#FFFFFF')
      .attr('font-size', '9px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'sans-serif')
      .attr('pointer-events', 'none')
      .text((d) => d.raci[0]); // R, A, C, or I

    // Name Label below circle
    nodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 22)
      .attr('fill', '#E2E8F0')
      .attr('font-size', '9.5px')
      .attr('font-weight', '600')
      .attr('pointer-events', 'none')
      .text((d) => {
        const parts = d.name.split(' ');
        return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : d.name;
      });

  }, [filteredData, selectedStakeholder]);

  // Handle adding new stakeholder
  const handleAddStakeholder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newTitle.trim()) return;

    const quad = computeQuadrant(newPower, newInterest);
    const newStk: MatrixStakeholder = {
      id: `STK-${String(data.length + 1).padStart(2, '0')}`,
      name: newName.trim(),
      title: newTitle.trim(),
      department: newDept,
      email: `${newName.toLowerCase().replace(/\s+/g, '.')}@advannotech.co.za`,
      phone: '+27 12 004 0460',
      location: 'Gauteng',
      power: newPower,
      interest: newInterest,
      raci: newRaci,
      quadrant: quad,
      keyExpectation: newExpectation.trim() || 'Timely deliverable assurance and stakeholder alignment.',
      engagementChannel: 'Standard Project Governance Protocol'
    };

    const updated = [...data, newStk];
    setData(updated);
    if (onUpdateStakeholders) onUpdateStakeholders(updated);
    setSelectedStakeholder(newStk);
    setIsAdding(false);
    setNewName('');
    setNewTitle('');
    setNewExpectation('');
  };

  // Handle updating selected stakeholder sliders
  const handleUpdateSelected = (power: number, interest: number, raci: RaciRole) => {
    if (!selectedStakeholder) return;
    const quad = computeQuadrant(power, interest);
    const updatedStk: MatrixStakeholder = {
      ...selectedStakeholder,
      power,
      interest,
      raci,
      quadrant: quad
    };

    setSelectedStakeholder(updatedStk);
    setData((prev) => {
      const next = prev.map((s) => (s.id === updatedStk.id ? updatedStk : s));
      if (onUpdateStakeholders) onUpdateStakeholders(next);
      return next;
    });
  };

  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-6 text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Users className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              Stakeholder Impact & Influence Matrix
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-800 text-cyan-300 font-mono">
              d3 Interactive Map
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Maps stakeholder power/influence against interest level across 4 PMBOK 7th Edition governance quadrants with live drag-and-drop repositioning.
          </p>
        </div>

        {/* Quadrant Quick Counts */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Manage Closely: {manageCloselyCount}</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
            Keep Satisfied: {keepSatisfiedCount}
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 text-xs font-mono font-bold">
            Keep Informed: {keepInformedCount}
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono font-bold">
            Monitor: {monitorCount}
          </div>
        </div>
      </div>

      {/* Main Workspace: D3 SVG Chart (Left) + Stakeholder Profile & Sliders (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: D3 Interactive SVG Canvas */}
        <div className="lg:col-span-7 bg-[#0B1528] border border-slate-800 rounded-xl p-4 shadow-inner space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Power vs Interest D3 Canvas ({filteredData.length} Stakeholders)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              💡 Drag nodes to adjust power & interest
            </span>
          </div>

          {/* SVG Element */}
          <div className="w-full flex justify-center overflow-x-auto">
            <svg
              ref={svgRef}
              viewBox="0 0 640 480"
              className="w-full h-auto max-w-[640px] select-none"
            />
          </div>

          {/* RACI Node Legend */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-cyan-500 text-slate-950 font-bold text-[8px] flex items-center justify-center">A</span>
                <span>Accountable</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-cyan-500 text-slate-950 font-bold text-[8px] flex items-center justify-center">R</span>
                <span>Responsible</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-amber-500 text-slate-950 font-bold text-[8px] flex items-center justify-center">C</span>
                <span>Consulted</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-indigo-500 text-white font-bold text-[8px] flex items-center justify-center">I</span>
                <span>Informed</span>
              </span>
            </div>
            <span className="text-slate-500 font-mono text-[10px]">Pulsing ring = High influence &gt; 80%</span>
          </div>
        </div>

        {/* Right: Selected Stakeholder Dossier & Calibration Sliders */}
        <div className="lg:col-span-5 space-y-4">
          {selectedStakeholder ? (
            <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/40 shadow-xl space-y-3 animate-fade-in">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-300">{selectedStakeholder.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      selectedStakeholder.quadrant === 'Manage Closely'
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50'
                        : selectedStakeholder.quadrant === 'Keep Satisfied'
                        ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                        : selectedStakeholder.quadrant === 'Keep Informed'
                        ? 'bg-indigo-950 text-indigo-300 border-indigo-500/50'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {selectedStakeholder.quadrant}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800">
                  RACI: {selectedStakeholder.raci}
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-white">{selectedStakeholder.name}</h4>
                <p className="text-xs text-slate-400 font-medium">{selectedStakeholder.title}</p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Building className="w-3 h-3 text-cyan-400" />
                    {selectedStakeholder.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    {selectedStakeholder.location}
                  </span>
                </div>
              </div>

              {/* Sliders to recalibrate Power and Interest */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    Power / Influence:
                  </span>
                  <strong className="text-cyan-300 font-mono text-sm">{selectedStakeholder.power}%</strong>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={selectedStakeholder.power}
                  onChange={(e) =>
                    handleUpdateSelected(
                      Number(e.target.value),
                      selectedStakeholder.interest,
                      selectedStakeholder.raci
                    )
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />

                <div className="flex items-center justify-between text-slate-300 pt-1">
                  <span className="font-semibold flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    Interest Level:
                  </span>
                  <strong className="text-cyan-300 font-mono text-sm">{selectedStakeholder.interest}%</strong>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={selectedStakeholder.interest}
                  onChange={(e) =>
                    handleUpdateSelected(
                      selectedStakeholder.power,
                      Number(e.target.value),
                      selectedStakeholder.raci
                    )
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />

                {/* RACI selector */}
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">RACI Assignment:</span>
                  <div className="flex items-center gap-1">
                    {(['Responsible', 'Accountable', 'Consulted', 'Informed'] as RaciRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() =>
                          handleUpdateSelected(
                            selectedStakeholder.power,
                            selectedStakeholder.interest,
                            r
                          )
                        }
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                          selectedStakeholder.raci === r
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {r[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Key Expectation */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block font-bold">
                  Key Project Expectation:
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {selectedStakeholder.keyExpectation}
                </p>
              </div>

              {/* Engagement Channel */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block font-bold">
                  Recommended Engagement Cadence:
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {selectedStakeholder.engagementChannel}
                </p>
              </div>

              {/* Contact metadata */}
              <div className="flex flex-col gap-1 text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                <span className="flex items-center gap-1.5 font-mono truncate">
                  <Mail className="w-3 h-3 text-cyan-400 shrink-0" />
                  {selectedStakeholder.email}
                </span>
                <span className="flex items-center gap-1.5 font-mono">
                  <Phone className="w-3 h-3 text-cyan-400 shrink-0" />
                  {selectedStakeholder.phone}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-1.5">
              <Info className="w-5 h-5 text-slate-500" />
              <span>Select any stakeholder node on the D3 canvas to inspect or adjust their power, interest, and RACI role.</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Add Stakeholder Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stakeholders by name or role..."
              className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-56"
            />
          </div>

          {/* Quadrant Filters */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
            {['ALL', 'Manage Closely', 'Keep Satisfied', 'Keep Informed', 'Monitor'].map((q) => (
              <button
                key={q}
                onClick={() => setActiveFilter(q)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  activeFilter === q
                    ? 'bg-cyan-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAdding ? 'Cancel Add' : 'Add Stakeholder'}</span>
        </button>
      </div>

      {/* Add Stakeholder Form Drawer */}
      {isAdding && (
        <form
          onSubmit={handleAddStakeholder}
          className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 space-y-3 animate-fade-in"
        >
          <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Map New Project Stakeholder into Matrix</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Stakeholder Full Name:</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Nomvula Sithole"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Project Role / Title:</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Regional Electrical Substation Director"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Department / Organisation:</label>
              <input
                type="text"
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">RACI Designation:</label>
              <select
                value={newRaci}
                onChange={(e) => setNewRaci(e.target.value as RaciRole)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="Responsible">Responsible (Does the work)</option>
                <option value="Accountable">Accountable (Single decision authority)</option>
                <option value="Consulted">Consulted (Two-way input)</option>
                <option value="Informed">Informed (Kept updated)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">
                Power / Influence Level: <strong className="text-cyan-300">{newPower}%</strong>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={newPower}
                onChange={(e) => setNewPower(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">
                Interest Level: <strong className="text-cyan-300">{newInterest}%</strong>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={newInterest}
                onChange={(e) => setNewInterest(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-slate-300 block mb-1 font-semibold">Key Expectations & Deliverable Focus:</label>
              <input
                type="text"
                value={newExpectation}
                onChange={(e) => setNewExpectation(e.target.value)}
                placeholder="What this stakeholder requires for project acceptance..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer shadow-md shadow-cyan-500/20"
            >
              Add to Impact Matrix
            </button>
          </div>
        </form>
      )}

      {/* Stakeholder Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Role & Title</th>
              <th className="p-3">Department</th>
              <th className="p-3">Power</th>
              <th className="p-3">Interest</th>
              <th className="p-3">Quadrant Strategy</th>
              <th className="p-3">RACI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-300">
            {filteredData.map((stk) => {
              const isSelected = selectedStakeholder?.id === stk.id;

              return (
                <tr
                  key={stk.id}
                  onClick={() => setSelectedStakeholder(stk)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-cyan-950/40 text-white' : 'hover:bg-slate-900/50'
                  }`}
                >
                  <td className="p-3 font-mono font-bold text-cyan-300">{stk.id}</td>
                  <td className="p-3 font-semibold text-white whitespace-nowrap">{stk.name}</td>
                  <td className="p-3 text-slate-300 max-w-xs truncate">{stk.title}</td>
                  <td className="p-3 text-slate-400">{stk.department}</td>
                  <td className="p-3 font-mono font-bold">{stk.power}%</td>
                  <td className="p-3 font-mono font-bold">{stk.interest}%</td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                        stk.quadrant === 'Manage Closely'
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50'
                          : stk.quadrant === 'Keep Satisfied'
                          ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                          : stk.quadrant === 'Keep Informed'
                          ? 'bg-indigo-950 text-indigo-300 border-indigo-500/50'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {stk.quadrant}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="font-mono text-xs font-bold text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {stk.raci}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
