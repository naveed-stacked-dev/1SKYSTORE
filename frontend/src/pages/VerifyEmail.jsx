import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import authService from '@/api/auth.service';
import Accent from '@/components/home/ui/Accent';
import Eyebrow from '@/components/home/ui/Eyebrow';
import PillLink from '@/components/home/ui/PillLink';

const PANEL = 'rounded-[2rem] border border-line bg-surface p-7 text-center sm:p-10';
const ICON_SEAT = 'mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full';
const TITLE = 'mt-3 font-display text-[clamp(2rem,8vw,2.5rem)] font-medium leading-none tracking-[-0.035em] text-ink';

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
      <div role="status" aria-live="polite" className={PANEL}>
        <div className={`${ICON_SEAT} bg-accent-soft text-accent`}>
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
        </div>
        <Eyebrow>Email verification</Eyebrow>
        <h1 className={TITLE}>
          Verifying your email...
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-ink-soft">
          Please wait while we verify your email address.
        </p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div role="status" aria-live="polite" className={PANEL}>
        <div className={`${ICON_SEAT} bg-accent-soft text-accent`}>
          <CheckCircle className="h-6 w-6" aria-hidden="true" />
        </div>
        <Eyebrow>Email verification</Eyebrow>
        <h1 className={TITLE}>
          Email <Accent>verified!</Accent>
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-ink-soft">
          {message} You can now log in to your account.
        </p>
        <div className="mt-8 flex justify-center">
          <PillLink to="/login">Go to Login</PillLink>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div role="alert" className={PANEL}>
      <div className={`${ICON_SEAT} bg-error-500/10 text-error-500`}>
        <XCircle className="h-6 w-6" aria-hidden="true" />
      </div>
      <Eyebrow>Email verification</Eyebrow>
      <h1 className={TITLE}>
        Verification failed
      </h1>
      <p className="mx-auto mt-4 max-w-sm wrap-break-word text-[15px] leading-relaxed text-ink-soft">
        {message}
      </p>
      <div className="mt-8 flex justify-center">
        <PillLink to="/register" tone="outline">Try Again</PillLink>
      </div>
    </div>
  );
}
