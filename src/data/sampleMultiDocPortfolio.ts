/**
 * Advannotech Enterprise Sample Document Portfolio
 * Pre-configured multi-document bundle for instant ISO 21500 / ISO 9001 audit and analytics testing.
 */

import { ExtractedFile } from '../utils/fileParsers';

export const SAMPLE_MULTI_DOC_PORTFOLIO: ExtractedFile[] = [
  {
    id: 'sample-doc-1',
    name: 'Advannotech_IoT_Project_Charter_v1.docx',
    size: 245000,
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    wordCount: 1420,
    charCount: 9800,
    text: `
# ADVANNOTECH (PTY) LTD - STRATEGIC PROJECT CHARTER
Project Title: Smart Industrial Telemetry & IoT Edge Gateway Deployment
Project Code: ADV-CHARTER-2026-01
Project Sponsor: Executive Director · Advannotech (Pty) Ltd
Lead Software Engineer: Valiant Khoza (Gauteng)

## 1. Project Purpose & Strategic Justification
This charter authorizes the implementation of Advannotech's Enterprise IoT Telemetry Platform across 45 regional substation facilities. The objective is to replace legacy analog RTUs with secure edge computing gateways compliant with ISO/IEC 27001 cybersecurity and ISO 9001 quality management benchmarks. Target operational date is December 15, 2026.

## 2. Measurable Project Objectives & Success Criteria
- Deliver 100% gateway deployment with zero unscheduled downtime.
- Real-time telemetry ingestion under 250ms latency over private APN.
- Formal sign-off and site acceptance testing by December 15, 2026.
- Total capital expenditure capped at ZAR 3,850,000 (Excl. VAT).

## 3. High-Level Requirements & Scope Boundaries
In-Scope:
- Procurement, staging, and firmware hardening of 45 Advannotech Edge Gateways.
- Cloud message broker integration and REST API ingestion endpoints.
- 24/7 telemetry monitoring dashboard with role-based access control.

Out-of-Scope:
- Modification of high-voltage transmission substation wiring.
- Third-party billing engine customizations outside agreed API specifications.

## 4. Summary Milestone Schedule
- Project Charter Approval: February 1, 2026
- Architecture & Hardware Staging Complete: May 15, 2026
- Pilot Substation Commissioning: August 1, 2026
- Full Fleet Site Acceptance Testing (SAT): November 20, 2026
- Final Project Sign-Off & Close-Out: December 15, 2026

## 5. Budget & Financial Allocations
- Total Approved Budget: ZAR 3,850,000.
- Hardware & Procurement: ZAR 2,100,000.
- Software Engineering & Delivery: ZAR 1,400,000.
- Management Contingency Reserve: ZAR 350,000 (10%).

## 6. Key Stakeholders & Governance RACI
- Executive Sponsor: Client Delivery Director (Accountable)
- Lead Software Engineer: Valiant Khoza (Responsible)
- Quality Assurance Officer: ISO Lead Auditor (Consulted)
- Substation Facility Managers: Provincial Operations (Informed)
    `.trim(),
  },
  {
    id: 'sample-doc-2',
    name: 'Advannotech_Statement_of_Work_Signed.pdf',
    size: 380000,
    type: 'application/pdf',
    wordCount: 1680,
    charCount: 11400,
    text: `
# STATEMENT OF WORK (SOW) - ADV-SOW-2026-88
Between: Advannotech (Pty) Ltd ("Supplier") and Regional Energy Utility ("Customer")
Effective Date: March 1, 2026

## 1. Scope of Work & Deliverables
Supplier shall engineer, configure, and install forty-five (45) Advannotech Edge IoT Gateways as detailed in Schedule A. All software deliverables shall be subjected to rigorous automated integration testing and PMBOK 7th Edition performance verification. Acceptance criteria require 99.95% telemetry transmission reliability over a continuous 14-day soak test.

## 2. Deliverable Acceptance Criteria
- Deliverable 1: Technical Architecture Specification Document - Approved by Lead Architect.
- Deliverable 2: Factory Acceptance Testing (FAT) Certificate - Conforming to ISO 9001 standards.
- Deliverable 3: Site Acceptance Testing (SAT) - Signed off per substation.
- Final Acceptance: Complete system operational acceptance signed by December 15, 2026.

## 3. Financial Terms & Milestone Payments
Total Contract Price: ZAR 3,850,000 (Three Million Eight Hundred and Fifty Thousand Rand), payable on milestone delivery:
- Milestone 1 (Mobilization & Architecture): 20% (ZAR 770,000)
- Milestone 2 (Factory Acceptance Testing): 30% (ZAR 1,155,000)
- Milestone 3 (Site Installations Complete): 30% (ZAR 1,155,000)
- Milestone 4 (Final Acceptance & Handover): 20% (ZAR 770,000)

## 4. Change Control & Governance Procedure
Any modification to deliverables, timeline, or price requires a written Change Request Form (CRF) approved by both the Customer Representative and Advannotech Delivery Authority. No verbal changes shall be binding under ISO 9001 configuration management rules.
    `.trim(),
  },
  {
    id: 'sample-doc-3',
    name: 'Cost_Baseline_and_Schedule_Gantt.xlsx',
    size: 195000,
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    wordCount: 920,
    charCount: 6500,
    text: `
--- Sheet: Cost Breakdown Structure (CBS) ---
WBS Code, Task / Deliverable Name, Owner, Cost Baseline (ZAR), Contingency, Total Allocated
1.0, Project Initiation & Governance, PMO, 150000, 15000, 165000
2.0, Architecture & Security Design, Valiant Khoza, 450000, 45000, 495000
3.0, Hardware Procurement & Staging, Procurement Lead, 1950000, 195000, 2145000
4.0, Telemetry Broker Software Delivery, Lead Software Eng, 800000, 80000, 880000
5.0, Site Acceptance Testing & Commissioning, Field Services, 500000, 50000, 550000
TOTAL, Approved Project Baseline, Advannotech Executive, 3850000, 385000, 4235000

--- Sheet: Schedule Milestone Baseline ---
Milestone ID, Milestone Title, Planned Date, Critical Path, Tolerance
M1, Architecture Sign-off, 2026-05-15, Yes, 5 Days
M2, FAT Verification Complete, 2026-07-30, Yes, 3 Days
M3, Pilot Substation Online, 2026-08-01, Yes, 5 Days
M4, Regional Substation Fleet SAT, 2026-11-20, Yes, 7 Days
M5, Final Commercial Acceptance Gate, 2026-12-15, Yes, 0 Days
    `.trim(),
  },
  {
    id: 'sample-doc-4',
    name: 'ISO_Risk_and_Quality_Assurance_Log.docx',
    size: 210000,
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    wordCount: 1150,
    charCount: 8200,
    text: `
# ADVANNOTECH QUALITY ASSURANCE & RISK MANAGEMENT PLAN
Conformance Standard: ISO 31000:2018 (Risk Management) & ISO 9001:2015 (Quality)
Custodian: Quality & Risk Committee · Advannotech (Pty) Ltd

## 1. Risk Assessment Matrix
- RSK-01: Microcontroller Supply Chain Lead Time Delay
  - Likelihood: Medium | Impact: High | Risk Score: 15 (Amber)
  - Mitigation Strategy: Pre-order 100% of semiconductor modules during project mobilization phase.
  - Contingency Budget Allocated: ZAR 120,000. Owner: Procurement Director.

- RSK-02: Cellular APN Connectivity Blind Spots at Remote Substations
  - Likelihood: High | Impact: High | Risk Score: 20 (Red)
  - Mitigation Strategy: Implement multi-carrier roaming SIM cards with satellite backhaul fallback protocol.
  - Owner: Valiant Khoza (Lead Software Engineer).

- RSK-03: Scope Creep on Custom Modbus Driver Protocols
  - Likelihood: Medium | Impact: Medium | Risk Score: 12 (Amber)
  - Mitigation Strategy: Strict adherence to SOW Section 4 Change Request procedure.

## 2. ISO 9001 Quality Verification Protocols
- Dual-peer code review enforced on all firmware commits prior to QA staging.
- Automated static security analysis with zero critical vulnerability threshold.
- 100% factory calibration certificate required before dispatching hardware to substations.
    `.trim(),
  },
  {
    id: 'sample-doc-5',
    name: 'SteerCo_Governance_Meeting_Minutes.md',
    size: 145000,
    type: 'text/markdown',
    wordCount: 890,
    charCount: 5900,
    text: `
# PROJECT STEERING COMMITTEE (STEERCO) - MEETING MINUTES
Meeting ID: MIN-STEERCO-04
Date: October 12, 2026 | 09:00 - 10:30 SAST
Chair: Executive Project Sponsor · Advannotech (Pty) Ltd
Attendees: Valiant Khoza (Lead Software Engineer), Financial Controller, Regional Ops Lead

## 1. Project Health & RAG Status Summary
- Overall Project RAG: GREEN
- Scope Conformance: Conforming to SOW Schedule A deliverables.
- Schedule Conformance: On track for December 15, 2026 final commercial sign-off.
- Budget Conformance: Cumulative spend ZAR 2,980,000 of ZAR 3,850,000 approved ceiling.

## 2. Key Decisions Made
- DEC-01: Approved deployment of dual-SIM edge gateways to mitigate remote carrier coverage blind spots.
- DEC-02: Confirmed SAT schedule for Gauteng and Western Cape regional substations starting November 1.
- DEC-03: Endorsed ISO 21500 formal audit preparation review led by Lead Software Engineer Valiant Khoza.

## 3. Formal Action Items Register
- ACT-01: Valiant Khoza to finalize edge firmware release v2.4 with encrypted TLS 1.3 telemetry broker. Due: Oct 25, 2026.
- ACT-02: Financial Controller to verify Milestone 3 billing schedule alignment. Due: Oct 30, 2026.
- ACT-03: Quality Assurance Lead to audit Factory Acceptance certificates against ISO 9001 checklist. Due: Nov 5, 2026.
    `.trim(),
  },
];
