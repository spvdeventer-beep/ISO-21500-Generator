import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Download,
  BookOpen,
  Layers,
  X,
  Sparkles,
  Terminal,
  Cpu,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { PMIDocumentDefinition, PMStandard } from '../data/documents';
import { downloadBlob } from '../utils/exportUtils';

interface DesignDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDoc: PMIDocumentDefinition | null;
  projectName?: string;
  onInsertDesignDoc?: (markdown: string) => void;
  selectedStandard: PMStandard;
}

export const DesignDocumentModal: React.FC<DesignDocumentModalProps> = ({
  isOpen,
  onClose,
  selectedDoc,
  projectName = 'Enterprise Telemetry & Governance Initiative',
  onInsertDesignDoc,
  selectedStandard
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'design-doc' | 'prompt' | 'components'>('design-doc');

  if (!isOpen || !selectedDoc) return null;

  const docTitle = selectedDoc.title;
  const docPhase = selectedDoc.phase;
  const docId = selectedDoc.id;

  // Build Comprehensive System & Architecture Technical Design Document (TDD)
  const designDocumentMarkdown = `
# ADVANNOTECH (PTY) LTD · ENTERPRISE SYSTEM ARCHITECTURE & TECHNICAL DESIGN DOCUMENT (TDD)
**Document Reference:** ADV-SYS-ARCH-2026-V2  
**System Title:** Advannotech Stateless Project Governance & Forensic Document Engineering Platform  
**Target Document Context:** ${docTitle} (${docId === 'custom-doc' ? 'Bespoke Composition' : `${docPhase} Phase`})  
**Governing Standards:** ISO 21500:2021 (Project Governance) · ISO 9001:2015 (Quality Management) · ISO 31000:2018 (Risk) · ${selectedStandard}  
**Associated Project:** ${projectName}  
**Lead Architecture Authority:** Valiant Khoza (Lead Software Engineer) & Sarel van Deventer (PMO Director) · Advannotech (Pty) Ltd  
**Security Classification:** CONFIDENTIAL – PROPRIETARY (ADVANNOTECH PTY LTD)  

---

## 1. Executive System Overview & Mission Architecture
The Advannotech Project Governance Platform is a high-integrity, stateless, client-first enterprise web system engineered to synthesize, audit, verify, and export publication-grade project governance artifacts. Built strictly around ISO 21500:2021 and PMBOK 7th Edition performance domains, the platform enforces a **Zero-Hallucination Factual Grounding Policy**:
- **Stateless Privacy by Design**: All source artifacts are parsed, analyzed, and stored in client volatile memory. Zero project data is retained across sessions unless explicitly exported by the user.
- **Fail-Safe Dual-Engine Synthesis**: A resilient dual-path synthesis architecture combines an Express backend AI proxy (Gemini 1.5 Flash with 60s timeout guard) with an instantaneous, 100% offline, deterministic client-side synthesis engine (\`synthesizeDocumentFromSource\`).
- **Clean Content Discipline**: Technical metadata (e.g. revision logs, reference IDs, lifecycle phase headers, parameter declaration tables) is stripped from generated document bodies to focus strictly on substantive project commitments, while retaining professional corporate branding and letterhead in PDF and Word exports.

---

## 2. Complete Application Component Architecture

The platform comprises 10 integrated component domains working in deterministic synergy:

### Component 1: Meeting Minute Generator & Distribution Security Engine (\`Sidebar.tsx\`, \`server.ts\`, \`documentSynthesizer.ts\`)
- **Single-File Transcript Intake**: Dedicated intake zone accepting audio transcripts and meeting notes (\`.txt\`, \`.md\`, \`.docx\`, \`.pdf\`, \`.vtt\`, \`.srt\`).
- **Intelligent Auto-Detection**: Scans extracted text for participant email addresses. If all detected emails end in \`@advannotech.co.za\`, distribution automatically switches to **Internal**; otherwise, it defaults to **External**.
- **Distribution Security Enforcement**:
  - *Internal Mode*: Automatically excludes all financial data, budgets, and cost performance metrics. Excludes client-specific requirements (UAT, acceptance criteria, client sign-offs). Restricts stakeholder registers and impact matrices exclusively to supplier personnel (\`@advannotech.co.za\`). Prepends the mandatory \`> **INTERNAL DISTRIBUTION ONLY** · RESTRICTED TO ADVANNOTECH PERSONNEL\` banner.
  - *External Mode*: Formats standard bilateral governance minutes suitable for client and steerco distribution.
- **ISO 21500 8-Section Structure**:
  1. *Meeting Details* (Title, Date, Start Time e.g. "10:19", Format e.g. "Microsoft Teams", Chair, Minute-taker, Next meeting; no duration or recorded mentions).
  2. *Purpose / Summary* (2-3 concise sentences on context and outcomes).
  3. *Key Discussion Points* (Grouped by topic, 2-4 bullets each on substance, options, and reasoning).
  4. *Decisions Made* (Numbered list attributing decisions to specific individuals).
  5. *Action Items Table* (Columns: Action, Owner, Due Date e.g. "26 Oct 2026", Status = Open).
  6. *Risks, Issues and Dependencies* (Cross-referenced risks and blockers).
  7. *Open Questions / Parked Items* (Unresolved agenda items).
  8. *Next Meeting* (Date and proposed agenda).
- **Post-Minutes Audit**: Mandatory "Items to confirm" section highlighting unclear names, references, or actions missing owners/dates.
- **Tone & Persona**: Experienced Project Manager persona. Natural business English, no corporate padding, no small talk, and no Section 11 distribution/approval block.

### Component 2: Project Governance & Framework - ISO 21500 Directory Engine (\`IsoFolderStructureModal.tsx\`, \`isoZipExporter.ts\`)
- **Directory Taxonomy**: Interactive visual tree representing the complete ISO 21500 5-phase governance structure:
  - \`01_Initiation/\`: Charters, Feasibility Studies, Business Cases, Stakeholder Registers.
  - \`02_Planning/\`: Scope Baselines, WBS, Schedule Models, Budgets, Quality Plans, Resource Plans.
  - \`03_Execution/\`: Change Logs, Issue Logs, Lessons Learned, Job Cards & Work Authorizations.
  - \`04_Monitoring_and_Controlling/\`: Status Reports, EVM Financial Calculations, Quality Measurements, Risk Registers.
  - \`05_Closing/\`: Final Reports, Procurement Closeouts, Client Sign-Off Handover Certificates.
- **Manifest Architecture**: Pre-loads each folder with automated \`REQUIRED_DOCUMENTS.txt\` governance manifests.
- **Instant .ZIP Exporter**: Uses \`jszip\` to package the entire hierarchical directory and manifests into an immediate download archive (\`<ProjectName>_ISO_21500_Governance_Structure.zip\`).
- **Sidebar Integration**: Prominent top-of-menu navigation entry separated from Initiation by an architectural divider line.

### Component 3: Job Cards & Work Requests Intake Zone (\`Sidebar.tsx\`, \`App.tsx\`)
- **Operational Ingestion**: Dedicated drop zone in the navigation menu for operational field tickets, work orders, and service requests.
- **Automated Routing**: Automatically ingests multi-file job requests, selects the \`job-card\` document type, and transitions to the execution synthesis pipeline.
- **Synthesized Deliverables**: Structured job cards featuring technical instructions, technician allocations, safety/PPE constraints, bill of materials consumed, and formal client witness sign-off blocks.

### Component 4: Interactive Document Catalogue & Readiness System (\`Sidebar.tsx\`, \`documents.ts\`)
- **20+ ISO 21500 / PMBOK 7th Documents**: Spanning all 5 lifecycle phases plus Custom Bespoke Composition, Report Generator, and Financial Calculations Report.
- **Critical Path Document Highlighting**: Highlights mission-critical compliance artifacts in bold Red (Charter, Business Case, Scope Baseline & WBS, Schedule Baseline, Cost Baseline & Budget, Risk Register, Client Sign-off).
- **Forensic Readiness Engine**: Dynamically calculates lexical and semantic source coverage across ingested artifacts:
  - *Green (Ready)*: Coverage ratio >= 80% against required fields and sections.
  - *Amber (Partial)*: Coverage ratio > 0% and < 80%.
  - *Blue / Slate*: 0% coverage or non-critical ungrounded artifact.
- **Clean Sidebar Typography**: Automatic removal of leading numerical indexes and hyphen prefixes for clean corporate readability.
- **Instant Quick Generate**: One-click synthesis bypass with low-context safety modal (\`AuditWarningModal.tsx\`).

### Component 5: Secondary Governance Bar (\`GovernanceGutter.tsx\`)
- **Corporate Identity & Logo Ingestion**: In-memory Base64 logo upload with instant visual preview and automatic embedding into HTML canvas, PDF letterheads, and Word exports.
- **Custom Template Ingestion**: Upload custom corporate templates to serve as structural background context during generation.
- **Timeline Verification Trigger**: Direct access to milestone baseline reconciliation modal.
- **Audit Readiness Dashboard**: Real-time summary modal showing forensic readiness scores across all catalogue documents.

### Component 6: 5-Step Forensic Generation Pipeline (\`Step1Select.tsx\` through \`Step5Review.tsx\`)
- **Step 1 (Select)**: Document specification, standard adaptation (ISO 21500 / PMBOK 7th), mandatory section toggle list, required information fields, and sub-field definitions. Includes "Build Your Own Document" custom composer.
- **Step 2 (Source)**: Multi-format client-side parser extracting paragraphs, tables, and text from PDF, Word (.docx), Excel (.xlsx/.csv), and Markdown/Text. Includes remote source location inspector for Google Drive, SharePoint, and Web URLs (\`SourceLocationModal.tsx\`).
- **Step 3 (Clarify)**: Forensic gap analysis engine displaying Grounded (Found), Missing (with contextual clarification questions and TBC toggles), and Uncertain (competing values) items. Auto-populates project registers (\`registerExtractors.ts\`). Fast-track bypass available.
- **Step 4 (Generate)**: Resilient synthesis screen showing live generation stage checklists with automatic 60s backend failover to offline client synthesizer.
- **Step 5 (Review & Canvas)**: Split-screen workstation featuring interactive Markdown canvas (\`DocumentCanvas.tsx\`), live preview, section navigation, conversational refinement input, and audit provenance inspector drawer.

### Component 7: Governance Registers & Multi-Modal Analytics Suite
- **Stakeholder Impact Matrix (\`StakeholderImpactMatrix.tsx\`)**: Interactive Power vs. Interest 2x2 grid (Manage Closely, Keep Satisfied, Keep Informed, Monitor) with drag-and-drop repositioning and internal supplier filtering.
- **Risk Heatmap (\`RiskHeatmapChart.tsx\`)**: ISO 31000 5x5 Probability vs. Impact matrix with 1-25 qualitative scoring, RAG badges, and risk owner assignments.
- **Risk Mitigation Trend (\`RiskMitigationTrend.tsx\`)**: Residual risk burn-down trajectory visualization.
- **RASCI Responsibility Matrix (\`RasciSpreadsheet.tsx\`)**: Full spreadsheet editor assigning Responsible (R), Accountable (A), Supportive (S), Consulted (C), and Informed (I) roles across project work packages.
- **Resource Load & Timeline (\`ResourceLoadChart.tsx\`, \`ResourceAssignmentTimeline.tsx\`)**: Workload distribution charts and Gantt scheduling across Advannotech engineering teams.
- **Governance Burndown (\`BurndownChart.tsx\`)**: Real-time velocity tracking for project deliverables and governance action items.
- **Dependency Network (\`DependencyNetwork.tsx\`)**: Critical path predecessor/successor deliverable network graph.
- **Register Manager (\`RegisterManager.tsx\`)**: Unified CRUD interface managing project stakeholders, risks, assumptions, and action items.

### Component 8: Specialized Reporting & Audit Engines
- **Advanced Report Generator (\`reportSettings\`)**: Synthesizes SteerCo Executive, Weekly Progress, and Ad-Hoc reports with adjustable verbosity (Summary, Standard, Detailed) and embedded chart visualization placeholders.
- **Financial Calculations Report (\`financial-report\`)**: Full Earned Value Management (EVM) engine calculating BAC, AC, EV, PV, CPI, SPI, EAC, Net Present Value (NPV), Internal Rate of Return (IRR), ROI, and Payback Period.
- **Existing Document Audit View (\`ReviewExistingDocView.tsx\`)**: Ingests pre-existing documents, evaluates compliance against ISO 21500 standards, generates RAG deficiency logs, and outputs a 100% compliant remediated draft.
- **Multi-Document ISO Portfolio Report (\`MultiDocIsoReportView.tsx\`)**: Evaluates comprehensive compliance coverage across the entire project document suite.
- **Meeting Agenda Modal (\`MeetingAgendaModal.tsx\`)**: Generates formal stage-gate governance agendas tailored to specific project milestones.

### Component 9: Multi-Format Export Engine (\`exportUtils.ts\`, \`StageDocDownloadModal.tsx\`)
- **Direct Binary PDF Export**: Uses \`jsPDF\` to generate publication-grade PDF files directly in the browser, complete with Advannotech letterheads, corporate logos, clean tables, page numbering, and digital signature placeholders.
- **Microsoft Word (.docx) Export**: Generates native Word documents using \`docx\` with styled heading hierarchies, clean tables, and custom headers/footers.
- **Raw Markdown (.md) Export**: Downloads clean markdown formatted for GitHub, GitLab, or corporate wikis.
- **Print Preview**: Styled CSS print view optimized for physical printing or browser PDF drivers.
- **CSV Data Export**: One-click download of structured Action Item registers and Stakeholder tables.

### Component 10: Advannotech Stakeholder Directory & Resource Directory (\`stakeholders.ts\`)
Pre-loaded with official Advannotech personnel and governance roles:
- *CEO & Executive Sponsor*: Xolani Zuma (\`xolani.zuma@advannotech.co.za\`)
- *CFO & Commercial Authority*: Lando Zuma (\`lando.zuma@advannotech.co.za\`)
- *Head of Delivery & PMO Director*: Sarel van Deventer (\`sarel.vdeventer@advannotech.co.za\`)
- *Lead Software Engineer & Technical Authority*: Valiant Khoza (\`khoza.valiantr@advannotech.co.za\`)
- *Head of IoT Products & Technical Lead*: Steffen Engelbrecht (\`engel.steffense@advannotech.co.za\`)
- *Security Systems Lead*: Andrew Kotamo (\`andrew.kotamo@advannotech.co.za\`)
- *Senior Field QA*: Edgar Skosana (\`edgar.skosana@advannotech.co.za\`)
- *Project Delivery Officer*: Lunga Myeza (\`lunga.myeza@advannotech.co.za\`)

---

## 3. Data Flow & State Lifecycle Diagram

\`\`\`
[ Raw Files / Transcripts ] ─────────> [ File Parsers: DOCX, PDF, XLSX, TXT ]
                                                     │
                                                     ▼
[ Project Scope / Standard ] ────────> [ In-Memory Source Context + State Store ]
                                                     │
               ┌─────────────────────────────────────┴─────────────────────────────────────┐
               ▼                                                                           ▼
      [ Meeting Minutes ]                                                         [ Standard PMI / ISO ]
               │                                                                           │
   [ Auto-Detect Distribution ]                                                   [ Forensic Gap Analysis ]
   (Internal vs External Filter)                                                  (Found / Missing / Uncertain)
               │                                                                           │
               ▼                                                                           ▼
   [ 8-Section ISO 21500 Engine ]                                                 [ Clarifications & Registers ]
   (Experienced PM Persona)                                                       (TBC Auto-Propagation)
               │                                                                           │
               └─────────────────────────────────────┬─────────────────────────────────────┘
                                                     ▼
                                      [ Resilient Dual-Layer Synthesis ]
                                      ├── Path A: Express API (Gemini 1.5 Flash, 60s)
                                      └── Path B: Client-Side Engine (Instant Fallback)
                                                     │
                                                     ▼
                                         [ Clean Content Markdown ]
                                         (Technical Metadata Stripped)
                                                     │
                                                     ▼
                                        [ Step 5 Document Workstation ]
                                        ├── Live Markdown Canvas & Editor
                                        ├── Interactive Governance Gutter
                                        ├── Multi-Modal Visualizations (Heatmap, RACI)
                                        └── Direct Exports: PDF, DOCX, MD, CSV, ZIP
\`\`\`

---

## 4. Active Document Specification: ${docTitle}
- **Document Code:** ADV-DOC-${docId.toUpperCase()}-2026
- **Assigned PMI Lifecycle Gate:** ${docId === 'custom-doc' ? 'Cross-Lifecycle Bespoke' : `${docPhase} Gate`}
- **Mandatory Sections (${selectedDoc.requiredSections.length}):**
${selectedDoc.requiredSections.map((sec, i) => `  ${i + 1}. ${sec}`).join('\n')}
- **Required Governance Fields (${selectedDoc.requiredFields.length}):**
${selectedDoc.requiredFields.map((f) => `  - \`${f}\`: Extracted from source evidence or tracked as TBC`).join('\n')}

