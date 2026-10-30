import { apiFetch } from '../../lib/apiClient';
import type { CourseLevel } from '@shared';

export type CourseDetailLesson = {
  id: string;
  title: string;
  description: string;
  durationSec: number;
  order: number;
  isOptional: boolean;
  hasQuiz: boolean;
  quizMaxPoints: number | null;
  videoCompletedAt: string | null;
  videoPointsAwarded: number;
  bestQuizScore: number | null;
  quizPointsAwarded: number;
  quizAttempts: number;
};

export type CourseDetailFinalExam = {
  exists: true;
  unlocked: boolean;
  title: string;
  maxMarks: number;
  passMark: number;
  submissionStatus: null | 'submitted' | 'graded';
  marksAwarded: number | null;
  passed: boolean | null;
};

export type CourseDetailPayload = {
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnailUrl: string | null;
    category: string;
    level: CourseLevel;
    lessonCount: number;
    totalDurationSec: number;
  };
  lessons: CourseDetailLesson[];
  finalExam: CourseDetailFinalExam | null;
  summary: {
    completedLessonCount: number;
    progressPct: number;
    totalPointsEarned: number;
    lastLessonId: string | null;
  };
};

export function getCourseDetail(courseId: string): Promise<CourseDetailPayload> {
  return apiFetch<CourseDetailPayload>(`/courses/${courseId}`);
}
