'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes
  const router = useRouter();

  useEffect(() => {
    // Get email from session storage
    const storedEmail = sessionStorage.getItem('registrationEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }

    // Countdown timer
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate OTP is 6 digits
    if (!otp.trim()) {
      setError('Please enter the verification code');
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError('Verification code must be 6 digits');
      return;
    }

    // Mark as verified
    setIsVerified(true);

    // Redirect to login after 2 seconds
    setTimeout(() => {
      sessionStorage.removeItem('registrationEmail');
      sessionStorage.removeItem('registrationUsername');
      router.push('/login');
    }, 2000);
  };

  const handleResend = () => {
    setTimer(300);
    setError('');
    setOtp('');
  };

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  const isExpired = timer === 0;

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Email Verified!</h2>
          <p className="text-muted-foreground mb-6">
            Your account has been successfully created. Redirecting you to login...
          </p>
          <div className="inline-block">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
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
        <h2 className="text-3xl font-bold text-foreground mb-2">Verify Your Email</h2>
        <p className="text-muted-foreground mb-8">
          We&apos;ve sent a 6-digit code to<br />
          <span className="font-semibold text-foreground">{email || 'your email'}</span>
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* OTP Input Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-foreground mb-2">
              Verification Code
            </label>
            <Input
              id="otp"
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => {
                // Only allow digits and limit to 6
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(value);
              }}
              maxLength={6}
              className="w-full text-center text-2xl tracking-widest"
              disabled={isExpired}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          {/* Timer */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-center text-sm">
              Code expires in:{' '}
              <span className={`font-semibold ${isExpired ? 'text-red-600' : 'text-blue-600'}`}>
                {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
              </span>
            </p>
          </div>

          <Button
            type="submit"
            disabled={isExpired}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Verify Email
          </Button>
        </form>

        {/* Resend Link */}
        <div className="mt-6 text-center">
          {isExpired ? (
            <button
              onClick={handleResend}
              className="text-primary font-semibold hover:underline"
            >
              Resend Code
            </button>
          ) : (
            <p className="text-xs text-muted-foreground">
              Didn&apos;t receive the code?{' '}
              <button
                type="button"
                onClick={handleResend}
                className="text-primary font-semibold hover:underline"
              >
                Resend
              </button>
            </p>
          )}
        </div>

        {/* Demo Info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            <span className="font-semibold">Demo mode:</span> Enter any 6 digits to verify
          </p>
        </div>
      </div>
    </div>
  );
}
