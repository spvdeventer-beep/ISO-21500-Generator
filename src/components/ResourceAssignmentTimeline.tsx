import React, { useMemo } from 'react';
import { Calendar, Users, Clock, ChevronRight } from 'lucide-react';
import { AdvannotechResource } from '../data/stakeholders';

interface ResourceTimelineProps {
  resources: AdvannotechResource[];
  startDate: string;
  projectName: string;
}

export const ResourceAssignmentTimeline: React.FC<ResourceTimelineProps> = ({
  resources,
  startDate,
  projectName
}) => {
  const baseDate = useMemo(() => new Date(startDate || Date.now()), [startDate]);
  
  // Generate schedule data based on resources and start date
  const scheduleData = useMemo(() => {
    return resources.map((res, idx) => {
      // Logic: Different roles get different durations/offsets to look like a Gantt
      const role = (res as any).governanceRole || 'Responsible';
      let duration = 90;
      let offset = 0;

      if (role.includes('Accountable')) { duration = 120; offset = 0; }
      else if (role.includes('Responsible')) { duration = 80; offset = 10; }
      else if (role.includes('Consulted')) { duration = 40; offset = 20; }
      else if (role.includes('Informed')) { duration = 120; offset = 0; }
      else { duration = 60; offset = 15; }

      const start = new Date(baseDate);
      start.setDate(start.getDate() + offset + (idx * 2)); // Add slight stagger
      const end = new Date(start);
      end.setDate(end.getDate() + duration);

      return {
        resource: res,
        start,
        end,
        duration,
        progress: Math.min(100, Math.floor(Math.random() * 60) + 20),
        color: role.includes('Accountable') ? 'bg-cyan-500' : 
               role.includes('Responsible') ? 'bg-sky-500' : 
               role.includes('Consulted') ? 'bg-indigo-500' : 'bg-slate-500'
      };
    });
  }, [resources, baseDate]);

  const totalDays = 150; // Visual window

  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="bg-slate-900/90 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Resource Assignment Timeline</h3>
            <p className="text-[10px] text-slate-400 font-mono uppercase">{projectName} · Forensic Schedule Visualization</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            <span>Active Assignment</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <span>Baseline Period</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px] p-6">
          {/* Timeline Header (Months) */}
          <div className="flex mb-4 border-b border-slate-800 pb-2">
            <div className="w-64 shrink-0 font-bold text-[10px] text-slate-500 uppercase">Resource / Capacity</div>
            <div className="flex-1 flex text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-1 border-l border-slate-800/50 pl-2">Month {i + 1}</div>
              ))}
            </div>
          </div>

          {/* Gantt Rows */}
          <div className="space-y-4">
            {scheduleData.map((item, idx) => {
              const startOffsetPercent = (item.start.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24) / totalDays * 100;
              const widthPercent = item.duration / totalDays * 100;

              return (
                <div key={idx} className="flex items-center group">
                  {/* Left Label */}
                  <div className="w-64 shrink-0 pr-4">
                    <div className="text-xs font-bold text-white truncate">{item.resource.name}</div>
                    <div className="text-[10px] text-cyan-400/80 truncate leading-tight">{item.resource.title}</div>
                  </div>

                  {/* Right Bar Area */}
                  <div className="flex-1 h-8 bg-slate-900/50 rounded-lg relative overflow-hidden border border-slate-800/50">
                    {/* Vertical grid lines */}
                    <div className="absolute inset-0 flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex-1 border-r border-slate-800/30" />
                      ))}
                    </div>

                    {/* Task Bar */}
                    <div 
                      className={`absolute top-1 bottom-1 rounded-md shadow-lg flex items-center px-2 min-w-[40px] group-hover:brightness-110 transition-all ${item.color}`}
                      style={{ 
                        left: `${Math.max(0, startOffsetPercent)}%`, 
                        width: `${Math.min(100, widthPercent)}%` 
                      }}
                    >
                      <span className="text-[9px] font-black text-slate-950 truncate whitespace-nowrap uppercase">
                        {item.duration}D Assignment
                      </span>
                      
                      {/* Progress inner bar */}
                      <div 
                        className="absolute bottom-0 left-0 h-0.5 bg-slate-950/30" 
                        style={{ width: `${item.progress}%` }} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer baseline */}
          <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-800">
            <div className="text-[10px] text-slate-500 italic">
              * Timeline generated from {resources.length} assigned resources starting {baseDate.toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{resources.length} Total Heads</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