---

## 5. Formal Executive Architecture Sign-Off
Certified as the Definitive Architecture & Technical Specification for Advannotech Enterprise Governance Systems:

________________________________________            ________________________________________
Valiant Khoza                                       Sarel van Deventer
Lead Software Engineer & Technical Author          Head of Delivery & PMO Director
Advannotech (Pty) Ltd                               Advannotech (Pty) Ltd
Date: ${new Date().toISOString().split('T')[0]}                      Date: ${new Date().toISOString().split('T')[0]}
`.trim();

  // Build Master Synthesis Prompt Suite covering ALL components
  const masterPrompt = `
# ADVANNOTECH ENTERPRISE MASTER SYNTHESIS PROMPT SUITE
# System Persona: Principal Enterprise Project Governance Architect & Senior PM Advisor
# Governing Standards: ISO 21500:2021 · ISO 9001:2015 · ISO 31000:2018 · ${selectedStandard}

================================================================================
MODULE 1: CORE SYSTEM PERSONA & INVARIANTS (ALL COMPONENTS)
================================================================================
You are the Principal Enterprise Project Governance Architect for Advannotech (Pty) Ltd (advannotech.co.za).
Your mission is to synthesize publication-grade, audit-ready project governance documents strictly aligned with ISO 21500 and PMBOK 7th Edition performance domains.

