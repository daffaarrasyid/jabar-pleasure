'use client';

import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Lock, Check } from 'lucide-react';
import BrandLogo from '@/components/ui/BrandLogo';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface RegisterFormProps {
  onBack?: () => void;
  onNavigateToLogin?: () => void;
  onSuccess?: (userData: { name: string; email: string }) => void;
}

export default function RegisterForm({
  onBack,
  onNavigateToLogin,
  onSuccess,
}: RegisterFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    agreeTerms?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = (val: string) => /\S+@\S+\.\S+/.test(val);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Nama lengkap tidak boleh kosong';
    }

    if (!email) {
      newErrors.email = 'Email tidak boleh kosong';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!password) {
      newErrors.password = 'Kata sandi tidak boleh kosong';
    } else if (password.length < 8) {
      newErrors.password = 'Kata sandi minimal 8 karakter';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi kata sandi wajib diisi';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Kata sandi tidak cocok';
    }

    if (!agreeTerms) {
      newErrors.agreeTerms = 'Anda harus menyetujui syarat & ketentuan';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    // Simulate API registration call
    setTimeout(() => {
      setIsLoading(false);
      if (onSuccess) {
        onSuccess({ name, email });
      }
    }, 1000);
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
      <div className="w-full flex items-center justify-center mb-5">
        <BrandLogo
          variant="gradient"
          size="sm"
          showText
          textClassName="text-[19px] font-bold text-gray-900 tracking-tight font-sans"
        />
      </div>

      {/* Main Registration Content - Perfectly Centered in Viewport */}
      <div className="w-full max-w-[380px] mx-auto my-auto flex flex-col items-center justify-center">

        {/* Title "Daftar" */}
        <h1 className="text-2xl sm:text-[26px] font-bold text-center text-gray-900 mb-5 tracking-tight font-sans">
          Daftar
        </h1>

        {/* Form Fields with #4941EC borders */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 w-full">
          <Input
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            error={errors.name}
            borderVariant="primary"
            leftIcon={<User className="w-5 h-5 text-gray-400" />}
            autoComplete="name"
          />

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

          <Input
            label="Kata Sandi"
            type="password"
            placeholder="Masukkan kata sandi (min. 8 karakter)"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            error={errors.password}
            borderVariant="primary"
            leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
            autoComplete="new-password"
          />

          <Input
            label="Konfirmasi Kata Sandi"
            type="password"
            placeholder="Ulangi kata sandi"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
            }}
            error={errors.confirmPassword}
            borderVariant="primary"
            leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
            autoComplete="new-password"
          />

          {/* Terms Agreement Checkbox */}
          <div className="flex items-start gap-2.5 mt-0.5">
            <button
              type="button"
              role="checkbox"
              aria-checked={agreeTerms}
              onClick={() => {
                setAgreeTerms(!agreeTerms);
                if (errors.agreeTerms) setErrors({ ...errors, agreeTerms: undefined });
              }}
              className={`w-5 h-5 shrink-0 mt-0.5 rounded-md border flex items-center justify-center transition-colors ${agreeTerms
                  ? 'bg-[#4941EC] border-[#4941EC] text-white'
                  : 'bg-white border-gray-300 hover:border-gray-400'
                }`}
            >
              {agreeTerms && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>
            <label
              onClick={() => {
                setAgreeTerms(!agreeTerms);
                if (errors.agreeTerms) setErrors({ ...errors, agreeTerms: undefined });
              }}
              className="text-xs text-gray-600 leading-snug cursor-pointer select-none font-sans"
            >
              Saya menyetujui{' '}
              <span className="font-semibold text-[#4941EC]">Syarat & Ketentuan</span> serta{' '}
              <span className="font-semibold text-[#4941EC]">Kebijakan Privasi</span> JabarPleasure.
            </label>
          </div>
          {errors.agreeTerms && (
            <p className="text-xs text-red-500 -mt-1 font-sans">{errors.agreeTerms}</p>
          )}

          {/* Action Button: Daftar -> */}
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            rightIcon={<span className="text-lg leading-none font-medium">→</span>}
            className="mt-3 text-base font-semibold shadow-xs rounded-xl h-[50px]"
          >
            Daftar
          </Button>
        </form>

        {/* Switcher to Login */}
        <p className="text-center text-xs sm:text-sm text-gray-600 mt-6 font-sans">
          Sudah punya akun?{' '}
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="font-bold text-[#4941EC] hover:underline"
          >
            Masuk Sekarang
          </button>
        </p>
      </div>
    </div>
  );
}
