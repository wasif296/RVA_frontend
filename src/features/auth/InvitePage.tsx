import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  ErrorState,
  Input,
  Spinner,
} from '../../design-system';
import { AuthShell } from '../../layouts/AuthShell';
import { ApiError } from '../../lib/apiClient';
import * as authApi from './api';
import { useAcceptInvite } from './hooks';

const acceptSchema = z
  .object({
    password: z.string().min(12, 'Password must be at least 12 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type AcceptFormValues = z.infer<typeof acceptSchema>;

function acceptErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'RATE_LIMITED') {
      return 'Too many attempts. Please try again shortly.';
    }
    if (error.code === 'INVALID_INVITE_TOKEN') {
      return 'This link is invalid or has expired.';
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

function InvalidInviteCard() {
  return (
    <Card className="w-full max-w-md shadow-md">
      <CardHeader>
        <h1 className="font-display text-3xl text-fg">This invite isn&apos;t valid</h1>
        <p className="text-sm text-fg-muted">
          The link may have expired, already been used, or is incorrect. Ask your administrator to
          send a new invite.
        </p>
      </CardHeader>
      <CardBody>
        <Link to="/login" className="text-sm font-medium text-brand-700 underline">
          Back to sign in
        </Link>
      </CardBody>
    </Card>
  );
}

export function InvitePage() {
  const token = useParams().token ?? '';
  const inviteQuery = useQuery({
    queryKey: ['auth-invite', token],
    queryFn: () => authApi.getInvite(token),
    enabled: Boolean(token),
    retry: false,
  });
  const acceptInvite = useAcceptInvite(token);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptFormValues>({
    resolver: zodResolver(acceptSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const inviteInvalid =
    !token ||
    (inviteQuery.isError &&
      inviteQuery.error instanceof ApiError &&
      inviteQuery.error.code === 'INVALID_INVITE_TOKEN') ||
    (acceptInvite.isError &&
      acceptInvite.error instanceof ApiError &&
      acceptInvite.error.code === 'INVALID_INVITE_TOKEN');

  return (
    <AuthShell>
      {inviteQuery.isLoading ? (
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" label="Checking your invite" />
          <p className="text-sm text-fg-muted">Checking your invite…</p>
        </div>
      ) : inviteInvalid ? (
        <InvalidInviteCard />
      ) : inviteQuery.isError ? (
        <ErrorState
          title="Could not open this invite"
          description="Check your connection and try again."
          onRetry={() => void inviteQuery.refetch()}
        />
      ) : (
        <Card className="w-full max-w-md shadow-md">
          <CardHeader>
            <h1 className="font-display text-3xl text-fg">
              Welcome, {inviteQuery.data?.name}
            </h1>
            <p className="text-sm text-fg-muted">
              Set a password for {inviteQuery.data?.email} to join RVA Academy.
            </p>
          </CardHeader>
          <CardBody>
            <form
              className="flex flex-col gap-4"
              onSubmit={handleSubmit((values) => {
                acceptInvite.mutate(values.password);
              })}
              noValidate
            >
              <Input
                label="New password"
                type="password"
                autoComplete="new-password"
                error={errors.password?.message}
                {...register('password')}
              />
              <Input
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              {acceptInvite.error &&
              !(
                acceptInvite.error instanceof ApiError &&
                acceptInvite.error.code === 'INVALID_INVITE_TOKEN'
              ) ? (
                <p className="text-sm text-danger" role="alert">
                  {acceptErrorMessage(acceptInvite.error)}
                </p>
              ) : null}

              <Button type="submit" loading={acceptInvite.isPending} className="w-full">
                Set password and continue
              </Button>
            </form>
          </CardBody>
        </Card>
      )}
    </AuthShell>
  );
}
