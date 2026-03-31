import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Lock, Check } from 'lucide-react';
import authService from '@/api/auth.service';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
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
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-6">
          <Check className="w-7 h-7 text-success-500" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-white mb-2">Password reset!</h1>
        <p className="text-sm text-neutral-500 mb-6">You can now sign in with your new password</p>
        <Link to="/login"><Button>Go to Login</Button></Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-white mb-2">Reset password</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">Enter your new password</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input icon={Lock} label="New Password" type="password" placeholder="Min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Input icon={Lock} label="Confirm Password" type="password" placeholder="Repeat password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        <Button type="submit" className="w-full" size="lg" loading={loading}>Reset Password</Button>
      </form>
    </div>
  );
}
