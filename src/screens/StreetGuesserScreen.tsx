import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useEffect, useReducer, useState } from 'react';

import { MapCard } from '../components/MapCard';
import { QuizOption } from '../components/QuizOption';
import { fetchStreetPacks, getCityOptions, type CityOption, type District } from '../data/streetPacks';
import { buildQuizSession, scoreGuess, type QuizSession } from '../game/gameEngine';
import { displayFont, palette, shadowCard } from '../theme';

const SESSION_LENGTH = 8;

type GameState = {
  session: QuizSession | null;
  questionIndex: number;
  selectedOptionId: string | null;
  answerState: 'correct' | 'incorrect' | null;
  score: number;
  streak: number;
  bestStreak: number;
  correctCount: number;
  roundDelta: number;
};

type GameAction =
  | {
      type: 'startSession';
      session: QuizSession;
    }
  | {
      type: 'reset';
    }
  | {
      type: 'guess';
      optionId: string;
    }
  | {
      type: 'advance';
    };

const initialGameState: GameState = {
  session: null,
  questionIndex: 0,
  selectedOptionId: null,
  answerState: null,
  score: 0,
  streak: 0,
  bestStreak: 0,
  correctCount: 0,
  roundDelta: 0,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'reset':
      return initialGameState;
    case 'startSession':
      return {
        ...initialGameState,
        session: action.session,
      };
    case 'guess': {
      if (!state.session || state.answerState) {
        return state;
      }

      const currentQuestion = state.session.questions[state.questionIndex];

      if (!currentQuestion) {
        return state;
      }

      const isCorrect = action.optionId === currentQuestion.answerId;
      const roundScore = scoreGuess(state.score, state.streak, isCorrect);

      return {
        ...state,
        selectedOptionId: action.optionId,
        answerState: isCorrect ? 'correct' : 'incorrect',
        score: roundScore.score,
        streak: roundScore.streak,
        bestStreak: isCorrect ? Math.max(state.bestStreak, roundScore.streak) : state.bestStreak,
        correctCount: isCorrect ? state.correctCount + 1 : state.correctCount,
        roundDelta: roundScore.delta,
      };
    }
    case 'advance':
      if (!state.session || !state.answerState) {
        return state;
      }

      return {
        ...state,
        questionIndex: Math.min(state.questionIndex + 1, state.session.questions.length),
        selectedOptionId: null,
        answerState: null,
        roundDelta: 0,
      };
    default:
      return state;
  }
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function normalizeSearchValue(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function getFuzzyScore(candidate: string, query: string) {
  const normalizedCandidate = normalizeSearchValue(candidate);
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return 0;
  }

  let queryIndex = 0;
  let score = 0;
  let streak = 0;

  for (let candidateIndex = 0; candidateIndex < normalizedCandidate.length; candidateIndex += 1) {
    if (normalizedCandidate[candidateIndex] === normalizedQuery[queryIndex]) {
      streak += 1;
      score += 2 + streak;
      queryIndex += 1;

      if (queryIndex === normalizedQuery.length) {
        return score - (normalizedCandidate.length - normalizedQuery.length);
      }
    } else {
      streak = 0;
    }
  }

  return -1;
}

function getFilteredCities(cities: CityOption[], query: string) {
  return cities
    .map((city) => ({
      city,
      score: getFuzzyScore(city.name, query),
    }))
    .filter(({ score }) => score >= 0)
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }

      return left.city.name.localeCompare(right.city.name);
    })
    .map(({ city }) => city);
}

