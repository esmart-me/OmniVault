import { LifeAdminExtractionResult, LifeAdminItem } from '../types/document';

export interface DuplicateMatchResult {
  isDuplicate: boolean;
  score: number; // 0 - 100
  confidence: 'High' | 'Medium' | 'Low' | 'None';
  existingItem: LifeAdminItem | null;
  matchedReasons: string[];
}

/**
 * Normalizes identifier strings (removes hyphens, spaces, special chars, lowercases)
 */
export function normalizeIdentifier(val: string | null | undefined): string {
  if (!val) return '';
  return val.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Calculates Jaccard token similarity between two strings (0 to 1)
 */
export function calculateTokenSimilarity(strA: string, strB: string): number {
  const tokenize = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 1)
    );

  const tokensA = tokenize(strA);
  const tokensB = tokenize(strB);

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  const intersection = new Set([...tokensA].filter(x => tokensB.has(x)));
  const union = new Set([...tokensA, ...tokensB]);

  return intersection.size / union.size;
}

/**
 * Scans a new document ingestion against all items in the user's vault
 * to detect potential duplicates.
 */
export function scanForPotentialDuplicates(
  newItem: LifeAdminExtractionResult | LifeAdminItem,
  existingVault: LifeAdminItem[],
  excludeId?: string
): DuplicateMatchResult {
  let highestScore = 0;
  let bestMatch: LifeAdminItem | null = null;
  let bestReasons: string[] = [];

  const newDocName = newItem.document_or_event_name || '';
  const newPrimaryId = normalizeIdentifier(newItem.identification_numbers?.primary_id);
  const newSecondaryId = normalizeIdentifier(newItem.identification_numbers?.secondary_id);
  const newHolder = normalizeIdentifier(newItem.holder_or_person_name);
  const newCategory = newItem.category;

  for (const existing of existingVault) {
    if (excludeId && existing.id === excludeId) continue;

    let score = 0;
    const reasons: string[] = [];

    const existingPrimaryId = normalizeIdentifier(existing.identification_numbers?.primary_id);
    const existingSecondaryId = normalizeIdentifier(existing.identification_numbers?.secondary_id);
    const existingHolder = normalizeIdentifier(existing.holder_or_person_name);
    const existingDocName = existing.document_or_event_name || '';
    const sameCategory = existing.category === newCategory;

    // 1. Primary Identification Number Match (Strongest signal)
    if (newPrimaryId && existingPrimaryId) {
      if (newPrimaryId === existingPrimaryId) {
        score += 55;
        reasons.push(`Exact Primary ID match: "${existing.identification_numbers?.primary_id}"`);
      } else if (
        newPrimaryId.length >= 4 &&
        existingPrimaryId.length >= 4 &&
        (newPrimaryId.endsWith(existingPrimaryId) || existingPrimaryId.endsWith(newPrimaryId))
      ) {
        score += 45;
        reasons.push(`Matching ID suffix (e.g. card/policy ending digits)`);
      }
    }

    // 2. Secondary Identification Match
    if (newSecondaryId && existingSecondaryId && newSecondaryId === existingSecondaryId) {
      score += 25;
      reasons.push(`Matching Secondary ID: "${existing.identification_numbers?.secondary_id}"`);
    }

    // 3. Document Name Similarity
    const nameSimilarity = calculateTokenSimilarity(newDocName, existingDocName);
    if (nameSimilarity >= 0.75) {
      score += 35;
      reasons.push(`Very similar document name (${Math.round(nameSimilarity * 100)}% keyword overlap)`);
    } else if (nameSimilarity >= 0.45) {
      score += 20;
      reasons.push(`Similar document title (${Math.round(nameSimilarity * 100)}% similarity)`);
    } else if (
      newDocName.toLowerCase().includes(existingDocName.toLowerCase()) ||
      existingDocName.toLowerCase().includes(newDocName.toLowerCase())
    ) {
      score += 25;
      reasons.push(`Document name substring match`);
    }

    // 4. Same Category
    if (sameCategory) {
      score += 15;
      reasons.push(`Both are in category "${newCategory}"`);
    }

    // 5. Same Person / Holder Name
    if (newHolder && existingHolder && (newHolder === existingHolder || newHolder.includes(existingHolder) || existingHolder.includes(newHolder))) {
      score += 15;
      reasons.push(`Identical document holder: "${existing.holder_or_person_name}"`);
    }

    // Cap at 100
    const finalScore = Math.min(100, score);

    if (finalScore > highestScore) {
      highestScore = finalScore;
      bestMatch = existing;
      bestReasons = reasons;
    }
  }

  // Threshold: If score >= 60 or primary ID matched in same category, flag as duplicate
  const isDuplicate = highestScore >= 55;

  let confidence: 'High' | 'Medium' | 'Low' | 'None' = 'None';
  if (highestScore >= 80) confidence = 'High';
  else if (highestScore >= 60) confidence = 'Medium';
  else if (highestScore >= 40) confidence = 'Low';

  return {
    isDuplicate,
    score: highestScore,
    confidence,
    existingItem: bestMatch,
    matchedReasons: bestReasons,
  };
}
