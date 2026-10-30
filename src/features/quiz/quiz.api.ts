import { apiFetch } from '../../lib/apiClient';

export type LearnerQuestion = {
  id: string;
  text: string;
  options: string[];
  order: number;
};

export type LearnerQuiz = {
  id: string;
  scope: 'lesson' | 'final_exam';
  title: string;
  pointsPerQuestion: number;
  passingScorePct: number;
  maxAttempts: number | null;
  questionCount: number;
  maxPoints: number;
  questions: LearnerQuestion[];
};

export type QuestionResult = {
  questionId: string;
  selectedIndex: number | null;
  correctIndex: number;
  isCorrect: boolean;
};

export type SubmitQuizResult = {
  correctCount: number;
  score: number;
  maxScore: number;
  pointsDelta: number;
  passed: boolean;
  attemptNumber: number;
  breakdown: QuestionResult[];
};

export type AttemptHistoryItem = {
  id: string;
  score: number;
  maxScore: number;
  correctCount: number;
  pointsDelta: number;
  attemptNumber: number;
  createdAt: string;
};

export type QuizResultLocationState = {
  submitResult: SubmitQuizResult;
};

export type LearnerFinalExamQuestion = {
  id: string;
  text: string;
  order: number;
};

export type LearnerFinalExam = {
  id: string;
  title: string;
  instructions: string;
  questions: LearnerFinalExamQuestion[];
  maxMarks: number;
  passPct: number;
  passMark: number;
};

export type ExamSubmissionStatus = 'submitted' | 'graded';

export type ExamSubmission = {
  id: string;
  courseId: string;
  examId: string;
  loomUrl: string | null;
  docUrl: string;
  status: ExamSubmissionStatus;
  submittedAt: string;
  marksAwarded: number | null;
  maxMarks: number;
  passed: boolean | null;
  feedback: string | null;
  gradedAt: string | null;
};

export type SubmitFinalExamInput = {
  docUrl: string;
  loomUrl?: string | null;
};

export type SubmitFinalExamResult = {
  submission: ExamSubmission;
  pointsAwarded: number;
};

export function getLessonQuiz(lessonId: string): Promise<{ quiz: LearnerQuiz }> {
  return apiFetch(`/lessons/${lessonId}/quiz`);
}

export function submitLessonQuiz(
  lessonId: string,
  answers: Array<number | null>,
): Promise<SubmitQuizResult> {
  return apiFetch(`/lessons/${lessonId}/quiz/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}

export function listLessonQuizAttempts(
  lessonId: string,
): Promise<{ attempts: AttemptHistoryItem[] }> {
  return apiFetch(`/lessons/${lessonId}/quiz/attempts`);
}

export function getFinalExam(courseId: string): Promise<{ exam: LearnerFinalExam }> {
  return apiFetch(`/courses/${courseId}/final-exam`);
}

export function submitFinalExam(
  courseId: string,
  input: SubmitFinalExamInput,
): Promise<SubmitFinalExamResult> {
  return apiFetch(`/courses/${courseId}/final-exam/submit`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getFinalExamSubmission(
  courseId: string,
): Promise<{ submission: ExamSubmission | null }> {
  return apiFetch(`/courses/${courseId}/final-exam/submission`);
}
