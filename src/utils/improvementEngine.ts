/**
 * PMBOK 7th Edition Improvement Engine
 * Generates specific, actionable remediation steps for RED and AMBER flagged content.
 * Provides source file references, interactive missing data point prompts, and SME inquiry templates.
 */

import { ExtractedFile } from './fileParsers';
import { PMIDocumentDefinition } from '../data/documents';

export interface ImprovementEngineItem {
  id: string;
  flag: 'RED' | 'AMBER';
  title: string;
  category: 'Section Missing' | 'Field Deficient' | 'High Risk Advisory' | 'PMBOK Compliance';
  sectionOrField: string;
  defectSummary: string;
  impactAnalysis: string;
  actionableSteps: string[];
  sourceFileReferences: {
    recommendedFileType: string;
    exampleFileNames: string[];
    sectionToInspect: string;
    alreadyUploadedMatch?: string;
  };
  missingDataPrompt: {
    promptText: string;
    placeholder: string;
    dataPointKey: string;
    responsibleRole: string;
    sampleValue: string;
  };
  suggestedFixClause: string;
  isResolved?: boolean;
  resolvedValue?: string;
}

/**
 * Intelligent generator that constructs detailed ImprovementEngineItems
 * from audit advisories, missing sections, and deficient fields.
 */
