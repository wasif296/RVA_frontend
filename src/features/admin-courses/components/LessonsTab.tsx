import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Button, EmptyState, ErrorState, Spinner } from '../../../design-system';
import { LessonFormModal } from './LessonFormModal';
import { LessonRow } from './LessonRow';
import type { AdminLesson, CreateLessonInput } from '../lessons.api';
import {
  useCreateLesson,
  useDeleteLesson,
  useLessonsQuery,
  useReorderLessons,
  useUpdateLesson,
} from '../lessons.hooks';

type LessonsTabProps = {
  courseId: string;
};

export function LessonsTab({ courseId }: LessonsTabProps) {
  const lessonsQuery = useLessonsQuery(courseId);
  const createLesson = useCreateLesson(courseId);
  const updateLesson = useUpdateLesson(courseId);
  const deleteLesson = useDeleteLesson(courseId);
  const reorderLessons = useReorderLessons(courseId);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminLesson | null>(null);

  const lessons = lessonsQuery.data?.lessons ?? [];

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(lesson: AdminLesson) {
    setEditing(lesson);
    setFormOpen(true);
  }

  function moveLesson(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= lessons.length) return;
    const next = lessons.map((lesson) => lesson.id);
    const [removed] = next.splice(index, 1);
    next.splice(nextIndex, 0, removed!);
    reorderLessons.mutate(next);
  }

  function handleSubmit(input: CreateLessonInput) {
    if (editing) {
      updateLesson.mutate(
        { id: editing.id, input },
        {
          onSuccess: () => {
            setFormOpen(false);
            setEditing(null);
          },
        },
      );
      return;
    }
    createLesson.mutate(input, {
      onSuccess: () => {
        setFormOpen(false);
      },
    });
  }

  if (lessonsQuery.isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner label="Loading lessons" />
      </div>
    );
  }

  if (lessonsQuery.isError) {
    return (
      <ErrorState
        title="Could not load lessons"
        description="Check your connection and try again."
        onRetry={() => void lessonsQuery.refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-fg">Lessons</h2>
          <p className="text-sm text-fg-muted">
            Ordered with move up / move down. Quizzes are managed in a later phase.
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          Add lesson
        </Button>
      </div>

      {lessons.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="size-5" aria-hidden />}
          title="No lessons yet"
          description="Add the first lesson to this course."
          action={
            <Button type="button" size="sm" onClick={openCreate}>
              Add lesson
            </Button>
          }
        />
      ) : (
        <ul className="rounded-md border border-border bg-surface px-4">
          {lessons.map((lesson, index) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              index={index}
              total={lessons.length}
              reorderPending={reorderLessons.isPending}
              onMoveUp={() => moveLesson(index, -1)}
              onMoveDown={() => moveLesson(index, 1)}
              onEdit={() => openEdit(lesson)}
              onDelete={() => deleteLesson.mutate(lesson.id)}
            />
          ))}
        </ul>
      )}

      <LessonFormModal
        open={formOpen}
        lesson={editing}
        loading={createLesson.isPending || updateLesson.isPending}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
