import { describe, expect, it } from '@jest/globals';

import { getCityOptions, STREET_PACKS } from '../data/streetPacks';
import { buildQuizSession, scoreGuess } from './gameEngine';

function sequenceRandom(values: number[]) {
  let index = 0;

  return () => {
    const value = values[index % values.length] ?? 0.5;
    index += 1;
    return value;
  };
}

describe('buildQuizSession', () => {
  it('builds unique questions with four options and the correct answer included', () => {
    const session = buildQuizSession(
      STREET_PACKS,
      8,
      sequenceRandom([0.11, 0.71, 0.32, 0.94, 0.21, 0.56, 0.48]),
    );

    expect(session.questions).toHaveLength(8);

    const answerIds = new Set(session.questions.map((question) => question.answerId));
    expect(answerIds.size).toBe(8);

    for (const question of session.questions) {
      expect(question.options).toHaveLength(4);
      expect(question.options.some((option) => option.id === question.answerId)).toBe(true);

      const optionIds = new Set(question.options.map((option) => option.id));
      expect(optionIds.size).toBe(4);
    }
  });
});

describe('getCityOptions', () => {
  it('returns each city once in alphabetical order', () => {
    expect(getCityOptions(STREET_PACKS)).toEqual([
      { id: 'new-york-city', name: 'New York City' },
      { id: 'san-francisco', name: 'San Francisco' },
      { id: 'tokyo', name: 'Tokyo' },
    ]);
  });
});

describe('scoreGuess', () => {
  it('adds score and streak for correct answers', () => {
    expect(scoreGuess(0, 0, true)).toEqual({
      score: 100,
      streak: 1,
      delta: 100,
    });

    expect(scoreGuess(100, 1, true)).toEqual({
      score: 215,
      streak: 2,
      delta: 115,
    });
  });

  it('resets the streak without changing score for incorrect answers', () => {
    expect(scoreGuess(245, 3, false)).toEqual({
      score: 245,
      streak: 0,
      delta: 0,
    });
  });
});
