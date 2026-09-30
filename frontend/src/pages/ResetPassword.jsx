import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Check } from 'lucide-react';
import authService from '@/api/auth.service';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Accent from '@/components/home/ui/Accent';
import Eyebrow from '@/components/home/ui/Eyebrow';
import PillLink from '@/components/home/ui/PillLink';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      setLoading(true);
      await authService.resetPassword({ token, password });
      setDone(true);
      toast.success('Password reset successful');
    } catch (err) {
      toast.error(err.message || 'Failed to reset');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div role="status" className="rounded-[2rem] border border-line bg-surface p-7 text-center sm:p-10">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Check className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="font-display text-[clamp(2rem,8vw,2.5rem)] font-medium leading-none tracking-[-0.035em] text-ink">
          Password <Accent>reset!</Accent>
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-ink-soft">You can now sign in with your new password</p>
        <div className="mt-8 flex justify-center">
          <PillLink to="/login">Go to Login</PillLink>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Eyebrow>Password help</Eyebrow>
      <h1 className="mt-4 font-display text-[clamp(2.25rem,9vw,3.25rem)] font-medium leading-[0.98] tracking-[-0.035em] text-ink">
        Reset <Accent>password</Accent>
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">Enter your new password</p>

      <form onSubmit={handleSubmit} className="mt-9 space-y-5">
        <Input icon={Lock} label="New Password" type="password" placeholder="Min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Input icon={Lock} label="Confirm Password" type="password" placeholder="Repeat password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        <div className="pt-2">
          <Button type="submit" className="w-full" size="lg" loading={loading}>Reset Password</Button>
        </div>
      </form>
    </div>
  );
}
