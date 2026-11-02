/**
 * Suggested Meeting Agenda Templates aligned with PMBOK 7th Edition & Advannotech Governance.
 * Covers: Stakeholder Meetings, Update Calls, General Meetings, Kick-Off Meetings, and Close-Out Meetings.
 */

export interface AgendaItem {
  id: string;
  order: number;
  durationMinutes: number;
  title: string;
  objective: string;
  presenterRole: string;
  discussionPoints: string[];
  expectedOutput: string;
}

export interface MeetingAgendaTemplate {
  id: string;
  type: 'kick-off' | 'stakeholder' | 'update-call' | 'general' | 'close-out';
  title: string;
  categoryName: string;
  recommendedDuration: string;
  recommendedAttendees: string[];
  purpose: string;
  governancePrerequisites: string[];
  items: AgendaItem[];
  closingDeliverables: string[];
  documentRelevance: string[]; // Document catalogue IDs that this agenda naturally pairs with
}

export const SUGGESTED_MEETING_AGENDAS: MeetingAgendaTemplate[] = [
  {
    id: 'kick-off-meeting',
    type: 'kick-off',
    title: 'Project Kick-Off & Governance Alignment Meeting',
    categoryName: 'Kick-off Meeting',
    recommendedDuration: '60 - 90 Minutes',
    recommendedAttendees: [
      'Supplier Project Sponsor (Advannotech Executive)',
      'Client Project Sponsor (Executive Authority)',
      'Supplier Project Manager (PMO Lead)',
      'Client Project Manager (Governance & Delivery Lead)',
      'Lead Software Engineer / Technical Architect',
      'Finance & Commercial Officer'
    ],
    purpose: 'Formally inaugurate the project, establish governance baseline, align all internal and client stakeholders on the charter, scope boundaries, milestone schedule, communications cadence, and risk escalation channels.',
    governancePrerequisites: [
      'Approved Project Charter & Signed SOW',
      'Initial High-Level Scope Baseline & WBS Outline',
      'Pre-populated Stakeholder Register & RACI Matrix',
      'Advannotech Engineering Standard Operating Procedures'
    ],
    items: [
      {
        id: 'ko-1',
        order: 1,
        durationMinutes: 10,
        title: 'Executive Welcome, Context & Strategic Mandate',
        objective: 'Reiterate business need, executive endorsement, and strategic value proposition for Advannotech and the client.',
        presenterRole: 'Project Sponsor / Executive Lead',
        discussionPoints: [
          'Opening remarks and welcome to key stakeholders',
          'Strategic drivers and commercial business case context',
          'Executive sponsorship commitment and success definition'
        ],
        expectedOutput: 'Shared leadership vision and formal authorization confirmed.'
      },
      {
        id: 'ko-2',
        order: 2,
        durationMinutes: 15,
        title: 'Project Charter & Scope Boundaries (In-Scope vs Out-of-Scope)',
        objective: 'Define deliverable boundaries, constraints, and explicit exclusions to protect baseline integrity.',
        presenterRole: 'Project Manager (PMO Lead)',
        discussionPoints: [
          'Detailed review of project deliverables and acceptance criteria',
          'Explicit out-of-scope items and boundary management',
          'Assumptions, hard dependencies, and external vendor interfaces'
        ],
        expectedOutput: 'Unambiguous scope boundary alignment signed off by attendees.'
      },
      {
        id: 'ko-3',
        order: 3,
        durationMinutes: 15,
        title: 'Master Milestone Schedule & Critical Path Walkthrough',
        objective: 'Review major delivery stages, gating milestones, client review windows, and target go-live dates.',
        presenterRole: 'Project Manager & Lead Technical Architect',
        discussionPoints: [
          'Phase gating criteria (Initiation -> Planning -> Execution -> Testing -> Close-out)',
          'High-level schedule with critical path dependencies',
          'Client approval lead times and SLA expectations'
        ],
        expectedOutput: 'Approved milestone schedule baseline with mutual accountability dates.'
      },
      {
        id: 'ko-4',
        order: 4,
        durationMinutes: 15,
        title: 'Governance Structure, RACI Matrix & Communications Cadence',
        objective: 'Establish decision rights, CCB escalation paths, meeting cadences, and reporting channels.',
        presenterRole: 'Project Manager & Client Product Owner',
        discussionPoints: [
          'RACI roles: Responsible, Accountable, Consulted, Informed',
          'Reporting rhythm (Weekly Status Reports, Daily Standups, Steering Committee)',
          'Change Control Board (CCB) process: How scope changes are submitted and evaluated'
        ],
        expectedOutput: 'Agreed RACI matrix and weekly governance communication protocols.'
      },
      {
        id: 'ko-5',
        order: 5,
        durationMinutes: 10,
        title: 'Initial Risk Register, Issue Protocols & Immediate Blockers',
        objective: 'Surface high-priority risks, environment access hurdles, and immediate technical prerequisites.',
        presenterRole: 'Lead Software Engineer / Security Lead',
        discussionPoints: [
          'Top 3-5 identified threats and proactive mitigation plans',
          'Infrastructure access, security clearances, and API credentials needed',
          'Immediate 14-day technical onboarding priorities'
        ],
        expectedOutput: 'Initial Risk Log baseline and immediate 48-hour access blocker list.'
      },
      {
        id: 'ko-6',
        order: 6,
        durationMinutes: 10,
        title: 'Open Q&A, Action Items Sign-Off & Adjournment',
        objective: 'Confirm immediate task assignments, next sync date, and formal kickoff closure.',
        presenterRole: 'Project Manager',
        discussionPoints: [
          'Stakeholder Q&A clarification',
          'Review of action items with assigned owners and due dates',
          'Confirmation of next governance check-in'
        ],
        expectedOutput: 'Kick-off meeting minutes and action item log distributed within 24 hours.'
      }
    ],
    closingDeliverables: [
      'Formal Kick-off Meeting Minutes with Attendance Register',
      'Signed Kick-off Acceptance Record',
      'Action Item Register with 48h / 7-day deadlines',
      'Updated Stakeholder Register with confirmed communication channels'
    ],
    documentRelevance: ['project-charter', 'meeting-minutes', 'stakeholder-register', 'scope-management-plan']
  },
  {
    id: 'stakeholder-meeting',
    type: 'stakeholder',
    title: 'Stakeholder Governance & Steering Review Meeting',
    categoryName: 'Stakeholder Meeting',
    recommendedDuration: '45 - 60 Minutes',
    recommendedAttendees: [
      'Supplier Project Sponsor (Chairperson)',
      'Client Project Sponsor (Co-Chair)',
      'Supplier Project Manager (PMO)',
      'Client Project Manager',
      'Lead Technical Architect / Engineering Authority',
      'Quality & Risk Assurance Lead'
    ],
    purpose: 'Review overall strategic health, evaluate stakeholder satisfaction, review Power/Interest movements, address executive escalations, and formally deliberate pending change control requests.',
    governancePrerequisites: [
      'Published Executive Status Report with Earned Value Metrics',
      'Updated Stakeholder Register & Power/Interest Grid',
      'Formal Change Requests submitted to CCB',
      'Risk & Issue Heatmap with high-severity items flagged'
    ],
    items: [
      {
        id: 'sh-1',
        order: 1,
        durationMinutes: 5,
        title: 'Welcome, Quorum Verification & Prior Action Items Review',
        objective: 'Confirm attendance quorum and verify disposition of prior steering committee commitments.',
        presenterRole: 'Project Sponsor / Chairperson',
        discussionPoints: [
          'Attendance confirmation and apologies',
          'Review of previous meeting action item status (Open, Closed, Superseded)',
          'Approval of previous session minutes'
        ],
        expectedOutput: 'Quorum established and prior action items reconciled.'
      },
      {
        id: 'sh-2',
        order: 2,
        durationMinutes: 15,
        title: 'Strategic Progress & Milestone Variance Scorecard',
        objective: 'Review overall RAG health, earned value performance (CPI/SPI), and milestone delivery progress.',
        presenterRole: 'Project Manager',
        discussionPoints: [
          'Milestones delivered since last review vs baseline target',
          'Financial status: actual expenditure vs budget forecast',
          'Schedule variance analysis and critical path forecast'
        ],
        expectedOutput: 'Consensus on project baseline health and variance tolerance.'
      },
      {
        id: 'sh-3',
        order: 3,
        durationMinutes: 15,
        title: 'Stakeholder Impact, Feedback & Organizational Change Readiness',
        objective: 'Evaluate operational impact on client teams, training readiness, and stakeholder sentiments.',
        presenterRole: 'Business Analyst / Change Lead',
        discussionPoints: [
          'Feedback from end-user departments and key business champions',
          'Organizational change readiness and adoption risks',
          'Communications plan effectiveness'
        ],
        expectedOutput: 'Updated stakeholder sentiment assessment and tailored communication adjustments.'
      },
      {
        id: 'sh-4',
        order: 4,
        durationMinutes: 15,
        title: 'Executive Escalations & Change Control Board (CCB) Decisions',
        objective: 'Deliberate and decide on proposed scope, timeline, or budgetary adjustments requiring steering approval.',
        presenterRole: 'Project Sponsor & Project Manager',
        discussionPoints: [
          'Evaluation of pending Change Requests (Cost, Scope, Schedule impact)',
          'Executive sponsor decisions: Approved, Rejected, Deferred for Info',
          'Budget re-allocations or contingency draw-down authorizations'
        ],
        expectedOutput: 'Binding CCB decision sign-offs recorded in the Change Log.'
      },
      {
        id: 'sh-5',
        order: 5,
        durationMinutes: 10,
        title: 'Strategic Decisions Summary, Next Milestones & Adjournment',
        objective: 'Consolidate agreed mandates, assign executive sponsors to critical escalations, and schedule next review.',
        presenterRole: 'Chairperson / PMO Lead',
        discussionPoints: [
          'Summary of formal decisions and sign-off accountability',
          'Confirmation of key deliverables for the next 30 days',
          'Date of next Steering Review'
        ],
        expectedOutput: 'Executive minutes and updated Change Register issued to leadership.'
      }
    ],
    closingDeliverables: [
      'Steering Committee Governance Minutes',
      'Signed CCB Decision Log',
      'Updated Stakeholder Expectations Matrix',
      'Escalation Action Plan'
    ],
    documentRelevance: ['stakeholder-register', 'meeting-minutes', 'status-report', 'change-log']
  },
  {
    id: 'update-call',
    type: 'update-call',
    title: 'Project Update Call & Cadence Sync (Weekly / Sprint Review)',
    categoryName: 'Update Call',
    recommendedDuration: '25 - 45 Minutes',
    recommendedAttendees: [
      'Supplier Project Manager (Facilitator)',
      'Client Project Coordinator / PM',
      'Lead Software Engineer & Technical Team',
      'QA Lead & Systems Engineers'
    ],
    purpose: 'Deliver crisp operational progress updates, track 7-day milestone burn-down, review open defects and work-in-progress, and unblock immediate delivery impediments within 24-48 hours.',
    governancePrerequisites: [
      'Active Sprint / Weekly Work Package Board',
      'Updated Issue Log with newly reported defects',
      'Timesheet and work deliverable completion metrics',
      'Daily burn-up / burn-down charts'
    ],
    items: [
      {
        id: 'up-1',
        order: 1,
        durationMinutes: 5,
        title: 'Roll Call & Weekly Agenda Overview',
        objective: 'Fast alignment on meeting structure and verification of key team attendance.',
        presenterRole: 'Project Manager',
        discussionPoints: [
          'Attendance confirmation',
          'Review of call focus areas and time limits per topic'
        ],
        expectedOutput: 'Focused team alignment on operational review.'
      },
      {
        id: 'up-2',
        order: 2,
        durationMinutes: 15,
        title: 'Accomplishments vs Commitments (Last 7 Days)',
        objective: 'Review completed deliverables, code merged, test passes, and site work finished.',
        presenterRole: 'Engineering Lead & Project Delivery Officer',
        discussionPoints: [
          'Work packages completed and certified against Definition of Done',
          'Job cards fulfilled and technical inspections signed off',
          'Items planned but not finished and root cause explanation'
        ],
        expectedOutput: 'Accurate record of certified delivered progress.'
      },
      {
        id: 'up-3',
        order: 3,
        durationMinutes: 15,
        title: 'Impediments, Blockers & Technical Issue Log Triage',
        objective: 'Identify and resolve active blocking issues affecting work packages.',
        presenterRole: 'Lead Software Engineer / Operations Support',
        discussionPoints: [
          'High/Critical severity issues requiring external unblocking',
          'Third-party API dependencies or environmental infrastructure delays',
          'Action items with direct owner assignments for 24h resolution'
        ],
        expectedOutput: 'Targeted resolution plan with named owners for all blocking items.'
      },
      {
        id: 'up-4',
        order: 4,
        durationMinutes: 5,
        title: 'Next 7-Day Target Commitments & Key Milestone Gating',
        objective: 'Define the explicit delivery priorities for the upcoming reporting period.',
        presenterRole: 'Project Manager',
        discussionPoints: [
          'Deliverable targets for the next 7 days',
          'Scheduled client testing or demonstration sessions',
          'Upcoming vendor milestones or deliverable handovers'
        ],
        expectedOutput: 'Clear 7-day commitment contract across delivery squads.'
      }
    ],
    closingDeliverables: [
      'Weekly Status Flash Summary email',
      'Updated Issue Log with assigned resolution dates',
      'Refreshed Sprint Task Board'
    ],
    documentRelevance: ['status-report', 'meeting-minutes', 'issue-log', 'job-card']
  },
  {
    id: 'general-meeting',
    type: 'general',
    title: 'General Project & Technical Problem-Solving Session',
    categoryName: 'General Meeting',
    recommendedDuration: '45 - 60 Minutes',
    recommendedAttendees: [
      'Project Manager / Session Facilitator',
      'Lead Technical Architect & Systems Engineers',
      'Subject Matter Experts (SMEs)',
      'Security Systems Lead & QA Specialists'
    ],
    purpose: 'Conduct deep-dive collaborative reviews into technical architecture, risk mitigations, complex specification clarifications, or vendor integration challenges that require multidisciplinary problem-solving.',
    governancePrerequisites: [
      'Problem Statement or Architecture Decision Record (ADR) draft',
      'Technical design diagrams / interface specifications',
      'Relevant vendor documentation or benchmark test results'
    ],
    items: [
      {
        id: 'gen-1',
        order: 1,
        durationMinutes: 5,
        title: 'Session Context, Problem Framing & Success Criteria',
        objective: 'Clearly articulate the specific technical problem or decision requiring consensus.',
        presenterRole: 'Meeting Facilitator / Lead Software Engineer',
        discussionPoints: [
          'Background of the problem or architecture trade-off',
          'Constraints (budget, latency, security, timeline, backward compatibility)',
          'Required decision output for the session'
        ],
        expectedOutput: 'Shared understanding of the technical problem space.'
      },
      {
        id: 'gen-2',
        order: 2,
        durationMinutes: 20,
        title: 'Option Presentation & Trade-Off Analysis',
        objective: 'Review evaluated architectural or operational options against Advannotech standards.',
        presenterRole: 'Subject Matter Expert / Technical Lead',
        discussionPoints: [
          'Option A vs Option B technical and operational comparisons',
          'Security, maintenance, and scalability implications',
          'Cost and schedule impact of each viable pathway'
        ],
        expectedOutput: 'Comprehensive evaluation matrix across competing options.'
      },
      {
        id: 'gen-3',
        order: 3,
        durationMinutes: 15,
        title: 'Open Technical Debate & Consensus Building',
        objective: 'Stress-test the preferred option and deliberate failure modes and edge cases.',
        presenterRole: 'All Engineering & Governance Attendees',
        discussionPoints: [
          'Edge case analysis and failure recovery scenarios',
          'Client operational impact and supportability',
          'Validation against ISO/PMBOK quality criteria'
        ],
        expectedOutput: 'Consensus on the recommended technical solution.'
      },
      {
        id: 'gen-4',
        order: 4,
        durationMinutes: 10,
        title: 'Formal Architectural Decision Record (ADR) & Action Assignment',
        objective: 'Formulate the binding decision, document rationale, and assign implementation tasks.',
        presenterRole: 'Lead Software Engineer / PM',
        discussionPoints: [
          'Drafting the decision statement and rationale in the ADR',
          'Assigning prototype or implementation owners',
          'Follow-up verification deadline'
        ],
        expectedOutput: 'Approved ADR entry and assigned implementation action items.'
      }
    ],
    closingDeliverables: [
      'Architectural Decision Record (ADR)',
      'Detailed Technical Meeting Notes & Action List',
      'Risk Register update if new vulnerabilities identified'
    ],
    documentRelevance: ['meeting-minutes', 'quality-control-measurements', 'risk-register', 'procurement-performance-report']
  },
  {
    id: 'close-out-meeting',
    type: 'close-out',
    title: 'Project Close-Out, Acceptance & Retrospective Meeting',
    categoryName: 'Kick-off & Close-out Meetings',
    recommendedDuration: '60 - 90 Minutes',
    recommendedAttendees: [
      'Project Sponsor (Client Executive & Advannotech Executive)',
      'Project Manager (PMO Director / Delivery Lead)',
      'Client Operations Handover Lead',
      'Lead Technical Architect & Engineering Team',
      'Finance & Commercial Officer'
    ],
    purpose: 'Formally certify project completion, verify deliverable acceptance against contractual scope, finalize financial settlements, conduct retrospective lessons learned, and transition ongoing support to operations.',
    governancePrerequisites: [
      'Final Acceptance Certificates & Test Sign-off sheets',
      'Financial Reconciliation & Invoice Statement of Account',
      'Draft Final Project Report & Transition Plan',
      'Pre-populated Lessons Learned Register'
    ],
    items: [
      {
        id: 'co-1',
        order: 1,
        durationMinutes: 10,
        title: 'Formal Welcome & Project Scope Fulfillment Verification',
        objective: 'Verify that 100% of approved scope and work packages have been formally delivered and accepted.',
        presenterRole: 'Project Sponsor & Project Manager',
        discussionPoints: [
          'Scope baseline scorecard: Delivered deliverables vs Charter objectives',
          'Verification of client acceptance signatures on all work packages',
          'Disposition of any waived non-critical variances'
        ],
        expectedOutput: 'Unanimous concurrence on project completion and scope fulfillment.'
      },
      {
        id: 'co-2',
        order: 2,
        durationMinutes: 15,
        title: 'Financial Reconciliation, Contract Settlements & Warranty Baseline',
        objective: 'Review final expenditures against approved budget, close procurement contracts, and activate warranties.',
        presenterRole: 'Finance Associate / Commercial Lead',
        discussionPoints: [
          'Budget reconciliation: Approved budget vs actual final cost',
          'Contractor retainage release and final invoice authorizations',
          'Warranty period commencement date, terms, and SLA response covenants'
        ],
        expectedOutput: 'Approved financial settlement and warranty activation sign-off.'
      },
      {
        id: 'co-3',
        order: 3,
        durationMinutes: 20,
        title: 'Operational Handover & Ongoing Support Transition',
        objective: 'Hand over credentials, technical repositories, runbooks, and SLA responsibilities to operations.',
        presenterRole: 'Lead Software Engineer & Systems Support Lead',
        discussionPoints: [
          'Delivery of as-built architectural documentation and source repositories',
          'Access credentials transfer and administrative handover',
          'Operations support SLA escalation procedures (Tier 1/2/3 contacts)'
        ],
        expectedOutput: 'Signed Operations Handover Certificate.'
      },
      {
        id: 'co-4',
        order: 4,
        durationMinutes: 20,
        title: 'Retrospective & Lessons Learned Workshop',
        objective: 'Reflect candidly on project successes, root causes of friction, and institutional knowledge improvements.',
        presenterRole: 'Project Manager (All Attendees Contributing)',
        discussionPoints: [
          'What succeeded and should be codified as Advannotech best practice',
          'What challenges occurred (scope creep, estimation variances, vendor delays)',
          'Concrete organizational process assets (OPA) update recommendations'
        ],
        expectedOutput: 'Final Lessons Learned Register entries approved by team.'
      },
      {
        id: 'co-5',
        order: 5,
        durationMinutes: 10,
        title: 'Executive Endorsement, Team Release & Formal Adjournment',
        objective: 'Formally disband project team, release resources to functional departments, and archive project.',
        presenterRole: 'Project Sponsor & PMO Director',
        discussionPoints: [
          'Sponsor closing commendations and appreciation',
          'Formal release of team resources from project code',
          'Archiving project documentation in Advannotech PMO repository'
        ],
        expectedOutput: 'Formal Project Closure Endorsement and archive authorization.'
      }
    ],
    closingDeliverables: [
      'Signed Final Project Closure Report',
      'Formal Client Acceptance Certificate',
      'Final Lessons Learned Register',
      'Operational Support Handover Agreement'
    ],
    documentRelevance: ['final-report', 'procurement-contract-closeout', 'lessons-learned-register', 'meeting-minutes']
  }
];

