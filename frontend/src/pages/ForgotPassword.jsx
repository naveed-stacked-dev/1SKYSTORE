import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import authService from '@/api/auth.service';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
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
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-6">
          <Mail className="w-7 h-7 text-success-500" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-white mb-2">Check your email</h1>
        <p className="text-sm text-neutral-500 mb-6">We've sent a password reset link to <strong>{email}</strong></p>
        <Link to="/login"><Button variant="outline">Back to Login</Button></Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-white mb-2">Forgot password?</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">Enter your email and we'll send you a reset link</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input icon={Mail} label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Button type="submit" className="w-full" size="lg" loading={loading}>Send Reset Link</Button>
      </form>

      <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-neutral-500 hover:text-primary-500 mt-6">
        <ArrowLeft className="w-4 h-4" /> Back to login
      </Link>
    </div>
  );
}