OFFICIAL ADVANNOTECH KEY PERSONNEL:
- Executive Sponsor / CEO: Xolani Zuma (xolani.zuma@advannotech.co.za)
- Commercial & CFO: Lando Zuma (lando.zuma@advannotech.co.za)
- PMO Director / Head of Delivery: Sarel van Deventer (sarel.vdeventer@advannotech.co.za)
- Lead Software Engineer: Valiant Khoza (khoza.valiantr@advannotech.co.za)
- IoT Products & Technical Lead: Steffen Engelbrecht (engel.steffense@advannotech.co.za)
- Information Security Lead: Andrew Kotamo (andrew.kotamo@advannotech.co.za)
- Senior Field QA: Edgar Skosana (edgar.skosana@advannotech.co.za)
- Project Delivery Officer: Lunga Myeza (lunga.myeza@advannotech.co.za)

CORE GOVERNANCE INVARIANTS:
1. TRUTH & ZERO HALLUCINATION: Ingested source documentation is the sole ground truth. Never invent metrics, dates, client names, or commitments.
2. TBC PROPAGATION: Unconfirmed or missing parameters must appear as "TBC – to be confirmed by [Owner]".
3. CLEAN CONTENT DISCIPLINE: Stripped of technical metadata tables (e.g. Revision History tables, parameter declaration audit blocks, lifecycle metadata) inside the document body to focus exclusively on substantive project execution, while preserving corporate branding in export representations.
4. LANGUAGE & TONE: Authoritative, formal, audit-ready British English.

