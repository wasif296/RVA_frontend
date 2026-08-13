import { useState } from 'react';
import { ArrowDown, ArrowUp, ImageOff, MoreHorizontal } from 'lucide-react';
import {
  Badge,
  Button,
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '../../../design-system';
import {
  youtubeThumbnailUrl,
  type AdminLesson,
} from '../lessons.api';
import { formatDuration } from '../../../lib/format';

type LessonRowProps = {
  lesson: AdminLesson;
  index: number;
  total: number;
  reorderPending?: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function LessonRow({
  lesson,
  index,
  total,
  reorderPending = false,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: LessonRowProps) {
  const [thumbBroken, setThumbBroken] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <li className="flex flex-wrap items-center gap-4 border-b border-border py-4 last:border-b-0">
        <div className="flex shrink-0 flex-col gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Move ${lesson.title} up`}
            disabled={index === 0 || reorderPending}
            onClick={onMoveUp}
            leftIcon={<ArrowUp className="size-4" aria-hidden />}
          >
            Up
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Move ${lesson.title} down`}
            disabled={index >= total - 1 || reorderPending}
            onClick={onMoveDown}
            leftIcon={<ArrowDown className="size-4" aria-hidden />}
          >
            Down
          </Button>
        </div>

        <div className="size-20 shrink-0 overflow-hidden rounded-md bg-neutral-100">
          {!thumbBroken ? (
            <img
              src={youtubeThumbnailUrl(lesson.youtubeVideoId)}
              alt=""
              className="size-full object-cover"
              onError={() => setThumbBroken(true)}
            />
          ) : (
            <div className="flex size-full items-center justify-center text-fg-muted">
              <ImageOff className="size-5" aria-hidden />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-fg">{lesson.title}</p>
            {lesson.isOptional ? (
              <Badge variant="warning" size="sm">
                Optional
              </Badge>
            ) : null}
            {lesson.hasQuiz ? (
              <Badge variant="brand" size="sm">
                Quiz
              </Badge>
            ) : (
              <Badge variant="neutral" size="sm">
                No quiz
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-fg-muted">
            {formatDuration(lesson.durationSec)} · watch {lesson.requiredWatchSec}s · order{' '}
            {lesson.order}
          </p>
        </div>

        <div className="inline-flex w-fit">
          <Dropdown
            align="end"
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`Actions for ${lesson.title}`}
                rightIcon={<MoreHorizontal className="size-4" aria-hidden />}
              >
                Actions
              </Button>
            }
          >
            <DropdownItem onSelect={onEdit}>Edit</DropdownItem>
            <DropdownSeparator />
            <DropdownItem destructive onSelect={() => setConfirmDelete(true)}>
              Delete
            </DropdownItem>
          </Dropdown>
        </div>
      </li>

      <Modal open={confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(false)}>
        <ModalHeader
          title="Delete lesson?"
          description={`“${lesson.title}” and its quiz (if any) will be removed. Learner progress for this lesson will be pruned.`}
        />
        <ModalBody>
          <p className="text-sm text-fg-muted">
            If this is the last lesson on a published course, delete will be refused — unpublish
            first.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              setConfirmDelete(false);
              onDelete();
            }}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
