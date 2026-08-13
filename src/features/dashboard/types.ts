import type { Badge } from '../badges/badges.api';

export type InProgressCourse = {
  courseId: string;
  courseTitle: string;
  thumbnailUrl: string | null;
  lessonId: string;
  lessonTitle: string;
  courseProgressPct: number;
  completedLessonCount: number;
  lessonCount: number;
  lastActivityAt: string;
};

export type ProgressCourse = {
  courseId: string;
  title: string;
  thumbnailUrl: string | null;
  category: string;
  level: string;
  lessonCount: number;
  completedLessonCount: number;
  progressPct: number;
  totalPointsEarned: number;
  finalExamUnlocked: boolean;
  finalExamCompleted: boolean;
  lastLessonId: string | null;
};

export type ProgressSummary = {
  totalPoints: number;
  coursesStarted: number;
  coursesCompleted: number;
  lessonsCompleted: number;
  inProgress: InProgressCourse[];
  courses: ProgressCourse[];
  badges: Badge[];
};

export type CatalogCourse = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string | null;
  category: string;
  level: string;
  status: string;
  lessonCount: number;
  totalDurationSec: number;
};
