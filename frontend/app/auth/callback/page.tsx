'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, CircleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiGateway } from '@/app/utils/api';

type VerifyState = 'loading' | 'success' | 'error';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const api = useMemo(() => new ApiGateway(), []);
  const [state, setState] = useState<VerifyState>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const run = async () => {
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type') || 'signup';
      const errorDescription = searchParams.get('error_description');

      if (errorDescription) {
        setState('error');
        setMessage(decodeURIComponent(errorDescription));
        return;
      }

      if (!tokenHash) {
        setState('error');
        setMessage('Invalid verification link. Missing token.');
        return;
      }

      try {
        await api.verifyEmailLink(tokenHash, type);
        if (typeof window !== 'undefined') {
          localStorage.setItem('isEmailVerified', 'true');
        }
        setState('success');
        setMessage('Email verified successfully. You can now use all features.');
      } catch (error: any) {
        setState('error');
        setMessage(error?.message || 'Email verification failed.');
      }
    };

    run();
  }, [api, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="flex justify-center mb-5">
          {state === 'success' ? (
            <CheckCircle2 className="w-16 h-16 text-green-600" />
          ) : state === 'error' ? (
            <CircleAlert className="w-16 h-16 text-red-600" />
          ) : (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Email Verification</h1>
        <p className="text-muted-foreground mb-6">{message}</p>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => router.push('/')}>
            Home
          </Button>
          <Button onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    </div>
  );
}

function AuthCallbackFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="flex justify-center mb-5">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Email Verification</h1>
        <p className="text-muted-foreground mb-6">Verifying your email...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackFallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
