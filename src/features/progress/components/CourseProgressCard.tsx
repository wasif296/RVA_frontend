import { useState } from 'react';
import { Badge, Modal, ModalBody, ModalFooter, ModalHeader, ProgressBar, Button } from '../../../design-system';
import { formatDuration, formatPercent, formatPoints } from '../../../lib/format';
import type {
  LearnerProgressCourse,
  LearnerProgressFinalExam,
  LearnerProgressLesson,
} from '../progress.api';

type CourseProgressCardProps = {
  course: LearnerProgressCourse;
};

function videoLabel(lesson: LearnerProgressLesson): string {
  if (lesson.videoCompletedAt != null) {
    return `Completed · +${formatPoints(lesson.videoPointsAwarded)} pts`;
  }
  if (!lesson.started) {
    return 'Not started';
  }
  return `In progress · ${formatDuration(lesson.watchedSec)} / ${formatDuration(lesson.requiredWatchSec)}`;
}

function quizLabel(lesson: LearnerProgressLesson): string {
  if (lesson.quizMaxScore == null) {
    return 'No quiz';
  }
  if (lesson.quizAttempts <= 0 || lesson.bestQuizScore == null) {
    return 'Not attempted';
  }
  const pct =
    lesson.quizMaxScore > 0
      ? (lesson.bestQuizScore / lesson.quizMaxScore) * 100
      : 0;
  const passPct = lesson.quizPassingScorePct ?? 0;
  const passed = pct >= passPct;
  return `Attempted · best ${formatPoints(lesson.bestQuizScore)}/${formatPoints(lesson.quizMaxScore)} (${formatPercent(pct, 0)}) · ${passed ? 'pass' : 'below pass'} at ${formatPercent(passPct, 0)} · ${lesson.quizAttempts} attempt${lesson.quizAttempts === 1 ? '' : 's'} · +${formatPoints(lesson.quizPointsAwarded)} pts`;
}

function examLabel(exam: LearnerProgressFinalExam): string {
  if (!exam.unlocked) {
    return 'Not unlocked — finish every lesson video first';
  }
  if (exam.submissionStatus == null) {
    return `Unlocked · not submitted · ${formatPoints(exam.maxMarks)} marks · pass at ${formatPoints(exam.passMark)}`;
  }
  if (exam.submissionStatus === 'submitted') {
    return 'Submitted — awaiting grading';
  }
  const marks = exam.marksAwarded ?? 0;
  const pct = exam.maxMarks > 0 ? (marks / exam.maxMarks) * 100 : 0;
  return `Graded · ${formatPoints(marks)}/${formatPoints(exam.maxMarks)} (${formatPercent(pct, 0)}) · ${exam.passed ? 'pass' : 'fail'}`;
}

export function CourseProgressCard({ course }: CourseProgressCardProps) {
  const [open, setOpen] = useState(false);
  const remaining = Math.max(0, course.pointsAvailable - course.pointsEarned);
  const isComplete =
    course.lessonCount > 0 && course.completedLessonCount === course.lessonCount;

  return (
    <>
      <article className="rounded-lg border border-border bg-surface">
        <button
          type="button"
          className="flex w-full flex-col gap-3 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:flex-row sm:items-center sm:justify-between"
          onClick={() => setOpen(true)}
        >
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-xl text-fg">{course.title}</h3>
            <p className="mt-1 text-sm text-fg-muted">
              {course.completedLessonCount}/{course.lessonCount} lessons complete ·{' '}
              {formatPoints(course.pointsEarned)}/{formatPoints(course.pointsAvailable)}{' '}
              points
              {remaining > 0 ? (
                <span className="text-brand-800">
                  {' '}
                  · {formatPoints(remaining)} left
                </span>
              ) : null}
            </p>
            <div className="mt-3">
              <ProgressBar
                value={course.progressPct}
                size="sm"
                label={`Course progress ${formatPercent(course.progressPct, 1)}`}
              />
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {isComplete ? (
              <Badge variant="success" size="sm">
                Course complete
              </Badge>
            ) : (
              <Badge variant="neutral" size="sm">
                {formatPercent(course.progressPct, 1)}
              </Badge>
            )}
          </div>
        </button>
      </article>

      <Modal open={open} onOpenChange={setOpen} size="lg">
        <ModalHeader
          title={course.title}
          description={`${course.completedLessonCount} of ${course.lessonCount} lessons complete · ${formatPercent(course.progressPct, 1)} · ${formatPoints(course.pointsEarned)} pts earned in this course`}
        />
        <ModalBody className="max-h-[min(70vh,36rem)] overflow-y-auto">
          <ul className="flex flex-col gap-4">
            {course.lessons.map((lesson) => (
              <li
                key={lesson.lessonId}
                className="flex flex-col gap-1 border-b border-border/60 pb-4 last:border-0 last:pb-0"
              >
                <p className="text-sm font-medium text-fg">{lesson.title}</p>
                <p className="text-sm text-fg-muted">Video: {videoLabel(lesson)}</p>
                <p className="text-sm text-fg-muted">Quiz: {quizLabel(lesson)}</p>
              </li>
            ))}
          </ul>

          {course.finalExam ? (
            <div className="mt-6 rounded-md border border-border bg-neutral-50 px-3 py-3 text-sm">
              <p className="font-medium text-fg">Final exam</p>
              <p className="mt-1 text-fg-muted">{examLabel(course.finalExam)}</p>
              {course.finalExam.submissionStatus != null ? (
                <div className="mt-2 flex flex-wrap gap-3 text-sm">
                  {course.finalExam.docUrl ? (
                    <a
                      href={course.finalExam.docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-800 underline-offset-2 hover:underline"
                    >
                      Open Doc
                    </a>
                  ) : null}
                  {course.finalExam.loomUrl ? (
                    <a
                      href={course.finalExam.loomUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-800 underline-offset-2 hover:underline"
                    >
                      Open Loom
                    </a>
                  ) : null}
                </div>
              ) : null}
              {course.finalExam.submissionStatus === 'graded' &&
              course.finalExam.feedback ? (
                <p className="mt-2 text-fg-muted">
                  Feedback: {course.finalExam.feedback}
                </p>
              ) : null}
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
