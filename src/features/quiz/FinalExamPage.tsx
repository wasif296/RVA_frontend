import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { RULES, finalExamPassMark } from '@shared';
import { Button, ErrorState, Input, Skeleton } from '../../design-system';
import { BadgeList } from '../badges/components/BadgeList';
import { refreshAuthUser } from '../../lib/invalidateProgress';
import { useAuthStore } from '../../store/auth';
import type { ExamSubmission, LearnerFinalExam } from './quiz.api';
import {
  useCourseDetailForExamQuery,
  useFinalExamQuery,
  useFinalExamSubmissionQuery,
  useSubmitFinalExamMutation,
} from './quiz.hooks';

function ExamSkeleton() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4" aria-busy="true">
      <Skeleton width="sm" height="sm" />
      <Skeleton width="lg" height="lg" className="max-w-md" />
      <Skeleton variant="rect" height="xl" className="h-32" />
      <Skeleton width="sm" height="lg" className="h-11 w-36" />
    </div>
  );
}

function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

function formatSubmittedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

type SubmissionFormProps = {
  exam: LearnerFinalExam;
  initialDocUrl?: string;
  initialLoomUrl?: string;
  replaceMode?: boolean;
  submitting: boolean;
  onSubmit: (input: { docUrl: string; loomUrl?: string | null }) => Promise<unknown>;
};

