import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import {
  Badge,
  ErrorState,
  Input,
  Pagination,
  Select,
  Table,
  type TableColumn,
} from '../../design-system';
import { formatDateTime } from '../../lib/format';
import type {
  AdminExamSubmissionListItem,
  ExamSubmissionStatus,
  ExamSubmissionsListParams,
} from './grading.api';
import { useExamSubmissionsQuery } from './grading.hooks';

const PAGE_SIZE = 20;

export function GradingQueuePage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ExamSubmissionStatus>('submitted');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const params: ExamSubmissionsListParams = {
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    status,
  };

  const listQuery = useExamSubmissionsQuery(params);

  const columns = useMemo<TableColumn<AdminExamSubmissionListItem>[]>(
    () => [
      {
        key: 'learner',
        header: 'Learner',
        render: (row) => (
          <Link
            to={`/admin/grading/${row.id}`}
            className="font-medium text-brand-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {row.learner.name}
          </Link>
        ),
      },
      {
        key: 'course',
        header: 'Course',
        render: (row) => row.course.title,
      },
      {
        key: 'submittedAt',
        header: 'Submitted',
        render: (row) => formatDateTime(row.submittedAt),
      },
      {
        key: 'status',
        header: 'Status',
        render: (row) => (
          <Badge
            variant={row.status === 'graded' ? 'success' : 'warning'}
            size="sm"
          >
            {row.status === 'graded' ? 'Graded' : 'Ungraded'}
          </Badge>
        ),
      },
    ],
    [],
  );

  const totalPages = Math.max(
    1,
    Math.ceil((listQuery.data?.meta.total ?? 0) / PAGE_SIZE),
  );
  const ungradedCount = listQuery.data?.meta.ungradedCount;

  return (
    <div className="section-stack">
      <header className="page-header">
        <div className="page-header__copy">
          <h1 className="page-header__title">Grading</h1>
          <p className="page-header__subtitle">
            Review written final exam submissions and award marks.
            {typeof ungradedCount === 'number' ? (
              <>
                {' '}
                <span className="font-medium text-fg">
                  {ungradedCount} ungraded
                </span>
                .
              </>
            ) : null}
          </p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Search"
          placeholder="Learner name or email"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <Select
          label="Status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as ExamSubmissionStatus);
            setPage(1);
          }}
        >
          <option value="submitted">Ungraded</option>
          <option value="graded">Graded</option>
        </Select>
      </div>

      {listQuery.isError ? (
        <ErrorState
          title="Could not load submissions"
          description="Check your connection and try again."
          onRetry={() => void listQuery.refetch()}
        />
      ) : (
        <div className="min-w-0 overflow-x-auto">
          <Table
            columns={columns}
            rows={listQuery.data?.data ?? []}
            loading={listQuery.isLoading}
            caption="Exam submissions"
            empty={{
              icon: <ClipboardList className="size-5" aria-hidden />,
              title:
                status === 'submitted'
                  ? 'No ungraded submissions'
                  : 'No submissions found',
              description: 'Try adjusting status or search.',
            }}
          />
        </div>
      )}

      {!listQuery.isLoading &&
      !listQuery.isError &&
      (listQuery.data?.meta.total ?? 0) > 0 ? (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      ) : null}
    </div>
  );
}
