export interface RequiredFieldDef {
  name: string;
  subFields?: string[];
}

export interface PMIDocumentDefinition {
  id: string;
  title: string;
  phase: 'Initiation' | 'Planning' | 'Execution' | 'Monitoring & Controlling' | 'Closing';
  purpose: string;
  requiredSections: string[];
  requiredFields: string[];
  fieldDefinitions?: RequiredFieldDef[];
  isCritical?: boolean;
}

export const PMI_PHASES = [
  'Initiation',
  'Planning',
  'Execution',
  'Monitoring & Controlling',
  'Closing',
] as const;

export type PMIPhase = typeof PMI_PHASES[number];

export const DOCUMENT_CATALOGUE: PMIDocumentDefinition[] = [
  // 1. INITIATION
  {
    id: 'project-charter',
    title: 'Project Charter',
    phase: 'Initiation',
    purpose: 'Formally authorizes the existence of a project and provides the project manager with the authority to apply organizational resources to project activities.',
    requiredSections: [
      '1. Executive Summary & Project Purpose',
      '2. Measurable Project Objectives & Success Criteria',
      '3. High-Level Requirements & Scope Boundaries',
      '4. Key Milestones & Summary Schedule',
      '5. Summary Budget & Financial Authority',
      '6. High-Level Risks & Initial Assumptions',
      '7. Key Stakeholders & Governance Structure',
      '8. Project Sponsor & PM Approval Authority',
      '9. Appendix: Sources & Assumptions'
    ],
    requiredFields: [
      'Project Name',
      'Project Sponsor',
      'Project Manager',
      'Business Need & Objectives',
      'Scope Boundaries (In-Scope & Out-of-Scope)',
      'High-Level Milestones',
      'Summary Budget & Currency',
      'Assumptions & Constraints',
      'High-Level Risks',
      'Approval Sign-off Authority'
    ],
    isCritical: true
  },
  {
    id: 'stakeholder-register',
    title: 'Stakeholder Register',
    phase: 'Initiation',
    purpose: 'Identifies people, groups, or organizations that could impact or be impacted by a decision, activity, or outcome of the project, analyzing their expectations and influence.',
    requiredSections: [
      '1. Stakeholder Identification & Demographics',
      '2. Assessment & Expectations Matrix',
      '3. Classification & Power/Interest Grid',
      '4. Engagement Strategy & Communications Cadence',
      '5. Appendix: Sources & Assumptions'
    ],
    requiredFields: [
      'Stakeholder Names & Roles',
      'Internal vs External Classification',
      'Primary Project Expectations',
      'Influence / Power Rating',
      'Interest Rating',
      'Preferred Communication Channel'
    ]
  },
  {
    id: 'business-case',
    title: 'Business Case',
    phase: 'Initiation',
    purpose: 'Establishes whether the project is desirable, viable, and achievable to support investment decisions and strategic alignment.',
    requiredSections: [
      '1. Strategic Alignment & Executive Mandate',
      '2. Business Need & Problem Statement',
      '3. Option Evaluation & Trade-off Analysis',
      '4. Cost-Benefit & ROI Analysis',
      '5. Implementation Timeline & Financial Milestones',
      '6. Major Risks & Opportunity Realization',
      '7. Appendix: Sources & Assumptions'
    ],
    requiredFields: [
      'Problem / Opportunity Statement',
      'Strategic Alignment Goal',
      'Evaluated Options (Do Nothing vs Alternatives)',
      'Estimated Capital & Operational Costs',
      'Quantified Benefits / Payback Period',
      'Target Completion Window'
    ],
    isCritical: true
  },
  {
    id: 'feasibility-study',
    title: 'Feasibility Study',
    phase: 'Initiation',
    purpose: 'Evaluates project viability across technical, economic, operational, legal, and scheduling dimensions before capital commitment.',
    requiredSections: [
      '1. Technical Feasibility & Architectural Viability',
      '2. Economic & Financial Feasibility',
      '3. Legal, Regulatory & ISO Compliance',
      '4. Operational & Organizational Readiness',
      '5. Schedule Feasibility & Constraint Analysis',
      '6. Final Recommendation & Go/No-Go Decision Gate',
      '7. Appendix: Sources & Assumptions'
    ],
    requiredFields: [
      'Technical Capability Assessment',
      'Budgetary Upper Bound',
      'Regulatory & Compliance Standards',
      'Operational Resource Availability',
      'Critical Delivery Deadlines',
      'Feasibility Recommendation'
    ]
  },
  {
    id: 'assumptions-log',
    title: 'Assumptions Log',
    phase: 'Initiation',
    purpose: 'Records all strategic, operational, and technical assumptions and constraints throughout the project lifecycle.',
    requiredSections: [
      '1. Document Context & Governance Framework',
      '2. Strategic Business Assumptions',
      '3. Technical & Environmental Assumptions',
      '4. Project Constraints (Scope, Time, Cost, Quality)',
      '5. Validation Cadence & Ownership',
      '6. Appendix: Sources & Assumptions'
    ],
    requiredFields: [
      'Strategic Assumptions',
      'Technical / Resource Assumptions',
      'Hard Constraints',
      'Impact if Invalidated',
      'Assigned Validation Owner'
    ]
  },

  // 2. PLANNING
  {
    id: 'requirements-traceability-matrix',
    title: 'Requirements Traceability Matrix',
    phase: 'Planning',
    purpose: 'Links product requirements from their origin to the deliverables that satisfy them, ensuring each requirement adds business value and is verified.',
    requiredSections: [
      '1. Traceability Architecture & ID Scheme',
      '2. Business & Stakeholder Requirements',
      '3. Functional & Technical Requirements Matrix',
      '4. WBS Deliverable & Test Case Cross-Reference',
      '5. Verification & Acceptance Criteria',
      '6. Appendix: Sources & Assumptions'
    ],
    requiredFields: [
      'Requirement ID & Description',
      'Source / Requesting Stakeholder',
      'Associated Business Objective',
      'WBS Deliverable Mapping',
      'Verification Method & Acceptance Test'
    ]
  },
  {
    id: 'scope-baseline-wbs',
    title: 'Scope Baseline & WBS',
    phase: 'Planning',
    purpose: 'Comprises the Project Scope Statement, the Work Breakdown Structure (WBS), and the associated WBS Dictionary defining total deliverable boundaries.',
    requiredSections: [
      '1. Project Scope Statement (Inclusions & Exclusions)',
      '2. Deliverable Acceptance Criteria',
      '3. Hierarchical Work Breakdown Structure (Levels 1-4)',
      '4. WBS Dictionary & Work Package Specifications',
      '5. Scope Validation & Change Management Controls',
      '6. Appendix: Sources & Assumptions'
    ],
    requiredFields: [
      'Major Deliverables',
      'Clear Out-of-Scope Exclusions',
      'WBS Level Breakdown & Work Packages',
      'Acceptance Criteria per Deliverable',
      'Accountable Work Package Owners'
    ],
    isCritical: true
  },
  {
    id: 'schedule-baseline',
    title: 'Schedule Baseline',
    phase: 'Planning',
    purpose: 'Approved version of the project schedule model that can be changed only through formal change control procedures.',
    requiredSections: [
      '1. Schedule Management Approach & Cadence',
      '2. Milestone Schedule & Target Dates',
      '3. Work Package Sequencing & Critical Path',
      '4. Resource Allocation & Calendar Assumptions',
      '5. Schedule Variance Thresholds & Controls',
      '6. Appendix: Sources & Assumptions'
    ],
    requiredFields: [
      'Project Start & Target Completion Dates',
      'Major Phase Milestones & Deadlines',
      'Critical Path Activities',
      'Dependencies (Predecessors & Successors)',
      'Schedule Variance Tolerance (e.g. +/- days)'
    ],
    isCritical: true
  },
  {
    id: 'cost-baseline-budget',
    title: 'Cost Baseline & Budget',
    phase: 'Planning',
    purpose: 'Authorized time-phased project budget, excluding any management reserves, used to measure and monitor cost performance.',
    requiredSections: [
      '1. Cost Estimation Methodology & Currency',
      '2. Work Package Cost Estimates',
      '3. Contingency Reserves Allocation',
      '4. Management Reserves & Total Project Budget',
      '5. Funding Limit Reconciliation & Cash Flow',
      '6. Cost Variance Thresholds & Control Gates',
      '7. Appendix: Sources & Assumptions'
    ],
    requiredFields: [
      'Total Project Budget & Operating Currency',
      'Direct Costs (Labour, Hardware, Software, Services)',
      'Contingency Reserve Percentage / Value',
      'Management Reserve Amount',
      'Cost Baseline Spend Schedule'
    ],
    isCritical: true
  },
  {
    id: 'quality-management-plan',
    title: 'Quality Management Plan',
    phase: 'Planning',
    purpose: 'Identifies quality requirements and standards for the project and its deliverables, documenting how compliance will be demonstrated.',
    requiredSections: [
      '1. Quality Policy & ISO Compliance Baseline',
      '2. Quality Objectives & Metric Thresholds',
      '3. Quality Assurance (QA) Processes & Audits',
      '4. Quality Control (QC) Activities & Testing',
      '5. Defect Management & Corrective Action Protocol',
      '6. Appendix: Sources & Assumptions'
    ],
    requiredFields: [
      'Applicable Quality Standards (e.g. ISO 9001/27001)',
      'Key Quality Metrics & Tolerances',
      'Inspection & Audit Schedule',
      'Responsible Quality Lead',
      'Defect Severity Classifications'
    ]
  },
  {
    id: 'resource-requirements-rbs',
    title: 'Resource Requirements & RBS',
    phase: 'Planning',
    purpose: 'Documents the types and quantities of human and physical resources required for each work package, organized into a Resource Breakdown Structure.',
    requiredSections: [
      '1. Resource Management Approach',
      '2. Human Resource Requirements & Skill Profiles',
      '3. Physical Equipment, Facilities & Software Tooling',
      '4. Hierarchical Resource Breakdown Structure (RBS)',
      '5. Resource Acquisition Schedule & Constraints',
      '6. Appendix: Sources & Assumptions'
    ],
    requiredFields: [
      'Required Personnel Roles & Competencies',
      'FTE Estimates per Work Package',
      'Specialized Hardware / Software Requirements',
      'Acquisition Source (Internal vs Contractor)',
      'Resource Onboarding & Release Dates'
    ]
  },
  {
    id: 'communications-plan',
    title: 'Communications Plan',
    phase: 'Planning',
    purpose: 'Determines the information and communication needs of the stakeholders: who needs what, when, how it will be provided, and by whom.',
    requiredSections: [
      '1. Stakeholder Communication Requirements',
      '2. Information Distribution Matrix & Channels',
      '3. Meeting Cadence, Agenda & Protocols',
      '4. Escalation Paths & Crisis Communications',
      '5. Document Repository & Versioning Standard',
      '6. Appendix: Sources & Assumptions'
    ],
    requiredFields: [
      'Communication Artefacts (Status Reports, SteerCos, Standups)',
      'Distribution Frequency & Modality',
      'Sender / Initiator',
      'Target Audience / Recipients',
      'Escalation Thresholds & Timelines'
    ]
  },
  {
    id: 'procurement-plan',
    title: 'Procurement Plan',
    phase: 'Planning',
    purpose: 'Documents project procurement decisions, specifying the approach and identifying potential sellers.',
    requiredSections: [
      '1. Make-or-Buy Decisions & Sourcing Rationale',
      '2. Procurement Statements of Work (SOW)',
      '3. Contract Types & Pricing Structures',
      '4. Vendor Selection Criteria & Evaluation Weights',
      '5. Procurement Milestones & Contract Management',
      '6. Appendix: Sources & Assumptions'
    ],
    requiredFields: [
      'Outsourced Services or Products',
      'Contract Type (Fixed Price, Time & Materials, etc.)',
      'Evaluation & Selection Criteria',
      'Estimated Procurement Budget',
      'Target RFP / Contract Award Dates'
    ]
  },

  // 3. EXECUTION
  {
    id: 'change-log',
    title: 'Change Log',
    phase: 'Execution',
    purpose: 'Comprehensive document that records changes that occur during a project, along with their evaluation, approval, and implementation status.',
    requiredSections: [
      '1. Change Control Governance & CCB Mandate',
      '2. Master Change Log Register Table',
      '3. Impact Assessment Breakdown (Scope, Schedule, Budget)',
      '4. Change Request Status & Approval Disposition',
      '5. Implementation & Verification Tracking',
      '6. Appendix: Sources & Assumptions'
    ],
    requiredFields: [
      'Change Request ID',
      'Description of Proposed Change',
      'Requestor & Date Submitted',
      'Scope / Schedule / Cost Impact',
      'Change Control Board (CCB) Decision',
      'Assigned Implementation Owner'
    ]
  },
  {
    id: 'issue-log',
    title: 'Issue Log',
    phase: 'Execution',
    purpose: 'Documents and monitors current issues, blocking problems, and discrepancies affecting project execution.',
    requiredSections: [
      '1. Issue Management Workflow & Severity Definitions',
      '2. Active Project Issue Register Table',
      '3. Root Cause Analysis & Escalation Triggers',
      '4. Corrective Action Plans & Resolution Target Dates',
      '5. Historical Resolved Issues',
      '6. Appendix: Sources & Assumptions'
    ],
    requiredFields: [
      'Issue Identifier & Summary',
      'Severity & Business Impact (Critical / High / Medium / Low)',
      'Date Raised & Reported By',
      'Assigned Issue Owner',
      'Mitigation / Corrective Action Plan',
      'Target Resolution Deadline'
    ]
  },
  {
    id: 'lessons-learned-register',
    title: 'Lessons Learned Register',
    phase: 'Execution',
    purpose: 'Captures knowledge gained during the project to improve current performance and future organizational execution.',
    requiredSections: [
      '1. Knowledge Capture Framework & Methodology',
      '2. Performance Domain Findings (Scope, Tech, Team, Vendor)',
      '3. Success Factors & What Went Well',
      '4. Challenges, Pitfalls & Root Cause Diagnostics',
      '5. Actionable Recommendations for Future Initiatives',
      '6. Appendix: Sources & Assumptions'
    ],
    requiredFields: [
      'Event / Work Package Context',
      'Identified Challenge or Success',
      'Impact on Project Performance',
      'Action Taken / Response',
      'Permanent Process Improvement Recommendation'
    ]
  },
  {
    id: 'job-card',
    title: 'Job Card',
    phase: 'Execution',
    purpose: 'Operational instruction and tracking document authorizing and certifying specific work execution, technical deliverables, and sign-off.',
    requiredSections: [
      '1. Job Card Header & Work Authorization ID',
      '2. Task Scope, Safety & Environmental Constraints',
      '3. Assigned Technicians & Resource Allocation',
      '4. Step-by-Step Execution Checklist & QC Verifications',
      '5. Materials & Components Consumed',
      '6. Completion Sign-Off & Client Witness Verification',
      '7. Appendix: Sources & Assumptions'
    ],
    requiredFields: [
      'Job Card Identifier & Date',
      'Site / Location of Work',
      'Lead Engineer / Technician Name',
      'Detailed Technical Work Instructions',
      'Bill of Materials / Components Used',
      'Safety Procedures & Client Sign-off'
    ]
  },

  // 4. MONITORING & CONTROLLING
  {
    id: 'status-report',
    title: 'Status Report',
    phase: 'Monitoring & Controlling',
    purpose: 'Provides regular summary of project performance against baselines, upcoming milestones, issues, and risks for executive governance.',
    requiredSections: [
      '1. Executive Summary & RAG Health Status',
      '2. Schedule Performance & Milestones Completed This Period',
      '3. Milestone Targets for Next Reporting Period',
      '4. Financial Performance & Earned Value (EV, PV, AC, CPI, SPI)',
      '5. Critical Issues, Active Risks & Decisions Required',
      '6. Sponsor Governance Decisions Required',
      '7. Appendix: Sources & Assumptions'
    ],
    requiredFields: [
      'Reporting Period (Start & End Date)',
      'Overall Project RAG Status (Red / Amber / Green)',
      'Key Accomplishments This Period',
      'Planned Activities Next Period',
      'Budget & Schedule Variance Metrics',
      'Top Risks / Decisions Needed from Leadership'
    ]
  },
  {
    id: 'quality-control-measurements',
    title: 'Quality Control Measurements',
    phase: 'Monitoring & Controlling',
    purpose: 'Documents the results of quality control activities to evaluate whether deliverables adhere to quality standards and specifications.',
    requiredSections: [
      '1. Measurement Standards & Testing Protocol',
      '2. Deliverable Inspection Test Matrix & Raw Results',
      '3. Variance Analysis against Quality Baseline',
      '4. Non-Conformance Reports & Defect Log',
      '5. Remediation & Re-testing Action Schedule',
      '6. Appendix: Sources & Assumptions'
    ],
    requiredFields: [
      'Inspected Deliverable / Component',
      'Tested Quality Parameter',
      'Observed Value vs Baseline Specification',
      'Pass / Fail Determination',
      'Corrective Action for Non-Conformances'
    ]
  },
  {
    id: 'risk-register',
    title: 'Risk Register',
    phase: 'Monitoring & Controlling',
    purpose: 'Comprehensive repository of identified risks, qualitative and quantitative analysis, and planned mitigation strategies.',
    requiredSections: [
      '1. Risk Management Framework & Probability/Impact Matrix',
      '2. Master Risk Log (Threats & Opportunities)',
      '3. Qualitative Risk Analysis & Priority Scoring',
      '4. Risk Response Strategies (Avoid, Transfer, Mitigate, Accept)',
      '5. Contingency Plans, Triggers & Secondary Risks',
      '6. Risk Owner Accountabilities & Review Dates',
      '7. Appendix: Sources & Assumptions'
    ],
    requiredFields: [
      'Risk ID & Threat/Opportunity Description',
      'Root Cause & Event Trigger',
      'Probability Rating (1-5 or Low/Med/High)',
      'Impact Rating (1-5 or Low/Med/High)',
      'Specific Mitigation Strategy',
      'Designated Risk Owner & Contingency Action'
    ],
    isCritical: true
  },
  {
    id: 'issue-management-status',
    title: 'Issue Management Status',
    phase: 'Monitoring & Controlling',
    purpose: 'Reports on trends, resolution velocity, and unresolved blockers across all active operational issues.',
    requiredSections: [
      '1. Issue Status Executive Summary',
      '2. Issue Velocity & Burn-Down Metrics',
      '3. Blocking Critical/High Issues Breakdown',
      '4. Escalation Items Requiring Sponsor Intervention',
      '5. Preventive Actions & Policy Updates',
      '6. Appendix: Sources & Assumptions'
    ],
    requiredFields: [
      'Total Active Issues by Severity',
      'Critical Blockers & Daily Operational Impact',
      'Days Open per Issue',
      'Escalation Requirements',
      'Target Closure Dates'
    ]
  },
  {
    id: 'procurement-performance-report',
    title: 'Procurement Performance Report',
    phase: 'Monitoring & Controlling',
    purpose: 'Evaluates seller performance against contract terms, deliverables, budgets, and service level agreements (SLAs).',
    requiredSections: [
      '1. Contract Overview & Vendor Directory',
      '2. Deliverable Milestone Fulfillment vs SLA Baseline',
      '3. Invoice Verification & Financial Reconciliation',
      '4. Quality, Defect & Performance Discrepancies',
      '5. Vendor Risk & Dispute Assessment',
      '6. Appendix: Sources & Assumptions'
    ],
    requiredFields: [
      'Vendor Name & Contract Number',
      'Contract Value & Invoiced Amount to Date',
      'SLA Metric Fulfillment Percentage',
      'Outstanding Deliverables or Deficiencies',
      'Vendor Performance Rating'
    ]
  },
  {
    id: 'rasci-matrix',
    title: 'RASCI Responsibility Matrix',
    phase: 'Monitoring & Controlling',
    purpose: 'Defines the roles and responsibilities of stakeholders for project tasks, using the RASCI model (Responsible, Accountable, Supportive, Consulted, Informed).',
    requiredSections: [
      '1. Governance Framework & RASCI Definitions',
      '2. Project Management & Delivery RASCI Matrix',
      '3. Technical & Engineering RASCI Matrix',
      '4. Procurement & Commercial RASCI Matrix',
      '5. Operational Support & SLA RASCI Matrix',
      '6. Appendix: Sources & Assumptions'
    ],
    requiredFields: [
      'Task / Deliverable List',
      'Primary Accountable Party (A)',
      'Primary Responsible Party (R)',
      'Supportive Resources (S)',
      'Consulted Stakeholders (C)',
      'Informed Stakeholders (I)'
    ]
  },
  {
    id: 'meeting-minutes',
    title: 'Meeting Minutes',
    phase: 'Monitoring & Controlling',
    purpose: 'Formal audit-compliant record of discussions, decisions, risks, and action items originating from project governance sessions.',
    requiredSections: [
      '1. Meeting Details',
      '2. Purpose/Summary',
      '3. Key Discussion Points',
      '4. Decisions Made',
      '5. Action Items',
      '6. Risks, Issues and Dependencies',
      '7. Open Questions / Parked Items',
      '8. Next Meeting'
    ],
    requiredFields: [
      'Meeting Title',
      'Date',
      'Time',
      'Attendees',
      'Apologies',
      'Meeting Purpose',
      'Decisions Made',
      'Action Items with Owner & Due Date',
      'Risks or Issues Identified'
    ]
  },

  // 5. CLOSING
  {
    id: 'final-report',
    title: 'Final Report',
    phase: 'Closing',
    purpose: 'Provides a summary of project performance, scope verification, objective achievement, financial reconciliation, and final transition.',
    requiredSections: [
      '1. Executive Summary & Objective Fulfillment Scorecard',
      '2. Scope Baseline vs Final Delivered Capabilities',
      '3. Schedule Performance & Variance Analysis',
      '4. Cost Baseline vs Actual Expenditure Reconciliation',
      '5. Operational Handover & Transition Assurance',
      '6. Key Strategic Lessons Learned',
      '7. Sponsor & Governance Closure Endorsement',
      '8. Appendix: Sources & Assumptions'
    ],
    requiredFields: [
      'Project Start & Formal Finish Date',
      'Summary of Final Scope Delivered',
      'Total Approved Budget vs Final Actual Cost',
      'Variance Explanations',
      'Operations Handover Recipient',
      'Formal Project Closure Recommendation'
    ]
  },
  {
    id: 'procurement-contract-closeout',
    title: 'Procurement Contract Closeout',
    phase: 'Closing',
    purpose: 'Documents formal acceptance of all procurement deliverables, financial settlements, warranty obligations, and contractor release.',
    requiredSections: [
      '1. Contract Reference & Procurement Scope Summary',
      '2. Deliverable Inspection & Acceptance Verification',
      '3. Financial Settlement, Retainage & Final Payment Authorization',
      '4. Warranty Terms, IP Transfer & Ongoing Support Agreements',
      '5. Formal Contractor Discharge & Legal Release',
      '6. Appendix: Sources & Assumptions'
    ],
    requiredFields: [
      'Contract Reference & Vendor Name',
      'Final Contract Settlement Amount',
      'Statement of Full Deliverable Acceptance',
      'Warranty Period & Terms',
      'Contractor Release and Indemnity Sign-off'
    ]
  },
  {
    id: 'client-sign-off-document',
    title: 'Client Sign-off Document',
    phase: 'Closing',
    purpose: 'Definitive governance artifact securing formal client acceptance, milestone handover, and release of liabilities.',
    requiredSections: [
      '1. Handover Mandate & Deliverable Catalog',
      '2. User Acceptance Testing (UAT) Sign-off Certificate',
      '3. Outstanding Punch-List / Known Defects (if any)',
      '4. Operations & Maintenance Custody Transfer',
      '5. Formal Acceptance Declaration & Release',
      '6. Authorised Signature & Seals Block',
      '7. Appendix: Sources & Assumptions'
    ],
    requiredFields: [
      'Client Organization & Authorised Representative',
      'Project Deliverables Accepted',
      'Date of Formal Handover',
      'Exceptions or Punch-List Caveats',
      'Client Authorised Sign-off Signature Block'
    ],
    isCritical: true
  },
  {
    id: 'change-request-form',
    title: 'Change Request Form (CRF)',
    phase: 'Execution',
    purpose: 'Formal document used to propose a change to any project baseline (Scope, Schedule, or Cost). Requires impact assessment and dual-party authorization.',
    requiredSections: [
      '1. Change Identification & Requestor Details',
      '2. Description of Proposed Change',
      '3. Rationale & Executive Justification',
      '4. Impact Assessment (Scope, Schedule, Cost, Quality)',
      '5. Associated WBS & Work Package References',
      '6. Technical & Operational Risks',
      '7. Executive Approval & CCB Decision',
      '8. Appendix: Sources & Assumptions'
    ],
    requiredFields: [
      'Change Request ID',
      'Requestor Name & Organization',
      'Change Type (Scope / Schedule / Budget)',
      'Detailed Change Description',
      'WBS Reference Items',
      'Estimated Schedule Variance',
      'Estimated Cost Impact (Client-exclusive)',
      'Approval Authority'
    ]
  },
  {
    id: 'report-generator',
    title: 'Advanced Report Generator',
    phase: 'Monitoring & Controlling',
    purpose: 'Specialized engine for synthesizing Progress, Steerco, and Ad-Hoc reports based on ingested project data and forensic baselines.',
    requiredSections: [
      '1. Executive Summary',
      '2. Performance vs Baseline Scorecard',
      '3. Period Accomplishments',
      '4. Upcoming Milestones & Critical Path',
      '5. Financial Status (Client Baseline Only)',
      '6. Risks & Issues Requiring Escalation',
      '7. Appendix: Forensic Traceability'
    ],
    requiredFields: [
      'Report Type (Summary / Standard / Detailed)',
      'Reporting Period',
      'RAG Status',
      'Key Accomplishments',
      'Critical Path Status',
      'Financial Burn vs Budget'
    ]
  },
  {
    id: 'financial-report',
    title: 'Financial Calculations Report',
    phase: 'Monitoring & Controlling',
    purpose: 'Forensic financial analysis and projections for the project, covering ROI, NPV, CapEx/OpEx reconciliation, and cash flow forecasting.',
    requiredSections: [
      '1. Executive Financial Summary',
      '2. Capital Expenditure (CapEx) Reconciliation',
      '3. Operational Expenditure (OpEx) Performance',
      '4. Return on Investment (ROI) & Payback Analysis',
      '5. Net Present Value (NPV) & Internal Rate of Return (IRR)',
      '6. Cash Flow Forecasting & Funding Requirements',
      '7. Financial Risk & Sensitivity Analysis',
      '8. Appendix: Forensic Source Grounding'
    ],
    requiredFields: [
      'Total Project Budget',
      'Actual Cost to Date (AC)',
      'Planned Value (PV)',
      'Earned Value (EV)',
      'Cost Performance Index (CPI)',
      'Schedule Performance Index (SPI)',
      'Estimated ROI Percentage',
      'Payback Period (Months)',
      'Discount Rate (%)'
    ]
  }
];