================================================================================
MODULE 2: COMPONENT-SPECIFIC PROMPT SPECIFICATIONS
================================================================================

--------------------------------------------------------------------------------
PROMPT 2A: MEETING MINUTE GENERATOR (EXPERIENCED PM PERSONA)
--------------------------------------------------------------------------------
Role: You are an experienced project manager writing concise, accurate minutes from a transcript.
Task: Capture what was discussed, decided, and committed to. Not a blow-by-blow of who said what.
Rules:
- Use ONLY facts stated in the transcript. Strip small talk, greetings, filler words, and technical interruptions.
- Attribute actions and decisions to named individuals.
- Neutral, professional, natural tone (no corporate padding).
- Distribution-Aware Security:
  * Internal Distribution: Exclude all financial data/budgets. Exclude client-specific requirements (UAT, acceptance criteria, client sign-offs). Filter stakeholder registers to Advannotech supplier personnel only.
  * External Distribution: Standard bilateral governance minutes.
Output Structure (8 Sections):
  1. Meeting Details: Title, date ("Monday, 26 October 2026"), start time ("10:19"), format ("Microsoft Teams"), chair, minute-taker, next meeting. (NO duration or recorded wording).
  2. Purpose / Summary: 2-3 sentences on context and overall outcome.
  3. Key Discussion Points: Grouped by topic, 2-4 bullets each on substance, options, and reasoning.
  4. Decisions Made: Numbered list (who decided what).
  5. Action Items: Markdown Table (Action | Owner | Due Date "26 Oct 2026" | Status = Open).
  6. Risks, Issues and Dependencies: Identified project blockers and constraints.
  7. Open Questions / Parked Items: Items deferred or requiring inquiry.
  8. Next Meeting: Date and proposed agenda.
