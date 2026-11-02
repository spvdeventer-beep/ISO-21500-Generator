/**
 * Centralized Project Registers: Stakeholders, Risks, and Assumptions.
 * Includes types, initial data, and deduplication logic.
 */

export type StakeholderQuadrant = 'Manage Closely' | 'Keep Satisfied' | 'Keep Informed' | 'Monitor';
export type RaciRole = 'Responsible' | 'Accountable' | 'Consulted' | 'Informed';

export interface MatrixStakeholder {
  id: string;
  name: string;
  title: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  power: number;     // 0 to 100
  interest: number;  // 0 to 100
  raci: RaciRole;
  quadrant: StakeholderQuadrant;
  keyExpectation: string;
  engagementChannel: string;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ProjectRisk {
  id: string;
  title: string;
  category: 'Technical' | 'Schedule' | 'Cost' | 'Governance' | 'Cybersecurity' | 'Operational';
  probability: number; // 1 to 5
  impact: number;      // 1 to 5
  score: number;       // probability * impact
  level: RiskLevel;
  ragStatus: 'GREEN' | 'AMBER' | 'RED';
  owner: string;
  sourceOrigin: string;
  mitigationStrategy: string;
  contingencyPlan: string;
  status: 'Identified' | 'Mitigating' | 'Accepted' | 'Closed';
}

export interface ProjectAssumption {
  id: string;
  description: string;
  category: 'Commercial' | 'Technical' | 'Operational' | 'Resource';
  impactIfInvalid: 'Critical' | 'High' | 'Medium' | 'Low';
  validationOwner: string;
  status: 'Draft' | 'Validated' | 'Invalidated';
  sourceOrigin: string;
}

export const INITIAL_STAKEHOLDERS: MatrixStakeholder[] = [
  {
    id: 'STK-01',
    name: 'Sarel van Deventer',
    title: 'Head of Delivery and Projects',
    department: 'Delivery & Projects',
    email: 'sarel.vdeventer@advannotech.co.za',
    phone: '+27 83 469 3672',
    location: 'Gauteng',
    power: 88,
    interest: 94,
    raci: 'Accountable',
    quadrant: 'Manage Closely',
    keyExpectation: 'Zero project schedule slippage and full ISO 21500 / PMBOK 7th Ed baseline conformance.',
    engagementChannel: 'Weekly Project SteerCo & Executive Milestone Gates'
  },
  {
    id: 'STK-02',
    name: 'Valiant Khoza',
    title: 'Lead Software Engineer',
    department: 'Engineering & IoT',
    email: 'khoza.valiantr@advannotech.co.za',
    phone: '+27 71 586 7165',
    location: 'Gauteng',
    power: 84,
    interest: 96,
    raci: 'Responsible',
    quadrant: 'Manage Closely',
    keyExpectation: 'High-reliability IoT broker integration under 250ms latency with TLS 1.3 encryption.',
    engagementChannel: 'Daily Engineering Standup & GitHub PR Architecture Reviews'
  },
  {
    id: 'STK-03',
    name: 'Xolani Zuma',
    title: 'CEO & Executive Sponsor',
    department: 'Executive',
    email: 'xolani.zuma@advannotech.co.za',
    phone: '+27 64 658 7549',
    location: 'Gauteng',
    power: 96,
    interest: 78,
    raci: 'Accountable',
    quadrant: 'Manage Closely',
    keyExpectation: 'Strategic commercial value delivery, enterprise client satisfaction, and corporate governance alignment.',
    engagementChannel: 'Bi-Weekly Executive Sponsor Briefing & Board Summary'
  }
];

export const INITIAL_RISKS: ProjectRisk[] = [
  {
    id: 'RSK-01',
    title: 'Microcontroller & Gateway Semiconductor Supply Chain Delay',
    category: 'Operational',
    probability: 3,
    impact: 4,
    score: 12,
    level: 'HIGH',
    ragStatus: 'RED',
    owner: 'Sarel van Deventer (PMO Director)',
    sourceOrigin: 'ISO Risk & QA Log / Procurement Schedule',
    mitigationStrategy: 'Pre-order 100% of semiconductor modules during mobilization phase with dual-sourcing vendor contracts.',
    contingencyPlan: 'Allocate ZAR 120,000 contingency reserve for express courier freight delivery.',
    status: 'Mitigating'
  },
  {
    id: 'RSK-02',
    title: 'Cellular Private APN Telemetry Blind Spots at Remote Substations',
    category: 'Technical',
    probability: 4,
    impact: 5,
    score: 20,
    level: 'CRITICAL',
    ragStatus: 'RED',
    owner: 'Valiant Khoza (Lead Software Engineer)',
    sourceOrigin: 'Site Survey & Network Architecture Spec',
    mitigationStrategy: 'Implement multi-carrier roaming e-SIMs with automated satellite fallback backhaul failover.',
    contingencyPlan: 'Deploy high-gain directional Yagi antennas with local offline flash telemetry queuing.',
    status: 'Mitigating'
  },
  {
    id: 'RSK-03',
    title: 'Scope Creep on Legacy Modbus and Analog RTU Driver Interfacing',
    category: 'Technical',
    probability: 3,
    impact: 3,
    score: 9,
    level: 'MEDIUM',
    ragStatus: 'AMBER',
    owner: 'Steffen Engelbrecht (Head of IoT Solutions)',
    sourceOrigin: 'SOW §4 Change Control Baseline',
    mitigationStrategy: 'Enforce strict ISO 9001 change control; require dual-sponsor sign-off for protocol protocol variance.',
    contingencyPlan: 'Utilize pre-certified Advannotech industrial protocol conversion gateways.',
    status: 'Identified'
  },
  {
    id: 'RSK-04',
    title: 'High-Voltage Grid Transients and Lightning Surge Damage',
    category: 'Operational',
    probability: 2,
    impact: 5,
    score: 10,
    level: 'HIGH',
    ragStatus: 'RED',
    owner: 'Edgar Skosana (Senior IoT Solutions Technician)',
    sourceOrigin: 'Substation Site Environmental Audit',
    mitigationStrategy: 'Galvanic isolation on all RS-485 interfaces; Type 1+2 surge protective devices installed on DIN rails.',
    contingencyPlan: 'Maintain 10 hot-standby replacement units staged at provincial hubs.',
    status: 'Mitigating'
  },
  {
    id: 'RSK-05',
    title: 'Cybersecurity Threat & Telemetry Message Ingestion Spoofing',
    category: 'Cybersecurity',
    probability: 2,
    impact: 5,
    score: 10,
    level: 'HIGH',
    ragStatus: 'RED',
    owner: 'Andrew Kotamo (Security Systems Lead)',
    sourceOrigin: 'ISO/IEC 27001 Security Baseline',
    mitigationStrategy: 'Enforce TLS 1.3 mutual authentication (mTLS) with device certificate rotation and secure boot tokens.',
    contingencyPlan: 'Instant certificate revocation list (CRL) and automated SOC alert escalation.',
    status: 'Mitigating'
  },
  {
    id: 'RSK-06',
    title: 'Site Acceptance Testing (SAT) Delayed by Facility Access Restrictions',
    category: 'Schedule',
    probability: 2,
    impact: 3,
    score: 6,
    level: 'MEDIUM',
    ragStatus: 'AMBER',
    owner: 'Lunga Myeza (Project Delivery Officer)',
    sourceOrigin: 'Steering Committee Governance Minutes',
    mitigationStrategy: 'Submit facility access permits and technician security clearances 21 days in advance.',
    contingencyPlan: 'Schedule parallel commissioning teams across Gauteng and Western Cape facilities.',
    status: 'Identified'
  },
  {
    id: 'RSK-07',
    title: 'Commercial Billing Milestone Reconciliation Divergence',
    category: 'Cost',
    probability: 1,
    impact: 4,
    score: 4,
    level: 'LOW',
    ragStatus: 'GREEN',
    owner: 'Lando Zuma (CFO) / Happy Makofane',
    sourceOrigin: 'Contractual SOW Payment Schedule',
    mitigationStrategy: 'Tie invoices directly to signed FAT/SAT delivery certificates.',
    contingencyPlan: 'Weekly milestone sign-off audits conducted by finance lead.',
    status: 'Closed'
  },
  {
    id: 'RSK-08',
    title: 'Regulatory & POPIA / Information Officer Non-Compliance Audit',
    category: 'Governance',
    probability: 1,
    impact: 5,
    score: 5,
    level: 'MEDIUM',
    ragStatus: 'AMBER',
    owner: 'Xolani Zuma (CEO) / Lead Legal Counsel',
    sourceOrigin: 'Corporate Governance Register',
    mitigationStrategy: 'Conduct quarterly third-party ISO 9001 and POPIA compliance audits.',
    contingencyPlan: 'Formal audit remediation protocol within 5 business days.',
    status: 'Identified'
  }
];

export const INITIAL_ASSUMPTIONS: ProjectAssumption[] = [
  {
    id: 'ASM-01',
    description: 'Client will provide 24/7 access to remote substation sites for technician installation.',
    category: 'Operational',
    impactIfInvalid: 'High',
    validationOwner: 'Lunga Myeza',
    status: 'Draft',
    sourceOrigin: 'Project Kickoff Notes'
  },
  {
    id: 'ASM-02',
    description: 'Existing legacy Modbus RTU hardware is functional and compatible with Advannotech gateways.',
    category: 'Technical',
    impactIfInvalid: 'Critical',
    validationOwner: 'Valiant Khoza',
    status: 'Draft',
    sourceOrigin: 'Technical Pre-Sales Survey'
  }
];

/**
 * Deduplication helper: Adds new items to an existing list only if the unique key doesn't exist.
 */
export function deduplicateRegister<T>(
  existing: T[],
  incoming: T[],
  key: keyof T
): T[] {
  const existingKeys = new Set(existing.map(item => String(item[key]).toLowerCase().trim()));
  const newItems = incoming.filter(item => {
    const keyValue = String(item[key]).toLowerCase().trim();
    if (existingKeys.has(keyValue)) return false;
    existingKeys.add(keyValue);
    return true;
  });
  return [...existing, ...newItems];
}

/**
 * Strategy helper: Maps power/interest to a PMBOK quadrant.
 */
export function computeQuadrant(power: number, interest: number): StakeholderQuadrant {
  if (power >= 50 && interest >= 50) return 'Manage Closely';
  if (power >= 50 && interest < 50) return 'Keep Satisfied';
  if (power < 50 && interest >= 50) return 'Keep Informed';
  return 'Monitor';
}
