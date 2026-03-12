import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useEffect, useReducer, useState } from 'react';

import { CityPicker } from '../components/CityPicker';
import { MapCard } from '../components/MapCard';
import { ProgressHeader } from '../components/ProgressHeader';
import { QuizOption } from '../components/QuizOption';
import {
  fetchStreetPacks,
  getCityOptions,
  type CityOption,
  type District,
} from '../data/streetPacks';
import { buildQuizSession, scoreGuess, type QuizSession } from '../game/gameEngine';
import { fontFamily, fontSize, palette, radius, shadows, spacing } from '../theme';

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
  | { type: 'startSession'; session: QuizSession }
  | { type: 'reset' }
  | { type: 'guess'; optionId: string }
  | { type: 'advance' };

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
  const isWide = width >= 820;
  const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) : 0;
  const topPadding = Platform.OS === 'web' ? 0 : Math.max(statusBarHeight, 44);

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

    const selectedDistricts = districtsQuery.data.filter(
      (district) => district.cityId === selectedCityId,
    );

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
    dispatch({ type: 'guess', optionId });
  }

  function handleAdvance() {
    dispatch({ type: 'advance' });
  }

  const totalQuestions = session?.questions.length ?? SESSION_LENGTH;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const feedbackTitle =
    answerState === 'correct'
      ? 'Correct!'
      : answerState === 'incorrect'
        ? 'Not quite'
        : null;
  const feedbackBody =
    answerState === 'correct'
      ? `+${roundDelta} pts — ${currentQuestion?.streetName} locked in.`
      : answerState === 'incorrect'
        ? `It was ${currentQuestion?.streetName}.`
        : null;

  // -- Error ---
  if (districtsQuery.isError) {
    return (
      <View style={[styles.root, { paddingTop: topPadding }]}>
        <LinearGradient
          colors={[palette.bg, '#0a1628', palette.bg]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.centerContent}>
          <View style={styles.stateCard}>
            <Text style={styles.stateIcon}>!</Text>
            <Text style={styles.stateTitle}>Something went wrong</Text>
            <Text style={styles.stateBody}>Could not load street data. Try again.</Text>
            <Pressable
              onPress={() => districtsQuery.refetch()}
              style={({ pressed }) => [styles.btnPrimary, pressed ? styles.btnActive : null]}
            >
              <Text style={styles.btnPrimaryLabel}>Retry</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // -- Loading ---
  if (districtsQuery.isLoading) {
    return (
      <View style={[styles.root, { paddingTop: topPadding }]}>
        <LinearGradient
          colors={[palette.bg, '#0a1628', palette.bg]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.centerContent}>
          <ActivityIndicator color={palette.accent} size="large" />
          <Text style={[styles.stateBody, { marginTop: spacing.lg }]}>Loading streets...</Text>
        </View>
      </View>
    );
  }

  // -- Landing / City Select ---
  if (!selectedCity) {
    return (
      <View style={[styles.root, { paddingTop: topPadding }]}>
        <LinearGradient
          colors={[palette.bg, '#0d1f35', '#081420', palette.bg]}
          locations={[0, 0.35, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.glowTopRight} />
        <View style={styles.glowBottomLeft} />

        <ScrollView
          contentContainerStyle={styles.landingContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.landingInner}>
            <View style={styles.brandRow}>
              <View style={styles.brandDot} />
              <Text style={styles.brandLabel}>Street Guesser</Text>
            </View>

            <Text style={styles.landingHeading}>
              Can you name{'\n'}the road?
            </Text>
            <Text style={styles.landingBody}>
              Pick a city, study the unlabeled map, and identify the highlighted street. Test your
              knowledge or practice for the real thing.
            </Text>

            <View style={styles.cityPickerWrap}>
              <Text style={styles.fieldLabel}>Choose a city</Text>
              <CityPicker
                cities={filteredCities}
                isOpen={isCityDropdownOpen}
                onChangeSearch={setCitySearchValue}
                onClose={() => setIsCityDropdownOpen(false)}
                onOpen={() => setIsCityDropdownOpen(true)}
                onSelect={handleCitySelect}
                searchValue={citySearchValue}
              />
            </View>

            <View style={styles.landingDivider} />

            <View style={styles.landingHints}>
              <Text style={styles.hintsTitle}>How it works</Text>
              <HintRow number="1" text="Pick a city to begin your session" />
              <HintRow number="2" text="Study the map — labels are hidden" />
              <HintRow number="3" text="Select the correct street name" />
              <HintRow number="4" text="Build your streak and beat your score" />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // -- Preparing session ---
  if (!session) {
    return (
      <View style={[styles.root, { paddingTop: topPadding }]}>
        <LinearGradient
          colors={[palette.bg, '#0a1628', palette.bg]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.centerContent}>
          <ActivityIndicator color={palette.accent} size="large" />
          <Text style={[styles.stateBody, { marginTop: spacing.lg }]}>
            Preparing {selectedCity.name}...
          </Text>
        </View>
      </View>
    );
  }

  // -- Results ---
  if (isFinished) {
    const grade =
      accuracy >= 90
        ? 'Outstanding!'
        : accuracy >= 75
          ? 'Great job!'
          : accuracy >= 50
            ? 'Not bad!'
            : 'Keep practicing';

    const gradeColor =
      accuracy >= 75 ? palette.success : accuracy >= 50 ? palette.warning : palette.textSecondary;

    return (
      <View style={[styles.root, { paddingTop: topPadding }]}>
        <LinearGradient
          colors={[palette.bg, '#0d1f35', palette.bg]}
          style={StyleSheet.absoluteFill}
        />
        <ScrollView
          contentContainerStyle={styles.resultsContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.resultsInner}>
            <Text style={styles.resultsEyebrow}>Session complete</Text>
            <Text style={[styles.resultsHeading, { color: gradeColor }]}>{grade}</Text>
            <Text style={styles.resultsCity}>{selectedCity.name}</Text>

            <View style={styles.resultsGrid}>
              <ResultStat label="Score" value={score.toString()} />
              <ResultStat label="Correct" value={`${correctCount}/${totalQuestions}`} />
              <ResultStat label="Accuracy" value={`${accuracy}%`} />
              <ResultStat label="Best streak" value={bestStreak.toString()} />
            </View>

            <View style={styles.resultsActions}>
              <Pressable
                onPress={startFreshSession}
                style={({ pressed }) => [
                  styles.btnPrimary,
                  styles.btnFull,
                  pressed ? styles.btnActive : null,
                ]}
              >
                <Text style={styles.btnPrimaryLabel}>Play again</Text>
              </Pressable>
              <Pressable
                onPress={resetCitySelection}
                style={({ pressed }) => [
                  styles.btnSecondary,
                  styles.btnFull,
                  pressed ? styles.btnActive : null,
                ]}
              >
                <Text style={styles.btnSecondaryLabel}>Change city</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // -- Gameplay ---
  if (!currentQuestion) {
    return null;
  }

  const isLastQuestion = questionIndex + 1 === session.questions.length;

  return (
    <View style={[styles.root, { paddingTop: topPadding }]}>
      {isWide ? (
        <View style={styles.wideRoot}>
          <View style={styles.wideMapCol}>
            <View style={styles.wideProgressWrap}>
              <ProgressHeader
                current={questionIndex + 1}
                districtName={currentQuestion.districtName}
                score={score}
                streak={streak}
                total={totalQuestions}
              />
            </View>
            <View style={styles.wideMapWrap}>
              <MapCard
                accent={currentQuestion.districtAccent}
                answerId={currentQuestion.answerId}
                districtName={currentQuestion.districtName}
                streets={currentQuestion.streets}
              />
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.wideSidebar}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.questionTitle}>Which street is highlighted?</Text>

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
                  styles.feedback,
                  answerState === 'correct' ? styles.feedbackCorrect : styles.feedbackWrong,
                ]}
              >
                <Text style={styles.feedbackTitle}>{feedbackTitle}</Text>
                <Text style={styles.feedbackBody}>{feedbackBody}</Text>
              </View>
            ) : null}

            <View style={styles.gameActions}>
              {answerState ? (
                <Pressable
                  onPress={handleAdvance}
                  style={({ pressed }) => [
                    styles.btnPrimary,
                    styles.btnFull,
                    pressed ? styles.btnActive : null,
                  ]}
                >
                  <Text style={styles.btnPrimaryLabel}>
                    {isLastQuestion ? 'See results' : 'Next'}
                  </Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={resetCitySelection}
                style={({ pressed }) => [styles.btnGhost, pressed ? styles.btnActive : null]}
              >
                <Text style={styles.btnGhostLabel}>Change city</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.mobileContent, { paddingBottom: spacing.xxl }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.mobileProgressWrap}>
            <ProgressHeader
              current={questionIndex + 1}
              districtName={currentQuestion.districtName}
              score={score}
              streak={streak}
              total={totalQuestions}
            />
          </View>

          <MapCard
            accent={currentQuestion.districtAccent}
            answerId={currentQuestion.answerId}
            districtName={currentQuestion.districtName}
            streets={currentQuestion.streets}
          />

          <View style={styles.mobileQuizSection}>
            <Text style={styles.questionTitle}>Which street is highlighted?</Text>

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
                  styles.feedback,
                  answerState === 'correct' ? styles.feedbackCorrect : styles.feedbackWrong,
                ]}
              >
                <Text style={styles.feedbackTitle}>{feedbackTitle}</Text>
                <Text style={styles.feedbackBody}>{feedbackBody}</Text>
              </View>
            ) : null}

            <View style={styles.gameActions}>
              {answerState ? (
                <Pressable
                  onPress={handleAdvance}
                  style={({ pressed }) => [
                    styles.btnPrimary,
                    styles.btnFull,
                    pressed ? styles.btnActive : null,
                  ]}
                >
                  <Text style={styles.btnPrimaryLabel}>
                    {isLastQuestion ? 'See results' : 'Next'}
                  </Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={resetCitySelection}
                style={({ pressed }) => [styles.btnGhost, pressed ? styles.btnActive : null]}
              >
                <Text style={styles.btnGhostLabel}>Change city</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function HintRow({ number, text }: { number: string; text: string }) {
  return (
    <View style={hintStyles.row}>
      <View style={hintStyles.badge}>
        <Text style={hintStyles.badgeText}>{number}</Text>
      </View>
      <Text style={hintStyles.text}>{text}</Text>
    </View>
  );
}

const hintStyles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: palette.accentSoft,
    borderRadius: radius.sm,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  badgeText: {
    color: palette.accent,
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  text: {
    color: palette.textSecondary,
    fontSize: fontSize.md,
    flex: 1,
  },
});

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={resultStatStyles.root}>
      <Text style={resultStatStyles.value}>{value}</Text>
      <Text style={resultStatStyles.label}>{label}</Text>
    </View>
  );
}

