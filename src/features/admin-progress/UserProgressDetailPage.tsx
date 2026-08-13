import { Link, useLocation, useParams } from 'react-router-dom';
import { ErrorState, Skeleton } from '../../design-system';
import { ProgressDetailView } from '../progress/ProgressPage';
import { useAdminUserProgressQuery } from './admin-progress.hooks';

type LocationState = {
  name?: string;
  email?: string;
};

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton variant="rect" height="xl" className="h-16" />
      <Skeleton width="lg" height="lg" className="max-w-xs" />
      <Skeleton variant="rect" height="xl" className="h-48" />
    </div>
  );
}

export function UserProgressDetailPage() {
  const { userId = '' } = useParams<{ userId: string }>();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? {};
  const progressQuery = useAdminUserProgressQuery(userId);

  if (progressQuery.isLoading) {
    return <DetailSkeleton />;
  }

  if (progressQuery.isError || !progressQuery.data) {
    return (
      <ErrorState
        title="Could not load learner progress"
        description="Check your connection and try again."
        onRetry={() => void progressQuery.refetch()}
      />
    );
  }

  const name = state.name?.trim() || 'Learner';
  const email = state.email?.trim();

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-3">
        <p className="text-sm text-brand-900">
          Viewing progress for <span className="font-medium">{name}</span>
          {email ? ` (${email})` : ''}
        </p>
        <Link
          to="/admin/progress"
          className="mt-1 inline-block text-sm text-brand-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Back to all learners
        </Link>
      </div>

      <ProgressDetailView
        detail={progressQuery.data}
        heading={`${name}'s progress`}
        description="Admin view of this learner’s courses, exam results, and badges."
      />
    </div>
  );
}
