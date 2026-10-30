import { useEffect, useId, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import { ImageOff, Upload } from 'lucide-react';
import type { CourseLevel } from '@shared';
import { ApiError } from '../../../lib/apiClient';
import { Button, Input, Select, Textarea } from '../../../design-system';
import { uploadCourseThumbnail } from '../api';
import type { CourseFormValues } from '../types';

const LEVELS: CourseLevel[] = ['beginner', 'intermediate', 'advanced'];

// Browser-side size/type checks are convenience only — the server is the real check
// (magic bytes, re-encode, size limit). Do not treat this as security.
const MAX_CLIENT_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

type CourseFormProps = {
  initialValues: CourseFormValues;
  submitLabel: string;
  loading?: boolean;
  showStatus?: boolean;
  /** When false, category may be blank and is not HTML-required (API still gets a default). */
  categoryRequired?: boolean;
  onSubmit: (values: CourseFormValues) => void;
  onCancel?: () => void;
  /** Fires on every field change — used by the create wizard for dirty checks. */
  onValuesChange?: (values: CourseFormValues) => void;
};

export function CourseForm({
  initialValues,
  submitLabel,
  loading = false,
  showStatus = true,
  categoryRequired = true,
  onSubmit,
  onCancel,
  onValuesChange,
}: CourseFormProps) {
  const [values, setValues] = useState<CourseFormValues>(initialValues);
  const [thumbBroken, setThumbBroken] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();

  useEffect(() => {
    setValues(initialValues);
    setThumbBroken(false);
    setLocalPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setUploadProgress(null);
    setUploadError(null);
  }, [initialValues]);

  useEffect(() => {
    onValuesChange?.(values);
  }, [values, onValuesChange]);

  useEffect(() => {
    setThumbBroken(false);
  }, [values.thumbnailUrl, localPreview]);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(values);
  }

  function validateClientFile(file: File): string | null {
    if (!ACCEPTED_TYPES.has(file.type)) {
      return 'Only JPEG, PNG, and WebP images are accepted.';
    }
    if (file.size > MAX_CLIENT_BYTES) {
      return 'File too large. Maximum size is 5MB.';
    }
    return null;
  }

  async function handleFile(file: File) {
    setUploadError(null);
    const clientError = validateClientFile(file);
    if (clientError) {
      setUploadError(clientError);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return objectUrl;
    });
    setUploadProgress(0);

    try {
      const { url, publicId } = await uploadCourseThumbnail(file, {
        onProgress: setUploadProgress,
      });
      setValues((prev) => ({
        ...prev,
        thumbnailUrl: url,
        thumbnailPublicId: publicId ?? '',
      }));
      setUploadProgress(null);
      setLocalPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    } catch (error) {
      setUploadProgress(null);
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Upload failed';
      setUploadError(message);
    }
  }

  function onFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) void handleFile(file);
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  const previewUrl = localPreview ?? values.thumbnailUrl.trim();
  const showPreview = previewUrl.length > 0 && !thumbBroken;
  const uploading = uploadProgress !== null;

  return (
    <form className="flex max-w-2xl flex-col gap-5" onSubmit={handleSubmit}>
      <Input
        label="Title"
        required
        value={values.title}
        onChange={(event) => setValues((prev) => ({ ...prev, title: event.target.value }))}
      />
      <Textarea
        label="Description"
        required
        rows={5}
        value={values.description}
        onChange={(event) =>
          setValues((prev) => ({ ...prev, description: event.target.value }))
        }
      />

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-fg">Thumbnail</span>
        <p className="text-sm text-fg-muted">
          Upload an image, or paste an https URL if the file is already hosted.
        </p>

        <div
          role="button"
          tabIndex={0}
          aria-label="Upload course thumbnail"
          aria-disabled={uploading || loading}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              if (!uploading && !loading) fileInputRef.current?.click();
            }
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragging(false);
          }}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center gap-3 rounded-md border border-dashed px-4 py-8 transition-colors ${
            dragging
              ? 'border-accent-500 bg-accent-50'
              : 'border-border bg-neutral-50 hover:border-fg-muted'
          } ${uploading || loading ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
          onClick={() => {
            if (!uploading && !loading) fileInputRef.current?.click();
          }}
        >
          <Upload className="size-8 text-fg-muted" aria-hidden />
          <p className="text-center text-sm text-fg">
            Drag and drop an image here, or{' '}
            <span className="font-medium text-accent-700 underline">browse</span>
          </p>
          <p className="text-xs text-fg-muted">JPEG, PNG, or WebP · max 5MB</p>
        </div>

        <input
          ref={fileInputRef}
          id={fileInputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={uploading || loading}
          onChange={onFileInputChange}
        />

        {uploading ? (
          <div className="flex flex-col gap-1" aria-live="polite">
            <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full bg-accent-500 transition-[width] duration-150"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-fg-muted">Uploading… {uploadProgress}%</p>
          </div>
        ) : null}

        {uploadError ? (
          <p className="text-sm text-danger" role="alert">
            {uploadError}
          </p>
        ) : null}

        <Input
          label="Or paste thumbnail URL"
          hint="https URL, or leave blank and upload above."
          type="text"
          inputMode="url"
          placeholder="https://…"
          value={values.thumbnailUrl}
          onChange={(event) => {
            setUploadError(null);
            setValues((prev) => ({
              ...prev,
              thumbnailUrl: event.target.value,
              thumbnailPublicId: '',
            }));
          }}
        />
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-neutral-100">
        {showPreview ? (
          <img
            src={previewUrl}
            alt="Course thumbnail preview"
            className="h-40 w-full object-cover"
            onError={() => setThumbBroken(true)}
          />
        ) : (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-fg-muted">
            <ImageOff className="size-8" aria-hidden />
            <p className="text-sm">
              {previewUrl ? 'Preview unavailable' : 'No thumbnail yet'}
            </p>
          </div>
        )}
      </div>
      <Input
        label="Category"
        required={categoryRequired}
        hint={categoryRequired ? undefined : 'Optional — defaults to General if left blank.'}
        value={values.category}
        onChange={(event) => setValues((prev) => ({ ...prev, category: event.target.value }))}
      />
      <Select
        label="Level"
        required
        value={values.level}
        onChange={(event) =>
          setValues((prev) => ({
            ...prev,
            level: event.target.value as CourseLevel,
          }))
        }
      >
        {LEVELS.map((level) => (
          <option key={level} value={level}>
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </option>
        ))}
      </Select>
      {showStatus ? (
        <Select
          label="Status"
          value={values.status}
          onChange={(event) =>
            setValues((prev) => ({
              ...prev,
              status: event.target.value as CourseFormValues['status'],
            }))
          }
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </Select>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={loading || uploading}>
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
