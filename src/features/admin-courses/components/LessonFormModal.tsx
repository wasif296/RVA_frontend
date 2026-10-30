import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ImageOff } from 'lucide-react';
import { RULES } from '@shared';
import {
  Button,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Textarea,
} from '../../../design-system';
import {
  parseYouTubeVideoIdClient,
  youtubeThumbnailUrl,
  type AdminLesson,
  type CreateLessonInput,
} from '../lessons.api';

const DEFAULT_WATCH_PCT = Math.round(RULES.VIDEO_COMPLETION_RATIO * 100);

export type LessonFormValues = {
  title: string;
  description: string;
  youtubeVideoId: string;
  durationMin: string;
  durationSecPart: string;
  watchPct: string;
  isOptional: boolean;
};

type LessonFormModalProps = {
  open: boolean;
  lesson?: AdminLesson | null;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateLessonInput) => void;
};

function splitDuration(totalSec: number): {
  durationMin: string;
  durationSecPart: string;
} {
  const safe = Math.max(0, Math.floor(totalSec));
  return {
    durationMin: String(Math.floor(safe / 60)),
    durationSecPart: String(safe % 60),
  };
}

function formatClock(totalSec: number): string {
  const safe = Math.max(0, Math.floor(totalSec));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

function parseNonNegInt(raw: string): number {
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function clampWatchPct(pct: number): number {
  if (!Number.isFinite(pct)) return DEFAULT_WATCH_PCT;
  return Math.min(100, Math.max(1, Math.round(pct)));
}

function pctFromLesson(lesson: AdminLesson): number {
  if (lesson.durationSec < 1) return DEFAULT_WATCH_PCT;
  return clampWatchPct((lesson.requiredWatchSec / lesson.durationSec) * 100);
}

function requiredWatchSecFrom(durationSec: number, watchPct: number): number {
  if (durationSec < 1) return 0;
  const pct = clampWatchPct(watchPct);
  return Math.min(durationSec, Math.max(1, Math.round((durationSec * pct) / 100)));
}

function valuesFromLesson(lesson?: AdminLesson | null): LessonFormValues {
  if (!lesson) {
    const duration = splitDuration(60);
    return {
      title: '',
      description: '',
      youtubeVideoId: '',
      durationMin: duration.durationMin,
      durationSecPart: duration.durationSecPart,
      watchPct: String(DEFAULT_WATCH_PCT),
      isOptional: false,
    };
  }
  const duration = splitDuration(lesson.durationSec);
  const watchPct = lesson.watchTargetOverridden
    ? pctFromLesson(lesson)
    : DEFAULT_WATCH_PCT;
  return {
    title: lesson.title,
    description: lesson.description,
    youtubeVideoId: lesson.youtubeVideoId,
    durationMin: duration.durationMin,
    durationSecPart: duration.durationSecPart,
    watchPct: String(watchPct),
    isOptional: lesson.isOptional,
  };
}

export function LessonFormModal({
  open,
  lesson,
  loading = false,
  onOpenChange,
  onSubmit,
}: LessonFormModalProps) {
  const [values, setValues] = useState<LessonFormValues>(() => valuesFromLesson(lesson));
  const [watchTargetTouched, setWatchTargetTouched] = useState(false);
  const [thumbBroken, setThumbBroken] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(valuesFromLesson(lesson));
      setWatchTargetTouched(Boolean(lesson?.watchTargetOverridden));
      setThumbBroken(false);
    }
  }, [open, lesson]);

  const parsedId = useMemo(
    () => parseYouTubeVideoIdClient(values.youtubeVideoId),
    [values.youtubeVideoId],
  );

  const durationSec =
    parseNonNegInt(values.durationMin) * 60 + parseNonNegInt(values.durationSecPart);
  const watchPct = clampWatchPct(Number.parseInt(values.watchPct, 10));
  const requiredWatchSec = requiredWatchSecFrom(durationSec, watchPct);

  useEffect(() => {
    setThumbBroken(false);
  }, [parsedId]);

  function handleDurationFieldChange(
    field: 'durationMin' | 'durationSecPart',
    raw: string,
  ) {
    setValues((prev) => {
      const next = { ...prev, [field]: raw };
      if (!watchTargetTouched) {
        next.watchPct = String(DEFAULT_WATCH_PCT);
      }
      return next;
    });
  }

  function handleResetWatchTarget() {
    setWatchTargetTouched(false);
    setValues((prev) => ({ ...prev, watchPct: String(DEFAULT_WATCH_PCT) }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (durationSec < 1) return;
    if (requiredWatchSec < 1 || requiredWatchSec > durationSec) return;

    const input: CreateLessonInput = {
      title: values.title.trim(),
      description: values.description.trim(),
      youtubeVideoId: values.youtubeVideoId.trim(),
      durationSec,
      isOptional: values.isOptional,
    };

    if (watchTargetTouched) {
      input.requiredWatchSec = requiredWatchSec;
    } else if (lesson) {
      // Clear any prior admin override (Reset to 90% / never touched).
      input.requiredWatchSec = null;
    }

    onSubmit(input);
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} size="lg">
      <ModalHeader
        title={lesson ? 'Edit lesson' : 'Add lesson'}
        description="Paste a YouTube URL or 11-character video ID. Duration drives the completion threshold."
      />
      <form onSubmit={handleSubmit}>
        <ModalBody className="flex flex-col gap-4">
          <Input
            label="Title"
            required
            value={values.title}
            onChange={(event) => setValues((prev) => ({ ...prev, title: event.target.value }))}
          />
          <Textarea
            label="Description"
            required
            rows={4}
            value={values.description}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, description: event.target.value }))
            }
          />
          <Input
            label="YouTube URL or video ID"
            required
            value={values.youtubeVideoId}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, youtubeVideoId: event.target.value }))
            }
            hint={
              parsedId
                ? `Parsed video ID: ${parsedId}`
                : 'Accepts watch, youtu.be, embed, shorts, or a bare ID'
            }
            error={
              values.youtubeVideoId.trim() && !parsedId
                ? 'Could not parse a YouTube video ID yet'
                : undefined
            }
          />
          <div className="overflow-hidden rounded-md border border-border bg-neutral-100">
            {parsedId && !thumbBroken ? (
              <img
                src={youtubeThumbnailUrl(parsedId)}
                alt="YouTube thumbnail preview"
                className="h-40 w-full object-cover"
                onError={() => setThumbBroken(true)}
              />
            ) : (
              <div className="flex h-40 flex-col items-center justify-center gap-2 text-fg-muted">
                <ImageOff className="size-8" aria-hidden />
                <p className="text-sm">
                  {parsedId ? 'Thumbnail unavailable' : 'Thumbnail preview appears after a valid URL'}
                </p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Duration (minutes)"
              required
              type="number"
              min={0}
              step={1}
              value={values.durationMin}
              onChange={(event) =>
                handleDurationFieldChange('durationMin', event.target.value)
              }
            />
            <Input
              label="Duration (seconds)"
              required
              type="number"
              min={0}
              max={59}
              step={1}
              value={values.durationSecPart}
              onChange={(event) =>
                handleDurationFieldChange('durationSecPart', event.target.value)
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <Input
              label="Required watch (%)"
              required
              type="number"
              min={1}
              max={100}
              step={1}
              value={values.watchPct}
              onChange={(event) => {
                setWatchTargetTouched(true);
                setValues((prev) => ({ ...prev, watchPct: event.target.value }));
              }}
            />
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-sm leading-body text-fg-muted">
                {durationSec >= 1 ? (
                  <>
                    Learners must watch{' '}
                    <span className="font-medium text-fg">{formatClock(requiredWatchSec)}</span>
                    {' of '}
                    <span className="font-medium text-fg">{formatClock(durationSec)}</span>
                    {' to complete this lesson and earn its '}
                    {RULES.VIDEO_POINTS} points.
                  </>
                ) : (
                  'Enter a duration to see how much learners must watch.'
                )}
              </p>
              <Button
                type="button"
                variant="ghost"
                onClick={handleResetWatchTarget}
                disabled={!watchTargetTouched}
              >
                Reset to 90%
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Checkbox
              label="Optional lesson"
              checked={values.isOptional}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, isOptional: event.target.checked }))
              }
            />
            <p className="pl-6 text-sm text-fg-muted">
              Mark skippable for broken, removed, or non-essential videos so learners know they
              can move on without completing it.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={!parsedId}>
            {lesson ? 'Save lesson' : 'Add lesson'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