export function generateImprovementItems(
  auditData: {
    humanReviewAdvisories?: Array<{
      item: string;
      section: string;
      riskLevel: 'Critical' | 'High' | 'Medium';
      advisoryNote: string;
      recommendedAction: string;
      suggestedFix?: string;
    }>;
    complianceHeatmap?: Array<{
      knowledgeArea: string;
      coverageScore: number;
      confidenceLevel: 'High' | 'Medium' | 'Low';
      sectionsCovered: string[];
      notes: string;
      suggestions?: string;
    }>;
  } | null,
  selectedDoc: PMIDocumentDefinition | null,
  uploadedFiles: ExtractedFile[] = [],
  coveredSections?: string[],
  coveredFields?: string[]
): ImprovementEngineItem[] {
  const items: ImprovementEngineItem[] = [];
  const uploadedNames = uploadedFiles.map((f) => f.name.toLowerCase());

  const findMatchingUploadedFile = (keywords: string[]): string | undefined => {
    for (const file of uploadedFiles) {
      const lower = file.name.toLowerCase();
      if (keywords.some((k) => lower.includes(k.toLowerCase()))) {
        return file.name;
      }
    }
    return undefined;
  };

  // 1. Process Human Review Advisories with Critical (RED) or High (AMBER) risk
  if (auditData?.humanReviewAdvisories) {
    auditData.humanReviewAdvisories.forEach((adv, idx) => {
      if (adv.riskLevel === 'Critical' || adv.riskLevel === 'High') {
        const isRed = adv.riskLevel === 'Critical';
        const keywords = [adv.section, adv.item, 'charter', 'sow', 'contract', 'requirements', 'scope'];
        const matchedFile = findMatchingUploadedFile(keywords);

        const role = determineResponsibleRole(adv.section, adv.item);
        const steps = generateActionableSteps(adv.item, adv.section, isRed);
        const sourceRef = generateSourceFileRef(adv.section, adv.item, matchedFile);
        const dataPrompt = generateDataPrompt(adv.section, adv.item, role);

        items.push({
          id: `IMP-ADV-${idx + 1}`,
          flag: isRed ? 'RED' : 'AMBER',
          title: adv.item,
          category: 'High Risk Advisory',
          sectionOrField: adv.section,
          defectSummary: adv.advisoryNote,
          impactAnalysis: isRed
            ? 'Critical compliance violation under PMBOK 7th Ed. & ISO 21500; blocks audit sign-off.'
            : 'Moderate governance risk; assumptions require formal SME verification before baseline lock.',
          actionableSteps: steps,
          sourceFileReferences: sourceRef,
          missingDataPrompt: dataPrompt,
          suggestedFixClause:
            adv.suggestedFix ||
            `### ${adv.section} - Remediated Compliance Clause\n\nParameter / Baseline: ${adv.item}\n\nRemediation Action: ${adv.recommendedAction}\n\nFormal Specification: All project deliverables associated with ${adv.section} shall adhere to Advannotech Quality Standards, verified against PMBOK 7th Edition performance domains. Quantifiable tolerances: ±5% variance allowance.`,
        });
      }
    });
  }

  // 2. Process Missing Mandatory Sections (RED) if available
  if (selectedDoc && coveredSections) {
    selectedDoc.requiredSections.forEach((sec, idx) => {
      const isMissing = !coveredSections.includes(sec);
      if (isMissing && !items.some((i) => i.sectionOrField === sec)) {
        const keywords = [sec, 'scope', 'charter', 'wbs', 'governance', 'risk'];
        const matchedFile = findMatchingUploadedFile(keywords);
        const role = determineResponsibleRole(sec, 'Mandatory Section');

        items.push({
          id: `IMP-SEC-${idx + 1}`,
          flag: 'RED',
          title: `Missing Section: ${sec}`,
          category: 'Section Missing',
          sectionOrField: sec,
          defectSummary: `Mandatory PMBOK section '${sec}' is not covered in the document draft or source materials.`,
          impactAnalysis: 'Missing mandatory section causes ISO/PMBOK audit non-conformance and project boundary ambiguity.',
          actionableSteps: [
            `Step 1: Consult the project initiation package or ${matchedFile || 'Signed Project Charter / SOW'} for Section '${sec}'.`,
            `Step 2: Obtain formal boundary criteria from the designated ${role}.`,
            `Step 3: Insert mandatory section '${sec}' with quantifiable KPIs, thresholds, and governance approvals.`,
          ],
          sourceFileReferences: {
            recommendedFileType: 'Project Charter / Statement of Work (SOW)',
            exampleFileNames: [`Project_Charter_${selectedDoc.id}.docx`, 'SOW_Scope_Baseline.pdf'],
            sectionToInspect: `Scope Definition & Deliverables for ${sec}`,
            alreadyUploadedMatch: matchedFile,
          },
          missingDataPrompt: {
            promptText: `Provide the core scope description or baseline criteria for '${sec}':`,
            placeholder: `e.g. Detailed definition of ${sec} including inclusions, exclusions, and acceptance metrics...`,
            dataPointKey: `sec_${idx}`,
            responsibleRole: role,
            sampleValue: `${sec} adheres to Advannotech PMO governance with formal sign-off thresholds and milestone gates.`,
          },
          suggestedFixClause: `### ${sec}\n\nGovernance Baseline: This section establishes the governance criteria for ${sec} in strict alignment with PMI PMBOK 7th Edition standards.\n\n- Objective & Scope: Define clear boundaries, stakeholder responsibilities, and acceptance metrics.\n- Quantifiable KPI: Target 100% adherence to agreed timeline and quality criteria.\n- Approval Authority: Advannotech Lead Technical Authority & Project Sponsor.`,
        });
      }
    });
  }

  // 3. Process Deficient / Missing Fields (AMBER / RED)
  if (selectedDoc && coveredFields) {
    selectedDoc.requiredFields.forEach((field, idx) => {
      const isMissing = !coveredFields.includes(field);
      if (isMissing && !items.some((i) => i.title.includes(field))) {
        const role = determineResponsibleRole('Fields', field);
        const keywords = [field, 'budget', 'schedule', 'stakeholder', 'resource', 'kpi'];
        const matchedFile = findMatchingUploadedFile(keywords);

        items.push({
          id: `IMP-FLD-${idx + 1}`,
          flag: 'AMBER',
          title: `Required Field Gap: ${field}`,
          category: 'Field Deficient',
          sectionOrField: selectedDoc.requiredSections[0] || 'General Specifications',
          defectSummary: `Required information field '${field}' was not detected in source artifacts.`,
          impactAnalysis: 'Omission of required parameters leads to scope creep and lack of audit traceability.',
          actionableSteps: [
            `Step 1: Check source documents (${matchedFile || 'Resource Plan, Budget Sheet, or WBS Dictionary'}) for '${field}'.`,
            `Step 2: Prompt ${role} for specific metric, date, or threshold values.`,
            `Step 3: Inject the verified parameter into the document canvas.`,
          ],
          sourceFileReferences: {
            recommendedFileType: 'Budget Schedule / WBS Dictionary / Technical Architecture Spec',
            exampleFileNames: ['Project_Schedule_Baseline.xlsx', 'Technical_Architecture_Spec.docx'],
            sectionToInspect: `Table of Parameters: ${field}`,
            alreadyUploadedMatch: matchedFile,
          },
          missingDataPrompt: {
            promptText: `Enter verified value for '${field}':`,
            placeholder: `e.g. Specify numeric baseline, timeline date, or specific criteria for ${field}...`,
            dataPointKey: `fld_${idx}`,
            responsibleRole: role,
            sampleValue: `${field}: Verified baseline conforming to Advannotech standard operating procedures.`,
          },
          suggestedFixClause: `${field}: Parameter formally established in accordance with Advannotech baseline criteria. Metric approved by ${role}.`,
        });
      }
    });
  }

  // 4. Low-coverage Knowledge Areas in Heatmap (if coverage < 60% -> AMBER/RED)
  if (auditData?.complianceHeatmap) {
    auditData.complianceHeatmap.forEach((heat, idx) => {
      if (heat.coverageScore < 65) {
        const isRed = heat.coverageScore < 45;
        const exists = items.some((i) => i.title.includes(heat.knowledgeArea));
        if (!exists) {
          const role = determineResponsibleRole(heat.knowledgeArea, 'PMBOK');
          items.push({
            id: `IMP-KNOW-${idx + 1}`,
            flag: isRed ? 'RED' : 'AMBER',
            title: `PMBOK Knowledge Gap: ${heat.knowledgeArea}`,
            category: 'PMBOK Compliance',
            sectionOrField: heat.sectionsCovered[0] || 'Governance Alignment',
            defectSummary: `Coverage score for ${heat.knowledgeArea} is only ${heat.coverageScore}%. ${heat.notes || 'Insufficient depth of evidence.'}`,
            impactAnalysis: 'Under-represented knowledge area creates vulnerability during ISO/IEC 21500 compliance audits.',
            actionableSteps: [
              `Step 1: Review PMBOK 7th Edition performance standards for ${heat.knowledgeArea}.`,
              `Step 2: Incorporate missing artifacts or checklists recommended: "${heat.suggestions || 'Add explicit governance clauses'}".`,
              `Step 3: Validate with ${role} and update the document.`,
            ],
            sourceFileReferences: {
              recommendedFileType: 'PMBOK Governance Checklist / PMO Framework',
              exampleFileNames: [`Advannotech_${heat.knowledgeArea.replace(/\s+/g, '_')}_Standard.pdf`],
              sectionToInspect: 'Performance Domain Alignment Matrix',
            },
            missingDataPrompt: {
              promptText: `Specify mitigation or standard criteria for ${heat.knowledgeArea}:`,
              placeholder: `e.g. Protocol, monitoring frequency, or audit schedule for ${heat.knowledgeArea}...`,
              dataPointKey: `know_${idx}`,
              responsibleRole: role,
              sampleValue: `Governance protocol for ${heat.knowledgeArea} monitored bi-weekly with zero-variance threshold.`,
            },
            suggestedFixClause: `### ${heat.knowledgeArea} Alignment Protocol\n\n- Governance Standard: Conforming to PMI PMBOK 7th Edition.\n- Coverage Enhancement: ${heat.suggestions || 'Continuous monitoring and risk mitigation.'}\n- Oversight: Periodic reviews led by ${role}.`,
          });
        }
      }
    });
  }

  return items;
}

