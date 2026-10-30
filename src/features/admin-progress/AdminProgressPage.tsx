import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import {
  Badge,
  ErrorState,
  Input,
  Pagination,
  Select,
  Table,
  type TableColumn,
} from '../../design-system';
import { formatDateTime, formatPoints } from '../../lib/format';
import { listCourses } from '../admin-courses/api';
import type {
  AdminProgressListParams,
  AdminProgressRow,
} from './admin-progress.api';
import { useAdminProgressListQuery } from './admin-progress.hooks';

export function AdminProgressPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [courseId, setCourseId] = useState('');
  const [sort, setSort] = useState<NonNullable<AdminProgressListParams['sort']>>(
    '-totalPoints',
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const coursesQuery = useQuery({
    queryKey: ['admin-courses', 'progress-filter'],
    queryFn: () => listCourses({ page: 1, limit: 100, status: 'published' }),
  });

  const params: AdminProgressListParams = {
    page,
    limit: 20,
    search: search || undefined,
    courseId: courseId || undefined,
    sort,
  };

  const listQuery = useAdminProgressListQuery(params);

  const columns = useMemo<TableColumn<AdminProgressRow>[]>(
    () => [
      {
        key: 'name',
        header: 'Name',
        render: (row) => (
          <Link
            to={`/admin/progress/${row.userId}`}
            state={{ name: row.name, email: row.email }}
            className="font-medium text-brand-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {row.name}
          </Link>
        ),
      },
      {
        key: 'email',
        header: 'Email',
        render: (row) => row.email,
      },
      {
        key: 'status',
        header: 'Status',
        render: (row) => (
          <Badge variant={row.isActive ? 'success' : 'warning'} size="sm">
            {row.isActive ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        key: 'coursesStarted',
        header: 'Courses started',
        align: 'right',
        render: (row) => row.coursesStarted,
      },
      {
        key: 'coursesCompleted',
        header: 'Courses completed',
        align: 'right',
        render: (row) => row.coursesCompleted,
      },
      {
        key: 'lessonsCompleted',
        header: 'Lessons completed',
        align: 'right',
        render: (row) => row.lessonsCompleted,
      },
      {
        key: 'totalPoints',
        header: 'Points',
        align: 'right',
        render: (row) => (
          <span className="font-medium text-fg">{formatPoints(row.totalPoints)}</span>
        ),
      },
      {
        key: 'lastActivityAt',
        header: 'Last activity',
        render: (row) => formatDateTime(row.lastActivityAt),
      },
    ],
    [],
  );

  const totalPages = Math.max(1, Math.ceil((listQuery.data?.meta.total ?? 0) / 20));

  return (
    <div className="section-stack">
      <header className="page-header">
        <div className="page-header__copy">
          <h1 className="page-header__title">Progress</h1>
          <p className="page-header__subtitle">
            Learner points and completion across the academy.
          </p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Input
          label="Search"
          placeholder="Name or email"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <Select
          label="Course"
          value={courseId}
          onChange={(event) => {
            setCourseId(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All courses</option>
          {(coursesQuery.data?.data ?? []).map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </Select>
        <Select
          label="Sort"
          value={sort}
          onChange={(event) => {
            setSort(event.target.value as NonNullable<AdminProgressListParams['sort']>);
            setPage(1);
          }}
        >
          <option value="-totalPoints">Points (high to low)</option>
          <option value="totalPoints">Points (low to high)</option>
          <option value="-lastActivityAt">Last activity (newest)</option>
          <option value="lastActivityAt">Last activity (oldest)</option>
        </Select>
      </div>

      {listQuery.isError ? (
        <ErrorState
          title="Could not load progress"
          description="Check your connection and try again."
          onRetry={() => void listQuery.refetch()}
        />
      ) : (
        <div className="min-w-0 overflow-x-auto">
          <Table
            columns={columns}
            rows={listQuery.data?.data ?? []}
            loading={listQuery.isLoading}
            caption="Learner progress"
            empty={{
              icon: <Users className="size-5" aria-hidden />,
              title: 'No learners found',
              description: 'Try adjusting search or course filter.',
            }}
          />
        </div>
      )}

      {!listQuery.isLoading && !listQuery.isError && (listQuery.data?.meta.total ?? 0) > 0 ? (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      ) : null}
    </div>
  );
}
