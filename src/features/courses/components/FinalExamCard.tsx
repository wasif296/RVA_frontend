import { Link } from 'react-router-dom';
import { RULES } from '@shared';
import { cn } from '../../../lib/cn';
import type { CourseDetailFinalExam } from '../course-detail.api';

type FinalExamCardProps = {
  courseId: string;
  finalExam: CourseDetailFinalExam;
  completedLessonCount: number;
  lessonCount: number;
};

function statusLabel(finalExam: CourseDetailFinalExam): string {
  if (finalExam.submissionStatus === 'graded') {
    if (finalExam.passed) {
      return `Passed · ${finalExam.marksAwarded ?? '—'}/${finalExam.maxMarks}`;
    }
    return `Graded · ${finalExam.marksAwarded ?? '—'}/${finalExam.maxMarks}`;
  }
  if (finalExam.submissionStatus === 'submitted') {
    return 'Submitted — waiting to be graded';
  }
  return `Not submitted · ${finalExam.maxMarks} marks · pass at ${finalExam.passMark}`;
}

export function FinalExamCard({
  courseId,
  finalExam,
  completedLessonCount,
  lessonCount,
}: FinalExamCardProps) {
  const unlocked = finalExam.unlocked;
  const ctaLabel =
    finalExam.submissionStatus === 'graded'
      ? 'View result'
      : finalExam.submissionStatus === 'submitted'
        ? 'View submission'
        : 'Start final exam';

  return (
    <section
      className={cn(
        'flex flex-col gap-4 rounded-lg border p-5',
        unlocked ? 'card-highlight' : 'border-border bg-surface',
      )}
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-2xl text-fg">{finalExam.title}</h2>
        <p className="text-sm text-fg-muted">
          Written final exam · {RULES.FINAL_EXAM_PASS_PCT}%+ to pass
        </p>
      </div>

      {unlocked ? (
        <>
          <p className="text-base font-medium text-fg">{statusLabel(finalExam)}</p>
          <div>
            <Link
              to={`/exam/${courseId}`}
              className="inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-5 text-base font-semibold text-inverse shadow-sm transition-[background-color,box-shadow] duration-fast hover:bg-brand-700 hover:shadow-md motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {ctaLabel}
            </Link>
          </div>
        </>
      ) : (
        <p className="text-sm text-fg-muted">
          Complete all {lessonCount} lesson videos to unlock ({completedLessonCount}/
          {lessonCount})
        </p>
      )}
    </section>
  );
}
