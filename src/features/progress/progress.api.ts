import { apiFetch } from '../../lib/apiClient';
import type { Badge } from '../badges/badges.api';

export type LearnerProgressLesson = {
  lessonId: string;
  title: string;
  /** True once the learner has at least one heartbeat on this lesson. */
  started: boolean;
  watchedSec: number;
  requiredWatchSec: number;
  videoCompletedAt: string | null;
  videoPointsAwarded: number;
  bestQuizScore: number | null;
  quizMaxScore: number | null;
  quizPassingScorePct: number | null;
  quizPointsAwarded: number;
  quizAttempts: number;
};

export type LearnerProgressFinalExam = {
  exists: true;
  unlocked: boolean;
  maxMarks: number;
  passMark: number;
  submissionStatus: null | 'submitted' | 'graded';
  marksAwarded: number | null;
  passed: boolean | null;
  feedback: string | null;
  docUrl: string | null;
  loomUrl: string | null;
};

export type LearnerProgressCourse = {
  courseId: string;
  title: string;
  progressPct: number;
  completedLessonCount: number;
  lessonCount: number;
  pointsEarned: number;
  pointsAvailable: number;
  startedAt: string | null;
  completedAt: string | null;
  lessons: LearnerProgressLesson[];
  finalExam: LearnerProgressFinalExam | null;
};

export type LearnerProgressDetail = {
  totals: {
    totalPoints: number;
    videoPoints: number;
    quizPoints: number;
    examPoints: number;
    lessonsCompleted: number;
    coursesCompleted: number;
    quizzesTaken: number;
    examsTaken: number;
  };
  courses: LearnerProgressCourse[];
  badges: Badge[];
};

export function getMyProgress(): Promise<LearnerProgressDetail> {
  return apiFetch<LearnerProgressDetail>('/progress');
}