const resultStatStyles = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: palette.bgCardElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    flex: 1,
    gap: 4,
    minWidth: 80,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
  },
  value: {
    color: palette.text,
    fontSize: fontSize.xxl,
    fontWeight: '800',
  },
  label: {
    color: palette.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});

const styles = StyleSheet.create({
  root: {
    backgroundColor: palette.bg,
    flex: 1,
  },

  // -- Ambient glow elements --
  glowTopRight: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 240,
    height: 240,
    backgroundColor: 'rgba(77, 159, 255, 0.07)',
    borderRadius: 999,
  },
  glowBottomLeft: {
    position: 'absolute',
    bottom: -100,
    left: -80,
    width: 280,
    height: 280,
    backgroundColor: 'rgba(52, 211, 153, 0.05)',
    borderRadius: 999,
  },

  // -- Centered states (loading, error) --
  centerContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  stateCard: {
    alignItems: 'center',
    backgroundColor: palette.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    gap: spacing.lg,
    maxWidth: 400,
    padding: spacing.xxl,
    width: '100%',
    ...shadows.md,
  },
  stateIcon: {
    color: palette.danger,
    fontSize: 28,
    fontWeight: '900',
    backgroundColor: palette.dangerSoft,
    borderRadius: radius.pill,
    height: 48,
    width: 48,
    lineHeight: 48,
    textAlign: 'center',
    overflow: 'hidden',
  },
  stateTitle: {
    color: palette.text,
    fontFamily: fontFamily.display,
    fontSize: fontSize.xl,
    textAlign: 'center',
  },
  stateBody: {
    color: palette.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 22,
    textAlign: 'center',
  },

  // -- Landing --
  landingContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  landingInner: {
    alignSelf: 'center',
    gap: spacing.lg,
    maxWidth: 460,
    width: '100%',
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  brandDot: {
    backgroundColor: palette.accent,
    borderRadius: radius.pill,
    height: 10,
    width: 10,
  },
  brandLabel: {
    color: palette.textTertiary,
    fontSize: fontSize.sm,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  landingHeading: {
    color: palette.text,
    fontFamily: fontFamily.display,
    fontSize: 38,
    lineHeight: 44,
  },
  landingBody: {
    color: palette.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 23,
  },
  cityPickerWrap: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  fieldLabel: {
    color: palette.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  landingDivider: {
    backgroundColor: palette.border,
    height: 1,
    marginVertical: spacing.xs,
  },
  landingHints: {
    gap: spacing.md,
  },
  hintsTitle: {
    color: palette.textTertiary,
    fontSize: fontSize.sm,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },

  // -- Results --
  resultsContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  resultsInner: {
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing.lg,
    maxWidth: 440,
    width: '100%',
  },
  resultsEyebrow: {
    color: palette.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  resultsHeading: {
    color: palette.text,
    fontFamily: fontFamily.display,
    fontSize: 42,
    lineHeight: 48,
    textAlign: 'center',
  },
  resultsCity: {
    color: palette.textSecondary,
    fontSize: fontSize.lg,
    fontWeight: '500',
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
    width: '100%',
  },
  resultsActions: {
    gap: spacing.sm,
    marginTop: spacing.lg,
    width: '100%',
  },

  // -- Gameplay: wide --
  wideRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  wideMapCol: {
    flex: 1.15,
    padding: spacing.lg,
  },
  wideProgressWrap: {
    marginBottom: spacing.md,
  },
  wideMapWrap: {
    flex: 1,
  },
  wideSidebar: {
    flexGrow: 1,
    gap: spacing.lg,
    maxWidth: 420,
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },

  // -- Gameplay: mobile --
  mobileContent: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  mobileProgressWrap: {
    paddingHorizontal: spacing.xs,
  },
  mobileQuizSection: {
    gap: spacing.md,
    paddingHorizontal: spacing.xs,
  },

  // -- Shared gameplay --
  questionTitle: {
    color: palette.text,
    fontFamily: fontFamily.display,
    fontSize: fontSize.xxl,
    lineHeight: 32,
  },
  optionList: {
    gap: spacing.sm,
  },
  feedback: {
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  feedbackCorrect: {
    borderColor: palette.successBorder,
    backgroundColor: palette.successSoft,
  },
  feedbackWrong: {
    borderColor: palette.dangerBorder,
    backgroundColor: palette.dangerSoft,
  },
  feedbackTitle: {
    color: palette.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  feedbackBody: {
    color: palette.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  gameActions: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },

  // -- Buttons --
  btnPrimary: {
    alignItems: 'center',
    backgroundColor: palette.accent,
    borderRadius: radius.lg,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    ...shadows.sm,
  },
  btnPrimaryLabel: {
    color: palette.textInverse,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  btnSecondary: {
    alignItems: 'center',
    backgroundColor: palette.bgCardElevated,
    borderColor: palette.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  btnSecondaryLabel: {
    color: palette.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  btnGhost: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  btnGhostLabel: {
    color: palette.textTertiary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  btnFull: {
    width: '100%',
  },
  btnActive: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
