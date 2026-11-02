/**
 * ISO 21500:2021 & ISO 21502 Standard Project Governance Folder Hierarchy
 * 
 * Provides an authoritative directory taxonomy structured according to ISO 21500
 * (Project, programme and portfolio management) process groups and subject groups.
 * Every folder includes a standardized REQUIRED_DOCUMENTS.txt manifest.
 */

export interface IsoDocumentItem {
  id: string;
  name: string;
  isoClause: string;
  mandatory: boolean;
  frequency: string;
  responsibleRole: string;
  description: string;
  keySections: string[];
}

export interface IsoFolderNode {
  path: string;
  folderName: string;
  parentPath?: string;
  phase: string;
  description: string;
  documents: IsoDocumentItem[];
  subfolders?: IsoFolderNode[];
}

export const ISO_21500_FOLDER_STRUCTURE: IsoFolderNode[] = [
  {
    path: '00_Pre_Initiation_Sales_and_Client',
    folderName: '00_Pre_Initiation_Sales_and_Client',
    phase: 'Pre-Initiation',
    description: 'Early-stage sales artifacts, client requirement documents, and initial commercial agreements prior to formal project chartering.',
    documents: [
      {
        id: 'DOC-SAL-001',
        name: 'Sales Proposal & Tender Response',
        isoClause: 'ISO 21502 Clause 4 (Pre-project activities)',
        mandatory: true,
        frequency: 'Pre-Initiation',
        responsibleRole: 'Account Manager / Sales Director',
        description: 'The formal response to client RFPs or unsolicited proposals outlining the proposed solution and value proposition.',
        keySections: ['Executive Summary', 'Proposed Solution', 'Technical Architecture', 'Commercial Model', 'Timeline Estimates']
      },
      {
        id: 'DOC-SAL-002',
        name: 'Master Service Agreement (MSA)',
        isoClause: 'ISO 21502 Clause 7.8 (Procurement)',
        mandatory: true,
        frequency: 'Once per client relationship',
        responsibleRole: 'Legal Counsel / Commercial Director',
        description: 'The overarching legal contract governing the long-term relationship between Advannotech and the client.',
        keySections: ['Terms & Conditions', 'IP Ownership', 'Liability & Indemnity', 'Payment Terms', 'Termination Clauses']
      },
      {
        id: 'DOC-SAL-003',
        name: 'Pre-Project Statement of Work (Draft SOW)',
        isoClause: 'ISO 21502 Clause 6.2 (Business Case)',
        mandatory: true,
        frequency: 'Pre-Initiation',
        responsibleRole: 'Solution Architect / Account Manager',
        description: 'Initial draft of the work scope used for commercial estimation and client alignment before project formalization.',
        keySections: ['High-Level Scope', 'Assumed Deliverables', 'Resource Estimates', 'Pricing Schedule']
      },
      {
        id: 'DOC-SAL-004',
        name: 'Client Requirements Document (CRD)',
        isoClause: 'ISO 21502 Clause 7.2 (Requirements)',
        mandatory: true,
        frequency: 'Discovery Phase',
        responsibleRole: 'Business Analyst / Account Manager',
        description: 'Raw requirements captured from client discovery sessions, workshops, and business analysis.',
        keySections: ['Business Problems', 'User Needs', 'Functional Desires', 'Technical Constraints']
      }
    ]
  },
  {
    path: '01_Project_Governance_and_Framework',
    folderName: '01_Project_Governance_and_Framework',
    phase: 'Governance',
    description: 'Corporate oversight, delegation of authority, steering committee terms of reference, and regulatory compliance standards.',
    documents: [
      {
        id: 'DOC-GOV-001',
        name: 'Project Governance Framework & Delegation of Authority',
        isoClause: 'ISO 21502 Clause 5.2 (Governance Framework)',
        mandatory: true,
        frequency: 'Initial setup / Annual review',
        responsibleRole: 'Project Sponsor & Advannotech Executive Board',
        description: 'Defines the organizational hierarchy, escalation paths, financial threshold authorizations, and decision-making rights.',
        keySections: ['Governance Hierarchy', 'Delegation of Authority Matrix', 'Escalation Boundaries', 'Steering Committee Mandate']
      },
      {
        id: 'DOC-GOV-002',
        name: 'Steering Committee (SteerCo) Terms of Reference',
        isoClause: 'ISO 21502 Clause 5.3 (Project Board / Steering Group)',
        mandatory: true,
        frequency: 'Approved at Kickoff',
        responsibleRole: 'Steering Committee Chair (C-Level)',
        description: 'Establishes meeting cadence, quorum requirements, voting rules, and dispute resolution mechanisms for executive stakeholders.',
        keySections: ['Committee Composition', 'Quorum and Voting Protocol', 'Review Cadence (Monthly)', 'Dispute Resolution']
      },
      {
        id: 'DOC-GOV-003',
        name: 'ISO 21500 & PMBOK Standard Compliance Matrix',
        isoClause: 'ISO 21500 Clause 4 / ISO 21502 Clause 6',
        mandatory: true,
        frequency: 'Baseline and Gate Audits',
        responsibleRole: 'Quality & Governance Assurance Lead',
        description: 'Cross-reference traceability matrix mapping project deliverables against ISO 21500:2021 clauses and audit checklists.',
        keySections: ['Standard Cross-Reference', 'Compliance Checklist', 'Audit Traceability Log', 'Exemption Justifications']
      },
      {
        id: 'DOC-GOV-004',
        name: 'Stage Gate Governance & Assurance Procedures',
        isoClause: 'ISO 21502 Clause 6.1 (Project Life Cycle Stages)',
        mandatory: true,
        frequency: 'Every Stage Transition',
        responsibleRole: 'Lead Project Assurance Manager',
        description: 'Outlines the forensic stage gate criteria, readiness score minimums (85%+), and formal sign-off requirements.',
        keySections: ['Stage Gate Gates 1-5 Criteria', 'Gate Readiness Scoring', 'Deliverable Verification Checklist', 'Sign-off Certificates']
      }
    ]
  },
  {
    path: '02_Initiating',
    folderName: '02_Initiating',
    phase: 'Initiating',
    description: 'Processes performed to define a new project or a new phase by obtaining authorization to start the project or phase.',
    documents: [
      {
        id: 'DOC-INI-101',
        name: 'Project Charter',
        isoClause: 'ISO 21500 Clause 6.2 (Project Charter)',
        mandatory: true,
        frequency: 'Once during initiation',
        responsibleRole: 'Project Sponsor & Project Manager',
        description: 'Formally authorizes the existence of the project and provides the project manager with the authority to apply organizational resources.',
        keySections: ['Executive Summary', 'Business Need & Objectives', 'High-Level Scope', 'Assigned PM Authority', 'Initial Budget & Milestones', 'Executive Signatures']
      },
      {
        id: 'DOC-INI-102',
        name: 'Preliminary Project Scope Statement',
        isoClause: 'ISO 21502 Clause 7.2 (Scope Definition)',
        mandatory: true,
        frequency: 'Initiation phase',
        responsibleRole: 'Project Manager & Lead Architect',
        description: 'Captures the high-level boundaries, major deliverables, exclusions, and known constraints prior to detailed planning.',
        keySections: ['Scope Boundaries', 'Major In-Scope Deliverables', 'Out-of-Scope Exclusions', 'Key Constraints & Assumptions']
      },
      {
        id: 'DOC-INI-103',
        name: 'Business Case & Feasibility Study',
        isoClause: 'ISO 21502 Clause 6.2 (Business Case Justification)',
        mandatory: true,
        frequency: 'Initiation / Gate 1',
        responsibleRole: 'Commercial Director & Financial Controller',
        description: 'Cost-benefit analysis, strategic alignment rationale, ROI projections, and initial operational risk evaluation.',
        keySections: ['Problem Statement', 'Strategic Alignment', 'Cost-Benefit Financial Analysis', 'Alternative Options Assessed', 'ROI & Payback Period']
      },
      {
        id: 'DOC-INI-104',
        name: 'Stakeholder Identification Register',
        isoClause: 'ISO 21500 Clause 6.11 / ISO 21502 Clause 7.10',
        mandatory: true,
        frequency: 'Initial creation, continuous maintenance',
        responsibleRole: 'Project Manager',
        description: 'Catalogues all internal and external parties affected by or capable of influencing the project, their contact details and roles.',
        keySections: ['Stakeholder Names & Roles', 'Department & Contact Details', 'Initial Interest & Expectations', 'Classification Level']
      },
      {
        id: 'DOC-INI-105',
        name: 'Stage Gate 1 Sign-Off Certificate (Initiation to Planning)',
        isoClause: 'ISO 21502 Clause 6.1 (Stage Gate Review)',
        mandatory: true,
        frequency: 'Conclusion of Initiation',
        responsibleRole: 'Steering Committee / Project Sponsor',
        description: 'Formal executive sign-off certifying completion of initiation requirements and granting approval to fund detailed planning.',
        keySections: ['Gate 1 Audit Findings', 'Readiness Score Verification', 'Approved Planning Budget', 'Executive Signatures']
      }
    ]
  },
  {
    path: '03_Planning',
    folderName: '03_Planning',
    phase: 'Planning',
    description: 'Master planning processes to establish total project scope, define objectives, and develop the course of action required to attain them.',
    documents: [
      {
        id: 'DOC-PLN-200',
        name: 'Master Project Management Plan (PMP Index)',
        isoClause: 'ISO 21500 Clause 6.3 / ISO 21502 Clause 6.3',
        mandatory: true,
        frequency: 'Baselined at Gate 2, updated via change control',
        responsibleRole: 'Project Manager',
        description: 'The master integrated governance document coordinating all subsidiary management plans, baselines, and execution protocols.',
        keySections: ['Project Organization & Governance', 'Integrated Baselines Summary', 'Subsidiary Plans Directory', 'Change Control Protocol']
      }
    ],
    subfolders: [
      {
        path: '03_Planning/01_Integration_and_Scope',
        folderName: '01_Integration_and_Scope',
        parentPath: '03_Planning',
        phase: 'Planning',
        description: 'Scope baseline, requirements traceability, and work breakdown structures.',
        documents: [
          {
            id: 'DOC-PLN-201',
            name: 'Scope Management Plan & Scope Baseline',
            isoClause: 'ISO 21502 Clause 7.2 (Scope Management)',
            mandatory: true,
            frequency: 'Planning baseline',
            responsibleRole: 'Project Manager',
            description: 'Defines how project scope will be defined, validated, monitored, and controlled throughout execution.',
            keySections: ['Scope Definition Process', 'Scope Verification Protocol', 'Scope Change Procedures', 'Acceptance Criteria']
          },
          {
            id: 'DOC-PLN-202',
            name: 'Work Breakdown Structure (WBS) & WBS Dictionary',
            isoClause: 'ISO 21500 Clause 6.5 / ISO 21502 Clause 7.2.3',
            mandatory: true,
            frequency: 'Planning baseline',
            responsibleRole: 'Project Manager & Technical Leads',
            description: 'Hierarchical decomposition of the total scope into discrete, manageable work packages with full descriptive dictionaries.',
            keySections: ['Hierarchical WBS Code Tree', 'Work Package Descriptions', 'Owner Assignment', 'Deliverables Definition', 'Completion Acceptance Criteria']
          },
          {
            id: 'DOC-PLN-202_traceability',
            name: 'Requirements Traceability Matrix (RTM)',
            isoClause: 'ISO 21502 Clause 7.2 (Requirements Management)',
            mandatory: true,
            frequency: 'Planning through Verification',
            responsibleRole: 'Business Analyst / Systems Engineer',
            description: 'Tracks each high-level business requirement through technical specification, WBS package, test case, and client sign-off.',
            keySections: ['Requirement ID', 'Business Source', 'WBS Cross-Reference', 'Design Artifact Ref', 'Verification Method & Status']
          }
        ]
      },
      {
        path: '03_Planning/02_Schedule_and_Resources',
        folderName: '02_Schedule_and_Resources',
        parentPath: '03_Planning',
        phase: 'Planning',
        description: 'Schedule management, critical path analysis, resource allocations, and RACI governance matrices.',
        documents: [
          {
            id: 'DOC-PLN-211',
            name: 'Schedule Management Plan & Integrated Baseline Schedule',
            isoClause: 'ISO 21500 Clause 6.7 / ISO 21502 Clause 7.3',
            mandatory: true,
            frequency: 'Planning baseline',
            responsibleRole: 'Project Planner / Project Manager',
            description: 'Integrated Gantt schedule identifying activity durations, dependencies, milestones, and the Critical Path baseline.',
            keySections: ['Scheduling Methodology', 'Activity Sequencing & Dependencies', 'Critical Path Definition', 'Baseline Schedule Milestones']
          },
          {
            id: 'DOC-PLN-212',
            name: 'Resource Allocation Plan & RACI Matrix',
            isoClause: 'ISO 21500 Clause 6.9 / ISO 21502 Clause 7.4',
            mandatory: true,
            frequency: 'Planning baseline, updated per resource shifts',
            responsibleRole: 'Project Manager & Department Heads',
            description: 'Assigns roles and defines who is Responsible, Accountable, Consulted, and Informed for each WBS work package.',
            keySections: ['Resource Profiles & Capacities', 'RACI Assignment Matrix', 'Onboarding & Release Schedule', 'Resource Constraints & Contention Rules']
          },
          {
            id: 'DOC-PLN-213',
            name: 'Resource Assignment Timeline & Capacity Plan',
            isoClause: 'ISO 21502 Clause 7.4 (Resource Planning)',
            mandatory: true,
            frequency: 'Planning baseline, monitored bi-weekly',
            responsibleRole: 'Resource Manager',
            description: 'Timeline visualization mapping allocated FTE hours per resource across project phases to prevent over-allocation.',
            keySections: ['Resource Allocation Timeline', 'Monthly FTE Breakdown', 'Over-allocation Thresholds', 'Contingency Staffing Plan']
          }
        ]
      },
      {
        path: '03_Planning/03_Financial_and_Cost',
        folderName: '03_Financial_and_Cost',
        parentPath: '03_Planning',
        phase: 'Planning',
        description: 'Budget baseline, cost breakdown structures, cash flow forecasts, and reserve allocations.',
        documents: [
          {
            id: 'DOC-PLN-221',
            name: 'Cost Management Plan & Budget Baseline',
            isoClause: 'ISO 21500 Clause 6.8 / ISO 21502 Clause 7.5',
            mandatory: true,
            frequency: 'Planning baseline',
            responsibleRole: 'Project Manager & CFO / Financial Lead',
            description: 'Formal cost breakdown structure (CBS), approved capital/operational budget baseline, and cost control thresholds.',
            keySections: ['Cost Estimation Techniques', 'Cost Breakdown Structure (CBS)', 'Approved Budget Baseline', 'EVM Variance Thresholds']
          },
          {
            id: 'DOC-PLN-222',
            name: 'Cash Flow Forecast & Milestone Payment Tranches',
            isoClause: 'ISO 21502 Clause 7.5.3 (Funding & Cash Flow)',
            mandatory: true,
            frequency: 'Monthly forecast updates',
            responsibleRole: 'Financial Controller',
            description: 'Month-by-month financial disbursement forecast mapped to milestone completion and vendor contract payment tranches.',
            keySections: ['Monthly Inflow & Outflow Projections', 'Milestone Invoicing Tranches', 'Contingency Drawdown Rules', 'Working Capital Buffer']
          }
        ]
      },
      {
        path: '03_Planning/04_Risk_and_Quality',
        folderName: '04_Risk_and_Quality',
        parentPath: '03_Planning',
        phase: 'Planning',
        description: 'Risk management protocols, qualitative/quantitative risk registers, and quality management plans.',
        documents: [
          {
            id: 'DOC-PLN-231',
            name: 'Risk Management Plan & Risk Scoring Matrix',
            isoClause: 'ISO 21500 Clause 6.10 / ISO 21502 Clause 7.7',
            mandatory: true,
            frequency: 'Planning baseline',
            responsibleRole: 'Risk Lead / Project Manager',
            description: 'Establishes risk management methodology, probability-impact scoring criteria, tolerance thresholds, and mitigation guidelines.',
            keySections: ['Risk Governance & Roles', '5x5 Probability-Impact Scoring Grid', 'Risk Tolerance & Escalation Triggers', 'Mitigation Strategy Guidelines']
          },
          {
            id: 'DOC-PLN-232',
            name: 'Baseline Risk Register & Treatment Strategies',
            isoClause: 'ISO 21502 Clause 7.7 (Risk Identification & Treatment)',
            mandatory: true,
            frequency: 'Weekly / Bi-weekly review',
            responsibleRole: 'Risk Lead & Work Package Owners',
            description: 'Forensic inventory of identified threats and opportunities with pre-assigned owners, qualitative scores, and mitigation actions.',
            keySections: ['Risk ID & Description', 'Inherent Severity Score', 'Risk Owner', 'Planned Mitigation Actions', 'Residual Severity Score']
          },
          {
            id: 'DOC-PLN-233',
            name: 'Quality Management Plan & Quality Metrics Baseline',
            isoClause: 'ISO 21500 Clause 6.6 / ISO 21502 Clause 7.6',
            mandatory: true,
            frequency: 'Planning baseline',
            responsibleRole: 'Quality Assurance Lead',
            description: 'Specifies industry quality standards, compliance metrics, defect tolerances, and QA audit schedules.',
            keySections: ['Applicable Quality Standards', 'Key Quality Metrics & Tolerances', 'QA Audit Cadence', 'Defect Classification & Remediation']
          }
        ]
      },
      {
        path: '03_Planning/05_Stakeholders_and_Communications',
        folderName: '05_Stakeholders_and_Communications',
        parentPath: '03_Planning',
        phase: 'Planning',
        description: 'Power vs. interest stakeholder matrices, engagement strategies, and communications protocols.',
        documents: [
          {
            id: 'DOC-PLN-241',
            name: 'Stakeholder Engagement Strategy (Power vs. Interest Grid)',
            isoClause: 'ISO 21500 Clause 6.11 / ISO 21502 Clause 7.10',
            mandatory: true,
            frequency: 'Planning baseline, updated dynamically',
            responsibleRole: 'Project Manager & Lead Consultant',
            description: '2x2 Power-Interest matrix categorizing stakeholders into Manage Closely, Keep Satisfied, Keep Informed, and Monitor quadrants.',
            keySections: ['Power vs. Interest 2x2 Grid', 'Quadrant Engagement Protocols', 'Individual Engagement Objectives', 'Feedback & Escalation Channels']
          },
          {
            id: 'DOC-PLN-242',
            name: 'Communications Management Plan',
            isoClause: 'ISO 21502 Clause 7.9 (Communication Management)',
            mandatory: true,
            frequency: 'Planning baseline',
            responsibleRole: 'Communications Lead / Project Manager',
            description: 'Detailed protocol specifying what information is communicated to whom, when, via which medium, and under what authority.',
            keySections: ['Communication Matrix', 'Meeting Governance (Daily/Weekly/Monthly)', 'Reporting Distribution Lists', 'Crisis Communication Protocol']
          }
        ]
      },
      {
        path: '03_Planning/06_Procurement_and_Contracts',
        folderName: '06_Procurement_and_Contracts',
        parentPath: '03_Planning',
        phase: 'Planning',
        description: 'Procurement strategies, SOW templates, vendor evaluation rubrics, and subcontractor governance.',
        documents: [
          {
            id: 'DOC-PLN-251',
            name: 'Procurement Management Plan & Sourcing Strategy',
            isoClause: 'ISO 21502 Clause 7.8 (Procurement Management)',
            mandatory: true,
            frequency: 'Planning baseline',
            responsibleRole: 'Procurement Specialist & Legal Lead',
            description: 'Procurement packaging, contracting models (Fixed Price vs. T&M), supplier evaluation criteria, and contract administration.',
            keySections: ['Procurement Scope Breakdown', 'Contract Types & Selection Rubrics', 'Supplier Qualification Criteria', 'Contract Administration Guidelines']
          },
          {
            id: 'DOC-PLN-252',
            name: 'Statement of Work (SOW) Templates & Evaluation Rubric',
            isoClause: 'ISO 21502 Clause 7.8.2 (Contracting Preparation)',
            mandatory: true,
            frequency: 'Per procurement package',
            responsibleRole: 'Procurement Lead & Technical Lead',
            description: 'Standardized contractual specifications for vendor tender submissions and weighted scoring rubrics.',
            keySections: ['Scope of Vendor Deliverables', 'SLA Performance Standards', 'Commercial Pricing Matrix', 'Vendor Scoring Rubric']
          }
        ]
      },
      {
        path: '03_Planning/07_Stage_Gate_Signoff',
        folderName: '07_Stage_Gate_Signoff',
        parentPath: '03_Planning',
        phase: 'Planning',
        description: 'Integrated baseline approval records and Stage Gate 2 sign-off certificates.',
        documents: [
          {
            id: 'DOC-PLN-299',
            name: 'Stage Gate 2 Sign-Off Certificate (Planning to Execution)',
            isoClause: 'ISO 21502 Clause 6.1 (Stage Gate Baseline Review)',
            mandatory: true,
            frequency: 'Conclusion of Planning',
            responsibleRole: 'Project Sponsor & Steering Committee',
            description: 'Executive committee authorization formally approving the integrated Triple Baseline (Scope, Schedule, Cost) for execution.',
            keySections: ['Triple Baseline Verification', 'Audit Health Check Score', 'Approved Budget Allocation', 'Formal Executive Signatures']
          }
        ]
      }
    ]
  },
  {
    path: '04_Executing',
    folderName: '04_Executing',
    phase: 'Executing',
    description: 'Processes performed to complete the work defined in the Project Management Plan to satisfy project specifications.',
    documents: [
      {
        id: 'DOC-EXE-301',
        name: 'Project Team Charter & Operating Protocols',
        isoClause: 'ISO 21502 Clause 7.4.3 (Team Governance)',
        mandatory: true,
        frequency: 'At team launch',
        responsibleRole: 'Project Manager & Team Leads',
        description: 'Ground rules, collaboration etiquette, core working hours, internal meeting expectations, and conflict resolution norms.',
        keySections: ['Team Values & Ground Rules', 'Communication Etiquette', 'Working Hours & Availability', 'Decision-Making Protocol']
      },
      {
        id: 'DOC-EXE-302',
        name: 'Resource Onboarding & System Access Logs',
        isoClause: 'ISO 21502 Clause 7.4.2 (Acquiring Resources)',
        mandatory: true,
        frequency: 'Continuous as resources join',
        responsibleRole: 'Project Administrator / HR Liaison',
        description: 'Formal verification of security credential issuance, confidentiality agreements (NDAs), and environment access permissions.',
        keySections: ['Resource Details', 'NDA Signed Date', 'System Permissions Granted', 'Onboarding Checklist Sign-off']
      },
      {
        id: 'DOC-EXE-303',
        name: 'Deliverable Handover & Intermediate Acceptance Forms',
        isoClause: 'ISO 21500 Clause 6.4 / ISO 21502 Clause 7.2.4',
        mandatory: true,
        frequency: 'Per milestone deliverable',
        responsibleRole: 'Deliverable Lead & Client Lead',
        description: 'Sign-off documents certifying completion and verification of intermediate sprint, module, or package deliverables.',
        keySections: ['Deliverable ID & Description', 'Verification Test Results', 'Defect Log Status', 'Client Acceptance Signature']
      },
      {
        id: 'DOC-EXE-304',
        name: 'Quality Assurance Audit Records & Inspection Certificates',
        isoClause: 'ISO 21502 Clause 7.6.3 (Quality Assurance)',
        mandatory: true,
        frequency: 'Bi-weekly or per sprint audit',
        responsibleRole: 'QA Lead',
        description: 'Formal reports verifying adherence to engineering standards, test coverage requirements, and security compliance.',
        keySections: ['Audit Date & Scope', 'Test Execution Results', 'Identified Non-Conformities', 'Corrective Action Plan']
      },
      {
        id: 'DOC-EXE-305',
        name: 'Executed Vendor Contracts & Subcontractor Task Orders',
        isoClause: 'ISO 21502 Clause 7.8.3 (Contract Administration)',
        mandatory: true,
        frequency: 'Per vendor agreement',
        responsibleRole: 'Procurement Manager & Legal Counsel',
        description: 'Signed agreements, statements of work, and formal task orders issued to external vendors and service providers.',
        keySections: ['Contract Identification', 'Executed Agreement PDF Reference', 'Deliverable Milestones & Penalties', 'Signatures']
      },
      {
        id: 'DOC-EXE-306',
        name: 'Work Performance Data Logs & Activity Completion Records',
        isoClause: 'ISO 21502 Clause 6.3 (Directing Project Work)',
        mandatory: true,
        frequency: 'Weekly logging',
        responsibleRole: 'Project Manager & Team Leads',
        description: 'Raw performance data including actual hours worked, deliverable completion percentages, and milestone progress logs.',
        keySections: ['Reporting Period', 'Tasks Completed This Period', 'Actual Hours vs Planned', 'Impediments & Blockers Encountered']
      }
    ],
    subfolders: [
      {
        path: '04_Executing/01_Procurement_Requests',
        folderName: '01_Procurement_Requests',
        parentPath: '04_Executing',
        phase: 'Executing',
        description: 'Formal requests for project-specific procurement, equipment, and external services requiring commercial approval.',
        documents: [
          {
            id: 'DOC-EXE-PRO-001',
            name: 'Procurement Request Form (PRF)',
            isoClause: 'ISO 21502 Clause 7.8',
            mandatory: true,
            frequency: 'Ad-hoc per purchase requirement',
            responsibleRole: 'Project Manager / Lead Engineer',
            description: 'Individual request document for the purchase of project assets, hardware components, or specialized services.',
            keySections: ['Request Details & Specifications', 'Business Justification', 'Budget Approval Reference', 'Preferred Vendor (if any)', 'Authorized Signatures']
          }
        ]
      }
    ]
  },
  {
    path: '05_Controlling_and_Monitoring',
    folderName: '05_Controlling_and_Monitoring',
    phase: 'Controlling',
    description: 'Processes required to track, review, and regulate the progress and performance of the project; identify areas where changes to the plan are required.',
    documents: [],
    subfolders: [
      {
        path: '05_Controlling_and_Monitoring/01_Status_Reporting',
        folderName: '01_Status_Reporting',
        parentPath: '05_Controlling_and_Monitoring',
        phase: 'Controlling',
        description: 'Integrated project status reports and performance management analytics.',
        documents: [
          {
            id: 'DOC-CTL-401',
            name: 'Integrated Project Status Reports (Weekly & SteerCo Executive Pack)',
            isoClause: 'ISO 21500 Clause 6.4 / ISO 21502 Clause 6.4',
            mandatory: true,
            frequency: 'Weekly (PM), Monthly (SteerCo)',
            responsibleRole: 'Project Manager',
            description: 'RAG status summaries (Schedule, Scope, Cost, Quality, Risk), milestone progress, EVM metrics, and immediate executive escalations.',
            keySections: ['Executive Summary & RAG Status', 'Milestone Variance Table', 'Earned Value Metrics (CPI, SPI)', 'Top 5 Risks and Issues', 'Upcoming Key Decisions Needed']
          },
          {
            id: 'DOC-CTL-402',
            name: 'Earned Value Management (EVM) Reports & Variance Analysis',
            isoClause: 'ISO 21502 Clause 7.5.4 (Cost Control) & Clause 7.3.4 (Schedule Control)',
            mandatory: true,
            frequency: 'Bi-weekly / Monthly',
            responsibleRole: 'Project Controller / Project Manager',
            description: 'Mathematical tracking of Planned Value (PV), Earned Value (EV), and Actual Cost (AC) with CPI, SPI, EAC, and VAC calculations.',
            keySections: ['PV, EV, and AC Historical Curves', 'Cost Performance Index (CPI)', 'Schedule Performance Index (SPI)', 'Estimate at Completion (EAC)', 'Root Cause Variance Commentary']
          },
          {
            id: 'DOC-CTL-406',
            name: 'Stage Gate 3 & Stage Gate 4 Interim Governance Reviews',
            isoClause: 'ISO 21502 Clause 6.1 (Mid-Execution Gate Reviews)',
            mandatory: true,
            frequency: 'At designated phase milestones (e.g. 50%, 80%)',
            responsibleRole: 'Steering Committee',
            description: 'Interim stage gate review records evaluating project health, forecast viability, and continuing business case validity.',
            keySections: ['Interim Health Audit Score', 'Business Case Validation', 'Budget Burn Rate vs Value Earned', 'SteerCo Go/No-Go Decision']
          }
        ]
      },
      {
        path: '05_Controlling_and_Monitoring/02_Quality_Management',
        folderName: '02_Quality_Management',
        parentPath: '05_Controlling_and_Monitoring',
        phase: 'Controlling',
        description: 'Quality oversight, non-conformance tracking, and corrective action planning.',
        documents: [],
        subfolders: [
          {
            path: '05_Controlling_and_Monitoring/02_Quality_Management/Quality_Reports',
            folderName: 'Quality_Reports',
            parentPath: '05_Controlling_and_Monitoring/02_Quality_Management',
            phase: 'Controlling',
            description: 'Formal quality audit reports, performance certificates, and compliance validation records.',
            documents: [
              {
                id: 'DOC-CTL-405',
                name: 'Quality Control Inspection Logs & Non-Conformance Reports (NCR)',
                isoClause: 'ISO 21502 Clause 7.6.4 (Quality Control)',
                mandatory: true,
                frequency: 'Per quality inspection',
                responsibleRole: 'Quality Control Inspector',
                description: 'Detailed inspection results, defect severity logs, Root Cause Analysis (RCA), and Corrective & Preventive Actions (CAPA).',
                keySections: ['Inspection Timestamp & Item Ref', 'Pass/Fail Status', 'Defect Severity Classification', 'Root Cause Analysis (RCA)', 'CAPA Resolution Sign-off']
              }
            ]
          }
        ]
      },
      {
        path: '05_Controlling_and_Monitoring/03_Issue_Management',
        folderName: '03_Issue_Management',
        parentPath: '05_Controlling_and_Monitoring',
        phase: 'Controlling',
        description: 'Forensic tracking and resolution of materialized project issues, blockers, and impediments.',
        documents: [
          {
            id: 'DOC-CTL-403',
            name: 'Active Forensic Risk & Issue Log',
            isoClause: 'ISO 21502 Clause 7.7.3 (Controlling Risks & Issues)',
            mandatory: true,
            frequency: 'Continuous / Weekly updates',
            responsibleRole: 'Risk Lead & Project Manager',
            description: 'Living log tracking materialized issues, ongoing risk exposure, mitigation action status, and assigned resolution owners.',
            keySections: ['Issue ID & Urgency Rating', 'Materialization Impact Description', 'Assigned Resolution Owner', 'Target Resolution Date', 'Current Action Status']
          },
          {
            id: 'DOC-CTL-ISS-001',
            name: 'Individual Issue Report & Resolution Record',
            isoClause: 'ISO 21502 Clause 7.7.3',
            mandatory: true,
            frequency: 'Per major issue',
            responsibleRole: 'Issue Owner',
            description: 'Detailed forensic report for a single high-impact materialized issue, documenting root cause and resolution path.',
            keySections: ['Issue Description & Evidence', 'Stakeholder Impact Analysis', 'Resolution Action Plan', 'Resolution Verification & Sign-off']
          }
        ]
      },
      {
        path: '05_Controlling_and_Monitoring/04_Change_Management',
        folderName: '04_Change_Management',
        parentPath: '05_Controlling_and_Monitoring',
        phase: 'Controlling',
        description: 'Formal change control requests and integrated baseline impact assessments.',
        documents: [
          {
            id: 'DOC-CTL-404',
            name: 'Change Control Register & Approved Change Orders (CRs)',
            isoClause: 'ISO 21500 Clause 6.4 / ISO 21502 Clause 6.3.3',
            mandatory: true,
            frequency: 'Per change request submitted',
            responsibleRole: 'Change Control Board (CCB) & Project Manager',
            description: 'Formal repository of all submitted Change Requests (CRs), impact assessments (Scope, Schedule, Budget), and CCB approval decisions.',
            keySections: ['CR ID & Requester', 'Detailed Change Justification', 'Impact Assessment (Cost, Time, Quality)', 'CCB Decision (Approved/Rejected)', 'Baseline Update Confirmation']
          }
        ]
      },
      {
        path: '05_Controlling_and_Monitoring/05_Meeting_Minutes',
        folderName: '05_Meeting_Minutes',
        parentPath: '05_Controlling_and_Monitoring',
        phase: 'Controlling',
        description: 'Formal records and action items from all project governance, steering, and technical meetings.',
        documents: [
          {
            id: 'DOC-CTL-MTG-001',
            name: 'Project Meeting Minutes & Action Item Record',
            isoClause: 'ISO 21502 Clause 7.9',
            mandatory: true,
            frequency: 'Per project meeting',
            responsibleRole: 'Project Administrator / PM',
            description: 'The official forensic record of discussions, executive decisions, and assigned action items from a formal meeting.',
            keySections: ['Meeting Date & Attendance', 'Agenda Items Covered', 'Key Decisions Recorded', 'Assigned Action Items & Owners', 'Next Meeting Schedule']
          }
        ]
      }
    ]
  },
  {
    path: '06_Closing',
    folderName: '06_Closing',
    phase: 'Closing',
    description: 'Processes performed to formally complete or close a project, phase, or contract obligations.',
    documents: [
      {
        id: 'DOC-CLS-501',
        name: 'Project Closeout Report',
        isoClause: 'ISO 21500 Clause 6.12 / ISO 21502 Clause 6.5',
        mandatory: true,
        frequency: 'Once at project completion',
        responsibleRole: 'Project Manager & Lead Consultant',
        description: 'Comprehensive retrospective reviewing initial objectives vs. final deliverables, budget reconciliation, schedule variances, and KPIs achieved.',
        keySections: ['Executive Retrospective', 'Final Scope Deliverables Audit', 'Schedule Variance Analysis', 'Final Budget Reconciliation', 'Client Testimonial & Value Realization']
      },
      {
        id: 'DOC-CLS-502',
        name: 'Formal Handover Certificate & Operational Transition Sign-off',
        isoClause: 'ISO 21502 Clause 6.5.2 (Handover of Deliverables)',
        mandatory: true,
        frequency: 'At operational cutover',
        responsibleRole: 'Project Sponsor, Operations Lead, Client Lead',
        description: 'Legal and operational handover document certifying transfer of custody, training completion, operational readiness, and warranties.',
        keySections: ['Handover Asset Inventory', 'Operational Readiness Certification', 'Staff Training Sign-off', 'Warranty & Support Terms', 'Dual Acceptance Signatures']
      },
      {
        id: 'DOC-CLS-503',
        name: 'Lessons Learned Register & Post-Implementation Review (PIR)',
        isoClause: 'ISO 21502 Clause 6.5.3 (Lessons Learned)',
        mandatory: true,
        frequency: 'Final stage workshop',
        responsibleRole: 'Project Manager & Core Team',
        description: 'Forensic documentation of what worked well, what encountered friction, root causes, and institutional recommendations for future projects.',
        keySections: ['Success Factors & Enablers', 'Friction Points & Root Causes', 'Forensic Process Recommendations', 'Enterprise Knowledge Base Updates']
      },
      {
        id: 'DOC-CLS-504',
        name: 'Vendor & Subcontractor Final Acceptance Certificates',
        isoClause: 'ISO 21502 Clause 7.8.4 (Procurement Closeout)',
        mandatory: true,
        frequency: 'Per supplier contract',
        responsibleRole: 'Procurement Lead & Technical Lead',
        description: 'Formal closure of all third-party supplier agreements, verification of final deliverable acceptance, and lien waivers.',
        keySections: ['Vendor Contract ID', 'Final Deliverables Verification', 'No-Outstanding-Claims Declaration', 'Contract Closeout Sign-off']
      },
      {
        id: 'DOC-CLS-505',
        name: 'Final Financial Reconciliation & Retention Release',
        isoClause: 'ISO 21502 Clause 7.5.5 (Financial Closeout)',
        mandatory: true,
        frequency: 'Final accounting closure',
        responsibleRole: 'Chief Financial Officer & Project Controller',
        description: 'Final audit of all committed, incurred, and paid project expenses; de-obligation of unused purchase orders; release of retention funds.',
        keySections: ['Total Budget vs Actual Spend', 'Purchase Order Reconciliation', 'Retention Fund Release Notice', 'Formal Financial Closure Signatures']
      },
      {
        id: 'DOC-CLS-506',
        name: 'Stage Gate 5 Final Sign-Off & Project Dissolution Notice',
        isoClause: 'ISO 21502 Clause 6.1 & Clause 6.5.4 (Project Release)',
        mandatory: true,
        frequency: 'Final project milestone',
        responsibleRole: 'Executive Steering Committee',
        description: 'Formal sign-off by the Steering Committee dissolving the project organization, releasing team resources, and closing governance tracking.',
        keySections: ['SteerCo Final Resolution', 'Resource Reassignment Confirmation', 'Project Office Archival Status', 'Executive Board Signatures']
      },
      {
        id: 'DOC-CLS-507',
        name: 'Project Documentation Archival Index & Retention Schedule',
        isoClause: 'ISO 21502 Clause 6.5 (Records Retention & Archiving)',
        mandatory: true,
        frequency: 'Final step of project archive',
        responsibleRole: 'Project Administrator / Compliance Officer',
        description: 'Master repository inventory listing file locations, hash checksums, retention schedules (e.g. 7 years), and regulatory legal hold instructions.',
        keySections: ['Repository Storage Location', 'Master Manifest & Checksums', 'Regulatory Retention Period (7 Years)', 'Destruction / Long-term Archive Date']
      }
    ]
  }
];

