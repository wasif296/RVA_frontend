import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { useBlocker } from 'react-router-dom';
import { z } from 'zod';
import { RULES, finalExamPassMark } from '@shared';
import {
  Button,
  ErrorState,
  Input,
  Spinner,
  Textarea,
} from '../../../design-system';
import { ApiError } from '../../../lib/apiClient';
import {
  useDeleteFinalExam,
  useFinalExamAdminQuery,
  useUpsertFinalExam,
} from '../quiz.hooks';
import type { AdminFinalExam, UpsertFinalExamInput } from '../quiz.api';
import { ExamQuestionEditor } from './ExamQuestionEditor';

const examQuestionSchema = z.object({
  text: z.string().trim().min(1, 'Question text is required'),
});

export const finalExamFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    instructions: z.string().max(10_000),
    questions: z
      .array(examQuestionSchema)
      .min(1, 'Add at least one question')
      .max(100, 'At most 100 questions'),
  })
  .superRefine((body, ctx) => {
    const texts = body.questions.map((question) => question.text.toLowerCase());
    if (new Set(texts).size !== texts.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Duplicate question text is not allowed',
        path: ['questions'],
      });
    }
  });

export type FinalExamFormValues = z.infer<typeof finalExamFormSchema>;

function emptyQuestion(): FinalExamFormValues['questions'][number] {
  return { text: '' };
}

function toFormValues(exam?: AdminFinalExam | null): FinalExamFormValues {
  if (!exam) {
    return {
      title: '',
      instructions: '',
      questions: [emptyQuestion()],
    };
  }
  return {
    title: exam.title,
    instructions: exam.instructions,
    questions: exam.questions
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((question) => ({ text: question.text })),
  };
}

function toUpsertInput(values: FinalExamFormValues): UpsertFinalExamInput {
  return {
    title: values.title.trim(),
    instructions: values.instructions.trim(),
    questions: values.questions.map((question) => ({
      text: question.text.trim(),
    })),
  };
}

function applyServerErrors(
  error: unknown,
  setError: ReturnType<typeof useForm<FinalExamFormValues>>['setError'],
) {
  if (!(error instanceof ApiError) || !Array.isArray(error.details)) return;
  for (const issue of error.details as Array<{ path?: (string | number)[]; message?: string }>) {
    if (!issue.path?.length || !issue.message) continue;
    setError(issue.path.join('.') as 'title', {
      type: 'server',
      message: issue.message,
    });
  }
}

type FinalExamEditorProps = {
  exam: AdminFinalExam | null;
  saving: boolean;
  deleting: boolean;
  onSave: (input: UpsertFinalExamInput) => Promise<{ exam: AdminFinalExam; warning?: string }>;
  onDelete?: () => void;
  onClose?: () => void;
};