/**
 * Standard-specific terminology and structure overrides
 */
export type PMStandard = 'PMBOK 7';

interface StandardOverride {
  title?: string;
  requiredSections?: string[];
  requiredFields?: string[];
}

const STANDARD_OVERRIDES: Record<PMStandard, Record<string, StandardOverride>> = {
  'PMBOK 7': {}, // Default is PMBOK 7
};

/**
 * Adapts a document definition based on the selected standard
 */
export function getAdaptedDocument(doc: PMIDocumentDefinition, standard: PMStandard): PMIDocumentDefinition {
  const overrides = STANDARD_OVERRIDES[standard]?.[doc.id] || {};
  const baseFields = [
    'Customer',
    'Registered Partner / Solution Partner',
    'Customer Contact',
    'Date Registered',
    ...(overrides.requiredFields || doc.requiredFields)
  ];

  return {
    ...doc,
    title: overrides.title || doc.title,
    requiredSections: overrides.requiredSections || doc.requiredSections,
    requiredFields: Array.from(new Set(baseFields)), // Ensure uniqueness
  };
}

export const CUSTOM_DOCUMENT_DEFINITION: PMIDocumentDefinition = {
  id: 'custom-doc',
  title: 'Build Your Own Document',
  phase: 'Planning', // Placeholder phase
  purpose: 'A fully customizable governance artifact. Select any combination of sections and required fields from the Advannotech/PMBOK 7th catalogue to build a bespoke document.',
  requiredSections: [],
  requiredFields: [],
};