/**
 * Generates the clean formatted content of the REQUIRED_DOCUMENTS.txt file for any folder node
 */
export function generateRequiredDocumentsText(folder: IsoFolderNode): string {
  const lineSeparator = '='.repeat(80);
  const subSeparator = '-'.repeat(80);

  let output = `${lineSeparator}\n`;
  output += `ADVANNOTECH (PTY) LTD - PROJECT GOVERNANCE & ENGINEERING\n`;
  output += `ISO 21500:2021 & ISO 21502 STANDARD FOLDER MANIFEST\n`;
  output += `${lineSeparator}\n\n`;

  output += `FOLDER PATH: /${folder.path}\n`;
  output += `FOLDER NAME: ${folder.folderName}\n`;
  output += `PROJECT PHASE: ${folder.phase.toUpperCase()}\n`;
  output += `PURPOSE: ${folder.description}\n\n`;

  output += `${subSeparator}\n`;
  output += `REQUIRED DOCUMENTS INVENTORY (${folder.documents.length} REQUIRED ARTIFACTS)\n`;
  output += `${subSeparator}\n\n`;

  if (folder.documents.length === 0) {
    output += `Note: This folder serves as an organizational container for the subfolders listed below.\n\n`;
  } else {
    folder.documents.forEach((doc, idx) => {
      output += `[${idx + 1}] ${doc.name}\n`;
      output += `    Document Code:     ${doc.id}\n`;
      output += `    ISO Standard Ref:  ${doc.isoClause}\n`;
      output += `    Status:            ${doc.mandatory ? '[MANDATORY - GATE AUDIT REQUIREMENT]' : '[RECOMMENDED]'}\n`;
      output += `    Review Frequency:  ${doc.frequency}\n`;
      output += `    Responsible Role:  ${doc.responsibleRole}\n`;
      output += `    Description:       ${doc.description}\n`;
      output += `    Mandatory Sections & Contents Checklist:\n`;
      doc.keySections.forEach((section, sIdx) => {
        output += `      [ ] ${sIdx + 1}. ${section}\n`;
      });
      output += `\n`;
    });
  }

  if (folder.subfolders && folder.subfolders.length > 0) {
    output += `${subSeparator}\n`;
    output += `AUTHORIZED SUBDIRECTORIES IN THIS FOLDER:\n`;
    output += `${subSeparator}\n`;
    folder.subfolders.forEach((sub, sIdx) => {
      output += `  ${sIdx + 1}. /${sub.folderName}/ - ${sub.description} (${sub.documents.length} required documents)\n`;
    });
    output += `\n`;
  }

  output += `${lineSeparator}\n`;
  output += `GOVERNANCE & AUDIT INSTRUCTIONS:\n`;
  output += `1. All document files placed in this folder must adhere to the Advannotech corporate naming standard:\n`;
  output += `   [DOC-ID]_[PROJECT-CODE]_[DOCUMENT-NAME]_v[MAJOR].[MINOR].[EXT]\n`;
  output += `   Example: ${folder.documents[0]?.id || 'DOC-REF'}_ADV-PRJ-24_V1.0.docx\n\n`;
  output += `2. Every final document must include the standard Advannotech Cover Page (A4 portrait) with corporate\n`;
  output += `   details table, author signatures, and stage gate sign-off certification.\n\n`;
  output += `3. Audit Readiness: An audit health check score of 85% or greater is required across these artifacts\n`;
  output += `   prior to presenting deliverables to the Steering Committee for Stage Gate transition approval.\n`;
  output += `${lineSeparator}\n`;

  return output;
}

