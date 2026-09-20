export type RobotState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'success'
  | 'correcting'
  | 'confused'
  | 'error';

export interface AITeacherTurn {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  translationTr?: string;
  phonetic?: string;
  grammarTip?: string;
  correction?: {
    hasError: boolean;
    originalWrongPart?: string;
    correctedPart?: string;
    errorType?: string;
    explanationTr?: string;
  };
  hintForUser?: string;
  timestamp: string;
  status?: string;
}

export interface UserStatsData {
  streakDays: number;
  streakWeekDays: { day: string; done: boolean }[];
  todayProgressPercent: number;
  todayGoalMins: number;
  levelCode: string;
  levelName: string;
  levelPercent: number;
  learnedWordsCount: number;
}
