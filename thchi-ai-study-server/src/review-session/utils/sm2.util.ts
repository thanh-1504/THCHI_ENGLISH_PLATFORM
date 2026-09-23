import { WordLevel } from 'generated/prisma/enums';

export interface SM2Input {
  easeFactor: number;
  intervalDays: number;
  reviewCount: number;
  isCorrect: boolean;
}

export interface SM2Output {
  easeFactor: number;
  intervalDays: number;
  reviewCount: number;
  nextReviewAt: Date;
  level: WordLevel;
}


export function getWordLevel(reviewCount: number): WordLevel {
  if (reviewCount >= 12) return WordLevel.LEVEL_5;
  if (reviewCount >= 9) return WordLevel.LEVEL_4;
  if (reviewCount >= 6) return WordLevel.LEVEL_3;
  if (reviewCount >= 3) return WordLevel.LEVEL_2;
  return WordLevel.LEVEL_1;
}

export function calculateSM2(input: SM2Input): SM2Output {
  const { easeFactor, intervalDays, reviewCount, isCorrect } = input;
  const quality = isCorrect ? 4 : 1;
  let newEaseFactor = easeFactor;
  let newIntervalDays = intervalDays;
  let newReviewCount = reviewCount;
  if (quality >= 3) {
    if (reviewCount === 0) newIntervalDays = 1;
    else if (reviewCount === 1) newIntervalDays = 6;
    else newIntervalDays = Math.round(newIntervalDays * newEaseFactor);

    newEaseFactor =
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    newEaseFactor = Math.max(1.3, newEaseFactor);
    newReviewCount = reviewCount + 1;
  } else {
    newIntervalDays = 1;
    newReviewCount = 0;
  }

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + newIntervalDays);

  return {
    easeFactor: newEaseFactor,
    intervalDays: newIntervalDays,
    reviewCount: newReviewCount,
    nextReviewAt,
    level: getWordLevel(newReviewCount),
  };
}
