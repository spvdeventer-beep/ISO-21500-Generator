/**
 * ISO 31000 & PMBOK 7th Edition Risk Management Model
 * Defines Probability, Impact, Score calculations, and risk extraction heuristics.
 */

import { 
  ProjectRisk, 
  RiskLevel, 
  INITIAL_RISKS as DEFAULT_ADVANNOTECH_RISKS 
} from '../data/projectRegisters';

export type { ProjectRisk, RiskLevel };
export { DEFAULT_ADVANNOTECH_RISKS };

export function computeRiskScore(probability: number, impact: number): {
  score: number;
  level: RiskLevel;
  ragStatus: 'GREEN' | 'AMBER' | 'RED';
} {
  const score = Math.max(1, Math.min(25, probability * impact));
  let level: RiskLevel = 'LOW';
  let ragStatus: 'GREEN' | 'AMBER' | 'RED' = 'GREEN';

  if (score >= 15) {
    level = 'CRITICAL';
    ragStatus = 'RED';
  } else if (score >= 10) {
    level = 'HIGH';
    ragStatus = 'RED';
  } else if (score >= 5) {
    level = 'MEDIUM';
    ragStatus = 'AMBER';
  } else {
    level = 'LOW';
    ragStatus = 'GREEN';
  }

  return { score, level, ragStatus };
}

/**
 * Extracts risks from document markdown text and audit advisory records
 */

/**
 * Extracts risks from document markdown text and audit advisory records
 */
export function extractRisksFromDocument(
  markdown: string = '',
  advisories?: Array<any>
): ProjectRisk[] {
  const extracted: ProjectRisk[] = [...DEFAULT_ADVANNOTECH_RISKS];
  const seenTitles = new Set(extracted.map((r) => r.title.toLowerCase()));

  // Extract from advisories if available (safe against all advisory schemas)
  if (Array.isArray(advisories) && advisories.length > 0) {
    advisories.forEach((adv) => {
      try {
        if (!adv) return;
        const fieldOrItem = adv.field || adv.item || adv.section || 'Governance Advisory';
        const impactOrNote = adv.impactDescription || adv.advisoryNote || adv.recommendedAction || '';
        const title = `${fieldOrItem}${impactOrNote ? `: ${String(impactOrNote).slice(0, 60)}` : ''}`;
        
        if (!seenTitles.has(title.toLowerCase())) {
          seenTitles.add(title.toLowerCase());
          const riskLvlStr = String(adv.riskLevel || '').toUpperCase();
          const prob = riskLvlStr === 'CRITICAL' ? 4 : riskLvlStr === 'HIGH' ? 3 : 2;
          const imp = riskLvlStr === 'CRITICAL' ? 5 : riskLvlStr === 'HIGH' ? 4 : 3;
          const { score, level, ragStatus } = computeRiskScore(prob, imp);

          const fieldStr = String(fieldOrItem).toLowerCase();
          const category: ProjectRisk['category'] =
            fieldStr.includes('cost') || fieldStr.includes('budget') || fieldStr.includes('financial')
              ? 'Cost'
              : fieldStr.includes('schedule') || fieldStr.includes('date') || fieldStr.includes('milestone')
              ? 'Schedule'
              : fieldStr.includes('security') || fieldStr.includes('cyber')
              ? 'Cybersecurity'
              : fieldStr.includes('technical') || fieldStr.includes('software') || fieldStr.includes('hardware')
              ? 'Technical'
              : 'Governance';

          extracted.push({
            id: `ADV-RSK-${extracted.length + 1}`,
            title,
            category,
            probability: prob,
            impact: imp,
            score,
            level,
            ragStatus,
            owner: 'Sarel van Deventer (PMO Director)',
            sourceOrigin: `Audit Gap in ${adv.section || 'Baseline'}`,
            mitigationStrategy: adv.recommendedAction || adv.suggestedFix || adv.advisoryNote || 'Implement standard PMBOK governance remediation.',
            contingencyPlan: 'Verify documentation in Step 3 or incorporate remediation clause.',
            status: 'Identified'
          });
        }
      } catch (err) {
        console.warn('Error processing advisory for risk matrix:', err);
      }
    });
  }

  // Parse lines matching risk patterns in markdown
  const lines = markdown.split('\n');
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.match(/[-*]\s*RSK-\d+/i) || (trimmed.match(/[-*]\s*(Risk|Threat):/i) && trimmed.length > 25)) {
      const cleanTitle = trimmed.replace(/^[-*#\s:]+/, '').slice(0, 80);
      if (!seenTitles.has(cleanTitle.toLowerCase())) {
        seenTitles.add(cleanTitle.toLowerCase());
        const prob = cleanTitle.toLowerCase().includes('high') ? 4 : 3;
        const imp = cleanTitle.toLowerCase().includes('critical') ? 5 : 4;
        const { score, level, ragStatus } = computeRiskScore(prob, imp);

        extracted.push({
          id: `DOC-RSK-${extracted.length + 1}`,
          title: cleanTitle,
          category: 'Technical',
          probability: prob,
          impact: imp,
          score,
          level,
          ragStatus,
          owner: 'Valiant Khoza (Lead Software Engineer)',
          sourceOrigin: 'Generated Document Content',
          mitigationStrategy: 'Follow standard PMBOK 7th edition contingency reserves.',
          contingencyPlan: 'Active management monitoring.',
          status: 'Mitigating'
        });
      }
    }
  });

  return extracted;
}
