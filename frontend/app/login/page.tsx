'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiGateway } from '../utils/api';

export default function LoginPage() {
  const [Email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();
  const api = new ApiGateway();

  const handleLogin = async(e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Simple validation
    if (!Email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const data = await api.signIn(Email, password);
      localStorage.setItem('token', data.token);
      login(Email, data.role, data.token);
      router.push('/');
    }
    catch(error: any) {
      console.log(error.message);
      setError("Wrong email or password, please check again! " + error.message );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
              <LogIn className="w-6 h-6 text-white" />
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
        <h2 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h2>
        <p className="text-muted-foreground mb-8">Sign in to your ShopHub account</p>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="Email" className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <Input
              id="Email"
              type="text"
              placeholder="Enter your Email"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <button
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all duration-300"
          >
            Sign In
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-border"></div>
          <span className="text-xs text-muted-foreground">OR</span>
          <div className="flex-1 h-px bg-border"></div>
        </div>

        {/* Register Link */}
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <button
            onClick={() => router.push('/register')}
            className="text-primary font-semibold hover:underline"
          >
            Create one now
          </button>
        </p>

        {/* Demo Info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            <span className="font-semibold">Demo mode:</span> Use any Email (min 3 chars) and password (min 6 chars)
          </p>
        </div>
      </div>
    </div>
  );
}