/**
 * Determine the responsible SME role based on section or item keywords
 */
function determineResponsibleRole(section: string, item: string): string {
  const combined = `${section} ${item}`.toLowerCase();
  if (combined.includes('cost') || combined.includes('budget') || combined.includes('financial') || combined.includes('price')) {
    return 'Financial Controller / Commercial Lead';
  }
  if (combined.includes('software') || combined.includes('technical') || combined.includes('iot') || combined.includes('architecture') || combined.includes('api')) {
    return 'Valiant Khoza (Lead Software Engineer)';
  }
  if (combined.includes('schedule') || combined.includes('timeline') || combined.includes('milestone') || combined.includes('wbs')) {
    return 'Senior Project Manager / Scrum Master';
  }
  if (combined.includes('risk') || combined.includes('issue') || combined.includes('threat') || combined.includes('mitigation')) {
    return 'Risk Officer / PMO Director';
  }
  if (combined.includes('quality') || combined.includes('iso') || combined.includes('audit') || combined.includes('standard')) {
    return 'Quality Assurance Lead / ISO Auditor';
  }
  if (combined.includes('stakeholder') || combined.includes('sponsor') || combined.includes('executive') || combined.includes('approval')) {
    return 'Executive Sponsor / Client Delivery Director';
  }
  if (combined.includes('procurement') || combined.includes('vendor') || combined.includes('subcontractor') || combined.includes('contract')) {
    return 'Procurement Specialist / Legal Counsel';
  }
  return 'Project Manager / Workstream Lead';
}

