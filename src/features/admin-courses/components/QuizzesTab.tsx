import { useMemo, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Spinner,
} from '../../../design-system';
import { ApiError } from '../../../lib/apiClient';
import { useLessonsQuery } from '../lessons.hooks';
import {
  useDeleteLessonQuiz,
  useLessonQuizAdminQuery,
  useUpsertLessonQuiz,
} from '../quiz.hooks';
import { QuizBuilder } from './QuizBuilder';

type QuizzesTabProps = {
  courseId: string;
};

function LessonQuizSummary({
  lesson,
  onSelect,
}: {
  lesson: {
    id: string;
    title: string;
    hasQuiz: boolean;
    isOptional: boolean;
  };
  onSelect: () => void;
}) {
  const quizQuery = useLessonQuizAdminQuery(lesson.id, lesson.hasQuiz);
  const notFound =
    quizQuery.isError &&
    quizQuery.error instanceof ApiError &&
    quizQuery.error.code === 'NOT_FOUND';

  const questionCount = quizQuery.data?.quiz.questions.length;
  const maxPoints = quizQuery.data?.quiz.currentTotal;

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-4 last:border-b-0">
      <div className="min-w-0">
        <p className="font-medium text-fg">{lesson.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-fg-muted">
          {lesson.hasQuiz && !notFound ? (
            <>
              <Badge variant="brand" size="sm">
                Has quiz
              </Badge>
              {quizQuery.isLoading ? (
                <span>Loading details…</span>
              ) : (
                <>
                  <span>
                    {questionCount ?? '—'} question
                    {(questionCount ?? 0) === 1 ? '' : 's'}
                  </span>
                  <span>Max {maxPoints ?? '—'} pts</span>
                </>
              )}
            </>
          ) : (
            <Badge variant="neutral" size="sm">
              No quiz
            </Badge>
          )}
        </div>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onSelect}>
        {lesson.hasQuiz && !notFound ? 'Edit quiz' : 'Create quiz'}
      </Button>
    </li>
  );
}

function LessonQuizEditor({
  courseId,
  lessonId,
  lessonTitle,
  hasQuiz,
  onClose,
}: {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  hasQuiz: boolean;
  onClose: () => void;
}) {
  const quizQuery = useLessonQuizAdminQuery(lessonId, hasQuiz);
  const upsert = useUpsertLessonQuiz(courseId, lessonId);
  const remove = useDeleteLessonQuiz(courseId, lessonId);

  const notFound =
    quizQuery.isError &&
    quizQuery.error instanceof ApiError &&
    quizQuery.error.code === 'NOT_FOUND';

  const quiz = hasQuiz && !notFound ? (quizQuery.data?.quiz ?? null) : null;

  return (
    <QuizBuilder
      scope="lesson"
      heading="Lesson quiz"
      subtitle={`Lesson: ${lessonTitle}`}
      quiz={quiz}
      loading={hasQuiz && quizQuery.isLoading}
      saving={upsert.isPending}
      deleting={remove.isPending}
      onClose={onClose}
      onSave={(input) => upsert.mutateAsync(input)}
      onDelete={
        quiz
          ? () => {
              remove.mutate(undefined, { onSuccess: onClose });
            }
          : undefined
      }
    />
  );
}

export function QuizzesTab({ courseId }: QuizzesTabProps) {
  const lessonsQuery = useLessonsQuery(courseId);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const lessons = lessonsQuery.data?.lessons ?? [];
  const selectedLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === selectedLessonId) ?? null,
    [lessons, selectedLessonId],
  );

  if (lessonsQuery.isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner label="Loading quizzes" />
      </div>
    );
  }

  if (lessonsQuery.isError) {
    return (
      <ErrorState
        title="Could not load quizzes"
        description="Lessons are required for this tab."
        onRetry={() => {
          void lessonsQuery.refetch();
        }}
      />
    );
  }

  if (selectedLesson) {
    return (
      <LessonQuizEditor
        courseId={courseId}
        lessonId={selectedLesson.id}
        lessonTitle={selectedLesson.title}
        hasQuiz={selectedLesson.hasQuiz}
        onClose={() => setSelectedLessonId(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-xl text-fg">Lesson quizzes</h2>
        <p className="text-sm text-fg-muted">
          Optional per lesson. Points are awarded for correct answers; passing % is display-only.
        </p>
      </div>

      {lessons.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="size-5" aria-hidden />}
          title="No lessons yet"
          description="Add lessons first, then attach quizzes to them."
        />
      ) : (
        <ul className="rounded-md border border-border bg-surface px-4">
          {lessons.map((lesson) => (
            <LessonQuizSummary
              key={lesson.id}
              lesson={lesson}
              onSelect={() => setSelectedLessonId(lesson.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
