import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Link,
  useBlocker,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import {
  Badge,
  Button,
  ErrorState,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast,
} from '../../design-system';
import { CourseForm } from './components/CourseForm';
import { LessonsTab } from './components/LessonsTab';
import { QuizzesTab } from './components/QuizzesTab';
import { useCourseQuery, useCreateCourse, useUpdateCourse } from './hooks';
import { useLessonsQuery } from './lessons.hooks';
import type { CourseFormValues, CreateCourseInput, UpdateCourseInput } from './types';

const WIZARD_STEPS = ['details', 'lessons', 'quizzes'] as const;
type WizardStep = (typeof WIZARD_STEPS)[number];

const emptyValues: CourseFormValues = {
  title: '',
  description: '',
  thumbnailUrl: '',
  category: '',
  level: 'beginner',
  status: 'draft',
};

function isWizardStep(value: string | null): value is WizardStep {
  return value === 'details' || value === 'lessons' || value === 'quizzes';
}

function formSnapshot(values: CourseFormValues): string {
  return JSON.stringify({
    title: values.title.trim(),
    description: values.description.trim(),
    thumbnailUrl: values.thumbnailUrl.trim(),
    category: values.category.trim(),
    level: values.level,
  });
}

function toDraftCreateInput(values: CourseFormValues): CreateCourseInput {
  const input: CreateCourseInput = {
    title: values.title.trim(),
    description: values.description.trim(),
    category: values.category.trim() || 'General',
    level: values.level,
    status: 'draft',
  };
  const thumb = values.thumbnailUrl.trim();
  if (thumb) input.thumbnailUrl = thumb;
  return input;
}

function toDraftUpdateInput(values: CourseFormValues): UpdateCourseInput {
  const thumb = values.thumbnailUrl.trim();
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    category: values.category.trim() || 'General',
    level: values.level,
    thumbnailUrl: thumb ? thumb : null,
  };
}

function wizardPath(courseId: string, step: WizardStep): string {
  return `/admin/courses/${courseId}/new?step=${step}`;
}

