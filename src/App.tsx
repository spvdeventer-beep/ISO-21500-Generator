/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Stepper, StepNumber } from './components/Stepper';
import { StartupAnimation } from './components/StartupAnimation';
import { Step1Select } from './components/Step1Select';
import { Step2Source } from './components/Step2Source';
import {
  Step3Clarify,
  FoundItem,
  MissingItem,
  UncertainItem,
  ClarificationAnswer
} from './components/Step3Clarify';
import { Step4Generate } from './components/Step4Generate';
import { Step5Review, AuditData } from './components/Step5Review';
import { ReviewExistingDocView } from './components/ReviewExistingDocView';
import { MultiDocIsoReportView } from './components/MultiDocIsoReportView';
import { MeetingAgendaModal } from './components/MeetingAgendaModal';
import { DesignDocumentModal } from './components/DesignDocumentModal';
import { AuditWarningModal } from './components/AuditWarningModal';
import { AuditReadinessSummary } from './components/AuditReadinessSummary';
import { StakeholderImpactModal } from './components/StakeholderImpactModal';
import { TimelineVerificationModal } from './components/TimelineVerificationModal';
import { IsoFolderStructureModal } from './components/IsoFolderStructureModal';
import { GovernanceGutter } from './components/GovernanceGutter';
import { synthesizeDocumentFromSource } from './utils/documentSynthesizer';
import { ArrowRight } from 'lucide-react';
import {
  PMIDocumentDefinition,
  DOCUMENT_CATALOGUE,
  getDocumentFieldDefinitions,
  CUSTOM_DOCUMENT_DEFINITION,
  getAllUniqueSectionsAndFields,
  getAdaptedDocument,
  PMStandard
} from './data/documents';
import { ADVANNOTECH_STAKEHOLDERS, AdvannotechResource } from './data/stakeholders';
import { ExtractedFile, parseFileClientSide } from './utils/fileParsers';
import { downloadIso21500Zip } from './utils/isoZipExporter';

/**
 * Generate a formal Advannotech session Document ID: ADV-DOC-YYMMDD-####
 */