function FinalExamEditor({
  exam,
  saving,
  deleting,
  onSave,
  onDelete,
  onClose,
}: FinalExamEditorProps) {
  const methods = useForm<FinalExamFormValues>({
    resolver: zodResolver(finalExamFormSchema),
    defaultValues: toFormValues(exam),
    mode: 'onBlur',
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = methods;

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'questions',
  });

  useEffect(() => {
    reset(toFormValues(exam));
  }, [exam, reset]);

  const blocker = useBlocker(isDirty);

  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    const leave = window.confirm(
      'You have unsaved final exam changes. Leave this page and discard them?',
    );
    if (leave) blocker.proceed();
    else blocker.reset();
  }, [blocker]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  function requestClose() {
    if (!onClose) return;
    if (isDirty && !window.confirm('Discard unsaved final exam changes?')) return;
    onClose();
  }

  const maxMarks = RULES.FINAL_EXAM_MAX_MARKS;
  const passPct = RULES.FINAL_EXAM_PASS_PCT;
  const passMark = finalExamPassMark();

  return (
    <FormProvider {...methods}>
      <form
        className="flex flex-col gap-5"
        onSubmit={handleSubmit(async (values) => {
          try {
            const result = await onSave(toUpsertInput(values));
            reset(toFormValues(result.exam));
          } catch (error) {
            applyServerErrors(error, setError);
          }
        })}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-fg">Course final exam</h2>
            <p className="text-sm text-fg-muted">
              Written exam — unlocks after every lesson video is complete. Learners submit
              links; tutors award marks later.
            </p>
          </div>
          {onClose ? (
            <Button type="button" variant="ghost" onClick={requestClose}>
              Back
            </Button>
          ) : null}
        </div>

        {exam && exam.submissionCount > 0 ? (
          <div
            className="rounded-md border border-warning bg-warning-subtle px-4 py-3 text-sm text-warning"
            role="status"
          >
            This exam already has {exam.submissionCount} submission
            {exam.submissionCount === 1 ? '' : 's'}. Editing questions will not change
            existing submissions.
          </div>
        ) : null}

        <div className="rounded-md border border-border bg-neutral-50 px-4 py-3 text-sm text-fg">
          <p>
            <span className="font-medium">Max marks:</span> {maxMarks} (fixed)
          </p>
          <p className="mt-1">
            <span className="font-medium">Pass mark:</span> {passMark} ({passPct}% of{' '}
            {maxMarks})
          </p>
        </div>

        <Input
          label="Title"
          error={errors.title?.message}
          {...register('title')}
        />

        <Textarea
          label="Instructions"
          rows={4}
          hint="Shown to learners before they answer and submit."
          error={errors.instructions?.message}
          {...register('instructions')}
        />

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-xl text-fg">Questions</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append(emptyQuestion())}
            >
              Add question
            </Button>
          </div>

          {errors.questions?.message || errors.questions?.root?.message ? (
            <p className="text-sm text-danger" role="alert">
              {errors.questions.message ?? errors.questions.root?.message}
            </p>
          ) : null}

          {fields.map((field, index) => (
            <ExamQuestionEditor
              key={field.id}
              index={index}
              total={fields.length}
              canRemove={fields.length > 1}
              onRemove={() => remove(index)}
              onMoveUp={() => move(index, index - 1)}
              onMoveDown={() => move(index, index + 1)}
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" loading={saving} disabled={deleting}>
            Save final exam
          </Button>
          {onDelete ? (
            <Button
              type="button"
              variant="danger"
              loading={deleting}
              disabled={saving}
              onClick={() => {
                if (
                  !window.confirm(
                    'Delete this final exam? Learners will no longer see it.',
                  )
                ) {
                  return;
                }
                onDelete();
              }}
            >
              Delete exam
            </Button>
          ) : null}
        </div>
      </form>
    </FormProvider>
  );
}

type FinalExamTabProps = {
  courseId: string;
};

export function FinalExamTab({ courseId }: FinalExamTabProps) {
  const [creating, setCreating] = useState(false);
  const examQuery = useFinalExamAdminQuery(courseId, true);
  const upsert = useUpsertFinalExam(courseId);
  const remove = useDeleteFinalExam(courseId);

  const notFound =
    examQuery.isError &&
    examQuery.error instanceof ApiError &&
    examQuery.error.code === 'NOT_FOUND';

  const exam = !notFound ? (examQuery.data?.exam ?? null) : null;

  if (examQuery.isLoading) {
    return (
      <div className="flex min-h-32 items-center justify-center">
        <Spinner label="Loading final exam" />
      </div>
    );
  }

  if (examQuery.isError && !notFound) {
    return (
      <ErrorState
        title="Could not load final exam"
        description="Check your connection and try again."
        onRetry={() => void examQuery.refetch()}
      />
    );
  }

  if (creating || exam) {
    return (
      <FinalExamEditor
        exam={exam}
        saving={upsert.isPending}
        deleting={remove.isPending}
        onClose={exam ? undefined : () => setCreating(false)}
        onSave={(input) => upsert.mutateAsync(input)}
        onDelete={
          exam
            ? () => {
                remove.mutate(undefined, {
                  onSuccess: () => setCreating(false),
                });
              }
            : undefined
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-md border border-border bg-surface px-4 py-5">
      <div>
        <h2 className="font-display text-xl text-fg">Course final exam</h2>
        <p className="mt-1 text-sm text-fg-muted">
          Optional written exam. Fixed at {RULES.FINAL_EXAM_MAX_MARKS} marks with an{' '}
          {RULES.FINAL_EXAM_PASS_PCT}% pass mark ({finalExamPassMark()}). Learners submit
          document and optional Loom links for tutor grading.
        </p>
      </div>
      <div>
        <Button type="button" onClick={() => setCreating(true)}>
          Create final exam
        </Button>
      </div>
    </div>
  );
}