/**
 * Generate 3 actionable steps tailored to the item
 */
function generateActionableSteps(item: string, section: string, isRed: boolean): string[] {
  if (isRed) {
    return [
      `Step 1: Review primary legal/commercial source materials (SOW, SLA, or Contract Schedule) for '${item}'.`,
      `Step 2: Request verified data point or sign-off from designated authority for Section '${section}'.`,
      `Step 3: Inject the validated compliance clause into the document to eliminate the audit blocker.`,
    ];
  }
  return [
    `Step 1: Check existing project artifacts or operational notes for explicit mention of '${item}'.`,
    `Step 2: Confirm tolerances, baselines, and review cadences with the responsible workstream SME.`,
    `Step 3: Update Section '${section}' with the substantiated parameter and archive proof in project records.`,
  ];
}

/**
 * Generate source file references
 */
function generateSourceFileRef(
  section: string,
  item: string,
  matchedFile?: string
): ImprovementEngineItem['sourceFileReferences'] {
  const lower = `${section} ${item}`.toLowerCase();

  let recommendedFileType = 'Project Charter / Statement of Work (SOW)';
  let exampleFileNames = ['Project_Charter_v1.docx', 'SOW_Scope_Baseline.pdf'];
  let sectionToInspect = `Section addressing ${item} under ${section}`;

  if (lower.includes('budget') || lower.includes('cost') || lower.includes('financial')) {
    recommendedFileType = 'Cost Management Plan / Financial Model / SOW Appendix B';
    exampleFileNames = ['Project_Budget_v2.xlsx', 'Commercial_Proposal_Final.pdf'];
    sectionToInspect = 'Cost Breakdown Structure (CBS) & Contingency Reserves Table';
  } else if (lower.includes('schedule') || lower.includes('milestone') || lower.includes('timeline')) {
    recommendedFileType = 'Integrated Master Schedule / WBS Dictionary';
    exampleFileNames = ['Master_Schedule_Gantt.mpp', 'Project_Timeline.xlsx'];
    sectionToInspect = 'Critical Path & Milestone Deliverables Schedule';
  } else if (lower.includes('tech') || lower.includes('software') || lower.includes('iot') || lower.includes('architecture')) {
    recommendedFileType = 'Technical Architecture Document / System Specification';
    exampleFileNames = ['Architecture_Design_Spec.docx', 'API_Integration_Spec.pdf'];
    sectionToInspect = 'Non-Functional Requirements & Security Protocols';
  } else if (lower.includes('risk') || lower.includes('threat')) {
    recommendedFileType = 'Project Risk Register / Threat Analysis Log';
    exampleFileNames = ['Advannotech_Risk_Register.xlsx'];
    sectionToInspect = 'Qualitative Risk Scoring & Mitigation Actions Register';
  }

  return {
    recommendedFileType,
    exampleFileNames,
    sectionToInspect,
    alreadyUploadedMatch: matchedFile,
  };
}

/**
 * Generate interactive data prompt
 */