After the Minutes:
  - Add a short "Items to confirm" list for unclear names, references, or missing owners/dates.
  - DO NOT include Section 11 (Distribution and Approval).

--------------------------------------------------------------------------------
PROMPT 2B: STANDARD PMI / ISO 21500 GOVERNANCE ARTIFACTS
--------------------------------------------------------------------------------
Target Document: "${docTitle}" (${docPhase} Phase)
Project Title: "${projectName}"
Required Sections:
${selectedDoc.requiredSections.map((s, i) => `${i + 1}. ${s}`).join('\n')}
Required Fields to Resolve:
${selectedDoc.requiredFields.map((f) => `- ${f}`).join('\n')}
Formatting Rules:
- Start with corporate header: # ADVANNOTECH (PTY) LTD followed by # ${docTitle.toUpperCase()}
- For each section, synthesize detailed, publication-grade text incorporating all extracted source evidence.
- Include tabular representations for Scope Demarcation, Milestone Schedules, Budget Breakdowns, Risk Probability/Impact registers, and RACI matrices.
- Omit internal document control tables or parameter declaration blocks from the body text.
- Include formal Executive Sponsor and Lead Engineer Sign-off blocks at the conclusion.

--------------------------------------------------------------------------------
PROMPT 2C: FORENSIC GAP ANALYSIS & EVIDENCE EXTRACTION
--------------------------------------------------------------------------------
Input: Extracted source text + Mandatory fields & sections.
Task: Conduct forensic audit of source materials against required governance criteria.
Output Schema:
{
  "found": [{ "field": "Field name", "valueSummary": "Evidence summary", "source": "Filename", "confidence": "high" }],
  "missing": [{ "field": "Field name", "question": "Professional inquiry to user", "hint": "PMBOK expectation", "suggestedDefault": "" }],
  "uncertain": [{ "field": "Field name", "conflictSummary": "Explanation of source conflict", "options": ["Option A", "Option B"] }]
}