export function StreetGuesserScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 980;

  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [citySearchValue, setCitySearchValue] = useState('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  const districtsQuery = useQuery({
    queryKey: ['street-packs'],
    queryFn: fetchStreetPacks,
  });

  useEffect(() => {
    if (!districtsQuery.data || !selectedCityId) {
      return;
    }

    const selectedDistricts = districtsQuery.data.filter((district) => district.cityId === selectedCityId);

    if (selectedDistricts.length === 0) {
      return;
    }

    dispatch({
      type: 'startSession',
      session: buildQuizSession(selectedDistricts, SESSION_LENGTH),
    });
  }, [districtsQuery.data, selectedCityId]);

  const cityOptions = districtsQuery.data ? getCityOptions(districtsQuery.data) : [];
  const filteredCities = getFilteredCities(cityOptions, citySearchValue).slice(0, 6);
  const selectedCity = cityOptions.find((city) => city.id === selectedCityId) ?? null;

  const {
    session,
    questionIndex,
    selectedOptionId,
    answerState,
    score,
    streak,
    bestStreak,
    correctCount,
    roundDelta,
  } = gameState;

  const isFinished = Boolean(session) && questionIndex >= (session?.questions.length ?? 0);
  const currentQuestion = session?.questions[questionIndex];

  function buildSessionForCity(cityId: string, districts: District[]) {
    const selectedDistricts = districts.filter((district) => district.cityId === cityId);

    if (selectedDistricts.length === 0) {
      return;
    }

    dispatch({
      type: 'startSession',
      session: buildQuizSession(selectedDistricts, SESSION_LENGTH),
    });
  }

  function startFreshSession() {
    if (!districtsQuery.data || !selectedCityId) {
      return;
    }

    buildSessionForCity(selectedCityId, districtsQuery.data);
  }

  function handleCitySelect(city: CityOption) {
    setSelectedCityId(city.id);
    setCitySearchValue(city.name);
    setIsCityDropdownOpen(false);
  }

  function resetCitySelection() {
    setSelectedCityId(null);
    setCitySearchValue('');
    setIsCityDropdownOpen(false);
    dispatch({ type: 'reset' });
  }

  function handleGuess(optionId: string) {
    dispatch({
      type: 'guess',
      optionId,
    });
  }

  function handleAdvance() {
    dispatch({
      type: 'advance',
    });
  }

  const totalQuestions = session?.questions.length ?? SESSION_LENGTH;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const feedbackTitle =
    answerState === 'correct'
      ? 'Pinned it.'
      : answerState === 'incorrect'
        ? 'Close, but not this route.'
        : null;
  const feedbackBody =
    answerState === 'correct'
      ? `+${roundDelta} points. ${currentQuestion?.streetName} is now part of your mental map.`
      : answerState === 'incorrect'
        ? `The highlighted route was ${currentQuestion?.streetName}. Take another look before you move on.`
        : null;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[palette.backgroundStart, '#10233a', palette.backgroundEnd]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.shell}>
          <View style={styles.heroCard}>
            <Text style={styles.heroEyebrow}>Street Guesser</Text>
            <Text style={styles.heroTitle}>
              Guess highlighted streets on unlabeled maps across web, iPhone, and Android.
            </Text>
            <Text style={styles.heroBody}>
              Pick a city first, then work through its districts. Streets stay anonymous, one route
              lights up, and your streak depends on naming it before the map slips away.
            </Text>

            <View style={styles.statGrid}>
              <StatPill label="Score" value={score.toString()} />
              <StatPill label="Streak" value={streak.toString()} />
              <StatPill label="Best run" value={bestStreak.toString()} />
              <StatPill label="Accuracy" value={`${accuracy}%`} />
            </View>
          </View>

          {districtsQuery.isError ? (
            <View style={styles.stateCard}>
              <Text style={styles.stateTitle}>Map data stalled</Text>
              <Text style={styles.stateBody}>
                The local street packs could not be loaded. Try rebuilding the route set.
              </Text>
              <Pressable
                onPress={() => districtsQuery.refetch()}
                style={({ pressed }) => [
                  styles.primaryAction,
                  pressed ? styles.actionPressed : null,
                ]}
              >
                <Text style={styles.primaryActionLabel}>Retry</Text>
              </Pressable>
            </View>
          ) : districtsQuery.isLoading ? (
            <View style={styles.stateCard}>
              <ActivityIndicator color={palette.highlight} size="large" />
              <Text style={styles.stateTitle}>Loading districts</Text>
              <Text style={styles.stateBody}>
                Loading city routes and preparing the selector.
              </Text>
            </View>
          ) : !selectedCity ? (
            <View style={styles.selectorCard}>
              <Text style={styles.selectorEyebrow}>Choose a city</Text>
              <Text style={styles.selectorTitle}>Start by selecting where the quiz should happen.</Text>
              <Text style={styles.selectorBody}>
                Search for a city name and choose it from the dropdown before the first map appears.
              </Text>

              <View style={styles.selectorFieldWrap}>
                <Text style={styles.selectorLabel}>City</Text>
                <TextInput
                  autoCapitalize="words"
                  autoCorrect={false}
                  onBlur={() => {
                    setTimeout(() => setIsCityDropdownOpen(false), 120);
                  }}
                  onChangeText={(value) => {
                    setCitySearchValue(value);
                    setIsCityDropdownOpen(true);
                  }}
                  onFocus={() => setIsCityDropdownOpen(true)}
                  placeholder="Search cities"
                  placeholderTextColor={palette.textSoft}
                  style={styles.selectorInput}
                  value={citySearchValue}
                />
                {isCityDropdownOpen ? (
                  <View style={styles.dropdownMenu}>
                    {filteredCities.length > 0 ? (
                      filteredCities.map((city) => (
                        <Pressable
                          key={city.id}
                          onPress={() => handleCitySelect(city)}
                          style={({ pressed }) => [
                            styles.dropdownOption,
                            pressed ? styles.dropdownOptionPressed : null,
                          ]}
                        >
                          <Text style={styles.dropdownOptionLabel}>{city.name}</Text>
                        </Pressable>
                      ))
                    ) : (
                      <View style={styles.dropdownEmpty}>
                        <Text style={styles.dropdownEmptyLabel}>No city matches that search.</Text>
                      </View>
                    )}
                  </View>
                ) : null}
              </View>
            </View>
          ) : !session ? (
            <View style={styles.stateCard}>
              <ActivityIndicator color={palette.highlight} size="large" />
              <Text style={styles.stateTitle}>Preparing {selectedCity.name}</Text>
              <Text style={styles.stateBody}>
                Building the first route set for {selectedCity.name}.
              </Text>
            </View>
          ) : isFinished ? (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryEyebrow}>Session complete</Text>
              <Text style={styles.summaryTitle}>
                You named {correctCount} of {totalQuestions} streets in {selectedCity.name}.
              </Text>
              <Text style={styles.summaryBody}>
                Final score: {score}. Best streak: {bestStreak}.{' '}
                {accuracy >= 75
                  ? 'You know this city.'
                  : 'One more lap and these districts will stick.'}
              </Text>
              <View style={styles.actionRow}>
                <Pressable
                  onPress={resetCitySelection}
                  style={({ pressed }) => [
                    styles.secondaryAction,
                    pressed ? styles.actionPressed : null,
                  ]}
                >
                  <Text style={styles.secondaryActionLabel}>Change city</Text>
                </Pressable>
                <Pressable
                  onPress={startFreshSession}
                  style={({ pressed }) => [
                    styles.primaryAction,
                    pressed ? styles.actionPressed : null,
                  ]}
                >
                  <Text style={styles.primaryActionLabel}>Play another route set</Text>
                </Pressable>
              </View>
            </View>
          ) : currentQuestion ? (
            <View style={[styles.playArea, isWide ? styles.playAreaWide : null]}>
              <View style={styles.mapColumn}>
                <MapCard
                  accent={currentQuestion.districtAccent}
                  answerId={currentQuestion.answerId}
                  districtName={currentQuestion.districtName}
                  streets={currentQuestion.streets}
                />
              </View>

              <View style={styles.sidebar}>
                <View style={styles.questionCard}>
                  <Text style={styles.questionEyebrow}>
                    Round {questionIndex + 1} / {session.questions.length}
                  </Text>
                  <Text style={styles.questionTitle}>Which street is glowing?</Text>
                  <Text style={styles.questionBody}>
                    Study the map, ignore the missing labels, and pick the street name that matches
                    the highlighted route in {currentQuestion.districtName}.
                  </Text>

                  <View style={styles.optionList}>
                    {currentQuestion.options.map((option, index) => (
                      <QuizOption
                        key={option.id}
                        answered={Boolean(answerState)}
                        index={index}
                        isCorrectOption={option.id === currentQuestion.answerId}
                        label={option.label}
                        onPress={() => handleGuess(option.id)}
                        selected={selectedOptionId === option.id}
                      />
                    ))}
                  </View>

                  {feedbackTitle && feedbackBody ? (
                    <View
                      style={[
                        styles.feedbackCard,
                        answerState === 'correct' ? styles.feedbackCorrect : styles.feedbackWrong,
                      ]}
                    >
                      <Text style={styles.feedbackTitle}>{feedbackTitle}</Text>
                      <Text style={styles.feedbackBody}>{feedbackBody}</Text>
                    </View>
                  ) : null}

                  <View style={styles.actionRow}>
                    <Pressable
                      onPress={resetCitySelection}
                      style={({ pressed }) => [
                        styles.secondaryAction,
                        pressed ? styles.actionPressed : null,
                      ]}
                    >
                      <Text style={styles.secondaryActionLabel}>Change city</Text>
                    </Pressable>

                    {answerState ? (
                      <Pressable
                        onPress={handleAdvance}
                        style={({ pressed }) => [
                          styles.primaryAction,
                          pressed ? styles.actionPressed : null,
                        ]}
                      >
                        <Text style={styles.primaryActionLabel}>
                          {questionIndex + 1 === session.questions.length
                            ? 'See results'
                            : 'Next street'}
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.backgroundStart,
  },
  topGlow: {
    position: 'absolute',
    top: -110,
    right: -40,
    width: 280,
    height: 280,
    backgroundColor: 'rgba(255, 123, 92, 0.16)',
    borderRadius: 999,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: -120,
    left: -60,
    width: 320,
    height: 320,
    backgroundColor: 'rgba(95, 211, 182, 0.12)',
    borderRadius: 999,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  shell: {
    alignSelf: 'center',
    gap: 20,
    maxWidth: 1180,
    width: '100%',
  },
  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 18,
    padding: 24,
    ...shadowCard,
  },
  heroEyebrow: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: palette.text,
    fontFamily: displayFont,
    fontSize: 36,
    lineHeight: 40,
  },
  heroBody: {
    color: palette.textMuted,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 820,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statPill: {
    backgroundColor: palette.panelMuted,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 4,
    minWidth: 112,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statLabel: {
    color: palette.textSoft,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  statValue: {
    color: palette.text,
    fontSize: 24,
    fontWeight: '800',
  },
  stateCard: {
    alignItems: 'center',
    backgroundColor: palette.panel,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 12,
    padding: 28,
    ...shadowCard,
  },
  stateTitle: {
    color: palette.text,
    fontFamily: displayFont,
    fontSize: 28,
    textAlign: 'center',
  },
  stateBody: {
    color: palette.textMuted,
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 520,
    textAlign: 'center',
  },
  selectorCard: {
    backgroundColor: palette.panel,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 18,
    padding: 28,
    ...shadowCard,
  },
  selectorEyebrow: {
    color: palette.highlight,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  selectorTitle: {
    color: palette.text,
    fontFamily: displayFont,
    fontSize: 32,
    lineHeight: 36,
    maxWidth: 720,
  },
  selectorBody: {
    color: palette.textMuted,
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 620,
  },
  selectorFieldWrap: {
    gap: 10,
    maxWidth: 520,
    position: 'relative',
    zIndex: 10,
  },
  selectorLabel: {
    color: palette.textSoft,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  selectorInput: {
    backgroundColor: palette.panelElevated,
    borderColor: palette.border,
    borderRadius: 18,
    borderWidth: 1,
    color: palette.text,
    fontSize: 16,
    minHeight: 56,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  dropdownMenu: {
    backgroundColor: '#0d1b2c',
    borderColor: palette.border,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 4,
    overflow: 'hidden',
    ...shadowCard,
  },
  dropdownOption: {
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  dropdownOptionPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  dropdownOptionLabel: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '700',
  },
  dropdownEmpty: {
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  dropdownEmptyLabel: {
    color: palette.textMuted,
    fontSize: 15,
  },
  playArea: {
    gap: 20,
  },
  playAreaWide: {
    alignItems: 'stretch',
    flexDirection: 'row',
  },
  mapColumn: {
    flex: 1.1,
  },
  sidebar: {
    flex: 0.95,
  },
  questionCard: {
    backgroundColor: palette.panel,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 20,
    padding: 22,
    ...shadowCard,
  },
  questionEyebrow: {
    color: palette.highlight,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  questionTitle: {
    color: palette.text,
    fontFamily: displayFont,
    fontSize: 30,
    lineHeight: 34,
  },
  questionBody: {
    color: palette.textMuted,
    fontSize: 15,
    lineHeight: 23,
  },
  optionList: {
    gap: 12,
  },
  feedbackCard: {
    borderRadius: 22,
    borderWidth: 1,
    gap: 6,
    padding: 16,
  },
  feedbackCorrect: {
    borderColor: 'rgba(99, 217, 164, 0.32)',
    backgroundColor: 'rgba(99, 217, 164, 0.12)',
  },
  feedbackWrong: {
    borderColor: 'rgba(255, 141, 122, 0.32)',
    backgroundColor: 'rgba(255, 141, 122, 0.12)',
  },
  feedbackTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '800',
  },
  feedbackBody: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  primaryAction: {
    alignItems: 'center',
    backgroundColor: palette.highlight,
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 52,
    minWidth: 160,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  primaryActionLabel: {
    color: '#241406',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryAction: {
    alignItems: 'center',
    backgroundColor: palette.panelMuted,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    justifyContent: 'center',
    minHeight: 52,
    minWidth: 160,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  secondaryActionLabel: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '700',
  },
  actionPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  summaryCard: {
    backgroundColor: palette.panel,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 16,
    padding: 28,
    ...shadowCard,
  },
  summaryEyebrow: {
    color: palette.highlight,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  summaryTitle: {
    color: palette.text,
    fontFamily: displayFont,
    fontSize: 34,
    lineHeight: 38,
  },
  summaryBody: {
    color: palette.textMuted,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 700,
  },
});
