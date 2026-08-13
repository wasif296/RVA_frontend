import { useFormContext } from 'react-hook-form';
import { Button, Textarea } from '../../../design-system';
import type { FinalExamFormValues } from './FinalExamTab';

type ExamQuestionEditorProps = {
  index: number;
  total: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canRemove: boolean;
};

export function ExamQuestionEditor({
  index,
  total,
  onRemove,
  onMoveUp,
  onMoveDown,
  canRemove,
}: ExamQuestionEditorProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<FinalExamFormValues>();

  const questionError = errors.questions?.[index];

  return (
    <fieldset className="flex flex-col gap-4 rounded-md border border-border bg-surface p-4">
      <legend className="px-1 text-sm font-medium text-fg">Question {index + 1}</legend>

      <Textarea
        label="Question text"
        rows={3}
        error={questionError?.text?.message}
        {...register(`questions.${index}.text`)}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={index === 0}
          onClick={onMoveUp}
        >
          Move up
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={index >= total - 1}
          onClick={onMoveDown}
        >
          Move down
        </Button>
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
