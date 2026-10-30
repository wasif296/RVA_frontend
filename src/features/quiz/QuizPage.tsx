import { useEffect, useState } from 'react';
import {
  Link,
  useBlocker,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { ApiError } from '../../lib/apiClient';
import {
  Button,
  ErrorState,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Skeleton,
} from '../../design-system';
import { QuestionCard } from './components/QuestionCard';
import { QuizProgress } from './components/QuizProgress';
import type { LearnerQuiz, QuizResultLocationState, SubmitQuizResult } from './quiz.api';
import { listLessonQuizAttempts } from './quiz.api';
import {
  useLessonQuizAttemptsQuery,
  useLessonQuizQuery,
  useSubmitLessonQuizMutation,
} from './quiz.hooks';

export type QuizTakingFlowProps = {
  quiz: LearnerQuiz;
  courseId: string;
  backTo: string;
  resultPathFor: (attemptId: string) => string;
  attemptsUsed: number;
  maxAttempts: number | null;
  introTitle: string;
  introNote?: string;
  onSubmit: (answers: Array<number | null>) => Promise<SubmitQuizResult>;
  resolveAttemptId: (result: SubmitQuizResult) => Promise<string>;
  submitting: boolean;
  retakeAvailable: boolean;
};

export function QuizTakingFlow({
  quiz,
  courseId,
  backTo,
  resultPathFor,
  attemptsUsed,
  maxAttempts,
  introTitle,
  introNote,
  onSubmit,
  resolveAttemptId,
  submitting,
  retakeAvailable,
}: QuizTakingFlowProps) {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<number | null>>(() =>
    Array.from({ length: quiz.questions.length }, () => null),
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hardError, setHardError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const unansweredCount = answers.filter((a) => a == null).length;
  const atCap = maxAttempts != null && attemptsUsed >= maxAttempts;

  const blocker = useBlocker(started && dirty && !submitting && !hardError);

  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    const leave = window.confirm(
      'You have an in-progress quiz. Leave and discard your answers?',
    );
    if (leave) blocker.proceed();
    else blocker.reset();
  }, [blocker]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!started || !dirty || submitting || hardError) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [started, dirty, submitting, hardError]);

  const question = quiz.questions[index];
  if (!question && started) {
    return null;
  }

  async function runSubmit() {
    setConfirmOpen(false);
    try {
      const result = await onSubmit(answers);
      const attemptId = await resolveAttemptId(result);
      setDirty(false);
      navigate(resultPathFor(attemptId), {
        replace: true,
        state: { submitResult: result } satisfies QuizResultLocationState,
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Submission failed. Return to the course and try again later.';
      setHardError(message);
      setDirty(false);
    }
  }

  function requestSubmit() {
    if (unansweredCount > 0) {
      setConfirmOpen(true);
      return;
    }
    void runSubmit();
  }

  if (hardError) {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-4 py-10 text-center">
        <h1 className="font-display text-3xl text-fg">Could not submit</h1>
        <p className="text-fg-muted">{hardError}</p>
        <div>
          <Link
            to={`/courses/${courseId}`}
            className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-base font-medium text-inverse hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Back to course
          </Link>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <div>
          <Link
            to={backTo}
            className="text-sm font-medium text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Back
          </Link>
          <h1 className="mt-2 font-display text-3xl text-fg sm:text-4xl">
            {introTitle}
          </h1>
          <p className="mt-2 text-fg-muted">{quiz.title}</p>
        </div>

        <ul className="flex flex-col gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-fg">
          <li>{quiz.questionCount} questions</li>
          <li>Max points: {quiz.maxPoints}</li>
          <li>Passing score: {quiz.passingScorePct}%</li>
          <li>
            Attempts:{' '}
            {maxAttempts == null
              ? `${attemptsUsed} used (unlimited)`
              : `${attemptsUsed} of ${maxAttempts} used`}
          </li>
        </ul>

        {introNote ? <p className="text-sm text-fg-muted">{introNote}</p> : null}

        {atCap || !retakeAvailable ? (
          <p className="text-sm text-fg-muted" role="status">
            {atCap
              ? `You have used all ${maxAttempts} attempts. Review your results from the course page.`
              : 'This quiz is not available to start right now.'}
          </p>
        ) : (
          <Button type="button" size="lg" onClick={() => setStarted(true)}>
            Start quiz
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <QuizProgress
        total={quiz.questions.length}
        answers={answers}
        currentIndex={index}
        onJump={setIndex}
      />

      <QuestionCard
        question={question!}
        questionNumber={index + 1}
        totalQuestions={quiz.questions.length}
        selectedIndex={answers[index] ?? null}
        onSelect={(optionIndex) => {
          setAnswers((prev) => {
            const next = [...prev];
            next[index] = optionIndex;
            return next;
          });
          setDirty(true);
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={index === 0 || submitting}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          Previous
        </Button>

        {index < quiz.questions.length - 1 ? (
          <Button
            type="button"
            disabled={submitting}
            onClick={() =>
              setIndex((i) => Math.min(quiz.questions.length - 1, i + 1))
            }
          >
            Next
          </Button>
        ) : (
          <Button
            type="button"
            loading={submitting}
            disabled={submitting}
            onClick={requestSubmit}
          >
            Submit quiz
          </Button>
        )}
      </div>

      <Modal open={confirmOpen} onOpenChange={setConfirmOpen} size="sm">
        <ModalHeader title="Submit with blank answers?" />
        <ModalBody>
          <p className="text-sm text-fg">
            You have {unansweredCount} unanswered question
            {unansweredCount === 1 ? '' : 's'}. Blank answers score zero. Submit
            anyway?
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => setConfirmOpen(false)}
          >
            Keep editing
          </Button>
          <Button
            type="button"
            loading={submitting}
            disabled={submitting}
            onClick={() => void runSubmit()}
          >
            Submit anyway
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

function QuizPageSkeleton() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4" aria-busy="true">
      <Skeleton width="sm" height="sm" />
      <Skeleton width="lg" height="lg" className="max-w-md" />
      <Skeleton variant="rect" height="xl" className="h-32" />
      <Skeleton width="sm" height="lg" className="h-11 w-36" />
    </div>
  );
}

export function QuizPage() {
  const { courseId = '', lessonId = '' } = useParams<{
    courseId: string;
    lessonId: string;
  }>();
  const quizQuery = useLessonQuizQuery(lessonId);
  const attemptsQuery = useLessonQuizAttemptsQuery(lessonId);
  const submitMutation = useSubmitLessonQuizMutation(lessonId);

  if (quizQuery.isLoading || attemptsQuery.isLoading) {
    return <QuizPageSkeleton />;
  }

  if (quizQuery.isError) {
    return (
      <ErrorState
        title="Could not load this quiz"
        description="Check your connection and try again."
        onRetry={() => void quizQuery.refetch()}
      />
    );
  }

  if (attemptsQuery.isError) {
    return (
      <ErrorState
        title="Could not load quiz attempts"
        description="Check your connection and try again."
        onRetry={() => void attemptsQuery.refetch()}
      />
    );
  }

  const quiz = quizQuery.data?.quiz;
  if (!quiz) {
    return (
      <ErrorState
        title="Quiz not available"
        description="This lesson may not have a quiz yet."
        onRetry={() => void quizQuery.refetch()}
      />
    );
  }

  const attempts = attemptsQuery.data?.attempts ?? [];

  return (
    <QuizTakingFlow
      quiz={quiz}
      courseId={courseId}
      backTo={`/learn/${courseId}/${lessonId}`}
      resultPathFor={(attemptId) =>
        `/learn/${courseId}/${lessonId}/quiz/result/${attemptId}`
      }
      attemptsUsed={attempts.length}
      maxAttempts={quiz.maxAttempts}
      introTitle="Lesson quiz"
      introNote="You can retake this quiz anytime. Only improvements earn more points."
      submitting={submitMutation.isPending}
      retakeAvailable={true}
      onSubmit={(answers) => submitMutation.mutateAsync(answers)}
      resolveAttemptId={async (result) => {
        const fresh = await listLessonQuizAttempts(lessonId);
        const match = fresh.attempts.find(
          (a) => a.attemptNumber === result.attemptNumber,
        );
        if (!match) {
          throw new Error('Could not find the saved attempt');
        }
        return match.id;
      }}
    />
  );
}
