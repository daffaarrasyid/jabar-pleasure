'use client';

import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock } from 'lucide-react';
import BrandLogo from '@/components/ui/BrandLogo';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { setAuthToken } from '@/lib/auth';

interface LoginFormProps {
  onBack?: () => void;
  onNavigateToRegister?: () => void;
  onSuccess?: (userData: { id?: number; name?: string; email: string; token?: string }) => void;
}

export default function LoginForm({
  onBack,
  onNavigateToRegister,
  onSuccess,
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = (val: string) => /\S+@\S+\.\S+/.test(val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string; general?: string } = {};

    if (!email) {
      newErrors.email = 'Email tidak boleh kosong';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!password) {
      newErrors.password = 'Kata sandi tidak boleh kosong';
    } else if (password.length < 6) {
      newErrors.password = 'Kata sandi minimal 6 karakter';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setIsLoading(false);
        if (result.errors?.email) {
          setErrors({ email: result.errors.email[0] });
        } else if (result.errors?.password) {
          setErrors({ password: result.errors.password[0] });
        } else {
          setErrors({ general: result.message || 'Gagal masuk. Periksa kembali email dan kata sandi Anda.' });
        }
        return;
      }

      // Store auth session in localStorage and cookie for middleware
      if (result.data?.token) {
        setAuthToken(result.data.token, result.data.user);
      }

      setIsLoading(false);
      if (onSuccess) {
        onSuccess({
          id: result.data?.user?.id,
          name: result.data?.user?.name,
          email: result.data?.user?.email || email,
          token: result.data?.token,
        });
      }
    } catch (err: any) {
      console.error('Login network error:', err);
      setIsLoading(false);
      setErrors({
        general: 'Gagal terhubung ke server backend. Pastikan server backend sedang aktif.',
      });
    }
  };

  return (
    <div className="relative w-full h-full flex-1 flex flex-col justify-center items-center overflow-y-auto select-none px-6 sm:px-8 py-6 sm:py-8">
      {/* Back Navigation Button - Floating Top Left */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Kembali ke halaman sebelumnya"
          className="absolute top-7 left-5 p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 active:scale-95 transition-all z-20"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
        </button>
      )}
      {/* Centered JabarPleasure Logo matching Masuk.png */}
      <div className="w-full flex items-center justify-center mb-6">
        <BrandLogo
          variant="gradient"
          size="sm"
          showText
          textClassName="text-[19px] font-bold text-gray-900 tracking-tight font-sans"
        />
      </div>

      {/* Main Form Content - Perfectly Centered in Viewport */}
      <div className="w-full max-w-[380px] mx-auto my-auto flex flex-col items-center justify-center">

        {/* Title "Masuk" matching Masuk.png */}
        <h1 className="text-2xl sm:text-[26px] font-bold text-center text-gray-900 mb-6 tracking-tight font-sans">
          Masuk
        </h1>

        {/* Form Fields matching Masuk.png */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          {/* Email Field with blue border */}
          <Input
            label="Email"
            type="email"
            placeholder="Masukkan alamat email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            error={errors.email}
            borderVariant="primary"
            leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
            autoComplete="email"
          />

          {/* Password Field with blue border */}
          <div className="flex flex-col gap-1">
            <Input
              label="Kata Sandi"
              type="password"
              placeholder="Masukkan kata sandi"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              error={errors.password}
              borderVariant="primary"
              leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
              autoComplete="current-password"
            />

            <div className="flex justify-end mt-1">
              <button
                type="button"
                onClick={() => alert('Fitur pemulihan kata sandi akan segera hadir!')}
                className="text-xs font-medium text-[#4941EC] hover:underline font-sans"
              >
                Lupa Kata Sandi?
              </button>
            </div>
          </div>

          {errors.general && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium font-sans">
              {errors.general}
            </div>
          )}

          {/* Action Button: Masuk -> */}
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            rightIcon={<span className="text-lg leading-none font-medium">→</span>}
            className="mt-3 text-base font-semibold shadow-xs rounded-xl h-[50px]"
          >
            Masuk
          </Button>
        </form>

        {/* Navigation to Register */}
        <p className="text-center text-xs sm:text-sm text-gray-600 mt-7 font-sans">
          Belum punya akun?{' '}
          <button
            type="button"
            onClick={onNavigateToRegister}
            className="font-bold text-[#4941EC] hover:underline"
          >
            Daftar Sekarang
          </button>
        </p>
      </div>
    </div>
  );
}