--------------------------------------------------------------------------------
PROMPT 2D: EXISTING DOCUMENT AUDIT & REMEDIATOR
--------------------------------------------------------------------------------
Input: Pre-existing user document text + Target ISO 21500 document specification.
Task: Evaluate compliance score (0-100), identify deficiencies across every mandatory section and field, produce a RAG Priority Register, and output a 100% compliant remediated draft combining original text with required governance clauses.

--------------------------------------------------------------------------------
PROMPT 2E: FINANCIAL CALCULATIONS & EARNED VALUE MANAGEMENT (EVM) REPORT
--------------------------------------------------------------------------------
Formulas & Forensic Logic:
- BAC (Budget at Completion), AC (Actual Cost), EV (Earned Value), PV (Planned Value).
- Cost Performance Index (CPI = EV / AC) & Schedule Performance Index (SPI = EV / PV).
- Cost Variance (CV = EV - AC) & Schedule Variance (SV = EV - PV).
- Estimate at Completion (EAC = BAC / CPI).
- Net Present Value (NPV) based on 8.5% WACC discount rate across 3-year cash flows.
- 3-Year Return on Investment (ROI) & Payback Period in months.

--------------------------------------------------------------------------------
PROMPT 2F: ADVANCED STEERCO & PROGRESS REPORT GENERATOR
--------------------------------------------------------------------------------
Parameters: Type (SteerCo / Progress / Ad-Hoc), Verbosity (Summary / Standard / Detailed), Period.
Output: Executive health scorecard (RAG), milestone velocity vs baseline, client-authorized expenditure, issue resolution burndown, and data visualization placeholders ([PROJECT_HEALTH_KPI_CHART], [GANTT_CHART_VISUALIZATION]).

--------------------------------------------------------------------------------
PROMPT 2G: JOB CARD & WORK AUTHORIZATION ENGINE
--------------------------------------------------------------------------------
Structure: Job Card ID & date, site location, lead technician, technical scope & step-by-step checklist, safety & environmental precautions, bill of materials consumed, and dual technician/client completion sign-off.

--------------------------------------------------------------------------------
PROMPT 2H: DOCUMENT REFINEMENT & CONVERSATIONAL EDITOR
--------------------------------------------------------------------------------
Task: Apply targeted user refinements (e.g. tone adjustments, clause insertions, scope revisions) while preserving existing corporate letterhead, RACI matrix, and forensic evidence traceability.
`.trim();

  // Build Application Component Architecture Matrix
  const componentMatrixMarkdown = `
# ADVANNOTECH APPLICATION COMPONENT ARCHITECTURE MATRIX
**Comprehensive Mapping of All Application Modules, State Stores, and System Engines**

