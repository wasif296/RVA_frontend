import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '../../../lib/cn';

const THUMB_WIDTH = 1280;
const THUMB_HEIGHT = 720;

type CourseThumbnailProps = {
  src: string | null | undefined;
  alt?: string;
  className?: string;
};

export function CourseThumbnail({ src, alt = '', className }: CourseThumbnailProps) {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [src]);

  const showImage = Boolean(src) && !broken;

  return (
    <div
      className={cn(
        'relative aspect-video w-full overflow-hidden bg-surface-muted',
        className,
      )}
    >
      {showImage ? (
        <img
          src={src!}
          alt={alt}
          width={THUMB_WIDTH}
          height={THUMB_HEIGHT}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-linear-to-br from-brand-50 via-surface to-accent-50 text-fg-muted">
          <ImageOff className="size-8 text-brand-500" aria-hidden />
          <span className="text-sm">No thumbnail</span>
        </div>
      )}
    </div>
  );
}