function generateDocumentId(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ADV-DOC-${yy}${mm}${dd}-${rand}`;
}

export default function App() {
  // Brand Intro Animation State
  const [showIntro, setShowIntro] = useState(true);

  // Stepper state
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [maxAvailableStep, setMaxAvailableStep] = useState<StepNumber>(1);

  // Document metadata state
  const [selectedDoc, setSelectedDoc] = useState<PMIDocumentDefinition | null>(
    DOCUMENT_CATALOGUE[0] // Default to Project Charter
  );
  const [docCode, setDocCode] = useState<string>(generateDocumentId());
  const [date] = useState<string>(new Date().toISOString().split('T')[0]);
  const [projectName, setProjectName] = useState<string>('Enterprise Governance Initiative');

  // Advannotech Resources state
  const [selectedResources, setSelectedResources] = useState<AdvannotechResource[]>([]);

  // Mandatory Sections, Required Fields, and Sub-fields selection state (Default: ALL selected)
  const [selectedSections, setSelectedSections] = useState<string[]>(() => {
    return DOCUMENT_CATALOGUE[0]?.requiredSections || [];
  });
  const [selectedFields, setSelectedFields] = useState<string[]>(() => {
    return DOCUMENT_CATALOGUE[0]?.requiredFields || [];
  });
  const [selectedSubFields, setSelectedSubFields] = useState<Record<string, string[]>>(() => {
    const initialDefs = getDocumentFieldDefinitions(DOCUMENT_CATALOGUE[0]);
    const mapping: Record<string, string[]> = {};
    initialDefs.forEach((fd) => {
      mapping[fd.name] = fd.subFields ? [...fd.subFields] : [];
    });
    return mapping;
  });

  // Step 2: In-memory source artifacts
  const [files, setFiles] = useState<ExtractedFile[]>([]);
  const [pastedText, setPastedText] = useState<string>('');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');

  // Step 3: Gap analysis state
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [missingItems, setMissingItems] = useState<MissingItem[]>([]);
  const [uncertainItems, setUncertainItems] = useState<UncertainItem[]>([]);
  const [answers, setAnswers] = useState<Record<string, ClarificationAnswer>>({});
  const [isAnalyzingGaps, setIsAnalyzingGaps] = useState<boolean>(false);

  // Step 4: Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Step 5: Review & Audit state
  const [generatedMarkdown, setGeneratedMarkdown] = useState<string>('');
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [isRefining, setIsRefining] = useState<boolean>(false);

  // Application Mode: 'generate' (Standard 5-step generator) | 'audit-existing' (Review existing document) | 'multi-doc-report' (ISO Multi-Document Reporting)
  const [appMode, setAppMode] = useState<'generate' | 'audit-existing' | 'multi-doc-report'>('generate');

  // Selected Management Standard
  const [selectedStandard, setSelectedStandard] = useState<PMStandard>('PMBOK 7');

  // Suggested Meeting Agenda Modal State
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState<boolean>(false);

  // Technical Design Document & Prompt Modal State
  const [isDesignDocModalOpen, setIsDesignDocModalOpen] = useState<boolean>(false);

  // Stakeholder Impact Matrix Modal State
  const [isStakeholderModalOpen, setIsStakeholderModalOpen] = useState<boolean>(false);

  // Audit Warning Modal State
  const [isAuditWarningOpen, setIsAuditWarningOpen] = useState<boolean>(false);
  const [pendingQuickGenerateDoc, setPendingQuickGenerateDoc] = useState<PMIDocumentDefinition | null>(null);

  // Audit Readiness Summary Modal State
  const [isReadinessModalOpen, setIsReadinessModalOpen] = useState<boolean>(false);

  // ISO 21500 Standard Folder Structure Modal State
  const [isIsoModalOpen, setIsIsoModalOpen] = useState<boolean>(false);

  // Custom Company Logo (Base64)
  const [customLogo, setCustomLogo] = useState<string | null>(null);

  // Meeting Minute Generator Distribution State
  const [meetingDistribution, setMeetingDistribution] = useState<'internal' | 'external'>('external');

  // Uploaded Template (Metadata only for now, or text content if small)
  const [uploadedTemplate, setUploadedTemplate] = useState<{ name: string; text: string } | null>(null);

  // Report Generator Settings
  const [reportSettings, setReportSettings] = useState<{
    type: 'adhoc' | 'progress' | 'steerco';
    verbosity: 'summary' | 'standard' | 'detailed';
    includeGraphics: boolean;
    period?: string;
    customParameters?: string;
  }>({
    type: 'progress',
    verbosity: 'standard',
    includeGraphics: true
  });

  // Timeline Verification State
  const [isTimelineVerificationOpen, setIsTimelineVerificationOpen] = useState<boolean>(false);
  const [verifiedTimelineData, setVerifiedTimelineData] = useState<Record<string, string> | null>(null);

  // Stakeholder Matrix State (Power vs Interest)
  const [stakeholderMatrix, setStakeholderMatrix] = useState<any[]>([]);

  // Project Risks & Assumptions Registers
  const [projectRisks, setProjectRisks] = useState<any[]>([]);
  const [projectAssumptions, setProjectAssumptions] = useState<any[]>([]);

  // Seed initial registers if empty
  React.useEffect(() => {
    if (stakeholderMatrix.length === 0 || projectRisks.length === 0 || projectAssumptions.length === 0) {
      import('./data/projectRegisters').then(({ INITIAL_STAKEHOLDERS, INITIAL_RISKS, INITIAL_ASSUMPTIONS }) => {
        if (stakeholderMatrix.length === 0) setStakeholderMatrix(INITIAL_STAKEHOLDERS);
        if (projectRisks.length === 0) setProjectRisks(INITIAL_RISKS);
        if (projectAssumptions.length === 0) setProjectAssumptions(INITIAL_ASSUMPTIONS);
      });
    }
  }, []);

  // --- Local Storage Persistence ---
  
  // Load initial state from localStorage
  React.useEffect(() => {
    const savedData = localStorage.getItem('advannotech_session');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.currentStep) setCurrentStep(data.currentStep);
        if (data.maxAvailableStep) setMaxAvailableStep(data.maxAvailableStep);
        if (data.selectedDocId) {
          const doc = DOCUMENT_CATALOGUE.find(d => d.id === data.selectedDocId) || 
                      (data.selectedDocId === 'custom-doc' ? CUSTOM_DOCUMENT_DEFINITION : null);
          if (doc) setSelectedDoc(doc);
        }
        if (data.docCode) setDocCode(data.docCode);
        if (data.projectName) setProjectName(data.projectName);
        if (data.selectedResources) setSelectedResources(data.selectedResources);
        if (data.selectedSections) setSelectedSections(data.selectedSections);
        if (data.selectedFields) setSelectedFields(data.selectedFields);
        if (data.selectedSubFields) setSelectedSubFields(data.selectedSubFields);
        if (data.files) setFiles(data.files);
        if (data.pastedText) setPastedText(data.pastedText);
        if (data.specialInstructions) setSpecialInstructions(data.specialInstructions);
        if (data.foundItems) setFoundItems(data.foundItems);
        if (data.missingItems) setMissingItems(data.missingItems);
        if (data.uncertainItems) setUncertainItems(data.uncertainItems);
        if (data.answers) setAnswers(data.answers);
        if (data.generatedMarkdown) setGeneratedMarkdown(data.generatedMarkdown);
        if (data.auditData) setAuditData(data.auditData);
        if (data.appMode) setAppMode(data.appMode);
        if (data.selectedStandard) setSelectedStandard(data.selectedStandard);
        if (data.customLogo) setCustomLogo(data.customLogo);
        if (data.uploadedTemplate) setUploadedTemplate(data.uploadedTemplate);
        if (data.reportSettings) setReportSettings(data.reportSettings);
        if (data.stakeholderMatrix) setStakeholderMatrix(data.stakeholderMatrix);
        if (data.projectRisks) setProjectRisks(data.projectRisks);
        if (data.projectAssumptions) setProjectAssumptions(data.projectAssumptions);
      } catch (e) {
        console.error('Failed to restore session from local storage', e);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  React.useEffect(() => {
    const sessionData = {
      currentStep,
      maxAvailableStep,
      selectedDocId: selectedDoc?.id,
      docCode,
      projectName,
      selectedResources,
      selectedSections,
      selectedFields,
      selectedSubFields,
      files,
      pastedText,
      specialInstructions,
      foundItems,
      missingItems,
      uncertainItems,
      answers,
      generatedMarkdown,
      auditData,
      appMode,
      selectedStandard,
      customLogo,
      uploadedTemplate,
      reportSettings
    };
    
    try {
      localStorage.setItem('advannotech_session', JSON.stringify({
        ...sessionData,
        stakeholderMatrix,
        projectRisks,
        projectAssumptions
      }));
    } catch (e: any) {
      if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014) {
        console.warn('Session data exceeds localStorage quota. Switching to lightweight persistence (metadata only).');
        // Fallback: Store metadata but exclude large file texts and large generated markdown if needed
        const lightweightData = {
          ...sessionData,
          files: files.map(f => ({ ...f, text: '[Full text excluded to preserve storage quota]' })),
          pastedText: pastedText.length > 10000 ? pastedText.slice(0, 10000) + '\n\n[... Truncated due to storage limits ...]' : pastedText,
          // Keep a smaller snippet of generated markdown if it's huge
          generatedMarkdown: generatedMarkdown.length > 100000 
            ? generatedMarkdown.slice(0, 50000) + '\n\n[... Remaining content truncated in cache due to storage limits ...]' 
            : generatedMarkdown
        };
        try {
          localStorage.setItem('advannotech_session', JSON.stringify(lightweightData));
        } catch (innerError) {
          console.error('Even lightweight persistence failed. Clearing session cache.', innerError);
          localStorage.removeItem('advannotech_session');
        }
      } else {
        console.error('LocalStorage save failed:', e);
      }
    }
  }, [
    currentStep, maxAvailableStep, selectedDoc, docCode, projectName, 
    selectedResources, selectedSections, selectedFields, selectedSubFields, 
    files, pastedText, specialInstructions, foundItems, missingItems, 
    files, pastedText, specialInstructions, foundItems, missingItems, 
    uncertainItems, answers, generatedMarkdown, auditData, appMode, selectedStandard, customLogo,
    uploadedTemplate, reportSettings
  ]);

  const handleInsertAgenda = useCallback((agendaMd: string) => {
    if (currentStep === 5 || generatedMarkdown) {
      setGeneratedMarkdown((prev) => (prev ? `${prev}\n\n${agendaMd}\n` : agendaMd));
    } else {
      setPastedText((prev) => (prev ? `${prev}\n\n${agendaMd}` : agendaMd));
    }
  }, [currentStep, generatedMarkdown]);

  const handleTransferFromAuditToCanvas = useCallback((doc: PMIDocumentDefinition, markdown: string) => {
    setSelectedDoc(doc);
    setSelectedSections(doc.requiredSections);
    setSelectedFields(doc.requiredFields);
    setGeneratedMarkdown(markdown);
    setMaxAvailableStep(5);
    setCurrentStep(5);
    setAppMode('generate');
  }, []);

  /**
   * Complete memory reset - zero persistence
   */
  const handleClearSession = useCallback(() => {
    if (
      files.length > 0 ||
      pastedText.trim() ||
      generatedMarkdown
    ) {
      const confirmClear = window.confirm(
        'Clear all in-memory data? All uploaded files, answers, and drafts will be permanently wiped.'
      );
      if (!confirmClear) return;
    }

    setFiles([]);
    setPastedText('');
    setSpecialInstructions('');
    setFoundItems([]);
    setMissingItems([]);
    setUncertainItems([]);
    setAnswers({});
    setGeneratedMarkdown('');
    setAuditData(null);
    setCurrentStep(1);
    setMaxAvailableStep(1);
    setDocCode(generateDocumentId());
    setSelectedResources([]);
    setCustomLogo(null);
    setUploadedTemplate(null);
    
    // Reset registers to initial values
    import('./data/projectRegisters').then(({ INITIAL_STAKEHOLDERS, INITIAL_RISKS, INITIAL_ASSUMPTIONS }) => {
      setStakeholderMatrix(INITIAL_STAKEHOLDERS);
      setProjectRisks(INITIAL_RISKS);
      setProjectAssumptions(INITIAL_ASSUMPTIONS);
    });

    // Reset default selections for document 0
    if (DOCUMENT_CATALOGUE[0]) {
      setSelectedDoc(DOCUMENT_CATALOGUE[0]);
      setSelectedSections(DOCUMENT_CATALOGUE[0].requiredSections);
      setSelectedFields(DOCUMENT_CATALOGUE[0].requiredFields);
      const defs = getDocumentFieldDefinitions(DOCUMENT_CATALOGUE[0]);
      const mapping: Record<string, string[]> = {};
      defs.forEach((fd) => {
        mapping[fd.name] = fd.subFields ? [...fd.subFields] : [];
      });
      setSelectedSubFields(mapping);
    }
    
    // Wipe local storage
    localStorage.removeItem('advannotech_session');
  }, [files.length, pastedText, generatedMarkdown]);

  /**
   * Handle selecting a document from catalogue
   */
  const handleSelectDoc = (doc: PMIDocumentDefinition) => {
    const adapted = doc.id === 'custom-doc' ? doc : getAdaptedDocument(doc, selectedStandard);
    setSelectedDoc(adapted);
    if (adapted.id === 'custom-doc') {
      // For custom mode, start with empty selection
      setSelectedSections([]);
      setSelectedFields([]);
      setSelectedSubFields({});
    } else {
      // Default all mandatory sections and required fields to selected
      setSelectedSections([...doc.requiredSections]);
      setSelectedFields([...doc.requiredFields]);
      const defs = getDocumentFieldDefinitions(doc);
      const mapping: Record<string, string[]> = {};
      defs.forEach((fd) => {
        mapping[fd.name] = fd.subFields ? [...fd.subFields] : [];
      });
      setSelectedSubFields(mapping);
    }

    // If we changed document, reset gap analysis & generated doc
    setFoundItems([]);
    setMissingItems([]);
    setUncertainItems([]);
    setAnswers({});
    setGeneratedMarkdown('');
    setAuditData(null);
    setMaxAvailableStep(2);
    setCurrentStep(1);
  };

  /**
   * Advannotech Resource Handlers
   */
  const handleToggleResource = (resource: AdvannotechResource) => {
    setSelectedResources((prev) =>
      prev.some((r) => r.name === resource.name)
        ? prev.filter((r) => r.name !== resource.name)
        : [...prev, resource]
    );
  };

  const handleSelectCoreTeam = () => {
    const core = ADVANNOTECH_STAKEHOLDERS.filter((r) =>
      ['Xolani Zuma', 'Lando Zuma', 'Sarel van Deventer', 'Lunga Myeza', 'Steffen Engelbrecht', '[Client Sponsor Name]', '[Client PM Name]'].includes(r.name)
    );
    setSelectedResources(core);
  };

  const handleClearResources = () => {
    setSelectedResources([]);
  };

  /**
   * Mandatory Section Checkbox Handlers
   */
  const handleToggleSection = (section: string) => {
    setSelectedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const handleSelectAllSections = (select: boolean) => {
    if (!selectedDoc) return;
    if (selectedDoc.id === 'custom-doc') {
      const { sections } = getAllUniqueSectionsAndFields();
      setSelectedSections(select ? sections : []);
    } else {
      setSelectedSections(select ? [...selectedDoc.requiredSections] : []);
    }
  };

  /**
   * Required Information Fields & Sub-Fields Checkbox Handlers
   */
  const handleToggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const handleToggleSubField = (parentField: string, subField: string) => {
    setSelectedSubFields((prev) => {
      const existing = prev[parentField] || [];
      const updated = existing.includes(subField)
        ? existing.filter((sf) => sf !== subField)
        : [...existing, subField];
      return { ...prev, [parentField]: updated };
    });
  };

  const handleSelectAllFields = (select: boolean) => {
    if (!selectedDoc) return;
    
    if (selectedDoc.id === 'custom-doc') {
      const { fields } = getAllUniqueSectionsAndFields();
      setSelectedFields(select ? fields : []);
      if (select) {
        const mapping: Record<string, string[]> = {};
        fields.forEach(f => { mapping[f] = []; });
        setSelectedSubFields(mapping);
      } else {
        setSelectedSubFields({});
      }
    } else {
      setSelectedFields(select ? [...selectedDoc.requiredFields] : []);
      if (select) {
        const defs = getDocumentFieldDefinitions(selectedDoc);
        const mapping: Record<string, string[]> = {};
        defs.forEach((fd) => {
          mapping[fd.name] = fd.subFields ? [...fd.subFields] : [];
        });
        setSelectedSubFields(mapping);
      } else {
        setSelectedSubFields({});
      }
    }
  };

  /**
   * Section Management Handlers (Heatmap-driven)
   */
  const handleAddSection = (sectionTitle: string) => {
    setSelectedSections((prev) => {
      // Logic: Insert before sign-off (last) if possible
      const newSections = [...prev];
      if (newSections.length > 0) {
        newSections.splice(newSections.length - 1, 0, sectionTitle);
      } else {
        newSections.push(sectionTitle);
      }
      return newSections;
    });
  };

  const handleReorderSections = (newOrder: string[]) => {
    setSelectedSections(newOrder);
  };

  /**
   * Helper to calculate lexical coverage ratio for any document
   */
  const calculateDocCoverage = useCallback((doc: PMIDocumentDefinition, combinedText: string): number => {
    if (!combinedText.trim()) return 0;
    
    const text = combinedText.toLowerCase();
    let matches = 0;
    const totalRequired = doc.requiredFields.length + doc.requiredSections.length;
    
    if (totalRequired === 0) return 1;

    // Check Fields
    doc.requiredFields.forEach(field => {
      const cleanField = field.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
      const words = cleanField
        .split(/\s+/)
        .filter((w) => w.length >= 4 && !['project', 'management', 'plan', 'document', 'information'].includes(w));

      if (words.length === 0) {
        if (text.includes(field.toLowerCase().slice(0, 8))) matches++;
      } else {
        const matchCount = words.filter((w) => text.includes(w)).length;
        if (matchCount >= Math.min(2, Math.ceil(words.length / 2))) matches++;
      }
    });

    // Check Sections
    doc.requiredSections.forEach(sec => {
      const cleanSec = sec.replace(/^\d+[\.\)]\s*/, '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
      const words = cleanSec
        .split(/\s+/)
        .filter((w) => w.length >= 4 && !['appendix', 'sources', 'assumptions'].includes(w));

      if (words.length === 0) {
        if (text.includes(cleanSec.slice(0, 8))) matches++;
      } else {
        const matchCount = words.filter((w) => text.includes(w)).length;
        if (matchCount >= 1) matches++;
      }
    });

    return matches / totalRequired;
  }, []);

  /**
   * Calculate readiness for ALL documents based on current source materials
   */
  const documentReadiness = useMemo(() => {
    const combinedText = (files.map((f) => f.text).join(' ') + ' ' + pastedText).toLowerCase();
    const readinessMap: Record<string, 'ready' | 'partial' | 'not-ready'> = {};

    DOCUMENT_CATALOGUE.forEach(doc => {
      const ratio = calculateDocCoverage(doc, combinedText);
      if (ratio >= 0.8) {
        readinessMap[doc.id] = 'ready';
      } else if (ratio > 0) {
        readinessMap[doc.id] = 'partial';
      } else {
        readinessMap[doc.id] = 'not-ready';
      }
    });

    return readinessMap;
  }, [files, pastedText, calculateDocCoverage]);

  /**
   * Coverage Detection Computation
   * Indicates in RED which sections and fields are NOT covered by uploaded content.
   */
  const { coveredFields, coveredSections, hasUploadedContent } = useMemo(() => {
    const hasUploaded = files.length > 0 || pastedText.trim().length > 0;
    const cFields = new Set<string>();
    const cSections = new Set<string>();

    if (!hasUploaded || !selectedDoc) {
      return {
        coveredFields: cFields,
        coveredSections: cSections,
        hasUploadedContent: false,
      };
    }

    const combinedText = (
      files.map((f) => f.text).join(' ') + ' ' + pastedText
    ).toLowerCase();

    // Check foundItems from gap analysis if available
    foundItems.forEach((item) => {
      cFields.add(item.field);
    });

    // Lexical analysis against selectedFields
    selectedFields.forEach((field) => {
      if (cFields.has(field)) return;
      const cleanField = field.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
      const words = cleanField
        .split(/\s+/)
        .filter((w) => w.length >= 4 && !['project', 'management', 'plan', 'document', 'information'].includes(w));

      if (words.length === 0) {
        if (combinedText.includes(field.toLowerCase().slice(0, 8))) {
          cFields.add(field);
        }
      } else {
        const matchCount = words.filter((w) => combinedText.includes(w)).length;
        if (matchCount >= Math.min(2, Math.ceil(words.length / 2))) {
          cFields.add(field);
        }
      }
    });

    // Lexical analysis against selectedSections
    selectedSections.forEach((sec) => {
      const cleanSec = sec.replace(/^\d+[\.\)]\s*/, '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
      const words = cleanSec
        .split(/\s+/)
        .filter((w) => w.length >= 4 && !['appendix', 'sources', 'assumptions'].includes(w));

      if (words.length === 0) {
        if (combinedText.includes(cleanSec.slice(0, 8))) {
          cSections.add(sec);
        }
      } else {
        const matchCount = words.filter((w) => combinedText.includes(w)).length;
        if (matchCount >= 1) {
          cSections.add(sec);
        }
      }
    });

    return {
      coveredFields: cFields,
      coveredSections: cSections,
      hasUploadedContent: true,
    };
  }, [files, pastedText, foundItems, selectedFields, selectedSections, selectedDoc]);

  /**
   * Session Health Score Calculation (0-100)
   * Based on forensic grounding, context volume, and gap resolution status.
   */
  const healthScore = useMemo(() => {
    if (!selectedDoc) return 0;
    
    const totalReq = (selectedSections.length + selectedFields.length) || 1;
    const totalCovered = (coveredSections.size + coveredFields.size);
    
    // 1. Source Grounding Score (max 50 points)
    const coverageRatio = totalCovered / totalReq;
    const coveragePoints = coverageRatio * 50;
    
    // 2. Context Density Score (max 20 points)
    const filePoints = Math.min(files.length * 8, 15);
    const pastePoints = Math.min(Math.floor(pastedText.length / 500) * 2, 5);
    const densityPoints = filePoints + pastePoints;
    
    // 3. Gap Resolution Score (max 30 points)
    let gapPoints = 0;
    const totalGaps = missingItems.length + uncertainItems.length;
    
    if (totalGaps > 0) {
      const resolvedGaps = Object.values(answers).filter(a => a.status === 'answered' || a.status === 'tbc').length;
      gapPoints = (resolvedGaps / totalGaps) * 30;
    } else if (hasUploadedContent) {
      gapPoints = 15;
    }
    
    return Math.min(Math.round(coveragePoints + densityPoints + gapPoints), 100);
  }, [selectedDoc, selectedSections, selectedFields, coveredSections, coveredFields, files, pastedText, missingItems, uncertainItems, answers, hasUploadedContent]);

  /**
   * Detect if any progress data exists in sources (for reports)
   */
  const hasProgressData = useMemo(() => {
    const combined = (files.map(f => f.text).join(' ') + ' ' + pastedText).toLowerCase();
    const keywords = ['progress report', 'status update', 'weekly summary', 'monthly report', 'accomplishments', 'period progress'];
    return keywords.some(k => combined.includes(k));
  }, [files, pastedText]);

  /**
   * Step 2: Add files
   */
  const handleAddFiles = (newFiles: ExtractedFile[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  /**
   * Step 2: Remove a file
   */
  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  /**
   * Compile all extracted source text into a single prompt payload
   */
  const getCombinedSourceText = useCallback((): string => {
    const fileTexts = files.map(
      (f) => `=== Source File: ${f.name} (${f.wordCount} words) ===\n${f.text}\n`
    );
    const pasteSection = pastedText.trim()
      ? `=== User Pasted Notes / Transcripts ===\n${pastedText.trim()}\n`
      : '';
    return [...fileTexts, pasteSection].join('\n\n');
  }, [files, pastedText]);

  /**
   * Run Forensic Gap Analysis against backend Express proxy
   */
  const runGapAnalysis = useCallback(async () => {
    if (!selectedDoc || selectedDoc.id === 'meeting-minutes') return;
    setIsAnalyzingGaps(true);

    try {
      const combinedText = getCombinedSourceText();

      const response = await fetch('/api/gap-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docTitle: selectedDoc.title,
          docPhase: selectedDoc.phase,
          requiredFields: selectedFields,
          sections: selectedSections,
          subFields: selectedSubFields,
          extractedText: combinedText,
          specialInstructions,
        }),
      });

      if (!response.ok) {
        throw new Error(`Gap analysis failed with status: ${response.status}`);
      }

      const data = await response.json();
      setFoundItems(data.found || []);
      setMissingItems(data.missing || []);
      setUncertainItems(data.uncertain || []);

      // Auto-populate registers from source text
      import('./utils/registerExtractors').then(({ autoPopulateRegisters }) => {
        const result = autoPopulateRegisters(combinedText, stakeholderMatrix, projectRisks, projectAssumptions);
        setStakeholderMatrix(result.stakeholders);
        setProjectRisks(result.risks);
        setProjectAssumptions(result.assumptions);
      });

      // Seed answers with existing or defaults
      const initialAnswers: Record<string, ClarificationAnswer> = {};
      (data.missing || []).forEach((m: MissingItem) => {
        initialAnswers[m.field] = { status: 'answered', value: m.suggestedDefault || '' };
      });
      (data.uncertain || []).forEach((u: UncertainItem) => {
        initialAnswers[u.field] = { status: 'answered', value: u.options?.[0] || '' };
      });
      setAnswers(initialAnswers);
    } catch (err: any) {
      console.error('Gap analysis error:', err);
      // Fallback: populate required fields as missing
      setFoundItems([]);
      setMissingItems(
        selectedFields.map((f) => ({
          field: f,
          question: `Please specify the requirements or parameters for ${f}.`,
          hint: `Mandatory PMBOK 7th parameter for ${selectedDoc.title}`,
        }))
      );
      setUncertainItems([]);
    } finally {
      setIsAnalyzingGaps(false);
    }
  }, [selectedDoc, getCombinedSourceText, selectedFields, selectedSections, selectedSubFields, specialInstructions]);

  /**
   * Run Document Generation against backend Express proxy with automatic client-side fallback
   */
  const runGenerate = useCallback(async (verifiedData?: Record<string, string>) => {
    if (!selectedDoc) return;
    
    // Trigger timeline verification first if not provided (Skip for Meeting Minutes Generator)
    if (!verifiedData && !verifiedTimelineData && selectedDoc.id !== 'meeting-minutes') {
      setIsTimelineVerificationOpen(true);
      return;
    }

    const timeline = verifiedData || verifiedTimelineData;
    setIsGenerating(true);
    setGenerationError(null);
    setCurrentStep(4);

    try {
      const combinedText = getCombinedSourceText();

      // Formatted answers summary
      const formattedAnswers: Record<string, string> = {};
      Object.entries(answers).forEach(([field, ans]) => {
        if (ans.status === 'tbc') {
          formattedAnswers[field] = 'TBC – to be confirmed by [Owner]';
        } else if (ans.status === 'na') {
          formattedAnswers[field] = 'Not applicable for this project scope';
        } else {
          formattedAnswers[field] = ans.value;
        }
      });

      let data: any = null;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 65000);
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            docId: selectedDoc.id,
            docTitle: selectedDoc.title,
            docPhase: selectedDoc.phase,
            requiredFields: selectedFields,
            sections: selectedSections,
            subFields: selectedSubFields,
            selectedResources,
            extractedText: combinedText,
            answers: formattedAnswers,
            specialInstructions,
            docCode,
            date,
            projectName,
            uploadedTemplate,
            reportSettings,
            stakeholderMatrix,
            meetingDistribution
          }),
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          data = await response.json();
        }
      } catch (networkErr) {
        console.warn('Backend generate call failed or timed out, switching to client-side synthesis:', networkErr);
      }

      // If backend was unreachable or returned an error, synthesize using client-side engine
      if (!data || !data.markdown) {
        const fallbackResult = synthesizeDocumentFromSource({
          doc: selectedDoc,
          files,
          pastedText,
          answers: formattedAnswers,
          selectedResources,
          selectedSections,
          selectedFields,
          docCode,
          date,
          projectName,
          selectedStandard,
          specialInstructions,
          uploadedTemplate,
          reportSettings,
          stakeholderMatrix,
          meetingDistribution
        });
        data = {
          markdown: fallbackResult.markdown,
          audit: fallbackResult.audit,
        };
      }

      setGeneratedMarkdown(data.markdown || '');
      setAuditData(data.audit || null);

      setMaxAvailableStep(5);
      setCurrentStep(5);
    } catch (err: any) {
      console.error('Document generation error:', err);
      // Even in catch, synthesize to ensure document is generated from uploaded files
      try {
        const fallbackResult = synthesizeDocumentFromSource({
          doc: selectedDoc,
          files,
          pastedText,
          answers: {},
          selectedResources,
          selectedSections,
          selectedFields,
          docCode,
          date,
          projectName,
          selectedStandard,
          specialInstructions,
          uploadedTemplate,
          reportSettings,
          stakeholderMatrix,
          meetingDistribution
        });
        setGeneratedMarkdown(fallbackResult.markdown);
        setAuditData(fallbackResult.audit);
        setMaxAvailableStep(5);
        setCurrentStep(5);
      } catch (fallbackErr: any) {
        setGenerationError(err?.message || 'Failed to synthesize document');
      }
    } finally {
      setIsGenerating(false);
      // USER REQUEST: Always land on Step 5 for Meeting Minutes to ensure no questions/errors block the user
      if (selectedDoc.id === 'meeting-minutes') {
        setCurrentStep(5);
        setMaxAvailableStep(5);
      }
    }
  }, [selectedDoc, getCombinedSourceText, selectedFields, selectedSections, selectedSubFields, selectedResources, answers, specialInstructions, docCode, date, projectName, files, pastedText, meetingDistribution]);

  /**
   * Fast-track bypass directly executing verified client synthesis
   */
  const handleFastTrackSynthesis = useCallback(() => {
    if (!selectedDoc) return;
    try {
      const formattedAnswers: Record<string, string> = {};
      Object.entries(answers).forEach(([field, ans]) => {
        if (ans.status === 'tbc') {
          formattedAnswers[field] = 'TBC – to be confirmed by [Owner]';
        } else if (ans.status === 'na') {
          formattedAnswers[field] = 'Not applicable for this project scope';
        } else {
          formattedAnswers[field] = ans.value;
        }
      });

      const fallbackResult = synthesizeDocumentFromSource({
        doc: selectedDoc,
        files,
        pastedText,
        answers: formattedAnswers,
        selectedResources,
        selectedSections,
        selectedFields,
        docCode,
        date,
        projectName,
        selectedStandard,
        specialInstructions,
        uploadedTemplate,
        reportSettings,
        meetingDistribution
      });

      setGeneratedMarkdown(fallbackResult.markdown);
      setAuditData(fallbackResult.audit);
      setMaxAvailableStep(5);
      setCurrentStep(5);
      setIsGenerating(false);
    } catch (e: any) {
      setGenerationError(e?.message || 'Failed to complete fast-track synthesis');
    }
  }, [selectedDoc, files, pastedText, answers, selectedResources, selectedSections, selectedFields, docCode, date, projectName, specialInstructions, meetingDistribution]);

  /**
   * Run refinement against backend Express proxy
   */
  const handleRefine = async (instruction: string) => {
    if (!selectedDoc || !generatedMarkdown) return;
    setIsRefining(true);

    try {
      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentMarkdown: generatedMarkdown,
          instruction,
          docTitle: selectedDoc.title,
        }),
      });

      if (!response.ok) {
        throw new Error(`Refine failed with status: ${response.status}`);
      }

      const data = await response.json();
      if (data.markdown) {
        setGeneratedMarkdown(data.markdown);
      }
    } catch (err: any) {
      console.error('Refine error:', err);
    } finally {
      setIsRefining(false);
    }
  };

  /**
   * Proceed from Step 2 to Step 3
   */
  const handleProceedToStep3 = async () => {
    setMaxAvailableStep((prev) => Math.max(prev, 3) as StepNumber);
    setCurrentStep(3);
    await runGapAnalysis();
  };

  /**
   * Handle adding files inside Step 3 (auto re-run gap analysis)
   */
  const handleAddFilesStep3 = async (newFiles: ExtractedFile[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    // Allow state to settle, then re-run analysis
    setTimeout(() => {
      runGapAnalysis();
    }, 100);
  };

  /**
   * Quick Generate from Sidebar
   */
  const handleQuickGenerate = useCallback((doc: PMIDocumentDefinition) => {
    const hasEnoughContext = files.length > 0 || pastedText.trim().length > 10;
    
    if (!hasEnoughContext) {
      setPendingQuickGenerateDoc(doc);
      setIsAuditWarningOpen(true);
    } else {
      handleSelectDoc(doc);
      setAppMode('generate');
      // Trigger generation after state settles
      setTimeout(() => {
        runGenerate();
      }, 100);
    }
  }, [files, pastedText, runGenerate]);

  const confirmQuickGenerate = () => {
    if (pendingQuickGenerateDoc) {
      handleSelectDoc(pendingQuickGenerateDoc);
      setAppMode('generate');
      setIsAuditWarningOpen(false);
      setPendingQuickGenerateDoc(null);
      // Trigger generation
      setTimeout(() => {
        runGenerate();
      }, 100);
    }
  };

  const handleUploadJobCards = async (files: File[]) => {
    const extracted: ExtractedFile[] = [];
    for (const f of files) {
      const parsed = await parseFileClientSide(f);
      extracted.push(parsed);
    }
    if (extracted.length > 0) {
      setFiles((prev) => [...prev, ...extracted]);
      // Auto-select Job Card document type
      const jobCardDoc = DOCUMENT_CATALOGUE.find(d => d.id === 'job-card');
      if (jobCardDoc) {
        handleSelectDoc(jobCardDoc);
      }
      setCurrentStep(2);
      setMaxAvailableStep((prev) => Math.max(prev, 2) as StepNumber);
    }
  };

  const handleUploadTranscript = async (file: File) => {
    setIsGenerating(true);
    setCurrentStep(4);
    setAppMode('generate');

    const parsed = await parseFileClientSide(file);
    // Clear existing for pure transcript focus
    setFiles([parsed]);
    setPastedText('');
    setSpecialInstructions("MEETING MINUTE GENERATOR MODE: ROLE: Experienced project manager. TASK: Concise, accurate meeting minutes. Capture discussed, decided, committed. RULES: ONLY transcript facts. Strip small talk/filler. NO '(recorded)' or Duration row. NO Section 11. Start time: 10:19. Format: Microsoft Teams. TONE: Neutral, professional, natural.");

    // Auto-detect distribution
    const emailMatches = parsed.text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    const allInternal = emailMatches.length > 0 && emailMatches.every(email => email.toLowerCase().endsWith('@advannotech.co.za'));
    const detectedDist = allInternal ? 'internal' : 'external';
    setMeetingDistribution(detectedDist);

    const minuteDoc = DOCUMENT_CATALOGUE.find(d => d.id === 'meeting-minutes');
    if (minuteDoc) {
      const adapted = getAdaptedDocument(minuteDoc, selectedStandard);
      setSelectedDoc(adapted);
      setSelectedSections([...adapted.requiredSections]);
      setSelectedFields([...adapted.requiredFields]);
      
      const defs = getDocumentFieldDefinitions(adapted);
      const mapping: Record<string, string[]> = {};
      defs.forEach((fd) => {
        mapping[fd.name] = fd.subFields ? [...fd.subFields] : [];
      });
      setSelectedSubFields(mapping);

      setFoundItems([]);
      setMissingItems([]);
      setUncertainItems([]);
      setAnswers({});
      setGeneratedMarkdown('');
      setAuditData(null);
      setMaxAvailableStep(5);

      // Trigger generation after state settles
      setTimeout(() => {
        runGenerate();
      }, 150);
    }
  };

  const handleDownloadIsoZip = () => {
    downloadIso21500Zip(projectName);
  };

  const formattedAnswers = useMemo(() => {
    const res: Record<string, string> = {};
    Object.entries(answers).forEach(([field, ans]) => {
      if (ans.status === 'tbc') {
        res[field] = 'TBC – to be confirmed by [Owner]';
      } else if (ans.status === 'na') {
        res[field] = 'Not applicable for this project scope';
      } else {
        res[field] = ans.value;
      }
    });
    return res;
  }, [answers]);

  return (
    <div className="min-h-screen bg-[#0B1528] text-slate-100 flex flex-col font-sans">
      {/* Startup Animation (2.5s) */}
      {showIntro && (
        <StartupAnimation onComplete={() => setShowIntro(false)} />
      )}

      {/* Main Corporate Header */}
      <Header 
        onClearSession={handleClearSession} 
        healthScore={healthScore}
        isAnalyzing={isAnalyzingGaps}
        onOpenReadiness={() => setIsReadinessModalOpen(true)}
        onOpenIsoFolders={() => setIsIsoModalOpen(true)}
        selectedStandard={selectedStandard}
        onSelectStandard={(std) => {
          setSelectedStandard(std);
          // Re-adapt the current document if one is selected
          if (selectedDoc && selectedDoc.id !== 'custom-doc') {
            const originalDoc = DOCUMENT_CATALOGUE.find(d => d.id === selectedDoc.id);
            if (originalDoc) {
              const adapted = getAdaptedDocument(originalDoc, std);
              setSelectedDoc(adapted);
              // Update sections and fields if they haven't been manually tampered with significantly
              // (Or just always reset to standard defaults on switch for simplicity)
              setSelectedSections([...adapted.requiredSections]);
              setSelectedFields([...adapted.requiredFields]);
              const defs = getDocumentFieldDefinitions(adapted);
              const mapping: Record<string, string[]> = {};
              defs.forEach((fd) => {
                mapping[fd.name] = fd.subFields ? [...fd.subFields] : [];
              });
              setSelectedSubFields(mapping);
            }
          }
        }}
      />

      {/* Stepper Progress Bar (when in generate mode) OR Audit/Report Mode Header */}
      {appMode === 'generate' ? (
        <Stepper
          currentStep={currentStep}
          onStepClick={(step) => setCurrentStep(step)}
          maxAvailableStep={maxAvailableStep}
        />
      ) : appMode === 'multi-doc-report' ? (
        <div className="bg-[#0F172A] border-b border-slate-800 px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-0.5 rounded font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              ISO STANDARDS REPORTING
            </span>
            <span className="text-slate-300 font-medium">
              Multi-Document Portfolio Audit, Comparative Graphics & Traceability (ISO 21500 / 9001 / 31000 / 27001)
            </span>
          </div>
          <button
            onClick={() => setAppMode('generate')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900 cursor-pointer transition-colors"
          >
            <span>Back to 5-Step Generator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="bg-[#0F172A] border-b border-slate-800 px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-0.5 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              AUDIT MODE
            </span>
            <span className="text-slate-300 font-medium">
              Reviewing Existing Document Against {selectedStandard} Standards
            </span>
          </div>
          <button
            onClick={() => setAppMode('generate')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900 cursor-pointer transition-colors"
          >
            <span>Back to 5-Step Generator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* App Body: Left Sidebar + Content View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left PMI Phase & Document Catalogue Sidebar */}
        <Sidebar
          selectedDoc={selectedDoc}
          onSelectDoc={(doc) => {
            handleSelectDoc(doc);
          }}
          onQuickGenerate={handleQuickGenerate}
          selectedResources={selectedResources}
          onToggleResource={handleToggleResource}
          onSelectCoreTeam={handleSelectCoreTeam}
          onClearResources={handleClearResources}
          appMode={appMode}
          onSelectAppMode={setAppMode}
          onOpenAgendas={() => setIsAgendaModalOpen(true)}
          onOpenDesignDocPrompt={() => setIsDesignDocModalOpen(true)}
          onOpenStakeholderModal={() => setIsStakeholderModalOpen(true)}
          onOpenIsoFolders={() => setIsIsoModalOpen(true)}
          onDownloadIsoZip={handleDownloadIsoZip}
          onUploadJobCard={handleUploadJobCards}
          onUploadTranscript={handleUploadTranscript}
          meetingDistribution={meetingDistribution}
          onSetMeetingDistribution={setMeetingDistribution}
          documentReadiness={documentReadiness}
        />

        <GovernanceGutter
          customLogo={customLogo}
          onLogoChange={setCustomLogo}
          uploadedTemplate={uploadedTemplate}
          onTemplateChange={setUploadedTemplate}
          onOpenIsoFolders={() => setIsIsoModalOpen(true)}
          selectedDoc={selectedDoc}
        />

        {/* Main Workstation Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-b from-[#0B1528] to-[#080E1C]">
          {appMode === 'multi-doc-report' ? (
            <MultiDocIsoReportView
              onBackToGenerator={() => setAppMode('generate')}
              projectName={projectName}
              onOpenIsoFolders={() => setIsIsoModalOpen(true)}
            />
          ) : appMode === 'audit-existing' ? (
            <ReviewExistingDocView
              onTransferToCanvas={handleTransferFromAuditToCanvas}
              onOpenAgendas={() => setIsAgendaModalOpen(true)}
            />
          ) : (
            <>
              {/* STEP 1: Select Document */}
              {currentStep === 1 && (
                <Step1Select
                  selectedDoc={selectedDoc}
                  onSelectDoc={(doc) => {
                    handleSelectDoc(doc);
                    setMaxAvailableStep(2);
                    setCurrentStep(2);
                  }}
                  selectedSections={selectedSections}
                  onToggleSection={handleToggleSection}
                  onSelectAllSections={handleSelectAllSections}
                  selectedFields={selectedFields}
                  onToggleField={handleToggleField}
                  selectedSubFields={selectedSubFields}
                  onToggleSubField={handleToggleSubField}
                  onSelectAllFields={handleSelectAllFields}
                  coveredFields={coveredFields}
                  coveredSections={coveredSections}
                  hasUploadedContent={hasUploadedContent}
                  onProceed={() => {
                    setMaxAvailableStep((prev) => Math.max(prev, 2) as StepNumber);
                    setCurrentStep(2);
                  }}
                  onOpenAgendas={() => setIsAgendaModalOpen(true)}
                  reportSettings={reportSettings}
                  onReportSettingsChange={setReportSettings}
                />
              )}

              {/* STEP 2: Ingest Source Materials */}
              {currentStep === 2 && selectedDoc && (
                <Step2Source
                  selectedDoc={selectedDoc}
                  files={files}
                  onAddFiles={handleAddFiles}
                  onRemoveFile={handleRemoveFile}
                  pastedText={pastedText}
                  onChangePastedText={setPastedText}
                  specialInstructions={specialInstructions}
                  onChangeSpecialInstructions={setSpecialInstructions}
                  selectedSections={selectedSections}
                  selectedFields={selectedFields}
                  coveredFields={coveredFields}
                  coveredSections={coveredSections}
                  onProceed={handleProceedToStep3}
                  onBack={() => setCurrentStep(1)}
                  onSwitchToMultiDocReport={() => setAppMode('multi-doc-report')}
                  onQuickGenerate={runGenerate}
                />
              )}

              {/* STEP 3: Clarify Gaps & Conflicts */}
              {currentStep === 3 && selectedDoc && (
                <Step3Clarify
                  selectedDoc={selectedDoc}
                  foundItems={foundItems}
                  missingItems={missingItems}
                  uncertainItems={uncertainItems}
                  answers={answers}
                  onAnswerChange={(field, ans) =>
                    setAnswers((prev) => ({ ...prev, [field]: ans }))
                  }
                  isLoading={isAnalyzingGaps}
                  onRerunAnalysis={runGapAnalysis}
                  onAddFiles={handleAddFilesStep3}
                  onProceed={runGenerate}
                  onBack={() => setCurrentStep(2)}
                  hasProgressData={hasProgressData}
                  stakeholderMatrix={stakeholderMatrix}
                  onStakeholderMatrixChange={setStakeholderMatrix}
                  projectRisks={projectRisks}
                  onProjectRisksChange={setProjectRisks}
                  projectAssumptions={projectAssumptions}
                  onProjectAssumptionsChange={setProjectAssumptions}
                  files={files}
                />
              )}

              {/* STEP 4: Document Generation */}
              {currentStep === 4 && selectedDoc && (
                <Step4Generate
                  selectedDoc={selectedDoc}
                  isGenerating={isGenerating}
                  error={generationError}
                  onRetry={runGenerate}
                  onBack={() => setCurrentStep(3)}
                  onFastTrack={handleFastTrackSynthesis}
                />
              )}

              {/* STEP 5: Review, Refine, Export & Audit Inspector */}
              {currentStep === 5 && selectedDoc && (
                <Step5Review
                  selectedDoc={selectedDoc}
                  markdown={generatedMarkdown}
                  onChangeMarkdown={setGeneratedMarkdown}
                  auditData={auditData}
                  docCode={docCode}
                  date={date}
                  projectName={projectName}
                  onRefine={handleRefine}
                  isRefining={isRefining}
                  onStartOver={() => {
                    setCurrentStep(1);
                  }}
                  onOpenAgendas={() => setIsAgendaModalOpen(true)}
                  selectedStandard={selectedStandard}
                  customLogo={customLogo}
                  selectedResources={selectedResources}
                  selectedSections={selectedSections}
                  onAddSection={handleAddSection}
                  onReorderSections={handleReorderSections}
                  answers={formattedAnswers}
                  verifiedTimelineData={verifiedTimelineData}
                  stakeholderMatrix={stakeholderMatrix}
                  projectRisks={projectRisks}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Suggested Meeting Agenda Modal */}
      <MeetingAgendaModal
        isOpen={isAgendaModalOpen}
        onClose={() => setIsAgendaModalOpen(false)}
        onInsertAgenda={handleInsertAgenda}
        projectName={projectName}
        currentDocId={selectedDoc?.id}
      />

      {/* Formal Technical Design Document & Prompt Modal */}
      <DesignDocumentModal
        isOpen={isDesignDocModalOpen}
        onClose={() => setIsDesignDocModalOpen(false)}
        selectedDoc={selectedDoc}
        projectName={projectName}
        onInsertDesignDoc={(designDocMd) => {
          setGeneratedMarkdown(designDocMd);
          setMaxAvailableStep(5);
          setCurrentStep(5);
        }}
        selectedStandard={selectedStandard}
      />

      {/* Audit Warning Modal */}
      <AuditWarningModal
        isOpen={isAuditWarningOpen}
        onClose={() => setIsAuditWarningOpen(false)}
        onConfirm={confirmQuickGenerate}
        selectedStandard={selectedStandard}
      />

      {/* Audit Readiness Summary Modal */}
      <AuditReadinessSummary
        isOpen={isReadinessModalOpen}
        onClose={() => setIsReadinessModalOpen(false)}
        healthScore={healthScore}
        foundItems={foundItems}
        missingItems={missingItems}
        uncertainItems={uncertainItems}
        selectedDoc={selectedDoc}
        selectedStandard={selectedStandard}
      />

      {/* Timeline Verification Sequential Popups */}
      <TimelineVerificationModal 
        isOpen={isTimelineVerificationOpen}
        onClose={() => setIsTimelineVerificationOpen(false)}
        onConfirm={(data) => {
          setVerifiedTimelineData(data);
          setIsTimelineVerificationOpen(false);
          runGenerate(data);
        }}
      />

      {/* ISO 21500 Standard Folder Structure Modal */}
      <IsoFolderStructureModal
        isOpen={isIsoModalOpen}
        onClose={() => setIsIsoModalOpen(false)}
        projectName={projectName}
      />

      {/* Stakeholder Impact Matrix (Visual Grid) Modal */}
      <StakeholderImpactModal
        isOpen={isStakeholderModalOpen}
        onClose={() => setIsStakeholderModalOpen(false)}
        stakeholders={stakeholderMatrix}
        onUpdateStakeholders={setStakeholderMatrix}
        projectName={projectName}
      />
    </div>
  );
}
