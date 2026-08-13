import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form';
import { useBlocker } from 'react-router-dom';
import { z } from 'zod';
import { RULES } from '@shared';
import { Button, Input, Spinner } from '../../../design-system';
import { cn } from '../../../lib/cn';
import { ApiError } from '../../../lib/apiClient';
import type {
  AdminQuiz,
  QuizScope,
  UpsertQuizInput,
  UpsertQuizResponse,
} from '../quiz.api';
import { QuestionEditor } from './QuestionEditor';

const optionSchema = z.object({
  value: z.string().trim().min(1, 'Option text is required'),
});

const questionSchema = z
  .object({
    text: z.string().trim().min(1, 'Question text is required'),
    options: z
      .array(optionSchema)
      .min(2, 'Each question needs at least 2 options')
      .max(6, 'Each question may have at most 6 options'),
    correctIndex: z.number().int().min(0),
  })
  .superRefine((question, ctx) => {
    const normalized = question.options.map((option) => option.value.toLowerCase());
    if (new Set(normalized).size !== normalized.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Options must be mutually distinct',
        path: ['options'],
      });
    }
    if (question.correctIndex >= question.options.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select a correct option within the list',
        path: ['correctIndex'],
      });
    }
  });

export const quizBuilderSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    pointsPerQuestion: z.coerce.number().int().min(1).max(20),
    passingScorePct: z.coerce.number().int().min(0).max(100),
    questions: z
      .array(questionSchema)
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

export type QuizBuilderFormValues = z.infer<typeof quizBuilderSchema>;

function emptyQuestion(): QuizBuilderFormValues['questions'][number] {
  return {
    text: '',
    options: [{ value: '' }, { value: '' }],
    correctIndex: 0,
  };
}

function toFormValues(quiz?: AdminQuiz | null): QuizBuilderFormValues {
  if (!quiz) {
    return {
      title: '',
      pointsPerQuestion: RULES.DEFAULT_POINTS_PER_QUESTION,
      passingScorePct: RULES.DEFAULT_PASSING_SCORE_PCT,
      questions: [emptyQuestion()],
    };
  }
  return {
    title: quiz.title,
    pointsPerQuestion: quiz.pointsPerQuestion,
    passingScorePct: quiz.passingScorePct,
    questions: quiz.questions.map((question) => ({
      text: question.text,
      options: question.options.map((value) => ({ value })),
      correctIndex: question.correctIndex,
    })),
  };
}

function toUpsertInput(values: QuizBuilderFormValues): UpsertQuizInput {
  return {
    title: values.title.trim(),
    pointsPerQuestion: values.pointsPerQuestion,
    passingScorePct: values.passingScorePct,
    questions: values.questions.map((question) => ({
      text: question.text.trim(),
      options: question.options.map((option) => option.value.trim()),
      correctIndex: question.correctIndex,
    })),
  };
}

