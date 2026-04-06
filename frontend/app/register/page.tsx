'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiGateway } from '../utils/api';

interface FormData {
  //fullName: string;
  //address: string;
  //phoneNumber: string;
  //identityNumber: string;
  email: string;
  //username: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    //fullName: '',
    //address: '',
    //phoneNumber: '',
    //identityNumber: '',
    email: '',
    //username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const router = useRouter();
  const api = new ApiGateway();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    //if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    //if (!formData.address.trim()) newErrors.address = 'Address is required';
    //if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    // if (!/^\d{10,}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
    //   newErrors.phoneNumber = 'Phone number must be at least 10 digits';
    // }
    //if (!formData.identityNumber.trim()) newErrors.identityNumber = 'Identity number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    // if (!formData.username.trim()) newErrors.username = 'Username is required';
    // if (formData.username.length < 3) {
    //   newErrors.username = 'Username must be at least 3 characters';
    // }
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async(e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Store email temporarily for OTP page (in real app, this would be sent to backend)
    //sessionStorage.setItem('registrationEmail', formData.email);
    //sessionStorage.setItem('registrationUsername', formData.username);

    try {
      await api.signUp(formData.email, formData.password);

    }
    catch(error : any) {
      console.log(error.message);
      setErrors(error);
    }

    // Redirect to OTP verification page
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">ShopHub</h1>
          </div>
        </div>

        {/* Back to Home Button */}
        <button
          onClick={() => router.push('/')}
          className="text-primary hover:underline text-sm font-medium mb-4 inline-flex items-center gap-1"
        >
          ← Back to Home
        </button>

        {/* Title */}
        <h2 className="text-3xl font-bold text-foreground mb-2">Create Account</h2>
        <p className="text-muted-foreground mb-8">Join ShopHub and start shopping today</p>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            {/* <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                className={errors.fullName ? 'border-red-500' : ''}
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
              )}
            </div> */}

            {/* Phone Number */}
            {/* <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-foreground mb-2">
                Phone Number
              </label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="+1 234 567 8900"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={errors.phoneNumber ? 'border-red-500' : ''}
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p>
              )}
            </div> */}

            {/* Address */}
            {/* <div>
              <label htmlFor="address" className="block text-sm font-medium text-foreground mb-2">
                Address
              </label>
              <Input
                id="address"
                name="address"
                type="text"
                placeholder="123 Main Street"
                value={formData.address}
                onChange={handleChange}
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="mt-1 text-xs text-red-600">{errors.address}</p>
              )}
            </div> */}

            {/* Identity Number */}
            {/* <div>
              <label htmlFor="identityNumber" className="block text-sm font-medium text-foreground mb-2">
                Identity Number (ID/Passport)
              </label>
              <Input
                id="identityNumber"
                name="identityNumber"
                type="text"
                placeholder="123456789"
                value={formData.identityNumber}
                onChange={handleChange}
                className={errors.identityNumber ? 'border-red-500' : ''}
              />
              {errors.identityNumber && (
                <p className="mt-1 text-xs text-red-600">{errors.identityNumber}</p>
              )}
            </div> */}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Username */}
          {/* <div>
            <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
              Username
            </label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="johndoe"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? 'border-red-500' : ''}
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-600">{errors.username}</p>
            )}
          </div> */}

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'border-red-500' : ''}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Register Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all duration-300 mt-8"
          >
            Create Account
          </Button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-primary font-semibold hover:underline"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
}
