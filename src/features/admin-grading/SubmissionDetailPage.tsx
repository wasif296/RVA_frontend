import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge, ErrorState, Skeleton } from '../../design-system';
import { formatDateTime, formatPercent } from '../../lib/format';
import { GradeForm } from './components/GradeForm';
import { useExamSubmissionQuery, useGradeExamSubmissionMutation } from './grading.hooks';

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <Skeleton width="sm" height="sm" />
      <Skeleton width="lg" height="lg" className="max-w-md" />
      <Skeleton variant="rect" height="xl" className="h-40" />
      <Skeleton variant="rect" height="xl" className="h-48" />
    </div>
  );
}

function ExternalLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {children}
    </a>
  );
}

export function SubmissionDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const detailQuery = useExamSubmissionQuery(id);
  const gradeMutation = useGradeExamSubmissionMutation(id);

  if (detailQuery.isLoading) {
    return <DetailSkeleton />;
  }

  if (detailQuery.isError || !detailQuery.data?.submission) {
    return (
      <ErrorState
        title="Could not load submission"
        description="Check your connection and try again."
        onRetry={() => void detailQuery.refetch()}
      />
    );
  }

  const submission = detailQuery.data.submission;
  const exam = submission.exam;
  const orderedQuestions = exam.questions.slice().sort((a, b) => a.order - b.order);
  const isGraded = submission.status === 'graded';
  const marks = submission.marksAwarded;
  const pct =
    marks != null && submission.maxMarks > 0
      ? Math.round((marks / submission.maxMarks) * 1000) / 10
      : null;

  return (
    <div className="section-stack">
      <div>
        <Link
          to="/admin/grading"
          className="text-sm font-medium text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Back to grading queue
        </Link>
        <header className="page-header mt-3">
          <div className="page-header__copy">
            <h1 className="page-header__title">{exam.title}</h1>
            <p className="page-header__subtitle">
              {submission.learner.name} · {submission.course.title}
            </p>
          </div>
          <div className="page-header__actions">
            <Badge variant={isGraded ? 'success' : 'warning'} size="sm">
              {isGraded ? 'Graded' : 'Ungraded'}
            </Badge>
          </div>
        </header>
      </div>

      <section
        className="rounded-md border border-border bg-surface px-4 py-4 text-sm"
        aria-label="Learner and course"
      >
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-fg-muted">Learner</dt>
            <dd className="font-medium text-fg">{submission.learner.name}</dd>
            <dd className="text-fg-muted">{submission.learner.email}</dd>
          </div>
          <div>
            <dt className="text-fg-muted">Course</dt>
            <dd className="font-medium text-fg">{submission.course.title}</dd>
          </div>
          <div>
            <dt className="text-fg-muted">Submitted</dt>
            <dd className="text-fg">{formatDateTime(submission.submittedAt)}</dd>
          </div>
          <div>
            <dt className="text-fg-muted">Pass mark</dt>
            <dd className="text-fg">
              {exam.passMark}/{exam.maxMarks} ({exam.passPct}%)
            </dd>
          </div>
        </dl>
      </section>

      {exam.instructions.trim() ? (
        <section aria-label="Exam instructions">
          <h2 className="font-display text-xl text-fg">Instructions</h2>
          <p className="mt-2 whitespace-pre-wrap text-fg-muted">{exam.instructions}</p>
        </section>
      ) : null}

      <section aria-label="Exam questions" className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-fg">Questions</h2>
        <ol className="flex flex-col gap-3">
          {orderedQuestions.map((question, index) => (
            <li
              key={question.id}
              className="rounded-md border border-border bg-surface px-4 py-3"
            >
              <p className="text-sm font-medium text-fg-muted">Question {index + 1}</p>
              <p className="mt-1 whitespace-pre-wrap text-fg">{question.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-label="Submission links" className="flex flex-col gap-2">
        <h2 className="font-display text-xl text-fg">Learner links</h2>
        <ExternalLink href={submission.docUrl}>Document</ExternalLink>
        {submission.loomUrl ? (
          <ExternalLink href={submission.loomUrl}>Loom</ExternalLink>
        ) : (
          <p className="text-sm text-fg-muted">No Loom link provided</p>
        )}
      </section>

      {isGraded ? (
        <section
          className="rounded-xl border border-border bg-surface-raised px-6 py-6 shadow-sm"
          aria-label="Grade result"
        >
          <h2 className="font-display text-xl text-fg">Result</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-fg-muted">Marks</dt>
              <dd className="font-display text-2xl tracking-tight text-fg">
                {marks ?? '—'}/{submission.maxMarks}
                {pct != null ? (
                  <span className="ml-2 text-base text-fg-muted">
                    ({formatPercent(pct, pct % 1 === 0 ? 0 : 1)})
                  </span>
                ) : null}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-fg-muted">Outcome</dt>
              <dd className="font-display text-2xl tracking-tight text-fg">
                {submission.passed ? 'Pass' : 'Did not pass'}
              </dd>
            </div>
            {submission.gradedAt ? (
              <div>
                <dt className="text-sm text-fg-muted">Graded</dt>
                <dd className="text-fg">{formatDateTime(submission.gradedAt)}</dd>
              </div>
            ) : null}
            {submission.gradedBy ? (
              <div>
                <dt className="text-sm text-fg-muted">Graded by</dt>
                <dd className="text-fg">{submission.gradedBy.name}</dd>
              </div>
            ) : null}
          </dl>
          {submission.feedback?.trim() ? (
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-sm font-medium text-fg">Feedback</p>
              <p className="mt-1 whitespace-pre-wrap text-fg-muted">
                {submission.feedback}
              </p>
            </div>
          ) : null}
        </section>
      ) : (
        <section aria-label="Grade form" className="flex flex-col gap-3">
          <h2 className="font-display text-xl text-fg">Grade</h2>
          <GradeForm
            maxMarks={exam.maxMarks}
            passPct={exam.passPct}
            submitting={gradeMutation.isPending}
            onSubmit={async (input) => {
              await gradeMutation.mutateAsync(input);
              void navigate('/admin/grading');
            }}
          />
        </section>
      )}
    </div>
  );
}