function generateDataPrompt(
  section: string,
  item: string,
  role: string
): ImprovementEngineItem['missingDataPrompt'] {
  const lower = `${section} ${item}`.toLowerCase();

  if (lower.includes('budget') || lower.includes('cost')) {
    return {
      promptText: `Enter validated cost baseline / currency amount for '${item}':`,
      placeholder: 'e.g. ZAR 1,250,000 baseline budget with 10% contingency reserve',
      dataPointKey: 'cost_amount',
      responsibleRole: role,
      sampleValue: 'Total Baseline Budget: ZAR 1,250,000 (Excl. VAT); Contingency: 10% (ZAR 125,000).',
    };
  }
  if (lower.includes('date') || lower.includes('milestone') || lower.includes('schedule')) {
    return {
      promptText: `Enter validated completion date or milestone target for '${item}':`,
      placeholder: 'e.g. 2026-12-15 (Sprint 4 Deliverable Sign-Off)',
      dataPointKey: 'schedule_target',
      responsibleRole: role,
      sampleValue: 'Milestone Target Date: 2026-11-30; Critical Path buffer: 10 business days.',
    };
  }
  if (lower.includes('resource') || lower.includes('person') || lower.includes('role')) {
    return {
      promptText: `Specify appointed lead resource or RACI owner for '${item}':`,
      placeholder: 'e.g. Valiant Khoza (Lead Software Engineer) - Accountable',
      dataPointKey: 'raci_owner',
      responsibleRole: role,
      sampleValue: 'Lead Authority: Valiant Khoza (Lead Software Engineer) | Contact: khoza.valiantr@advannotech.co.za',
    };
  }

  return {
    promptText: `Enter missing data point or baseline parameter for '${item}':`,
    placeholder: `e.g. Specific quantifiable metric or standard for ${item}...`,
    dataPointKey: 'general_metric',
    responsibleRole: role,
    sampleValue: `${item}: Standard operational threshold formally verified against PMBOK 7th Edition specifications.`,
  };
}

/**
 * Generate a ready-to-copy SME Inquiry Email
 */
export function generateSmeEmailTemplate(
  item: ImprovementEngineItem,
  docTitle: string,
  projectName: string = 'Advannotech Strategic Initiative'
): string {
  return `Subject: URGENT: Audit Compliance Requirement - Missing Data for ${docTitle} [${item.flag} Flag]

Dear ${item.missingDataPrompt.responsibleRole},

During the PMBOK 7th Edition & ISO/IEC 21500 compliance audit for the project "${projectName}" (${docTitle}), our automated Improvement Engine flagged the following ${item.flag} priority item:

- Item / Parameter: ${item.title}
- Affected Section: ${item.sectionOrField}
- Audit Severity: ${item.flag === 'RED' ? 'RED (Critical Blocking Defect)' : 'AMBER (Medium Risk Assumption)'}
- Audit Defect: ${item.defectSummary}

Required Action:
${item.actionableSteps.map((s) => `  ${s}`).join('\n')}

Specific Data Point Needed:
"${item.missingDataPrompt.promptText}"
Suggested reference documents: ${item.sourceFileReferences.recommendedFileType} (${item.sourceFileReferences.sectionToInspect}).

Sample/Expected Value:
${item.missingDataPrompt.sampleValue}

Please reply with the verified figures/criteria or confirm if we may inject the suggested baseline clause:

"""
${item.suggestedFixClause}
"""

Kind regards,
Advannotech Project Governance Office & PMO Auditor
Advannotech (Pty) Ltd | ISO 21500 Compliance`;
}

/**
 * Injects user data or suggested clause into the document Markdown text
 */
export function applyImprovementFixToMarkdown(
  currentMarkdown: string,
  item: ImprovementEngineItem,
  customDataPoint?: string
): string {
  const sectionTarget = `### ${item.sectionOrField}`;
  const fixClause = customDataPoint
    ? `\n\n> [Remediation Fix - ${item.title}]\n> Verified Parameter: ${customDataPoint}\n> *Approved by ${item.missingDataPrompt.responsibleRole} conforming to PMBOK 7th Edition standards.*\n`
    : `\n\n${item.suggestedFixClause}\n`;

  if (currentMarkdown.includes(sectionTarget)) {
    return currentMarkdown.replace(sectionTarget, `${sectionTarget}${fixClause}`);
  }

  // If section header doesn't exist, append it at the end of the document
  return `${currentMarkdown.trim()}\n\n### ${item.sectionOrField}\n${fixClause}\n`;
}