| Component Domain | Primary File(s) | Key Responsibilities & Capabilities | Governance & Security Rules |
| :--- | :--- | :--- | :--- |
| **Meeting Minute Generator** | \`Sidebar.tsx\`, \`server.ts\`, \`documentSynthesizer.ts\` | Intake transcripts (.docx, .txt, .pdf, .vtt); auto-detect distribution; synthesize 8-section ISO 21500 minutes | Redact financial data and client specs for Internal; filter stakeholders to @advannotech.co.za |
| **ISO 21500 Folder Structure** | \`IsoFolderStructureModal.tsx\`, \`isoZipExporter.ts\` | 5-phase directory taxonomy browser; README manifests; instant .zip bundle generation | Pre-loaded with REQUIRED_DOCUMENTS.txt manifests per phase |
| **Job Cards & Work Requests** | \`Sidebar.tsx\`, \`App.tsx\`, \`documents.ts\` | Ingest field tickets; auto-route to Execution phase Job Card synthesis; step-by-step technical execution | Captures BOM, technician sign-off, and safety constraints |
| **Document Catalogue** | \`Sidebar.tsx\`, \`documents.ts\` | 20+ PMI/ISO documents; 5 phases; critical document red highlighting; dynamic green/amber readiness scoring | Zero-numbering & zero-dashes formatting; Quick Generate bypass |
| **Secondary Governance Bar** | \`GovernanceGutter.tsx\`, \`App.tsx\` | Corporate Identity logo upload (Base64); custom template upload; timeline verification & audit readiness triggers | In-memory logo persistence; applied to PDF & Word exports |
| **Step 1: Selection** | \`Step1Select.tsx\`, \`documents.ts\` | Standard adaptation (ISO 21500 / PMBOK 7th); section & field checkboxes; subfield configuration; bespoke composer | Supports standard and custom multi-phase compositions |
| **Step 2: Source Ingestion** | \`Step2Source.tsx\`, \`fileParsers.ts\`, \`SourceLocationModal.tsx\` | Parse DOCX (mammoth), PDF (pdfjs), XLSX/CSV (xlsx), TXT/MD; Google Drive / SharePoint URL inspection | Client-side in-memory extraction; zero server data retention |
| **Step 3: Gap Analysis** | \`Step3Clarify.tsx\`, \`registerExtractors.ts\` | Tri-state gap classification (Found/Missing/Uncertain); clarification questions; TBC propagation; register population | Bypassed for Meeting Minutes to maintain speed |
| **Step 4: Resilient Synthesis** | \`Step4Generate.tsx\`, \`server.ts\`, \`documentSynthesizer.ts\` | Dual-layer generation: Express Gemini 1.5 Flash (60s timeout) with automatic failover to local synthesizer | 100% offline deterministic fallback guarantee |
| **Step 5: Review & Canvas** | \`Step5Review.tsx\`, \`DocumentCanvas.tsx\`, \`VersionHistoryDrawer.tsx\` | Markdown editor with live preview; section navigator; conversational refine box; snapshot version control | Strips technical metadata from body; retains clean content |
| **Audit Provenance Inspector** | \`Step5Review.tsx\`, \`ComplianceHeatmap.tsx\` | Lifted evidence citations; forensic exclusions log; human review advisories; PMBOK knowledge area heatmap | ISO 21500 zero-hallucination provenance audit trail |
| **Stakeholder Impact Matrix** | \`StakeholderImpactMatrix.tsx\`, \`projectRegisters.ts\` | Interactive Power vs Interest 2x2 grid (Manage Closely, Keep Satisfied, Keep Informed, Monitor) | Filterable to supplier-only personnel (@advannotech.co.za) |
| **Risk Heatmap & Matrix** | \`RiskHeatmapChart.tsx\`, \`RiskMitigationTrend.tsx\` | ISO 31000 5x5 Probability/Impact scoring (1-25); RAG status; residual risk burn-down trend | Strict qualitative risk scoring with named mitigation owners |
| **RASCI Spreadsheet** | \`RasciSpreadsheet.tsx\`, \`projectRegisters.ts\` | Interactive RACI spreadsheet across all project work packages | Enforces single Accountable (A) party per deliverable |
| **Resource Load & Timeline** | \`ResourceLoadChart.tsx\`, \`ResourceAssignmentTimeline.tsx\` | Advannotech engineering FTE allocation and Gantt phase milestone distribution | Tracks capacity across Gauteng and Durban engineering hubs |
| **Governance Burndown** | \`BurndownChart.tsx\`, \`projectRegisters.ts\` | Velocity tracking for action items, deliverables, and governance gates | Real-time burn-down rate vs target velocity |
| **Dependency Network** | \`DependencyNetwork.tsx\`, \`projectRegisters.ts\` | Critical path deliverable dependency graph | Maps milestone sequencing and upstream/downstream blockers |
| **Register Manager** | \`RegisterManager.tsx\`, \`projectRegisters.ts\` | Unified management interface for stakeholders, risks, assumptions, and action items | Auto-populated from source text during gap analysis |
| **Financial EVM Engine** | \`documentSynthesizer.ts\`, \`documents.ts\` | Calculates BAC, AC, EV, PV, CPI, SPI, EAC, NPV (8.5% discount rate), IRR, ROI, and Payback Period | Full Earned Value Management compliance under PMBOK 7 |
| **Advanced Report Engine** | \`documentSynthesizer.ts\`, \`documents.ts\` | Synthesizes SteerCo, Progress, and Ad-Hoc reports with verbosity levels and chart placeholders | Grounded in period progress artifacts and forensic baselines |
| **Audit Existing Doc View** | \`ReviewExistingDocView.tsx\`, \`server.ts\` | Audits existing documents against ISO standards; produces compliance scores (0-100) and remediated drafts | Highlights missing mandatory clauses with ready-to-insert fixes |
| **Multi-Doc ISO Report** | \`MultiDocIsoReportView.tsx\`, \`sampleMultiDocPortfolio.ts\` | Evaluates compliance across entire project governance document portfolios | Generates executive audit summaries and portfolio gap reports |
| **Meeting Agenda Generator** | \`MeetingAgendaModal.tsx\`, \`meetingAgendas.ts\` | Generates formal stage-gate agendas tailored to specific documents; direct canvas insertion | Aligned with lifecycle gates and SteerCo protocols |
| **Timeline Verifier** | \`TimelineVerificationModal.tsx\`, \`App.tsx\` | Milestone start/completion date validation and baseline constraint reconciliation | Reconciles dates across charters, schedules, and contracts |
| **Export Engine (PDF/DOCX)** | \`exportUtils.ts\`, \`StageDocDownloadModal.tsx\` | Instant binary PDF via jsPDF; native Word docx via docx; raw Markdown; styled print view; CSV exports | Injects Advannotech letterhead, logos, and digital seals |
`.trim();

  const getActiveContent = () => {
    switch (activeTab) {
      case 'design-doc':
        return designDocumentMarkdown;
      case 'prompt':
        return masterPrompt;
      case 'components':
        return componentMatrixMarkdown;
      default:
        return designDocumentMarkdown;
    }
  };

  const activeContent = getActiveContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filenameMap = {
      'design-doc': `${docId}_System_Architecture_TDD.md`,
      'prompt': `${docId}_Master_System_Prompts.md`,
      'components': `${docId}_Component_Architecture_Matrix.md`
    };
    const filename = filenameMap[activeTab] || `${docId}_Specification.md`;
    downloadBlob(activeContent, filename, 'text/markdown;charset=utf-8');
  };

  const handleInsert = () => {
    if (onInsertDesignDoc) {
      onInsertDesignDoc(activeContent);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0B1528] border border-cyan-500/40 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 bg-[#0F172A] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <FileCode className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  System Architecture & Design Specification Suite
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono">
                  ALL COMPONENTS COVERED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Enterprise architecture TDD, master synthesis prompts, and component blueprint for <strong className="text-slate-200">{docTitle}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Tab Switcher: TDD vs Master Prompts vs Component Matrix */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-800/80 bg-[#0F172A]/70 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('design-doc')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'design-doc'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Full System TDD</span>
            </button>

            <button
              onClick={() => setActiveTab('prompt')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'prompt'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Master Synthesis Prompts</span>
            </button>

            <button
              onClick={() => setActiveTab('components')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'components'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Component Architecture Matrix</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.md)</span>
            </button>
          </div>
        </div>

        {/* Content Preview Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 bg-[#080E1C] font-mono text-xs text-slate-200 leading-relaxed custom-scrollbar">
          <pre className="whitespace-pre-wrap select-text font-mono text-xs bg-slate-950/80 p-5 rounded-xl border border-slate-800/80 overflow-x-auto text-slate-300 shadow-inner">
            {activeContent}
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0F172A] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              ISO 21500:2021 & {selectedStandard} Architecture · Covering <strong className="text-cyan-300">100% of Application Components</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
            >
              Close
            </button>

            {onInsertDesignDoc && (
              <button
                onClick={handleInsert}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
                title="Insert current tab markdown into the document canvas"
              >
                <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Load Active Specification into Canvas</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
