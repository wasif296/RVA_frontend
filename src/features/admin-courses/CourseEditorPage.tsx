import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ErrorState,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../design-system';
import { CourseForm } from './components/CourseForm';
import { CourseStatusBadge } from './components/CourseStatusBadge';
import { FinalExamTab } from './components/FinalExamTab';
import { LessonsTab } from './components/LessonsTab';
import { QuizzesTab } from './components/QuizzesTab';
import { useCourseQuery, useUpdateCourse } from './hooks';
import type { CourseFormValues, UpdateCourseInput } from './types';

const emptyValues: CourseFormValues = {
  title: '',
  description: '',
  thumbnailUrl: '',
  thumbnailPublicId: '',
  category: '',
  level: 'beginner',
  status: 'draft',
};

function toUpdateInput(values: CourseFormValues): UpdateCourseInput {
  const thumb = values.thumbnailUrl.trim();
  const publicId = values.thumbnailPublicId.trim();
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    category: values.category.trim(),
    level: values.level,
    status: values.status,
    thumbnailUrl: thumb ? thumb : null,
    thumbnailPublicId: publicId ? publicId : null,
  };
}

/**
 * Existing-course editor at /admin/courses/:id.
 * Create flow lives on CourseCreateWizardPage (/new and /:id/new).
 */
export function CourseEditorPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const courseQuery = useCourseQuery(id);
  const updateCourse = useUpdateCourse();

  const initialValues = useMemo<CourseFormValues>(() => {
    if (!courseQuery.data?.course) return emptyValues;
    const course = courseQuery.data.course;
    return {
      title: course.title,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl ?? '',
      thumbnailPublicId: course.thumbnailPublicId ?? '',
      category: course.category,
      level: course.level,
      status: course.status,
    };
  }, [courseQuery.data]);

  if (courseQuery.isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <Spinner label="Loading course" />
      </div>
    );
  }

  if (courseQuery.isError) {
    return (
      <ErrorState
        title="Could not load course"
        description="This course may have been removed."
        onRetry={() => void courseQuery.refetch()}
      />
    );
  }

  const course = courseQuery.data?.course;
  if (!course) {
    return (
      <ErrorState
        title="Could not load course"
        description="This course may have been removed."
        onRetry={() => void courseQuery.refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Link
            to="/admin/courses"
            className="text-sm text-brand-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            ← Back to courses
          </Link>
          <h1 className="font-display text-3xl text-fg">{course.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-fg-muted">
            <CourseStatusBadge status={course.status} />
            {course.status === 'draft' && course.lessonCount === 0 ? (
              <span className="text-sm font-medium text-warning">Incomplete — no lessons yet</span>
            ) : null}
            <span>Slug: {course.slug}</span>
            <span>
              {course.lessonCount} lesson{course.lessonCount === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="final-exam">Final exam</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <CourseForm
            key={course.id}
            initialValues={initialValues}
            submitLabel="Save changes"
            loading={updateCourse.isPending}
            onCancel={() => navigate('/admin/courses')}
            onSubmit={(values) => {
              updateCourse.mutate({
                id: course.id,
                input: toUpdateInput(values),
              });
            }}
          />
        </TabsContent>

        <TabsContent value="lessons">
          <LessonsTab courseId={course.id} />
        </TabsContent>

        <TabsContent value="quizzes">
          <QuizzesTab courseId={course.id} />
        </TabsContent>

        <TabsContent value="final-exam">
          <FinalExamTab courseId={course.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
