import { 
  MatrixStakeholder, 
  ProjectRisk, 
  ProjectAssumption,
  computeQuadrant,
  INITIAL_STAKEHOLDERS,
  INITIAL_RISKS,
  INITIAL_ASSUMPTIONS
} from '../data/projectRegisters';
import { computeRiskScore } from './riskData';

/**
 * Extracts Stakeholders from text using regex patterns
 */
export function extractStakeholders(text: string): MatrixStakeholder[] {
  const extracted: MatrixStakeholder[] = [];
  const seenNames = new Set<string>();
  
  // Pattern: [Name] - [Title] ([Dept])
  const patterns = [
    /([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)\s*-\s*([^,\n(]+)(?:\s*\(([^)]+)\))?/g,
    /Name:\s*([^\n]+)\s*Role:\s*([^\n]+)/gi,
    /([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)\s*\(([A-Z\s]+)\)/g
  ];

  patterns.forEach(regex => {
    let match;
    while ((match = regex.exec(text)) !== null) {
      const name = match[1].trim();
      const title = (match[2] || 'Stakeholder').trim();
      const dept = (match[3] || 'TBC').trim();
      
      if (!seenNames.has(name.toLowerCase()) && name.length < 40 && !name.includes('Project')) {
        seenNames.add(name.toLowerCase());
        extracted.push({
          id: `EXT-STK-${extracted.length + 1}`,
          name,
          title,
          department: dept,
          email: `${name.toLowerCase().replace(/\s+/g, '.')}@advannotech.co.za`,
          phone: '+27 12 004 0460',
          location: 'TBC',
          power: 50,
          interest: 50,
          raci: 'Informed',
          quadrant: 'Monitor',
          keyExpectation: 'Timely project delivery and information transparency.',
          engagementChannel: 'Standard Project Governance'
        });
      }
    }
  });

  return extracted;
}

/**
 * Extracts Assumptions from text
 */
export function extractAssumptions(text: string): ProjectAssumption[] {
  const extracted: ProjectAssumption[] = [];
  const lines = text.split('\n');
  const seen = new Set<string>();

  lines.forEach(line => {
    const trimmed = line.trim();
    if (
      (trimmed.toLowerCase().includes('assum') || trimmed.toLowerCase().startsWith('asm-')) && 
      trimmed.length > 20 && trimmed.length < 200
    ) {
      const clean = trimmed.replace(/^[-*#\s\d.]+(Assumption|Assume)?[:\s]*/i, '');
      if (!seen.has(clean.toLowerCase())) {
        seen.add(clean.toLowerCase());
        extracted.push({
          id: `EXT-ASM-${extracted.length + 1}`,
          description: clean,
          category: clean.toLowerCase().includes('cost') || clean.toLowerCase().includes('price') ? 'Commercial' : 'Operational',
          impactIfInvalid: 'Medium',
          validationOwner: 'TBC',
          status: 'Draft',
          sourceOrigin: 'Extracted from Source'
        });
      }
    }
  });

  return extracted;
}

/**
 * Extracts Risks from text
 */
export function extractRisks(text: string): ProjectRisk[] {
  const extracted: ProjectRisk[] = [];
  const lines = text.split('\n');
  const seen = new Set<string>();

  lines.forEach(line => {
    const trimmed = line.trim();
    // Look for lines that look like risks: starting with "Risk:", "Threat:", or containing "rsk-"
    if (
      (trimmed.toLowerCase().includes('risk:') || trimmed.toLowerCase().startsWith('rsk-')) && 
      trimmed.length > 20 && trimmed.length < 200
    ) {
      const clean = trimmed.replace(/^[-*#\s\d.]+(Risk|Threat)?[:\s]*/i, '');
      if (!seen.has(clean.toLowerCase())) {
        seen.add(clean.toLowerCase());
        const prob = clean.toLowerCase().includes('high') || clean.toLowerCase().includes('likely') ? 4 : 3;
        const imp = clean.toLowerCase().includes('critical') || clean.toLowerCase().includes('severe') ? 5 : 3;
        const { score, level, ragStatus } = computeRiskScore(prob, imp);

        extracted.push({
          id: `EXT-RSK-${extracted.length + 1}`,
          title: clean,
          category: clean.toLowerCase().includes('security') ? 'Cybersecurity' : 'Operational',
          probability: prob,
          impact: imp,
          score,
          level,
          ragStatus,
          owner: 'Sarel van Deventer',
          sourceOrigin: 'Extracted from Source',
          mitigationStrategy: 'Monitor and apply standard PMBOK controls.',
          contingencyPlan: 'Escalate to SteerCo if probability increases.',
          status: 'Identified'
        });
      }
    }
  });

  return extracted;
}

/**
 * Unified Auto-population logic for Step 3
 */
export function autoPopulateRegisters(
  sourceText: string,
  existingStakeholders: MatrixStakeholder[],
  existingRisks: ProjectRisk[],
  existingAssumptions: ProjectAssumption[]
) {
  const newStk = extractStakeholders(sourceText);
  const newAsm = extractAssumptions(sourceText);
  const newRsk = extractRisks(sourceText);
  
  return {
    stakeholders: mergeRegisters(existingStakeholders, newStk, 'name'),
    risks: mergeRegisters(existingRisks, newRsk, 'title'),
    assumptions: mergeRegisters(existingAssumptions, newAsm, 'description')
  };
}

function mergeRegisters<T>(existing: T[], incoming: T[], key: keyof T): T[] {
  const existingKeys = new Set(existing.map(i => String(i[key]).toLowerCase().trim()));
  const filtered = incoming.filter(i => !existingKeys.has(String(i[key]).toLowerCase().trim()));
  return [...existing, ...filtered];
}
