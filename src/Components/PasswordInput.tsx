import { useState } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface PasswordInputProps {
  register: UseFormRegisterReturn;
  placeholder: string;
  autoComplete?: string;
}

export default function PasswordInput({ register, placeholder, autoComplete = 'current-password' }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        {...register}
        className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600"
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );
}
