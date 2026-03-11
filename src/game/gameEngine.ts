import type { District, Street } from '../data/streetPacks';

type QuizOption = {
  id: string;
  label: string;
};

export type QuizQuestion = {
  id: string;
  districtId: string;
  districtName: string;
  districtAccent: string;
  streetName: string;
  streets: Street[];
  options: QuizOption[];
  answerId: string;
};

export type QuizSession = {
  questions: QuizQuestion[];
};

type StreetWithDistrict = Street & {
  districtId: string;
  districtName: string;
  districtAccent: string;
  districtStreets: Street[];
};

export function buildQuizSession(
  districts: District[],
  questionCount = 8,
  random: () => number = Math.random,
): QuizSession {
  if (districts.length === 0) {
    throw new Error('At least one district is required to start a quiz.');
  }

  for (const district of districts) {
    if (district.streets.length < 4) {
      throw new Error(`District "${district.name}" needs at least four streets.`);
    }
  }

  const streets = districts.flatMap<StreetWithDistrict>((district) =>
    district.streets.map((street) => ({
      ...street,
      districtId: district.id,
      districtName: district.name,
      districtAccent: district.accent,
      districtStreets: district.streets,
    })),
  );

  if (streets.length < 4) {
    throw new Error('At least four streets are required to build a quiz.');
  }

  const selectedTargets = shuffleList(streets, random).slice(
    0,
    Math.min(questionCount, streets.length),
  );

  return {
    questions: selectedTargets.map((target) => {
      const distractors = shuffleList(
        streets.filter(
          (street) => street.districtId === target.districtId && street.id !== target.id,
        ),
        random,
      ).slice(0, 3);

      const options = shuffleList(
        [
          { id: target.id, label: target.name },
          ...distractors.map((street) => ({ id: street.id, label: street.name })),
        ],
        random,
      );

      return {
        id: target.id,
        districtId: target.districtId,
        districtName: target.districtName,
        districtAccent: target.districtAccent,
        streetName: target.name,
        streets: target.districtStreets,
        options,
        answerId: target.id,
      };
    }),
  };
}

export function scoreGuess(currentScore: number, currentStreak: number, isCorrect: boolean) {
  if (!isCorrect) {
    return {
      score: currentScore,
      streak: 0,
      delta: 0,
    };
  }

  const streak = currentStreak + 1;
  const delta = 100 + Math.min((streak - 1) * 15, 75);

  return {
    score: currentScore + delta,
    streak,
    delta,
  };
}

function shuffleList<T>(items: T[], random: () => number): T[] {
  const output = [...items];

  for (let currentIndex = output.length - 1; currentIndex > 0; currentIndex -= 1) {
    const randomIndex = Math.floor(random() * (currentIndex + 1));
    const currentValue = output[currentIndex];

    output[currentIndex] = output[randomIndex];
    output[randomIndex] = currentValue;
  }

  return output;
}
