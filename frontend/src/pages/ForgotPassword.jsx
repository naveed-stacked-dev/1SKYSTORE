import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import authService from '@/api/auth.service';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Accent from '@/components/home/ui/Accent';
import Eyebrow from '@/components/home/ui/Eyebrow';
import PillLink from '@/components/home/ui/PillLink';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await authService.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent to your email');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div role="status" className="rounded-[2rem] border border-line bg-surface p-7 text-center sm:p-10">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Mail className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="font-display text-[clamp(2rem,8vw,2.5rem)] font-medium leading-none tracking-[-0.035em] text-ink">
          Check your <Accent>email</Accent>
        </h1>
        <p className="mx-auto mt-4 max-w-sm wrap-break-word text-[15px] leading-relaxed text-ink-soft">
          We've sent a password reset link to <strong className="font-medium text-ink">{email}</strong>
        </p>
        <div className="mt-8 flex justify-center">
          <PillLink to="/login" tone="outline">Back to Login</PillLink>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Eyebrow>Password help</Eyebrow>
      <h1 className="mt-4 font-display text-[clamp(2.25rem,9vw,3.25rem)] font-medium leading-[0.98] tracking-[-0.035em] text-ink">
        Forgot <Accent>password?</Accent>
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">Enter your email and we'll send you a reset link</p>

      <form onSubmit={handleSubmit} className="mt-9 space-y-5">
        <Input icon={Mail} label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <div className="pt-2">
          <Button type="submit" className="w-full" size="lg" loading={loading}>Send Reset Link</Button>
        </div>
      </form>

      <div className="mt-8 flex justify-center border-t border-line pt-6">
        <Link
          to="/login"
          className="group inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-sm font-medium text-ink-soft transition-colors duration-300 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" aria-hidden="true" />
          <span className="underline decoration-ink/25 underline-offset-4 group-hover:decoration-ink">Back to login</span>
        </Link>
      </div>
    </div>
  );
}
