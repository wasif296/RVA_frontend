import type { CourseStatus } from '@shared';
import { Badge } from '../../../design-system';

const labels: Record<CourseStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
};

const variants: Record<CourseStatus, 'neutral' | 'success' | 'warning'> = {
  draft: 'neutral',
  published: 'success',
  archived: 'warning',
};

type CourseStatusBadgeProps = {
  status: CourseStatus;
};

export function CourseStatusBadge({ status }: CourseStatusBadgeProps) {
  return (
    <Badge variant={variants[status]} size="sm">
      {labels[status]}
    </Badge>
  );
}
