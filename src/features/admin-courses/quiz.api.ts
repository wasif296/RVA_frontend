import { apiFetch } from '../../lib/apiClient';

export type QuizScope = 'lesson' | 'final_exam';

export type AdminQuizQuestion = {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  order: number;
};

export type AdminQuiz = {
  id: string;
  scope: QuizScope;
  courseId: string;
  lessonId: string | null;
  title: string;
  pointsPerQuestion: number;
  passingScorePct: number;
  maxAttempts: number | null;
  questions: AdminQuizQuestion[];
  attemptCount: number;
  currentTotal: number;
  requiredTotal: number | null;
  mismatchWarning: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpsertQuizInput = {
  title: string;
  pointsPerQuestion: number;
  passingScorePct: number;
  questions: Array<{
    text: string;
    options: string[];
    correctIndex: number;
  }>;
};

export type UpsertQuizResponse = {
  quiz: AdminQuiz;
  warning?: string;
};

export type AdminFinalExamQuestion = {
  id: string;
  text: string;
  order: number;
};

export type AdminFinalExam = {
  id: string;
  courseId: string;
  title: string;
  instructions: string;
  questions: AdminFinalExamQuestion[];
  maxMarks: number;
  passPct: number;
  passMark: number;
  submissionCount: number;
  createdAt: string;
  updatedAt: string;
};

export type UpsertFinalExamInput = {
  title: string;
  instructions: string;
  questions: Array<{ text: string }>;
};

export type UpsertFinalExamResponse = {
  exam: AdminFinalExam;
  warning?: string;
};

export function getLessonQuizAdmin(lessonId: string): Promise<{ quiz: AdminQuiz }> {
  return apiFetch(`/lessons/${lessonId}/quiz/admin`);
}

export function upsertLessonQuiz(
  lessonId: string,
  input: UpsertQuizInput,
): Promise<UpsertQuizResponse> {
  return apiFetch(`/lessons/${lessonId}/quiz`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteLessonQuiz(lessonId: string): Promise<void> {
  return apiFetch(`/lessons/${lessonId}/quiz`, { method: 'DELETE' });
}

export function getFinalExamAdmin(courseId: string): Promise<{ exam: AdminFinalExam }> {
  return apiFetch(`/courses/${courseId}/final-exam/admin`);
}

export function upsertFinalExam(
  courseId: string,
  input: UpsertFinalExamInput,
): Promise<UpsertFinalExamResponse> {
  return apiFetch(`/courses/${courseId}/final-exam`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteFinalExam(courseId: string): Promise<void> {
  return apiFetch(`/courses/${courseId}/final-exam`, { method: 'DELETE' });
}