function SubmissionForm({
  exam,
  initialDocUrl = '',
  initialLoomUrl = '',
  replaceMode = false,
  submitting,
  onSubmit,
}: SubmissionFormProps) {
  const [docUrl, setDocUrl] = useState(initialDocUrl);
  const [loomUrl, setLoomUrl] = useState(initialLoomUrl);
  const [docError, setDocError] = useState<string | null>(null);
  const [loomError, setLoomError] = useState<string | null>(null);

  useEffect(() => {
    setDocUrl(initialDocUrl);
    setLoomUrl(initialLoomUrl);
  }, [initialDocUrl, initialLoomUrl]);

  const orderedQuestions = exam.questions
    .slice()
    .sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-fg sm:text-4xl">{exam.title}</h1>
        {exam.instructions.trim() ? (
          <p className="mt-3 whitespace-pre-wrap text-fg-muted">{exam.instructions}</p>
        ) : null}
        <p className="mt-3 text-sm text-fg-muted">
          {exam.maxMarks} marks · pass at {exam.passMark} ({exam.passPct}%)
        </p>
      </div>

      <section aria-label="Exam questions" className="flex flex-col gap-4">
        <h2 className="font-display text-xl text-fg">Questions</h2>
        <ol className="flex flex-col gap-4">
          {orderedQuestions.map((question, index) => (
            <li
              key={question.id}
              className="rounded-md border border-border bg-surface px-4 py-4"
            >
              <p className="text-sm font-medium text-fg-muted">Question {index + 1}</p>
              <p className="mt-1 whitespace-pre-wrap text-fg">{question.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmedDoc = docUrl.trim();
          const trimmedLoom = loomUrl.trim();
          let valid = true;

          if (!trimmedDoc) {
            setDocError('A document link is required');
            valid = false;
          } else if (!isHttpsUrl(trimmedDoc)) {
            setDocError('Enter a valid https URL');
            valid = false;
          } else {
            setDocError(null);
          }

          if (trimmedLoom && !isHttpsUrl(trimmedLoom)) {
            setLoomError('Enter a valid https URL, or leave blank');
            valid = false;
          } else {
            setLoomError(null);
          }

          if (!valid) return;

          void onSubmit({
            docUrl: trimmedDoc,
            loomUrl: trimmedLoom ? trimmedLoom : null,
          });
        }}
      >
        <h2 className="font-display text-xl text-fg">
          {replaceMode ? 'Replace submission' : 'Your submission'}
        </h2>

        <Input
          label="Document link"
          type="url"
          required
          placeholder="https://"
          value={docUrl}
          error={docError ?? undefined}
          onChange={(event) => setDocUrl(event.target.value)}
        />

        <Input
          label="Loom link (optional)"
          type="url"
          placeholder="https://"
          value={loomUrl}
          error={loomError ?? undefined}
          onChange={(event) => setLoomUrl(event.target.value)}
        />

        <p className="text-sm text-fg-muted" role="note">
          Your tutor reviews your submission and awards marks. {RULES.FINAL_EXAM_PASS_PCT}%+
          ({finalExamPassMark()} of {RULES.FINAL_EXAM_MAX_MARKS}) is a pass.
        </p>

        <div>
          <Button type="submit" loading={submitting}>
            {replaceMode ? 'Replace submission' : 'Submit exam'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function GradedView({
  courseId,
  exam,
  submission,
}: {
  courseId: string;
  exam: LearnerFinalExam;
  submission: ExamSubmission;
}) {
  const marks = submission.marksAwarded;
  const maxMarks = submission.maxMarks;
  const pct =
    marks != null && maxMarks > 0
      ? Math.round((marks / maxMarks) * 1000) / 10
      : null;
  const passed = submission.passed === true;
  const userBadges = useAuthStore((state) => state.user?.badges ?? []);
  const earnedBadge =
    userBadges.find(
      (badge) =>
        badge.examSubmissionId === submission.id || badge.courseId === courseId,
    ) ?? null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-fg sm:text-4xl">{exam.title}</h1>
        <p className="mt-2 text-fg-muted">Graded</p>
      </div>

      <section
        className="rounded-xl border border-border bg-surface-raised px-6 py-6 shadow-sm"
        aria-label="Exam result"
      >
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-fg-muted">Marks</dt>
            <dd className="font-display text-2xl tracking-tight text-fg">
              {marks ?? '—'}/{maxMarks}
              {pct != null ? (
                <span className="ml-2 text-base font-sans text-fg-muted">
                  ({pct % 1 === 0 ? `${pct}%` : `${pct.toFixed(1)}%`})
                </span>
              ) : null}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-fg-muted">Result</dt>
            <dd className="font-display text-2xl tracking-tight text-fg">
              {passed ? 'Passed' : 'Below pass mark'}
            </dd>
          </div>
          {submission.gradedAt ? (
            <div>
              <dt className="text-sm text-fg-muted">Graded</dt>
              <dd className="text-fg">{formatSubmittedAt(submission.gradedAt)}</dd>
            </div>
          ) : null}
        </dl>

        {passed ? (
          <p className="mt-4 text-sm text-fg-muted">
            You scored at or above the pass mark ({exam.passMark}/{maxMarks},{' '}
            {exam.passPct}%).
          </p>
        ) : (
          <p className="mt-4 text-sm text-fg-muted">
            You scored below the pass mark of {exam.passMark}/{maxMarks} (
            {exam.passPct}%). You can keep learning on this course — this is a
            result, not a dead end.
          </p>
        )}

        {submission.feedback?.trim() ? (
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-sm font-medium text-fg">Tutor feedback</p>
            <p className="mt-1 whitespace-pre-wrap text-fg-muted">
              {submission.feedback}
            </p>
          </div>
        ) : null}

        {passed ? (
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-sm font-medium text-fg">Badge earned</p>
            {earnedBadge ? (
              <div className="mt-2">
                <BadgeList badges={[earnedBadge]} variant="full" />
              </div>
            ) : (
              <p className="mt-1 text-sm text-fg-muted">
                You earned a course badge for passing this exam.
              </p>
            )}
          </div>
        ) : null}
      </section>

      <section className="flex flex-col gap-2 text-sm">
        <p className="font-medium text-fg">Your links</p>
        <a
          href={submission.docUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-700 underline-offset-2 hover:underline"
        >
          Document
        </a>
        {submission.loomUrl ? (
          <a
            href={submission.loomUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-700 underline-offset-2 hover:underline"
          >
            Loom
          </a>
        ) : null}
      </section>

      <Link
        to={`/courses/${courseId}`}
        className="text-brand-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Back to course
      </Link>
    </div>
  );
}

function WaitingView({
  courseId,
  exam,
  submission,
  submitting,
  onReplace,
}: {
  courseId: string;
  exam: LearnerFinalExam;
  submission: ExamSubmission;
  submitting: boolean;
  onReplace: (input: { docUrl: string; loomUrl?: string | null }) => Promise<unknown>;
}) {
  const [replacing, setReplacing] = useState(false);

  if (replacing) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <Button type="button" variant="ghost" onClick={() => setReplacing(false)}>
          Cancel replace
        </Button>
        <SubmissionForm
          exam={exam}
          initialDocUrl={submission.docUrl}
          initialLoomUrl={submission.loomUrl ?? ''}
          replaceMode
          submitting={submitting}
          onSubmit={async (input) => {
            await onReplace(input);
            setReplacing(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-fg sm:text-4xl">{exam.title}</h1>
        <p className="mt-2 text-fg-muted">Submitted — waiting to be graded</p>
      </div>

      <section className="rounded-md border border-border bg-surface px-4 py-4 text-sm">
        <p className="text-fg-muted">
          Submitted {formatSubmittedAt(submission.submittedAt)}. Your tutor will review your
          work and award marks. {RULES.FINAL_EXAM_PASS_PCT}%+ is a pass.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <a
            href={submission.docUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-700 underline-offset-2 hover:underline"
          >
            Document link
          </a>
          {submission.loomUrl ? (
            <a
              href={submission.loomUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-700 underline-offset-2 hover:underline"
            >
              Loom link
            </a>
          ) : (
            <p className="text-fg-muted">No Loom link provided</p>
          )}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={() => setReplacing(true)}>
          Replace submission
        </Button>
        <Link
          to={`/courses/${courseId}`}
          className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-base font-medium text-fg hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Back to course
        </Link>
      </div>
    </div>
  );
}

export function FinalExamPage() {
  const { courseId = '' } = useParams<{ courseId: string }>();
  const courseQuery = useCourseDetailForExamQuery(courseId);
  const examQuery = useFinalExamQuery(courseId);
  const submissionQuery = useFinalExamSubmissionQuery(courseId);
  const submitMutation = useSubmitFinalExamMutation(courseId);
  const submissionStatus = submissionQuery.data?.submission?.status;
  const submissionId = submissionQuery.data?.submission?.id;

  useEffect(() => {
    if (submissionStatus === 'graded') {
      void refreshAuthUser();
    }
  }, [submissionId, submissionStatus]);

  const unlocked = courseQuery.data?.finalExam?.unlocked === true;
  const shouldLoadExam = unlocked;

  const loading =
    courseQuery.isLoading ||
    (shouldLoadExam && (examQuery.isLoading || submissionQuery.isLoading));

  if (loading) {
    return <ExamSkeleton />;
  }

  if (courseQuery.isError) {
    return (
      <ErrorState
        title="Could not load course status"
        description="Check your connection and try again."
        onRetry={() => void courseQuery.refetch()}
      />
    );
  }

  const detail = courseQuery.data;
  if (!detail) {
    return (
      <ErrorState
        title="Course not available"
        description="This course may be unpublished or the link is incorrect."
        onRetry={() => void courseQuery.refetch()}
      />
    );
  }

  const lessonCount = detail.course.lessonCount;
  const completed = detail.summary.completedLessonCount;
  const remainingVideos = Math.max(0, lessonCount - completed);

  if (!detail.finalExam?.unlocked) {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-4 py-10">
        <h1 className="font-display text-3xl text-fg">Final exam locked</h1>
        <p className="text-fg-muted">
          Complete all lesson videos to unlock the final exam.{' '}
          {remainingVideos === 1
            ? '1 lesson video remains.'
            : `${remainingVideos} lesson videos remain.`}
        </p>
        <Link
          to={`/courses/${courseId}`}
          className="text-brand-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Back to course
        </Link>
      </div>
    );
  }

  if (examQuery.isError) {
    return (
      <ErrorState
        title="Could not load the final exam"
        description="Check your connection and try again."
        onRetry={() => void examQuery.refetch()}
      />
    );
  }

  if (submissionQuery.isError) {
    return (
      <ErrorState
        title="Could not load your submission"
        description="Check your connection and try again."
        onRetry={() => void submissionQuery.refetch()}
      />
    );
  }

  const exam = examQuery.data?.exam;
  if (!exam) {
    return (
      <ErrorState
        title="Final exam not available"
        description="This course may not have a final exam yet."
        onRetry={() => void examQuery.refetch()}
      />
    );
  }

  const submission = submissionQuery.data?.submission ?? null;

  if (submission?.status === 'graded') {
    return <GradedView courseId={courseId} exam={exam} submission={submission} />;
  }

  if (submission?.status === 'submitted') {
    return (
      <WaitingView
        courseId={courseId}
        exam={exam}
        submission={submission}
        submitting={submitMutation.isPending}
        onReplace={(input) => submitMutation.mutateAsync(input)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Link
        to={`/courses/${courseId}`}
        className="mx-auto w-full max-w-2xl text-sm font-medium text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Back to course
      </Link>
      <SubmissionForm
        exam={exam}
        submitting={submitMutation.isPending}
        onSubmit={(input) => submitMutation.mutateAsync(input)}
      />
    </div>
  );
}
