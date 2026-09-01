import { useEffect, useMemo, useState } from 'react';
import { BookOpen, ImageOff, MoreHorizontal } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { CourseLevel, CourseStatus } from '@shared';
import {
  Badge,
  Button,
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  ErrorState,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Pagination,
  Select,
  Table,
  type TableColumn,
} from '../../design-system';
import { formatPoints } from '../../lib/format';
import { CourseStatusBadge } from './components/CourseStatusBadge';
import {
  useCourseDeletionImpact,
  useCoursesQuery,
  useDeleteCourse,
  useUpdateCourse,
} from './hooks';
import type { AdminCourse, ListCoursesParams } from './types';

function isIncompleteDraft(course: AdminCourse): boolean {
  return course.status === 'draft' && course.lessonCount === 0;
}

function ThumbnailCell({ course }: { course: AdminCourse }) {
  const [broken, setBroken] = useState(false);
  const url = course.thumbnailUrl;

  if (!url || broken) {
    return (
      <div className="flex size-12 items-center justify-center rounded bg-neutral-100 text-fg-muted">
        <ImageOff className="size-4" aria-hidden />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt=""
      className="size-12 rounded object-cover"
      onError={() => setBroken(true)}
    />
  );
}

function CourseRowActions({ course }: { course: AdminCourse }) {
  const navigate = useNavigate();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const impactQuery = useCourseDeletionImpact(course.id, confirmDelete);

  return (
    <>
      <div className="inline-flex w-fit">
        <Dropdown
          align="end"
          trigger={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={`Actions for ${course.title}`}
              rightIcon={<MoreHorizontal className="size-4" aria-hidden />}
            >
              Actions
            </Button>
          }
        >
          <DropdownItem onSelect={() => navigate(`/admin/courses/${course.id}`)}>
            Edit
          </DropdownItem>
          {isIncompleteDraft(course) ? (
            <DropdownItem
              onSelect={() => navigate(`/admin/courses/${course.id}/new?step=lessons`)}
            >
              Resume create wizard
            </DropdownItem>
          ) : null}
          {course.status !== 'published' ? (
            <DropdownItem
              onSelect={() =>
                updateCourse.mutate({
                  id: course.id,
                  input: { status: 'published' },
                })
              }
            >
              Publish
            </DropdownItem>
          ) : null}
          {course.status === 'published' ? (
            <DropdownItem
              onSelect={() =>
                updateCourse.mutate({
                  id: course.id,
                  input: { status: 'draft' },
                })
              }
            >
              Unpublish
            </DropdownItem>
          ) : null}
          {course.status !== 'archived' ? (
            <DropdownItem
              onSelect={() =>
                updateCourse.mutate({
                  id: course.id,
                  input: { status: 'archived' },
                })
              }
            >
              Archive
            </DropdownItem>
          ) : null}
          <DropdownSeparator />
          <DropdownItem destructive onSelect={() => setConfirmDelete(true)}>
            Delete permanently
          </DropdownItem>
        </Dropdown>
      </div>

      <Modal open={confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(false)}>
        <ModalHeader
          title="Delete this course permanently?"
          description={`“${course.title}” will be erased. This cannot be undone.`}
        />
        <ModalBody>
          <div className="flex flex-col gap-3 text-sm text-fg-muted">
            <p>
              Archive instead if you want to hide the course and keep learner history.
            </p>
            <p>Permanently deleting destroys:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>The course, all lessons, quizzes, and the final exam</li>
              <li>Every learner’s progress for this course</li>
              <li>Quiz attempts, exam submissions, and course badges</li>
            </ul>
            {impactQuery.isError ? (
              <p className="text-danger" role="alert">
                Could not load how many learners and points are affected. Cancel and try again.
              </p>
            ) : impactQuery.isLoading || !impactQuery.data ? (
              <p>Checking how many learners have progress…</p>
            ) : (
              <p>
                {impactQuery.data.learnersWithProgress}{' '}
                {impactQuery.data.learnersWithProgress === 1 ? 'learner has' : 'learners have'}{' '}
                progress. {formatPoints(impactQuery.data.pointsAtStake)} pts will be subtracted
                from those learners’ totals so remaining points still match visible courses.
              </p>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            loading={deleteCourse.isPending}
            disabled={impactQuery.isLoading || impactQuery.isError || !impactQuery.data}
            onClick={() => {
              deleteCourse.mutate(course.id, {
                onSuccess: () => setConfirmDelete(false),
              });
            }}
          >
            Delete permanently
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

export function CoursesListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState<ListCoursesParams['level']>('');
  const [status, setStatus] = useState<ListCoursesParams['status'] | 'incomplete'>('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setCategory(categoryInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput, categoryInput]);

  const incompleteOnly = status === 'incomplete';
  const params: ListCoursesParams = {
    page: incompleteOnly ? 1 : page,
    // Incomplete drafts are filtered client-side from draft rows (no API param).
    limit: incompleteOnly ? 100 : 20,
    search: search || undefined,
    category: category || undefined,
    level: level || undefined,
    status: incompleteOnly ? 'draft' : status || undefined,
  };

  const coursesQuery = useCoursesQuery(params);

  const rows = useMemo(() => {
    const data = coursesQuery.data?.data ?? [];
    if (!incompleteOnly) return data;
    return data.filter(isIncompleteDraft);
  }, [coursesQuery.data?.data, incompleteOnly]);

  const columns = useMemo<TableColumn<AdminCourse>[]>(
    () => [
      {
        key: 'thumbnail',
        header: '',
        render: (row) => <ThumbnailCell course={row} />,
      },
      {
        key: 'title',
        header: 'Title',
        render: (row) => (
          <Link
            to={`/admin/courses/${row.id}`}
            className="font-medium text-brand-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {row.title}
          </Link>
        ),
      },
      {
        key: 'category',
        header: 'Category',
        render: (row) => row.category,
      },
      {
        key: 'level',
        header: 'Level',
        render: (row) => row.level.charAt(0).toUpperCase() + row.level.slice(1),
      },
      {
        key: 'status',
        header: 'Status',
        render: (row) => (
          <div className="flex flex-wrap items-center gap-2">
            <CourseStatusBadge status={row.status} />
            {isIncompleteDraft(row) ? (
              <Badge variant="warning" size="sm">
                Incomplete
              </Badge>
            ) : null}
          </div>
        ),
      },
      {
        key: 'lessonCount',
        header: 'Lessons',
        render: (row) => row.lessonCount,
      },
      {
        key: 'actions',
        header: 'Actions',
        align: 'right',
        render: (row) => <CourseRowActions course={row} />,
      },
    ],
    [],
  );

  const totalPages = Math.max(1, Math.ceil((coursesQuery.data?.meta.total ?? 0) / 20));

  return (
    <div className="section-stack">
      <header className="page-header">
        <div className="page-header__copy">
          <h1 className="page-header__title">Courses</h1>
          <p className="page-header__subtitle">
            Create and publish academy courses. Lessons and quizzes come next.
          </p>
        </div>
        <div className="page-header__actions">
          <Button type="button" onClick={() => navigate('/admin/courses/new')}>
            New course
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Input
          label="Search"
          placeholder="Title, description, or category"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <Input
          label="Category"
          placeholder="Filter by category"
          value={categoryInput}
          onChange={(event) => setCategoryInput(event.target.value)}
        />
        <Select
          label="Level"
          value={level}
          onChange={(event) => {
            setLevel(event.target.value as CourseLevel | '');
            setPage(1);
          }}
        >
          <option value="">All levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </Select>
        <Select
          label="Status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as CourseStatus | '' | 'incomplete');
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
          <option value="incomplete">Incomplete drafts</option>
        </Select>
      </div>

      {incompleteOnly ? (
        <p className="text-sm text-fg-muted" role="note">
          Showing draft courses with zero lessons (abandoned or unfinished create flows).
          Nothing is auto-deleted — remove them from Actions when you are sure.
        </p>
      ) : null}

      {coursesQuery.isError ? (
        <ErrorState
          title="Could not load courses"
          description="Check your connection and try again."
          onRetry={() => void coursesQuery.refetch()}
        />
      ) : (
        <Table
          columns={columns}
          rows={rows}
          loading={coursesQuery.isLoading}
          caption="Academy courses"
          empty={{
            icon: <BookOpen className="size-5" aria-hidden />,
            title: incompleteOnly ? 'No incomplete drafts' : 'No courses found',
            description: incompleteOnly
              ? 'Every draft either has lessons or there are no drafts yet.'
              : 'Try adjusting filters, or create the first course.',
            action: incompleteOnly ? undefined : (
              <Button type="button" size="sm" onClick={() => navigate('/admin/courses/new')}>
                New course
              </Button>
            ),
          }}
        />
      )}

      {!incompleteOnly &&
      !coursesQuery.isLoading &&
      !coursesQuery.isError &&
      (coursesQuery.data?.meta.total ?? 0) > 0 ? (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      ) : null}
    </div>
  );
}
