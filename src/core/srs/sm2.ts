/**
 * SuperMemo-2 (SM-2) Spaced Repetition Algorithm
 * 
 * Quality responses:
 * 0: Complete blackout.
 * 1: Incorrect response; the correct one remembered.
 * 2: Incorrect response; where the correct one seemed easy to recall.
 * 3: Correct response recalled with serious difficulty.
 * 4: Correct response after a hesitation.
 * 5: Perfect response.
 */

export interface SRSData {
  repetition: number;
  interval: number;
  easinessFactor: number;
}

export function calculateSM2(
  quality: number,
  data: SRSData
): SRSData {
  let { repetition, interval, easinessFactor } = data;

  if (quality >= 3) {
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easinessFactor);
    }
    repetition += 1;
  } else {
    repetition = 0;
    interval = 1;
  }

  easinessFactor = easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  if (easinessFactor < 1.3) {
    easinessFactor = 1.3;
  }

  return {
    repetition,
    interval,
    easinessFactor
  };
}

export function calculateNextReviewDate(intervalDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + intervalDays);
  return date.toISOString();
}
