import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import authService from '@/api/auth.service';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    const verify = async () => {
      try {
        const res = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(res.data?.message || 'Email verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Verification failed. The link may be invalid or expired.');
      }
    };

    verify();
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="text-center py-10">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-500/15 flex items-center justify-center mb-5">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-white mb-3">
          Verifying your email...
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Please wait while we verify your email address.
        </p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="text-center py-10">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/15 flex items-center justify-center mb-5">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-white mb-3">
          Email verified!
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 max-w-sm mx-auto">
          {message} You can now log in to your account.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  // Error state
  return (
    <div className="text-center py-10">
      <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/15 flex items-center justify-center mb-5">
        <XCircle className="w-8 h-8 text-red-500" />
      </div>
      <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-white mb-3">
        Verification failed
      </h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 max-w-sm mx-auto">
        {message}
      </p>
      <Link
        to="/register"
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors"
      >
        Try Again
      </Link>
    </div>
  );
}