/**
 * Generates the top-level README for the entire ISO 21500 repository
 */
export function generateMasterIsoReadme(): string {
  const lineSeparator = '='.repeat(80);
  const subSeparator = '-'.repeat(80);

  let output = `${lineSeparator}\n`;
  output += `ADVANNOTECH (PTY) LTD - INTEGRATED TECH SOLUTIONS\n`;
  output += `ISO 21500:2021 & ISO 21502 PROJECT GOVERNANCE DIRECTORY STRUCTURE\n`;
  output += `Author: Advannotech Enterprise Engineering & Governance Office\n`;
  output += `Generated on: ${new Date().toISOString().split('T')[0]}\n`;
  output += `${lineSeparator}\n\n`;

  output += `OVERVIEW & STANDARD REFERENCE:\n`;
  output += `This folder structure strictly complies with ISO 21500:2021 (Project, programme and portfolio\n`;
  output += `management - Context and concepts) and ISO 21502:2020 (Guidance on project management).\n`;
  output += `It provides an audit-proof, forensic documentation repository designed to support stage-gated\n`;
  output += `delivery, rigorous traceability, and steering committee accountability.\n\n`;

  output += `${subSeparator}\n`;
  output += `DIRECTORY HIERARCHY SUMMARY & PROCESS GROUPS:\n`;
  output += `${subSeparator}\n\n`;

  function printNode(node: IsoFolderNode, indent = '') {
    output += `${indent}[DIR] ${node.folderName}/\n`;
    output += `${indent}      Description: ${node.description}\n`;
    output += `${indent}      Contains:    REQUIRED_DOCUMENTS.txt (${node.documents.length} artifacts listed)\n`;
    if (node.subfolders) {
      node.subfolders.forEach(sub => printNode(sub, indent + '      '));
    }
    output += `\n`;
  }

  ISO_21500_FOLDER_STRUCTURE.forEach(node => printNode(node));

  output += `${lineSeparator}\n`;
  output += `HOW TO USE THIS FOLDER STRUCTURE:\n`;
  output += `1. Extract or clone this archive into your organization's cloud storage or network share\n`;
  output += `   (e.g., SharePoint, Microsoft Teams, Google Drive, or Secure Enterprise File System).\n`;
  output += `2. Do not delete or rename the folders; they are mapped directly to project management audit standards.\n`;
  output += `3. In each directory, open the REQUIRED_DOCUMENTS.txt manifest to review the exact deliverables\n`;
  output += `   required before the project can pass that phase's Stage Gate review.\n`;
  output += `4. Use the Advannotech Project Governance Platform to generate, audit, and synthesize compliant\n`;
  output += `   project charters, management plans, and status reports that populate these directories.\n`;
  output += `${lineSeparator}\n`;

  return output;
}

/**
 * Flatten all folder nodes for quick querying or listing
 */
export function getAllIsoFolderNodes(): IsoFolderNode[] {
  const result: IsoFolderNode[] = [];
  function collect(node: IsoFolderNode) {
    result.push(node);
    if (node.subfolders) {
      node.subfolders.forEach(collect);
    }
  }
  ISO_21500_FOLDER_STRUCTURE.forEach(collect);
  return result;
}

/**
 * Returns total count of required documents across the entire ISO 21500 taxonomy
 */
export function getTotalIsoDocumentsCount(): number {
  return getAllIsoFolderNodes().reduce((sum, node) => sum + node.documents.length, 0);
}
