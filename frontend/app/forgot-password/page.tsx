'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home Button */}
        <button
          onClick={() => router.push('/')}
          className="text-primary hover:underline text-sm font-medium mb-4 inline-flex items-center gap-1"
        >
          ← Back to Home
        </button>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
          {!submitted ? (
            <>
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="bg-accent/10 rounded-full p-4">
                  <Mail className="w-8 h-8 text-accent" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-foreground mb-2 text-center">Reset Password</h2>
              <p className="text-muted-foreground mb-8 text-center">
                Enter your email address and we&apos;ll send you a link to reset your password
              </p>

              {/* Form */}
              <form 
                onSubmit={handleSubmit} 
                className="space-y-6" 
                noValidate
                onInvalid={(e) => e.preventDefault()}
              >
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    onInvalid={(e) => e.preventDefault()}
                    className="w-full"
                  />
                  {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>

              {/* Back to Login */}
              <p className="text-center text-sm text-muted-foreground mt-6">
                Remember your password?{' '}
                <button
                  onClick={() => router.push('/login')}
                  className="text-primary font-semibold hover:underline"
                >
                  Go back to login
                </button>
              </p>
            </>
          ) : (
            <>
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 rounded-full p-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>

              {/* Success Message */}
              <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Email Sent!</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-700">
                  <span className="font-semibold">Reset link sent to:</span>
                  <br />
                  {email}
                </p>
              </div>

              <p className="text-muted-foreground text-center mb-8">
                Check your email for a link to reset your password. The link will expire in 1 hour. If you didn&apos;t receive it, check your spam folder or try again.
              </p>

              {/* Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/login')}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  Back to Login
                </Button>
                <Button
                  onClick={() => {
                    setEmail('');
                    setSubmitted(false);
                    setError('');
                  }}
                  variant="outline"
                  className="w-full text-foreground border-border hover:bg-muted"
                >
                  Try Another Email
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Demo Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            <span className="font-semibold">Demo mode:</span> Enter any valid email address to continue
          </p>
        </div>
      </div>
    </main>
  );
}
