import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import apiClient from '../../config/apiClient';
import { useAuthStore } from '../../store/authStore';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const loginSchema = z.object({
  email: z.string().email({ message: 'Email tidak valid' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError(null);
      const response = await apiClient.post('/auth/login', data);

      const { user, accessToken } = response.data.data;
      setAuth(user, accessToken);

      // Redirect based on role or to where they tried to go
      const from = (location.state as any)?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
        return;
      }

      switch (user.role) {
        case 'ADMIN':
        case 'STAFF':
          navigate('/admin/dashboard', { replace: true });
          break;
        case 'DOCTOR':
          navigate('/doctor/dashboard', { replace: true });
          break;

        default:
          navigate('/', { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat login');
    }
  };

  const successMessage = (location.state as any)?.message;

  return (
    <div>
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-slate-900">Masuk ke Akun Anda</h3>
        <p className="text-sm text-slate-500 mt-1">Masukkan email & password untuk masuk</p>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-3 rounded-lg text-sm mb-4">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@klinik.com"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <span className='text-sm text-slate-500 block'>Note: Email = admin@klinik.com, Password = admin123</span>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Loading...' : 'Sign in'}
        </Button>
      </form>


    </div>
  );
};

export default Login;