function applyServerErrors(
  error: unknown,
  setError: ReturnType<typeof useForm<QuizBuilderFormValues>>['setError'],
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

type QuizBuilderProps = {
  scope: QuizScope;
  heading: string;
  subtitle?: string;
  quiz?: AdminQuiz | null;
  loading?: boolean;
  requiredTotal?: number | null;
  mismatchWarning?: string | null;
  saving?: boolean;
  deleting?: boolean;
  onSave: (input: UpsertQuizInput) => Promise<UpsertQuizResponse>;
  onDelete?: () => void;
  onClose?: () => void;
};

export function QuizBuilder({
  scope,
  heading,
  subtitle,
  quiz,
  loading = false,
  requiredTotal = null,
  mismatchWarning = null,
  saving = false,
  deleting = false,
  onSave,
  onDelete,
  onClose,
}: QuizBuilderProps) {
  const methods = useForm<QuizBuilderFormValues>({
    resolver: zodResolver(quizBuilderSchema),
    defaultValues: toFormValues(quiz),
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
    reset(toFormValues(quiz));
  }, [quiz, reset]);

  const blocker = useBlocker(isDirty);

  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    const leave = window.confirm(
      'You have unsaved quiz changes. Leave this page and discard them?',
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

  const pointsPerQuestion = useWatch({ control, name: 'pointsPerQuestion' });
  const questions = useWatch({ control, name: 'questions' });
  const currentTotal = useMemo(() => {
    const count = questions?.length ?? 0;
    const points = Number(pointsPerQuestion) || 0;
    return count * points;
  }, [pointsPerQuestion, questions]);

  const totalsMatch = requiredTotal == null ? true : currentTotal === requiredTotal;

  function requestClose() {
    if (!onClose) return;
    if (isDirty && !window.confirm('Discard unsaved quiz changes?')) return;
    onClose();
  }

  if (loading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner label="Loading quiz" />
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        className="flex flex-col gap-5"
        onSubmit={handleSubmit(async (values) => {
          try {
            const result = await onSave(toUpsertInput(values));
            reset(toFormValues(result.quiz));
          } catch (error) {
            applyServerErrors(error, setError);
          }
        })}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-fg">{heading}</h2>
            {subtitle ? <p className="text-sm text-fg-muted">{subtitle}</p> : null}
          </div>
          {onClose ? (
            <Button type="button" variant="ghost" onClick={requestClose}>
              Back
            </Button>
          ) : null}
        </div>

        {mismatchWarning ? (
          <div
            className="rounded-md border border-warning bg-warning-subtle px-4 py-3 text-sm text-warning"
            role="status"
          >
            {mismatchWarning}
          </div>
        ) : null}

        {quiz && quiz.attemptCount > 0 ? (
          <div
            className="rounded-md border border-warning bg-warning-subtle px-4 py-3 text-sm text-warning"
            role="status"
          >
            This quiz already has {quiz.attemptCount} attempt
            {quiz.attemptCount === 1 ? '' : 's'}. Saving edits will not rescore historical
            attempts — each keeps its own maxScore.
          </div>
        ) : null}

        {scope === 'final_exam' && requiredTotal != null ? (
          <div
            className={cn(
              'rounded-md border px-4 py-3',
              totalsMatch
                ? 'border-success bg-success-subtle text-success'
                : 'border-danger bg-danger-subtle text-danger',
            )}
          >
            <p className="text-sm font-medium">
              Required total: {requiredTotal} (lessonCount × 10)
            </p>
            <p className="mt-1 font-display text-2xl">
              Current total: {currentTotal}
              {!totalsMatch ? ' — mismatch' : ' — matches'}
            </p>
          </div>
        ) : (
          <p className="text-sm text-fg-muted">
            Maximum score:{' '}
            <span className="font-medium text-fg">{currentTotal}</span> (
            {questions?.length ?? 0} × {Number(pointsPerQuestion) || 0})
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <Input label="Title" error={errors.title?.message} {...register('title')} />
          <Input
            label="Points per question"
            type="number"
            min={1}
            max={20}
            error={errors.pointsPerQuestion?.message}
            {...register('pointsPerQuestion')}
          />
          <Input
            label="Passing score % (display only)"
            type="number"
            min={0}
            max={100}
            hint="Shown to learners; does not gate progress."
            error={errors.passingScorePct?.message}
            {...register('passingScorePct')}
          />
        </div>

        {errors.questions?.message || errors.questions?.root?.message ? (
          <p className="text-sm text-danger" role="alert">
            {errors.questions.message ?? errors.questions.root?.message}
          </p>
        ) : null}

        <div className="flex flex-col gap-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                >
                  Move up
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={index >= fields.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  Move down
                </Button>
              </div>
              <QuestionEditor
                index={index}
                canRemove={fields.length > 1}
                onRemove={() => remove(index)}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={fields.length >= 100}
            onClick={() => append(emptyQuestion())}
          >
            Add question
          </Button>
          <Button type="submit" loading={saving}>
            Save {scope === 'final_exam' ? 'final exam' : 'quiz'}
          </Button>
          {quiz && onDelete ? (
            <Button
              type="button"
              variant="danger"
              loading={deleting}
              onClick={() => {
                if (!window.confirm('Delete this quiz? Past attempts are kept.')) return;
                onDelete();
              }}
            >
              Delete
            </Button>
          ) : null}
        </div>
      </form>
    </FormProvider>
  );
}