export function CourseCreateWizardPage() {
  const { id: routeId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const courseId =
    routeId && routeId !== 'new' ? routeId : undefined;
  const stepParam = searchParams.get('step');
  const step: WizardStep = courseId
    ? isWizardStep(stepParam)
      ? stepParam
      : 'details'
    : 'details';

  const courseQuery = useCourseQuery(courseId);
  const lessonsQuery = useLessonsQuery(courseId);
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();

  const [liveValues, setLiveValues] = useState<CourseFormValues>(emptyValues);
  const [baseline, setBaseline] = useState(() => formSnapshot(emptyValues));
  const continueLock = useRef(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const detailsDirty = formSnapshot(liveValues) !== baseline;
  const saving = createCourse.isPending || updateCourse.isPending;

  const initialValues = useMemo<CourseFormValues>(() => {
    if (!courseQuery.data?.course) return emptyValues;
    const course = courseQuery.data.course;
    return {
      title: course.title,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl ?? '',
      category: course.category,
      level: course.level,
      status: course.status,
    };
  }, [courseQuery.data]);

  useEffect(() => {
    if (!courseId || !courseQuery.data?.course) return;
    const next = initialValues;
    setLiveValues(next);
    setBaseline(formSnapshot(next));
  }, [courseId, courseQuery.data?.course?.id, initialValues]);

  const blocker = useBlocker(({ nextLocation }) => {
    if (!detailsDirty) return false;
    const next = nextLocation.pathname;
    // Allow moving between wizard steps / the same draft URL.
    if (courseId && next === `/admin/courses/${courseId}/new`) return false;
    if (!courseId && next === '/admin/courses/new') return false;
    return true;
  });

  useEffect(() => {
    if (blocker.state === 'blocked') {
      setLeaveOpen(true);
    }
  }, [blocker.state]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!detailsDirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [detailsDirty]);

  const goToStep = useCallback(
    (next: WizardStep) => {
      if (!courseId) {
        if (next !== 'details') return;
        navigate('/admin/courses/new', { replace: true });
        return;
      }
      navigate(wizardPath(courseId, next), { replace: true });
    },
    [courseId, navigate],
  );

  const handleDetailsContinue = (values: CourseFormValues) => {
    if (continueLock.current || saving) return;
    if (!values.title.trim() || !values.description.trim()) {
      toast({
        variant: 'error',
        title: 'Missing details',
        description: 'Title and description are required to continue.',
      });
      return;
    }

    continueLock.current = true;

    if (!courseId) {
      createCourse.mutate(toDraftCreateInput(values), {
        onSuccess: (result) => {
          const newId = result.course.id;
          setBaseline(formSnapshot(values));
          navigate(wizardPath(newId, 'lessons'), { replace: true });
        },
        onSettled: () => {
          continueLock.current = false;
        },
      });
      return;
    }

    const nextSnap = formSnapshot(values);
    if (nextSnap === baseline) {
      continueLock.current = false;
      goToStep('lessons');
      return;
    }

    updateCourse.mutate(
      { id: courseId, input: toDraftUpdateInput(values) },
      {
        onSuccess: () => {
          setBaseline(nextSnap);
          goToStep('lessons');
        },
        onSettled: () => {
          continueLock.current = false;
        },
      },
    );
  };

  const handlePublish = () => {
    if (!courseId || updateCourse.isPending) return;
    updateCourse.mutate(
      { id: courseId, input: { status: 'published' } },
      {
        onSuccess: () => {
          navigate('/admin/courses', { replace: true });
        },
      },
    );
  };

  const handleSaveDraftExit = () => {
    if (detailsDirty && courseId) {
      if (continueLock.current || saving) return;
      continueLock.current = true;
      updateCourse.mutate(
        { id: courseId, input: toDraftUpdateInput(liveValues) },
        {
          onSuccess: () => {
            setBaseline(formSnapshot(liveValues));
            navigate('/admin/courses', { replace: true });
          },
          onSettled: () => {
            continueLock.current = false;
          },
        },
      );
      return;
    }
    navigate('/admin/courses', { replace: true });
  };

  const lessonCount =
    lessonsQuery.data?.lessons.length ??
    courseQuery.data?.course.lessonCount ??
    0;

  if (courseId && courseQuery.isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <Spinner label="Loading course draft" />
      </div>
    );
  }

  if (courseId && courseQuery.isError) {
    return (
      <ErrorState
        title="Could not load this draft"
        description="It may have been deleted. Start a new course, or return to the list."
        onRetry={() => void courseQuery.refetch()}
      />
    );
  }

  const title = courseQuery.data?.course.title || liveValues.title || 'New course';

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
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl text-fg">{title}</h1>
            {courseId ? (
              <Badge variant="success" size="sm">
                Saved as draft
              </Badge>
            ) : (
              <Badge variant="neutral" size="sm">
                Not saved yet
              </Badge>
            )}
          </div>
          <p className="text-sm text-fg-muted">
            {courseId
              ? 'This course is saved. Add lessons and quizzes, then publish when ready.'
              : 'Enter the basics, then continue — we save a draft before lessons so nothing is lost.'}
          </p>
        </div>
      </div>

      <Tabs
        value={step}
        onValueChange={(value) => {
          if (!isWizardStep(value)) return;
          if (!courseId && value !== 'details') return;
          goToStep(value);
        }}
      >
        <TabsList aria-label="Course creation steps">
          <TabsTrigger value="details">1. Details</TabsTrigger>
          <TabsTrigger
            value="lessons"
            disabled={!courseId}
            title={!courseId ? 'Continue from details to unlock lessons' : undefined}
          >
            2. Lessons
          </TabsTrigger>
          <TabsTrigger
            value="quizzes"
            disabled={!courseId}
            title={!courseId ? 'Continue from details to unlock quizzes' : undefined}
          >
            3. Quizzes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="flex flex-col gap-4">
          <CourseForm
            key={courseId ?? 'unsaved'}
            initialValues={courseId ? initialValues : emptyValues}
            submitLabel="Continue to lessons"
            loading={saving}
            showStatus={false}
            categoryRequired={false}
            onValuesChange={setLiveValues}
            onCancel={() => {
              if (detailsDirty) {
                setLeaveOpen(true);
                return;
              }
              navigate('/admin/courses');
            }}
            onSubmit={handleDetailsContinue}
          />
        </TabsContent>

        <TabsContent value="lessons" className="flex flex-col gap-4">
          {courseId ? <LessonsTab courseId={courseId} /> : null}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface px-4 py-4">
            <p className="text-sm text-fg">
              {lessonCount} lesson{lessonCount === 1 ? '' : 's'} so far.
            </p>
            <p className="text-sm text-fg-muted">
              You can continue with zero lessons while this stays a draft. Publishing
              requires at least one lesson.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={() => goToStep('quizzes')}>
                Continue to quizzes
              </Button>
              <Button type="button" variant="ghost" onClick={() => goToStep('details')}>
                Back to details
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="quizzes" className="flex flex-col gap-4">
          {courseId ? <QuizzesTab courseId={courseId} /> : null}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface px-4 py-4">
            <p className="text-sm text-fg-muted">
              {lessonCount === 0
                ? 'Publishing needs at least one lesson. You can still save this draft and finish later.'
                : 'Ready when you are — publish for learners, or keep working as a draft.'}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                loading={updateCourse.isPending}
                onClick={handlePublish}
              >
                Publish course
              </Button>
              <Button
                type="button"
                variant="secondary"
                loading={saving}
                onClick={handleSaveDraftExit}
              >
                Save as draft and exit
              </Button>
              <Button type="button" variant="ghost" onClick={() => goToStep('lessons')}>
                Back to lessons
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Modal
        open={leaveOpen}
        onOpenChange={(open) => {
          if (!open) {
            setLeaveOpen(false);
            if (blocker.state === 'blocked') blocker.reset?.();
          }
        }}
      >
        <ModalHeader
          title="Leave without saving details?"
          description="You have unsaved changes on the details step. Leaving discards those field edits (the draft course itself stays if it was already created)."
        />
        <ModalBody>
          <p className="text-sm text-fg-muted">
            Continue editing to keep your latest title, description, and thumbnail changes.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setLeaveOpen(false);
              if (blocker.state === 'blocked') blocker.reset?.();
            }}
          >
            Stay
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              setLeaveOpen(false);
              setBaseline(formSnapshot(liveValues));
              if (blocker.state === 'blocked') {
                blocker.proceed?.();
                return;
              }
              navigate('/admin/courses');
            }}
          >
            Leave
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
