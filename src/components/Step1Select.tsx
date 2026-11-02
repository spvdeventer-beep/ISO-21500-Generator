import React, { useState, useMemo } from 'react';
import {
  FileText,
  CheckCircle2,
  ListOrdered,
  Layers,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckSquare,
  Square,
  AlertCircle,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  Hammer,
  Search,
  BarChart3,
  FolderTree,
  Download
} from 'lucide-react';
import {
  PMIDocumentDefinition,
  DOCUMENT_CATALOGUE,
  getDocumentFieldDefinitions,
  RequiredFieldDef,
  getAllUniqueSectionsAndFields
} from '../data/documents';
import { exportExampleTemplate, exportExampleExcelTemplate } from '../utils/exportUtils';

interface Step1SelectProps {
  selectedDoc: PMIDocumentDefinition | null;
  onSelectDoc: (doc: PMIDocumentDefinition) => void;
  selectedSections: string[];
  onToggleSection: (section: string) => void;
  onSelectAllSections: (select: boolean) => void;
  selectedFields: string[];
  onToggleField: (field: string) => void;
  selectedSubFields: Record<string, string[]>;
  onToggleSubField: (parentField: string, subField: string) => void;
  onSelectAllFields: (select: boolean) => void;
  coveredFields?: Set<string>;
  coveredSections?: Set<string>;
  hasUploadedContent?: boolean;
  onProceed: () => void;
  onOpenAgendas?: () => void;
  reportSettings: {
    type: 'adhoc' | 'progress' | 'steerco';
    verbosity: 'summary' | 'standard' | 'detailed';
    includeGraphics: boolean;
    period?: string;
    customParameters?: string;
  };
  onReportSettingsChange: (settings: any) => void;
}

