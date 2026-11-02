import React, { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Network, 
  Users, 
  AlertTriangle, 
  Link as LinkIcon, 
  Info,
  Maximize2
} from 'lucide-react';
import { MatrixStakeholder, ProjectRisk } from '../data/projectRegisters';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'stakeholder' | 'risk' | 'governance';
  val: number;
  color: string;
  group: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  value: number;
  label: string;
}

interface DependencyNetworkProps {
  stakeholders: MatrixStakeholder[];
  risks: ProjectRisk[];
  projectName: string;
}

export const DependencyNetwork: React.FC<DependencyNetworkProps> = ({
  stakeholders,
  risks,
  projectName
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const graphData = useMemo(() => {
    const nodes: Node[] = [];
    const links: Link[] = [];

    // Add Stakeholder Nodes
    stakeholders.forEach(s => {
      nodes.push({
        id: `stk-${s.id}`,
        name: s.name,
        type: 'stakeholder',
        val: 10 + (s.power / 10),
        color: s.quadrant === 'Manage Closely' ? '#06B6D4' : '#6366F1',
        group: s.department
      });
    });

    // Add Risk Nodes
    risks.forEach(r => {
      nodes.push({
        id: `rsk-${r.id}`,
        name: r.title,
        type: 'risk',
        val: 8 + (r.score / 2),
        color: r.ragStatus === 'RED' ? '#F43F5E' : '#F59E0B',
        group: r.category
      });

      // Link Risk to its Owner (Stakeholder)
      const owner = stakeholders.find(s => 
        r.owner.toLowerCase().includes(s.name.toLowerCase()) || 
        s.name.toLowerCase().includes(r.owner.toLowerCase())
      );
      
      if (owner) {
        links.push({
          source: `rsk-${r.id}`,
          target: `stk-${owner.id}`,
          value: 2,
          label: 'Mitigation Ownership'
        });
      }

      // If risk is critical, link to Executive Sponsors
      if (r.score >= 15) {
        stakeholders.filter(s => s.department === 'Executive').forEach(exec => {
          links.push({
            source: `rsk-${r.id}`,
            target: `stk-${exec.id}`,
            value: 1,
            label: 'Escalation'
          });
        });
      }
    });

    // Cross-functional communication links (Stakeholders in same department)
    const depts = new Set(stakeholders.map(s => s.department));
    depts.forEach(dept => {
      const deptStks = stakeholders.filter(s => s.department === dept);
      for (let i = 0; i < deptStks.length; i++) {
        for (let j = i + 1; j < deptStks.length; j++) {
          links.push({
            source: `stk-${deptStks[i].id}`,
            target: `stk-${deptStks[j].id}`,
            value: 0.5,
            label: 'Dept Alignment'
          });
        }
      }
    });

    return { nodes, links };
  }, [stakeholders, risks]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = 500;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const simulation = d3.forceSimulation<Node>(graphData.nodes)
      .force('link', d3.forceLink<Node, Link>(graphData.links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => (d as any).val + 10));

    const g = svg.append('g');

    // Add drag behavior
    const drag = d3.drag<any, Node>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    const link = g.append('g')
      .selectAll('line')
      .data(graphData.links)
      .enter().append('line')
      .attr('stroke', '#334155')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.value))
      .attr('stroke-dasharray', d => d.label === 'Escalation' ? '4 2' : 'none');

    const node = g.append('g')
      .selectAll('g')
      .data(graphData.nodes)
      .enter().append('g')
      .call(drag);

    node.append('circle')
      .attr('r', d => d.val)
      .attr('fill', d => d.color)
      .attr('stroke', '#0B1528')
      .attr('stroke-width', 2);

    node.append('text')
      .text(d => d.name)
      .attr('x', d => d.val + 5)
      .attr('y', 4)
      .attr('fill', '#94A3B8')
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .attr('pointer-events', 'none')
      .attr('class', 'select-none');

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as Node).x!)
        .attr('y1', d => (d.source as Node).y!)
        .attr('x2', d => (d.target as Node).x!)
        .attr('y2', d => (d.target as Node).y!);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Zoom/Pan behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

  }, [graphData]);

  return (
    <div className="bg-[#0B1528] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="bg-slate-900/80 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-tight">Project Dependency & Communication Network</h3>
            <p className="text-[10px] text-slate-400 mt-0.5 italic">D3 Visualization of cross-functional links derived from Governance Registers</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            <Maximize2 className="w-3 h-3" />
            Zoom & Pan Enabled
          </span>
        </div>
      </div>

      <div ref={containerRef} className="relative w-full h-[500px] cursor-grab active:cursor-grabbing">
        <svg ref={svgRef} className="w-full h-full" />
        
        {/* Legend */}
        <div className="absolute bottom-4 left-6 p-3 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2 text-[10px] pointer-events-none">
          <div className="font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-1 mb-1">Entity Legend</div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" />
            <span className="text-slate-300">Key Stakeholder</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" />
            <span className="text-slate-300">Project Contributor</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]" />
            <span className="text-slate-300">Critical Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <span className="text-slate-300">Standard Risk</span>
          </div>
        </div>

        {/* Link Legend */}
        <div className="absolute bottom-4 right-6 p-3 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2 text-[10px] pointer-events-none text-right">
          <div className="font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-1 mb-1">Link Taxonomy</div>
          <div className="flex items-center justify-end gap-2">
            <span className="text-slate-300">Governance Escalation</span>
            <span className="w-6 h-px bg-slate-500 border-t border-dashed" />
          </div>
          <div className="flex items-center justify-end gap-2">
            <span className="text-slate-300">Mitigation Ownership</span>
            <span className="w-6 h-0.5 bg-slate-600" />
          </div>
          <div className="flex items-center justify-end gap-2">
            <span className="text-slate-300">Cross-Functional Sync</span>
            <span className="w-6 h-px bg-slate-700" />
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-900/40 border-t border-slate-800 flex items-start gap-4">
        <Info className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-slate-400 leading-relaxed italic">
          Audit Insight: This map dynamically clusters nodes by department and risk severity. Dashed links indicate automated escalation paths to the Steering Committee (Xolani Zuma / Lando Zuma) based on Critical Risk scoring (&gt;15). 
          Node size is weight-adjusted based on PMBOK power/interest and Risk Impact scores.
        </p>
      </div>
    </div>
  );
};
