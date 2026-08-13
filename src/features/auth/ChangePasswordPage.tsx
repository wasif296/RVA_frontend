import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Card, CardBody, CardHeader, Input } from '../../design-system';
import { AuthShell } from '../../layouts/AuthShell';
import { ApiError } from '../../lib/apiClient';
import { useChangePassword } from './hooks';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(12, 'Password must be at least 12 characters'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

function changePasswordErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'RATE_LIMITED') {
      return 'Too many attempts. Please try again shortly.';
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

export function ChangePasswordPage() {
  const changePassword = useChangePassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  return (
    <AuthShell>
      <Card className="w-full max-w-md shadow-md">
        <CardHeader>
          <h1 className="font-display text-3xl text-fg">Change password</h1>
          <p className="text-sm text-fg-muted">
            Choose a new password of at least 12 characters, then sign in again.
          </p>
        </CardHeader>
        <CardBody>
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit((values) => {
              changePassword.mutate({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
              });
            })}
            noValidate
          >
            <Input
              label="Current password"
              type="password"
              autoComplete="current-password"
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
            />
            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <Input
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {changePassword.error ? (
              <p className="text-sm text-danger" role="alert">
                {changePasswordErrorMessage(changePassword.error)}
              </p>
            ) : null}

            <Button type="submit" loading={changePassword.isPending} className="w-full">
              Update password
            </Button>
          </form>
        </CardBody>
      </Card>
    </AuthShell>
  );
}