export const Step1Select: React.FC<Step1SelectProps> = ({
  selectedDoc,
  onSelectDoc,
  selectedSections,
  onToggleSection,
  onSelectAllSections,
  selectedFields,
  onToggleField,
  selectedSubFields,
  onToggleSubField,
  onSelectAllFields,
  coveredFields = new Set(),
  coveredSections = new Set(),
  hasUploadedContent = false,
  onProceed,
  onOpenAgendas,
  reportSettings,
  onReportSettingsChange,
}) => {
  const [expandedFieldSubviews, setExpandedFieldSubviews] = useState<Record<string, boolean>>({});
  const [sectionSearch, setSectionSearch] = useState('');
  const [fieldSearch, setFieldSearch] = useState('');

  const toggleSubFieldView = (fieldName: string) => {
    setExpandedFieldSubviews((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const isCustomMode = selectedDoc?.id === 'custom-doc';
  const isReportGen = selectedDoc?.id === 'report-generator';
  
  const allAvailable = useMemo(() => {
    if (isCustomMode) {
      return getAllUniqueSectionsAndFields();
    }
    return {
      sections: selectedDoc?.requiredSections || [],
      fields: selectedDoc?.requiredFields || []
    };
  }, [isCustomMode, selectedDoc]);

  const fieldDefs = useMemo(() => {
    if (!selectedDoc) return [];
    return getDocumentFieldDefinitions(selectedDoc);
  }, [selectedDoc]);

  const filteredSections = allAvailable.sections.filter(s => 
    s.toLowerCase().includes(sectionSearch.toLowerCase())
  );

  const filteredFieldDefs = fieldDefs.filter(fd => 
    fd.name.toLowerCase().includes(fieldSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Intro Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          {isCustomMode ? <Hammer className="w-5 h-5 text-emerald-400" /> : <FileText className="w-5 h-5 text-cyan-400" />}
          <span>
            {isCustomMode 
              ? 'Build Your Own Document: Assemble Bespoke Governance Artifact' 
              : 'Step 1: Select Governance Document & Customize Requirements'}
          </span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          {isCustomMode 
            ? 'Select any combination of mandatory sections and information fields from across the entire PMI catalogue to create a custom project document.'
            : 'Pick your formal PMI artifact, and customize the mandatory sections, required fields, and sub-fields for this iteration.'}
        </p>
      </div>

      {/* Report Generator Configuration (Visible ONLY if Report Generator is selected) */}
      {isReportGen && (
        <div className="bg-[#0F172A] border border-sky-500/40 rounded-xl p-5 shadow-lg shadow-sky-950/20 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Report Generator Configuration</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Report Type</label>
              <select 
                value={reportSettings.type}
                onChange={(e) => onReportSettingsChange({...reportSettings, type: e.target.value})}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="progress">Progress Report (vs Schedule)</option>
                <option value="steerco">Steerco Executive Report</option>
                <option value="adhoc">Ad-Hoc Specialized Report</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Verbosity Level</label>
              <select 
                value={reportSettings.verbosity}
                onChange={(e) => onReportSettingsChange({...reportSettings, verbosity: e.target.value})}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="summary">Summary Report (Executive Only)</option>
                <option value="standard">Standard Report (General)</option>
                <option value="detailed">Detailed Forensic Report</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Reporting Period</label>
              <input 
                type="text"
                placeholder="e.g. Oct 2026 - Nov 2026"
                value={reportSettings.period || ''}
                onChange={(e) => onReportSettingsChange({...reportSettings, period: e.target.value})}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div 
                onClick={() => onReportSettingsChange({...reportSettings, includeGraphics: !reportSettings.includeGraphics})}
                className={`w-10 h-5 rounded-full relative transition-colors ${reportSettings.includeGraphics ? 'bg-sky-500' : 'bg-slate-800'}`}
              >
                <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${reportSettings.includeGraphics ? 'translate-x-5' : ''}`} />
              </div>
              <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">Include Analytical Graphics & Charts</span>
            </label>
          </div>

          {reportSettings.type === 'adhoc' && (
            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Custom Report Parameters</label>
              <textarea 
                placeholder="Define specialized parameters for this ad-hoc report..."
                value={reportSettings.customParameters || ''}
                onChange={(e) => onReportSettingsChange({...reportSettings, customParameters: e.target.value})}
                className="w-full h-20 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          )}
        </div>
      )}



      {selectedDoc ? (
        // Selected Document Overview Card with Section & Field Selectors
        <div className={`bg-[#0F172A] border rounded-xl p-6 shadow-lg transition-all space-y-6 ${
          isCustomMode ? 'border-emerald-500/40 shadow-emerald-950/20' : 'border-cyan-500/40 shadow-cyan-950/20'
        }`}>
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
                  isCustomMode 
                    ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300' 
                    : 'bg-cyan-950 border-cyan-500/40 text-cyan-300'
                }`}>
                  {isCustomMode ? 'Bespoke Composition' : `${selectedDoc.phase} Phase`}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {isCustomMode ? 'Cross-Lifecycle Artifact' : 'Standard PMBOK 7th Specification'}
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                {selectedDoc.title}
              </h3>
              <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
                {selectedDoc.purpose}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {onOpenAgendas && !isCustomMode && (
                <button
                  onClick={onOpenAgendas}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                  title="View suggested meeting agendas"
                >
                  <CalendarCheck className="w-4 h-4 text-cyan-400" />
                  <span>Suggested Agendas</span>
                </button>
              )}

              <button
                onClick={onProceed}
                className={`flex items-center gap-2 px-5 py-2.5 font-bold text-sm rounded-lg shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0 ${
                  isCustomMode 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20' 
                    : 'bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 shadow-cyan-500/20'
                }`}
              >
                <span>Attach Source Material</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Template & Offline Tool Access (Individual Download Options) */}
          {!isCustomMode && selectedDoc && (
            <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Example Templates & Offline Tools</h4>
                  <p className="text-[10px] text-slate-400">Download formatted Word or Excel templates for this specific artifact to populate offline.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportExampleTemplate(selectedDoc, 'docx')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-500/30 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Word Template (.docx)</span>
                </button>
                <button
                  onClick={() => exportExampleExcelTemplate(selectedDoc)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Field Register (.xlsx)</span>
                </button>
              </div>
            </div>
          )}

          {/* Uploaded Material Coverage Alert Notice (if content exists) */}
          {hasUploadedContent && (
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span>
                  Items highlighted in <strong className="text-rose-400">RED</strong> are NOT covered by currently uploaded content.
                </span>
              </span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Covered from source
              </span>
            </div>
          )}

          {/* Sections & Fields Interactive Checkbox Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Mandatory Document Sections Checkbox List */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Sections ({selectedSections.length}{isCustomMode ? '' : `/${allAvailable.sections.length}`})</span>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    onClick={() => onSelectAllSections(true)}
                    className="text-cyan-400 hover:text-cyan-300 cursor-pointer"
                  >
                    All
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    onClick={() => onSelectAllSections(false)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    None
                  </button>
                </div>
              </div>

              {isCustomMode && (
                <div className="space-y-2 mb-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2" />
                    <input 
                      type="text"
                      placeholder="Search sections..."
                      value={sectionSearch}
                      onChange={(e) => setSectionSearch(e.target.value)}
                      className="w-full pl-7 pr-2 py-1.5 bg-slate-950/50 border border-slate-800 rounded text-[10px] text-white focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  {sectionSearch && (
                    <div className="flex items-center gap-2 text-[10px] px-1">
                      <button 
                        onClick={() => {
                          filteredSections.forEach(s => {
                            if (!selectedSections.includes(s)) onToggleSection(s);
                          });
                        }}
                        className="text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
                      >
                        Select All Matches
                      </button>
                      <span className="text-slate-700">|</span>
                      <button 
                        onClick={() => {
                          filteredSections.forEach(s => {
                            if (selectedSections.includes(s)) onToggleSection(s);
                          });
                        }}
                        className="text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        Deselect All Matches
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[380px] pr-1">
                {filteredSections.map((sec, idx) => {
                  const isChecked = selectedSections.includes(sec);
                  const isCovered = coveredSections.has(sec);

                  return (
                    <div
                      key={idx}
                      onClick={() => onToggleSection(sec)}
                      className={`flex items-start gap-2.5 p-2 rounded-md transition-colors text-xs cursor-pointer ${
                        isChecked
                          ? 'bg-slate-950/80 text-slate-200 hover:bg-slate-950'
                          : 'text-slate-500 hover:bg-slate-900/40'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="leading-tight font-medium">{sec}</span>
                      </div>

                      {/* Coverage indicator */}
                      {hasUploadedContent && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase shrink-0 ${
                            isCovered
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                              : 'bg-rose-950 text-rose-400 border border-rose-500/50'
                          }`}
                        >
                          {isCovered ? 'Covered' : 'Not Covered'}
                        </span>
                      )}
                    </div>
                  );
                })}
                {filteredSections.length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-xs italic">
                    No sections matching your search.
                  </div>
                )}
              </div>
            </div>

            {/* 2. Required Information Fields & Sub-Fields Checkbox List */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-300 uppercase tracking-wider">
                  <ListOrdered className="w-4 h-4 text-sky-400" />
                  <span>Fields ({selectedFields.length}{isCustomMode ? '' : `/${fieldDefs.length}`})</span>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    onClick={() => onSelectAllFields(true)}
                    className="text-sky-400 hover:text-sky-300 cursor-pointer"
                  >
                    All
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    onClick={() => onSelectAllFields(false)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    None
                  </button>
                </div>
              </div>

              {isCustomMode && (
                <div className="space-y-2 mb-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2" />
                    <input 
                      type="text"
                      placeholder="Search fields..."
                      value={fieldSearch}
                      onChange={(e) => setFieldSearch(e.target.value)}
                      className="w-full pl-7 pr-2 py-1.5 bg-slate-950/50 border border-slate-800 rounded text-[10px] text-white focus:outline-none focus:border-sky-500/50"
                    />
                  </div>
                  {fieldSearch && (
                    <div className="flex items-center gap-2 text-[10px] px-1">
                      <button 
                        onClick={() => {
                          filteredFieldDefs.forEach(fd => {
                            if (!selectedFields.includes(fd.name)) onToggleField(fd.name);
                          });
                        }}
                        className="text-sky-400 hover:text-sky-300 font-bold cursor-pointer"
                      >
                        Select All Matches
                      </button>
                      <span className="text-slate-700">|</span>
                      <button 
                        onClick={() => {
                          filteredFieldDefs.forEach(fd => {
                            if (selectedFields.includes(fd.name)) onToggleField(fd.name);
                          });
                        }}
                        className="text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        Deselect All Matches
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex-1 space-y-2 overflow-y-auto max-h-[380px] pr-1">
                {filteredFieldDefs.map((fieldDef, idx) => {
                  const isChecked = selectedFields.includes(fieldDef.name);
                  const isExpanded = !!expandedFieldSubviews[fieldDef.name];
                  const hasSubFields = fieldDef.subFields && fieldDef.subFields.length > 0;
                  const activeSubFields = selectedSubFields[fieldDef.name] || [];
                  const isCovered = coveredFields.has(fieldDef.name);

                  return (
                    <div
                      key={idx}
                      className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/60"
                    >
                      {/* Parent field row */}
                      <div className="flex items-center justify-between p-2 hover:bg-slate-900/60 transition-colors">
                        <div
                          onClick={() => onToggleField(fieldDef.name)}
                          className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer text-xs"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-sky-400 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600 shrink-0" />
                          )}
                          <span
                            className={`font-semibold truncate ${
                              isChecked ? 'text-slate-200' : 'text-slate-500'
                            }`}
                          >
                            {fieldDef.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {hasUploadedContent && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                isCovered
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                                  : 'bg-rose-950 text-rose-400 border border-rose-500/50'
                              }`}
                            >
                              {isCovered ? 'Covered' : 'Not Covered'}
                            </span>
                          )}

                          {hasSubFields && (
                            <button
                              onClick={() => toggleSubFieldView(fieldDef.name)}
                              className="text-[10px] text-slate-400 hover:text-cyan-300 font-mono px-1 py-0.5 rounded hover:bg-slate-800 flex items-center gap-0.5 cursor-pointer"
                              title="Toggle sub-fields"
                            >
                              <span>{activeSubFields.length} sub</span>
                              {isExpanded ? (
                                <ChevronDown className="w-3 h-3" />
                              ) : (
                                <ChevronRight className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Sub-fields accordion */}
                      {hasSubFields && isExpanded && (
                        <div className="bg-slate-900/80 px-4 py-2 border-t border-slate-800 space-y-1.5">
                          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                            Sub-Fields
                          </div>
                          {fieldDef.subFields?.map((sub, sIdx) => {
                            const isSubChecked = activeSubFields.includes(sub);
                            return (
                              <div
                                key={sIdx}
                                onClick={() => onToggleSubField(fieldDef.name, sub)}
                                className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer py-0.5"
                              >
                                {isSubChecked ? (
                                  <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                                ) : (
                                  <Square className="w-3.5 h-3.5 text-slate-600" />
                                )}
                                <span className={isSubChecked ? 'text-slate-300' : 'text-slate-500'}>
                                  {sub}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                {filteredFieldDefs.length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-xs italic">
                    No fields matching your search.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer proceed bar */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className={`w-4 h-4 ${isCustomMode ? 'text-emerald-400' : 'text-cyan-400'}`} />
              <span>
                Configured: <strong className="text-white">{selectedSections.length} sections</strong> and{' '}
                <strong className="text-white">{selectedFields.length} required fields</strong>
              </span>
            </div>

            <button
              onClick={onProceed}
              className={`flex items-center gap-2 px-5 py-2 font-bold rounded-lg shadow-md transition-all cursor-pointer ${
                isCustomMode 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20' 
                  : 'bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 shadow-cyan-500/20'
              }`}
            >
              <span>Attach Source Material</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      ) : (
        // Prompt to select from sidebar
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-8 text-center max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-white">Select a PMI Document</h3>
          <p className="text-xs text-slate-400">
            Select a document from the left catalogue to customize sections, fields, and sub-fields.
          </p>
        </div>
      )}
    </div>
  );
};
