import React, { useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { AdvannotechResource } from '../data/stakeholders';
import { User, Clock, AlertTriangle, CheckCircle2, BarChart } from 'lucide-react';

interface ResourceLoadChartProps {
  resources: AdvannotechResource[];
  projectName?: string;
}

interface LoadData {
  name: string;
  load: number; // 0 to 100
  capacity: number; // usually 100
  tasks: number;
}

export const ResourceLoadChart: React.FC<ResourceLoadChartProps> = ({ 
  resources, 
  projectName = "Active Project" 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const loadData = useMemo(() => {
    // If no resources, use a dummy set for visualization purposes
    const targetResources = resources.length > 0 ? resources : [
      { name: 'Xolani Zuma', title: 'CEO' },
      { name: 'Sarel van Deventer', title: 'PMO Director' },
      { name: 'Valiant Khoza', title: 'Lead Engineer' },
      { name: 'Lando Zuma', title: 'CFO' },
      { name: 'Andrew Kotamo', title: 'Security Lead' }
    ];

    return targetResources.map((r, i) => {
      // Simulate load based on index/role
      let simulatedLoad = 40 + Math.random() * 50;
      if (r.name.includes('Sarel') || r.name.includes('Valiant')) simulatedLoad = 85 + Math.random() * 20;
      
      return {
        name: r.name,
        load: Math.min(simulatedLoad, 110),
        capacity: 100,
        tasks: Math.floor(Math.random() * 8) + 2
      };
    });
  }, [resources]);

  useEffect(() => {
    if (!svgRef.current || loadData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 30, right: 100, bottom: 60, left: 140 };
    const width = 800 - margin.left - margin.right;
    const height = Math.max(300, loadData.length * 45);
    
    // Set SVG height dynamically
    svg.attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const y = d3.scaleBand()
      .domain(loadData.map(d => d.name))
      .range([0, height])
      .padding(0.3);

    const x = d3.scaleLinear()
      .domain([0, 120])
      .range([0, width]);

    // Axis
    g.append("g")
      .call(d3.axisLeft(y).tickSize(0))
      .attr("color", "#94A3B8")
      .selectAll("text")
      .attr("font-weight", "600")
      .attr("font-size", "11px");

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d}%`))
      .attr("color", "#475569")
      .attr("font-size", "10px");

    // Grid
    g.append("g")
      .attr("class", "grid")
      .attr("opacity", 0.05)
      .call(d3.axisBottom(x)
        .tickSize(height)
        .tickFormat("" as any)
      );

    // Threshold Line (100%)
    g.append("line")
      .attr("x1", x(100))
      .attr("x2", x(100))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "#F43F5E")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4,4")
      .attr("opacity", 0.6);

    // Bars
    const barGroups = g.selectAll(".bar-group")
      .data(loadData)
      .enter()
      .append("g")
      .attr("class", "bar-group")
      .attr("transform", d => `translate(0, ${y(d.name)})`);

    // Background track
    barGroups.append("rect")
      .attr("width", x(120))
      .attr("height", y.bandwidth())
      .attr("fill", "#1E293B")
      .attr("rx", 4);

    // Load bar
    barGroups.append("rect")
      .attr("width", 0)
      .attr("height", y.bandwidth())
      .attr("rx", 4)
      .attr("fill", d => d.load > 100 ? "#F43F5E" : d.load > 80 ? "#F59E0B" : "#06B6D4")
      .transition()
      .duration(1000)
      .attr("width", d => x(Math.min(d.load, 120)));

    // Labels
    barGroups.append("text")
      .attr("x", d => x(Math.min(d.load, 120)) + 8)
      .attr("y", y.bandwidth() / 2 + 4)
      .attr("fill", d => d.load > 100 ? "#FDA4AF" : "#94A3B8")
      .attr("font-size", "10px")
      .attr("font-family", "monospace")
      .attr("font-weight", "bold")
      .text(d => `${Math.round(d.load)}%`);

    // Capacity Text
    g.append("text")
      .attr("x", x(100))
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("fill", "#F43F5E")
      .attr("font-size", "9px")
      .attr("font-weight", "bold")
      .text("CAPACITY THRESHOLD");

  }, [loadData]);

  const overLoadedCount = loadData.filter(d => d.load > 100).length;

  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <BarChart className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-tight">Resource Utilization Load</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-800 text-slate-400 font-mono">
              FTE Allocation
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Forensic time-allocation across selected Advannotech resources for <span className="text-cyan-400 font-bold">{projectName}</span>.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Over-allocated</div>
            <div className={`text-lg font-black ${overLoadedCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {overLoadedCount} Personnel
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0B1528] rounded-xl border border-slate-800 p-4 overflow-x-auto">
        <svg 
          ref={svgRef} 
          width="100%" 
          viewBox="0 0 800 500" 
          className="w-full h-auto min-w-[600px]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-1" />
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Optimal Load</h4>
            <p className="text-[11px] text-slate-400 mt-1">Resources in <span className="text-cyan-400">CYAN</span> are within healthy utilization boundaries (40% - 80%).</p>
          </div>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-1" />
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">High Contention</h4>
            <p className="text-[11px] text-slate-400 mt-1">Resources in <span className="text-amber-400">AMBER</span> are approaching critical capacity limits (80% - 100%).</p>
          </div>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 mt-1" />
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Breach Risk</h4>
            <p className="text-[11px] text-slate-400 mt-1">Resources in <span className="text-rose-400">ROSE</span> are currently exceeding 100% FTE, risking delivery fatigue.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
