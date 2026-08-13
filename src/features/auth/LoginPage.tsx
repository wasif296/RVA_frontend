import { Navigate } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '../../design-system';
import { AuthShell } from '../../layouts/AuthShell';
import { useAuthStore } from '../../store/auth';
import { LoginForm } from './components/LoginForm';
import { postLoginRedirect } from './hooks';

export function LoginPage() {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);

  if (status === 'authenticated' && user) {
    return <Navigate to={postLoginRedirect(user)} replace />;
  }

  return (
    <AuthShell>
      <Card className="w-full max-w-md shadow-md">
        <CardHeader>
          <h1 className="font-display text-3xl text-fg">Sign in</h1>
          <p className="text-sm text-fg-muted">
            One login for learners and administrators. Your role opens the right workspace.
          </p>
        </CardHeader>
        <CardBody>
          <LoginForm />
        </CardBody>
      </Card>
    </AuthShell>
  );
}
