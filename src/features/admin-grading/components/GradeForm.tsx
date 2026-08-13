import { useMemo, useState } from 'react';
import { RULES, finalExamPassMark } from '@shared';
import {
  Badge,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Textarea,
} from '../../../design-system';
import { formatPercent } from '../../../lib/format';

export type GradeFormProps = {
  maxMarks?: number;
  passPct?: number;
  submitting?: boolean;
  onSubmit: (input: { marksAwarded: number; feedback?: string }) => Promise<unknown>;
};

export function GradeForm({
  maxMarks = RULES.FINAL_EXAM_MAX_MARKS,
  passPct = RULES.FINAL_EXAM_PASS_PCT,
  submitting = false,
  onSubmit,
}: GradeFormProps) {
  const passMark = finalExamPassMark(maxMarks);
  const [marksInput, setMarksInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [marksError, setMarksError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const parsedMarks = useMemo(() => {
    const trimmed = marksInput.trim();
    if (trimmed === '') return null;
    if (!/^\d+$/.test(trimmed)) return NaN;
    return Number(trimmed);
  }, [marksInput]);

  const marksValid =
    parsedMarks !== null &&
    Number.isInteger(parsedMarks) &&
    parsedMarks >= 0 &&
    parsedMarks <= maxMarks;

  const pct =
    marksValid && maxMarks > 0
      ? Math.round((parsedMarks / maxMarks) * 1000) / 10
      : null;
  const passed = marksValid ? parsedMarks >= passMark : null;

  function validateAndOpenConfirm() {
    if (parsedMarks === null || marksInput.trim() === '') {
      setMarksError(`Enter an integer from 0 to ${maxMarks}`);
      return;
    }
    if (!marksValid) {
      setMarksError(`Marks must be a whole number between 0 and ${maxMarks}`);
      return;
    }
    setMarksError(null);
    setConfirmOpen(true);
  }

  async function confirmGrade() {
    if (!marksValid) return;
    const trimmedFeedback = feedback.trim();
    await onSubmit({
      marksAwarded: parsedMarks,
      ...(trimmedFeedback ? { feedback: trimmedFeedback } : {}),
    });
    setConfirmOpen(false);
  }

  return (
    <>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          validateAndOpenConfirm();
        }}
      >
        <Input
          label={`Marks (0–${maxMarks})`}
          inputMode="numeric"
          pattern="[0-9]*"
          value={marksInput}
          error={marksError ?? undefined}
          onChange={(event) => {
            setMarksInput(event.target.value);
            if (marksError) setMarksError(null);
          }}
        />

        {marksValid && pct !== null && passed !== null ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-fg-muted">
              {formatPercent(pct, pct % 1 === 0 ? 0 : 1)} of {maxMarks}
            </span>
            <Badge variant={passed ? 'success' : 'warning'} size="sm">
              {passed ? 'Pass' : 'Did not pass'}
            </Badge>
            <span className="text-fg-muted">
              Pass mark: {passMark} ({passPct}%)
            </span>
          </div>
        ) : (
          <p className="text-sm text-fg-muted">
            Pass at {passMark} of {maxMarks} ({passPct}%). Points awarded equal marks.
          </p>
        )}

        <Textarea
          label="Feedback (optional)"
          rows={4}
          value={feedback}
          onChange={(event) => setFeedback(event.target.value)}
        />

        <div>
          <Button type="submit" disabled={submitting}>
            Grade submission
          </Button>
        </div>
      </form>

      <Modal open={confirmOpen} onOpenChange={setConfirmOpen} size="sm">
        <ModalHeader
          title="Confirm grade?"
          description="Grading is permanent and cannot be undone."
        />
        <ModalBody>
          {marksValid && passed !== null ? (
            <dl className="grid gap-3 text-sm">
              <div>
                <dt className="text-fg-muted">Marks</dt>
                <dd className="font-medium text-fg">
                  {parsedMarks}/{maxMarks}
                  {pct !== null ? ` (${formatPercent(pct, pct % 1 === 0 ? 0 : 1)})` : ''}
                </dd>
              </div>
              <div>
                <dt className="text-fg-muted">Result</dt>
                <dd className="font-medium text-fg">
                  {passed ? 'Pass' : 'Did not pass'}
                </dd>
              </div>
              <div>
                <dt className="text-fg-muted">Points to award</dt>
                <dd className="font-medium text-fg">{parsedMarks}</dd>
              </div>
            </dl>
          ) : null}
          <p className="mt-4 text-sm text-fg-muted">
            Once submitted, marks and feedback cannot be changed.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            type="button"
            variant="ghost"
            disabled={submitting}
            onClick={() => setConfirmOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            loading={submitting}
            disabled={submitting}
            onClick={() => void confirmGrade()}
          >
            Confirm grade
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
