export interface AdvannotechResource {
  title: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  department: 'Executive' | 'Finance' | 'Delivery & Projects' | 'Engineering & IoT' | 'Operations' | 'Marketing';
  governanceRole: string;
}

/**
 * Format any phone number into the standard South African format: +27 xx xxx xxxx
 */
export function formatSouthAfricanPhone(phone: string): string {
  if (!phone || !phone.trim()) return '';
  // Strip everything except digits
  let clean = phone.replace(/[^\d]/g, '');
  if (clean.startsWith('27')) {
    clean = clean.slice(2);
  } else if (clean.startsWith('0')) {
    clean = clean.slice(1);
  }
  // If we have 9 digits (e.g., 71 586 7165 or 64 658 7549 or 12 004 0460)
  if (clean.length === 9) {
    return `+27 ${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5)}`;
  }
  if (clean.length === 10 && clean.startsWith('0')) {
    clean = clean.slice(1);
    return `+27 ${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5)}`;
  }
  if (clean.length > 0) {
    return `+27 ${clean}`;
  }
  return phone;
}

export const ADVANNOTECH_STAKEHOLDERS: AdvannotechResource[] = [
  {
    title: 'CEO',
    name: 'Xolani Zuma',
    email: 'xolani.zuma@advannotech.co.za',
    phone: '+27 64 658 7549',
    location: 'Gauteng',
    department: 'Executive',
    governanceRole: 'Executive Sponsor & Corporate Governance Authority'
  },
  {
    title: 'CFO',
    name: 'Lando Zuma',
    email: 'lando.zuma@advannotech.co.za',
    phone: '+27 12 004 0460',
    location: 'Gauteng',
    department: 'Finance',
    governanceRole: 'Financial Approver & Commercial Baseline Authority'
  },
  {
    title: 'Finance Associate',
    name: 'Happy Makofane',
    email: 'makofane.happym@advannotech.co.za',
    phone: '+27 12 004 0460',
    location: 'Gauteng',
    department: 'Finance',
    governanceRole: 'Financial Reconciliation & Invoicing Control'
  },
  {
    title: 'Accounts Administrator',
    name: 'Ndalo Kumalo',
    email: 'ndalo.kumalo@advannotech.co.za',
    phone: '+27 66 091 7106',
    location: 'Gauteng',
    department: 'Finance',
    governanceRole: 'Accounts Payable / Receivable Administration'
  },
  {
    title: 'Systems & Helpdesk Support Engineer',
    name: 'Sanele Langa',
    email: 'sanele.langa@advannotech.co.za',
    phone: '+27 31 000 0000', // Durban Support Line
    location: 'Durban',
    department: 'Operations',
    governanceRole: 'Operational Support & SLA Escalation Lead'
  },
  {
    title: 'Junior Software Support Engineer',
    name: 'Mpendulo Maduna',
    email: 'mpendulo.maduna@advannotech.co.za',
    phone: '+27 71 353 7885',
    location: 'Durban',
    department: 'Operations',
    governanceRole: 'Technical Support & Incident Resolution'
  },
  {
    title: 'Lead Software Engineer',
    name: 'Valiant Khoza',
    email: 'khoza.valiantr@advannotech.co.za',
    phone: '+27 71 586 7165',
    location: 'Gauteng',
    department: 'Engineering & IoT',
    governanceRole: 'Lead Software Engineer & Technical Architecture Authority'
  },
  {
    title: 'Security Systems Lead',
    name: 'Andrew Kotamo',
    email: 'andrew.kotamo@advannotech.co.za',
    phone: '+27 60 461 8284',
    location: 'Gauteng',
    department: 'Engineering & IoT',
    governanceRole: 'Information Security & Compliance Authority'
  },
  {
    title: 'Head of IoT Products and Solutions',
    name: 'Steffen Engelbrecht',
    email: 'engel.steffense@advannotech.co.za',
    phone: '+27 76 623 5299',
    location: 'Gauteng',
    department: 'Engineering & IoT',
    governanceRole: 'Technical Design Authority & Product Lead'
  },
  {
    title: 'Junior Systems Technician',
    name: 'Lucky Hlungwani',
    email: 'Lucky.hlungwani@advannotech.co.za',
    phone: '+27 78 235 1802',
    location: 'Gauteng',
    department: 'Engineering & IoT',
    governanceRole: 'Field Engineering & Systems Testing'
  },
  {
    title: 'Senior IoT Solutions Technician',
    name: 'Edgar Skosana',
    email: 'edgar.skosana@advannotech.co.za',
    phone: '+27 60 461 8284',
    location: 'Gauteng',
    department: 'Engineering & IoT',
    governanceRole: 'Hardware Deployment & Senior QA Specialist'
  },
  {
    title: 'Head of Delivery and Projects',
    name: 'Sarel van Deventer',
    email: 'sarel.vdeventer@advannotech.co.za',
    phone: '+27 83 469 3672',
    location: 'Gauteng',
    department: 'Delivery & Projects',
    governanceRole: 'Project Governance Lead & PMO Director'
  },
  {
    title: 'Project Delivery Officer',
    name: 'Lunga Myeza',
    email: 'lunga.myeza@advannotech.co.za',
    phone: '+27 76 298 7743',
    location: 'Gauteng',
    department: 'Delivery & Projects',
    governanceRole: 'Project Manager & Governance Execution Lead'
  },
  {
    title: 'Marketing',
    name: 'Eve Mavume',
    email: 'Mavume.Eve@advannotech.co.za',
    phone: '+27 12 004 0460', // Advannotech Switchboard
    location: 'Gauteng',
    department: 'Marketing',
    governanceRole: 'Stakeholder Communications & Brand Assurance'
  },
  // --- CLIENT REPRESENTATIVES ---
  {
    title: 'Client Project Sponsor',
    name: '[Client Sponsor Name]',
    email: 'sponsor@client-org.co.za',
    phone: '+27 11 000 0000',
    location: 'Client Site',
    department: 'Executive',
    governanceRole: 'Client Accountable (A) - Executive Decision Authority'
  },
  {
    title: 'Client Project Manager',
    name: '[Client PM Name]',
    email: 'pm@client-org.co.za',
    phone: '+27 11 000 0001',
    location: 'Client Site',
    department: 'Delivery & Projects',
    governanceRole: 'Client Responsible (R) - Primary Operational Contact'
  }
];
