import {
  Controller,
  useFieldArray,
  useFormContext,
} from 'react-hook-form';
import { Button, Input, Textarea } from '../../../design-system';
import { cn } from '../../../lib/cn';
import type { QuizBuilderFormValues } from './QuizBuilder';

type QuestionEditorProps = {
  index: number;
  onRemove: () => void;
  canRemove: boolean;
};

export function QuestionEditor({
  index,
  onRemove,
  canRemove,
}: QuestionEditorProps) {
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<QuizBuilderFormValues>();

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({
    control,
    name: `questions.${index}.options`,
  });

  const correctIndex = watch(`questions.${index}.correctIndex`);
  const questionError = errors.questions?.[index];

  return (
    <fieldset className="flex flex-col gap-4 rounded-md border border-border bg-surface p-4">
      <legend className="px-1 text-sm font-medium text-fg">Question {index + 1}</legend>

      <Textarea
        label="Question text"
        rows={2}
        error={questionError?.text?.message}
        {...register(`questions.${index}.text`)}
      />

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-fg">Options</p>
        <p className="text-sm text-fg-muted">
          Select the radio next to the correct answer — that choice is graded for every learner.
        </p>
        {optionFields.map((optionField, optionIndex) => {
          const isCorrect = correctIndex === optionIndex;
          return (
            <div
              key={optionField.id}
              className={cn(
                'flex items-start gap-3 rounded-md border px-3 py-2',
                isCorrect
                  ? 'border-success bg-success-subtle ring-2 ring-success/40'
                  : 'border-border bg-surface',
              )}
            >
              <Controller
                control={control}
                name={`questions.${index}.correctIndex`}
                render={({ field: radioField }) => (
                  <label className="mt-2 inline-flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      className="size-4 accent-success focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      checked={radioField.value === optionIndex}
                      onChange={() => radioField.onChange(optionIndex)}
                      aria-label={`Mark option ${optionIndex + 1} as correct`}
                    />
                    <span
                      className={cn(
                        'text-xs font-semibold uppercase tracking-wide',
                        isCorrect ? 'text-success' : 'text-fg-muted',
                      )}
                    >
                      {isCorrect ? 'Correct' : 'Option'}
                    </span>
                  </label>
                )}
              />
              <div className="min-w-0 flex-1">
                <Input
                  label={`Option ${optionIndex + 1}`}
                  error={questionError?.options?.[optionIndex]?.value?.message}
                  {...register(`questions.${index}.options.${optionIndex}.value`)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-7"
                disabled={optionFields.length <= 2}
                onClick={() => {
                  if (optionFields.length <= 2) return;
                  const nextCorrect =
                    correctIndex === optionIndex
                      ? 0
                      : correctIndex > optionIndex
                        ? correctIndex - 1
                        : correctIndex;
                  removeOption(optionIndex);
                  setValue(`questions.${index}.correctIndex`, nextCorrect, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              >
                Remove
              </Button>
            </div>
          );
        })}
        {questionError?.options?.message || questionError?.options?.root?.message ? (
          <p className="text-sm text-danger" role="alert">
            {questionError.options.message ?? questionError.options.root?.message}
          </p>
        ) : null}
        {questionError?.correctIndex?.message ? (
          <p className="text-sm text-danger" role="alert">
            {questionError.correctIndex.message}
          </p>
        ) : null}
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={optionFields.length >= 6}
            onClick={() => appendOption({ value: '' })}
          >
            Add option
          </Button>
        </div>
      </div>

      <div>
        <Button
          type="button"
          variant="danger"
          size="sm"
          disabled={!canRemove}
          onClick={onRemove}
        >
          Remove question
        </Button>
      </div>
    </fieldset>
  );
}