export function getDocumentById(id: string): PMIDocumentDefinition | undefined {
  if (id === 'custom-doc') return CUSTOM_DOCUMENT_DEFINITION;
  return DOCUMENT_CATALOGUE.find((doc) => doc.id === id);
}

export function getDocumentsByPhase(phase: PMIPhase): PMIDocumentDefinition[] {
  return DOCUMENT_CATALOGUE.filter((doc) => doc.phase === phase);
}

/**
 * Returns all unique sections and fields across the entire catalogue
 */
export function getAllUniqueSectionsAndFields() {
  const allSections = new Set<string>();
  const allFields = new Set<string>();

  DOCUMENT_CATALOGUE.forEach((doc) => {
    doc.requiredSections.forEach((s) => allSections.add(s));
    doc.requiredFields.forEach((f) => allFields.add(f));
  });

  return {
    sections: Array.from(allSections).sort(),
    fields: Array.from(allFields).sort(),
  };
}

/**
 * Returns field definitions with sub-fields for any document
 */
export function getDocumentFieldDefinitions(doc: PMIDocumentDefinition): RequiredFieldDef[] {
  if (doc.id === 'custom-doc') {
    const { fields } = getAllUniqueSectionsAndFields();
    return fields.map(f => ({ name: f, subFields: getFallbackSubfields(f) }));
  }

  if (doc.fieldDefinitions && doc.fieldDefinitions.length > 0) {
    return doc.fieldDefinitions;
  }

  return doc.requiredFields.map((field) => {
    return {
      name: field,
      subFields: getFallbackSubfields(field)
    };
  });
}

