import { createBrowserRouter } from 'react-router-dom';
import { DevGalleryPage } from '../App';
import { Card, CardBody } from '../design-system';
import { CourseEditorPage } from '../features/admin-courses/CourseEditorPage';
import { CourseCreateWizardPage } from '../features/admin-courses/CourseCreateWizardPage';
import { CoursesListPage } from '../features/admin-courses/CoursesListPage';
import { GradingQueuePage } from '../features/admin-grading/GradingQueuePage';
import { SubmissionDetailPage } from '../features/admin-grading/SubmissionDetailPage';
import { AdminProgressPage } from '../features/admin-progress/AdminProgressPage';
import { UserProgressDetailPage } from '../features/admin-progress/UserProgressDetailPage';
import { UsersListPage } from '../features/admin-users/UsersListPage';
import { ChangePasswordPage } from '../features/auth/ChangePasswordPage';
import { LoginPage } from '../features/auth/LoginPage';
import { CourseCatalogPage } from '../features/courses/CourseCatalogPage';
import { CourseDetailPage } from '../features/courses/CourseDetailPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { LearningPage } from '../features/learning/LearningPage';
import { ProgressPage } from '../features/progress/ProgressPage';
import { FinalExamPage } from '../features/quiz/FinalExamPage';
import { QuizPage } from '../features/quiz/QuizPage';
import { QuizResultPage } from '../features/quiz/QuizResultPage';
import { AdminShell } from '../layouts/AdminShell';
import { AppShell } from '../layouts/AppShell';
import { useAuthStore } from '../store/auth';
import {
  NotFoundPage,
  RequireAuth,
  RequirePasswordCurrent,
  RequireRole,
} from './guards';

function PlaceholderAdmin() {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-3xl text-fg">Admin overview</h1>
      <p className="text-fg-muted">
        Placeholder overview — manage users from the Users nav item. Full admin tools arrive later.
      </p>
      <Card>
        <CardBody>
          <p className="text-base text-fg">
            Signed in as {user.name} ({user.email})
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/dev/gallery',
    element: <DevGalleryPage />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <RequirePasswordCurrent />,
        children: [
          {
            path: '/change-password',
            element: <ChangePasswordPage />,
          },
          {
            element: <RequireRole role="user" />,
            children: [
              {
                element: <AppShell />,
                children: [
                  {
                    path: '/',
                    element: <DashboardPage />,
                  },
                  {
                    path: '/courses',
                    element: <CourseCatalogPage />,
                  },
                  {
                    path: '/courses/:courseId',
                    element: <CourseDetailPage />,
                  },
                  {
                    path: '/learn/:courseId/:lessonId',
                    element: <LearningPage />,
                  },
                  {
                    path: '/learn/:courseId/:lessonId/quiz',
                    element: <QuizPage />,
                  },
                  {
                    path: '/learn/:courseId/:lessonId/quiz/result/:attemptId',
                    element: <QuizResultPage />,
                  },
                  {
                    path: '/exam/:courseId',
                    element: <FinalExamPage />,
                  },
                  {
                    path: '/progress',
                    element: <ProgressPage />,
                  },
                ],
              },
            ],
          },
          {
            element: <RequireRole role="super_admin" />,
            children: [
              {
                element: <AdminShell />,
                children: [
                  {
                    path: '/admin',
                    element: <PlaceholderAdmin />,
                  },
                  {
                    path: '/admin/users',
                    element: <UsersListPage />,
                  },
                  {
                    path: '/admin/progress',
                    element: <AdminProgressPage />,
                  },
                  {
                    path: '/admin/progress/:userId',
                    element: <UserProgressDetailPage />,
                  },
                  {
                    path: '/admin/grading',
                    element: <GradingQueuePage />,
                  },
                  {
                    path: '/admin/grading/:id',
                    element: <SubmissionDetailPage />,
                  },
                  {
                    path: '/admin/courses',
                    element: <CoursesListPage />,
                  },
                  {
                    path: '/admin/courses/new',
                    element: <CourseCreateWizardPage />,
                  },
                  {
                    path: '/admin/courses/:id/new',
                    element: <CourseCreateWizardPage />,
                  },
                  {
                    path: '/admin/courses/:id',
                    element: <CourseEditorPage />,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
