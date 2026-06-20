export interface JournalAnalysis {
  primaryEmotion: string;
  intensityScore: number;
  burnoutRisk: boolean;
  crisisFlag: boolean;
  triggers: string[];
}

const crisisPatterns = [
  /\bkill myself\b/i,
  /\bend my life\b/i,
  /\bsuicid(?:e|al)\b/i,
  /\bself[- ]?harm\b/i,
  /\bdon't want to live\b/i,
  /\bdo not want to live\b/i,
];

const triggerGroups: Array<{ label: string; patterns: RegExp[] }> = [
  { label: "Exams", patterns: [/\bexam/i, /\btest/i, /\bmock/i, /\bscore/i, /\bresult/i] },
  { label: "Workload", patterns: [/\bdeadline/i, /\bworkload/i, /\bassignment/i, /\btoo much/i] },
  { label: "Time management", patterns: [/\bno time/i, /\blate\b/i, /\bprocrastinat/i, /\bschedule/i] },
  { label: "Sleep", patterns: [/\bsleep/i, /\binsomnia/i, /\btired/i, /\bexhaust/i] },
  { label: "Social pressure", patterns: [/\bparent/i, /\bpeer/i, /\bcompare/i, /\bexpectation/i] },
  { label: "Isolation", patterns: [/\balone\b/i, /\blonely/i, /\bisolat/i] },
];

export function containsCrisisLanguage(text: string): boolean {
  return crisisPatterns.some((pattern) => pattern.test(text));
}

export function analyzeJournal(text: string): JournalAnalysis {
  const crisisFlag = containsCrisisLanguage(text);
  const anxietyMatches = text.match(/\b(anxious|anxiety|panic|worried|overwhelmed|stress(?:ed)?)\b/gi)?.length ?? 0;
  const lowMoodMatches = text.match(/\b(sad|hopeless|empty|low|crying|worthless)\b/gi)?.length ?? 0;
  const fatigueMatches = text.match(/\b(tired|exhausted|burnout|drained|can't focus|cannot focus)\b/gi)?.length ?? 0;
  const positiveMatches = text.match(/\b(good|calm|happy|hopeful|proud|better|motivated)\b/gi)?.length ?? 0;
  const negativeTotal = anxietyMatches + lowMoodMatches + fatigueMatches;

  let primaryEmotion = "Reflective";
  if (crisisFlag || lowMoodMatches > Math.max(anxietyMatches, fatigueMatches)) primaryEmotion = "Low mood";
  else if (fatigueMatches > anxietyMatches) primaryEmotion = "Fatigue";
  else if (anxietyMatches > 0) primaryEmotion = "Anxiety";
  else if (positiveMatches > 0) primaryEmotion = "Positive";

  const intensityScore = Math.min(10, Math.max(1, 2 + negativeTotal * 2 + (crisisFlag ? 4 : 0) - positiveMatches));
  const triggers = triggerGroups
    .filter((group) => group.patterns.some((pattern) => pattern.test(text)))
    .map((group) => group.label);

  return {
    primaryEmotion,
    intensityScore,
    burnoutRisk: fatigueMatches >= 2 || (fatigueMatches >= 1 && anxietyMatches >= 2),
    crisisFlag,
    triggers: triggers.length > 0 ? triggers : ["General wellbeing"],
  };
}

export function buildCompanionReply(message: string, recentTriggers: string[]): string {
  if (containsCrisisLanguage(message)) {
    return "Your safety matters more than this conversation. Please contact local emergency services now, move near a trusted person, and tell them clearly that you need immediate support. This app cannot provide emergency care.";
  }

  const context = recentTriggers.length > 0
    ? `You have recently mentioned ${recentTriggers.slice(0, 2).join(" and ").toLowerCase()}. `
    : "";
  return `${context}Try one small reset: put both feet on the floor, take five slow breaths, and choose the smallest useful action you can finish in ten minutes. You do not need to solve the whole day at once.`;
}