function getFallbackSubfields(field: string): string[] {
  const fLower = field.toLowerCase();
  let subFields: string[] = [];

  if (fLower.includes('scope')) {
    subFields = ['In-Scope Work Deliverables', 'Out-of-Scope Exclusions', 'Acceptance Boundaries'];
  } else if (fLower.includes('budget') || fLower.includes('cost')) {
    subFields = ['Capital Expenditure (CapEx)', 'Operational Expenditure (OpEx)', 'Contingency Reserve'];
  } else if (fLower.includes('milestone') || fLower.includes('schedule') || fLower.includes('date')) {
    subFields = ['Project Kickoff / Authorization', 'Gate Review Milestone', 'Final Handover / Sign-off'];
  } else if (fLower.includes('risk')) {
    subFields = ['Identified Risk Event', 'Impact & Probability Rating', 'Mitigation & Contingency Strategy'];
  } else if (fLower.includes('stakeholder') || fLower.includes('resource') || fLower.includes('sponsor') || fLower.includes('manager')) {
    subFields = ['Primary Accountable Person', 'Contact Details & Organization', 'RACI Governance Level'];
  } else if (fLower.includes('objective') || fLower.includes('need')) {
    subFields = ['Strategic Alignment Goal', 'Measurable Success KPI', 'Business Benefit Target'];
  } else if (fLower.includes('assumption') || fLower.includes('constraint')) {
    subFields = ['Key Operating Assumption', 'Hard Project Constraint', 'Validation Owner'];
  } else if (fLower.includes('quality') || fLower.includes('acceptance')) {
    subFields = ['Quality Metric Baseline', 'Testing / Verification Method', 'Tolerance Threshold'];
  } else {
    subFields = ['Core Specification', 'Verification Criteria'];
  }
  return subFields;
}