/**
 * Format an agenda template into clean, professional Markdown for embedding into project documents.
 */
export function formatAgendaAsMarkdown(agenda: MeetingAgendaTemplate, projectName?: string): string {
  let md = `### Formal Meeting Agenda: ${agenda.title}\n\n`;
  md += `Meeting Category: ${agenda.categoryName}  \n`;
  md += `Target Duration: ${agenda.recommendedDuration}  \n`;
  if (projectName) {
    md += `Project Reference: ${projectName}  \n`;
  }
  md += `Governance Standard: PMBOK 7th Edition & Advannotech Quality Framework\n\n`;

  md += `#### 1. Purpose & Strategic Mandate\n${agenda.purpose}\n\n`;

  md += `#### 2. Recommended Attendees & Quorum\n`;
  agenda.recommendedAttendees.forEach((attendee) => {
    md += `- ${attendee}\n`;
  });
  md += `\n`;

  md += `#### 3. Governance Prerequisites (Required Prior to Session)\n`;
  agenda.governancePrerequisites.forEach((prereq) => {
    md += `- [ ] ${prereq}\n`;
  });
  md += `\n`;

  md += `#### 4. Time-Boxed Agenda Structure\n\n`;
  md += `| Item | Duration | Agenda Topic | Presenter / Lead | Expected Governance Output |\n`;
  md += `| :---: | :---: | :--- | :--- | :--- |\n`;
  agenda.items.forEach((item) => {
    md += `| ${item.order} | ${item.durationMinutes} min | ${item.title} | ${item.presenterRole} | ${item.expectedOutput} |\n`;
  });
  md += `\n`;

  md += `#### 5. Itemized Discussion Protocols\n\n`;
  agenda.items.forEach((item) => {
    md += `##### ${item.order}. ${item.title} (${item.durationMinutes} min - ${item.presenterRole})\n`;
    md += `*Objective:* ${item.objective}\n\n`;
    md += `*Key Discussion Points:*\n`;
    item.discussionPoints.forEach((dp) => {
      md += `- ${dp}\n`;
    });
    md += `*Deliverable Outcome:* ${item.expectedOutput}\n\n`;
  });

  md += `#### 6. Closing Deliverables & Mandatory Distribution\n`;
  agenda.closingDeliverables.forEach((deliv) => {
    md += `- ${deliv} *(Distribution within 24 hours of session adjournment)*\n`;
  });
  md += `\n---\n`;

  return md;
}
