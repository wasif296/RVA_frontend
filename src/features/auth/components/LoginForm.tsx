import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input } from '../../../design-system';
import { ApiError } from '../../../lib/apiClient';
import { useLogin } from '../hooks';

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function loginErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'RATE_LIMITED') {
      return 'Too many login attempts. Please try again shortly.';
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

export function LoginForm() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit((values) => {
        login.mutate(values);
      })}
      noValidate
    >
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />

      {login.error ? (
        <p className="text-sm text-danger" role="alert">
          {loginErrorMessage(login.error)}
        </p>
      ) : null}

      <Button type="submit" loading={login.isPending} className="w-full">
        Sign in
      </Button>
    </form>
  );
}
