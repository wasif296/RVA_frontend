import { apiFetch } from '../../lib/apiClient';

export type LearningLesson = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  youtubeVideoId: string;
  durationSec: number;
  requiredWatchSec: number;
  order: number;
  isOptional: boolean;
};

export type LearningNavLesson = {
  id: string;
  title: string;
  order: number;
  durationSec: number;
  videoCompletedAt: string | null;
  hasQuiz: boolean;
};

export type LearningProgress = {
  watchedSec: number;
  videoCompletedAt: string | null;
  videoPointsAwarded: number;
  bestQuizScore: number | null;
  quizPointsAwarded: number;
  quizAttempts: number;
};

export type LearningQuizSummary = {
  exists: true;
  title: string;
  questionCount: number;
  maxPoints: number;
};

export type LearningLessonDetail = {
  lesson: LearningLesson;
  courseNav: {
    courseId: string;
    courseTitle: string;
    lessons: LearningNavLesson[];
    prevLessonId: string | null;
    nextLessonId: string | null;
  };
  progress: LearningProgress;
  quiz: LearningQuizSummary | null;
};

export function getLearningLesson(lessonId: string): Promise<LearningLessonDetail> {
  return apiFetch<LearningLessonDetail>(`/lessons/${lessonId}`);
}
