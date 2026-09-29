import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const update = (key, value) => setForm({ ...form, [key]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await register(form);
      setRegistered(true);
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Show verification message after successful registration
  if (registered) {
    return (
      <div className="text-center py-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-500/15 flex items-center justify-center mb-5">
          <Mail className="w-8 h-8 text-primary-500" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-white mb-3">
          Verify your email
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2 max-w-sm mx-auto">
          We've sent a verification link to
        </p>
        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-6">
          {form.email}
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 max-w-sm mx-auto">
          Please check your inbox and click the verification link to activate your account. Once verified, you can log in.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors"
        >
          <CheckCircle className="w-4 h-4" />
          Go to Login
        </Link>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-6">
          Didn't receive the email? Check your spam folder.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-white mb-2">Create an account</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">Join 1SkyStore for a better experience</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input icon={User} label="First Name" placeholder="John" value={form.first_name} onChange={(e) => update('first_name', e.target.value)} required />
          <Input label="Last Name" placeholder="Doe" value={form.last_name} onChange={(e) => update('last_name', e.target.value)} required />
        </div>
        <Input icon={Mail} label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update('email', e.target.value)} required />
        <Input icon={Phone} label="Phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
        <Input icon={Lock} label="Password" type="password" placeholder="Min 8 characters" value={form.password} onChange={(e) => update('password', e.target.value)} required />

        <Button type="submit" className="w-full" size="lg" loading={loading}>Create Account</Button>
      </form>

      <p className="text-sm text-neutral-500 text-center mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">Sign in</Link>
      </p>
    </div>
  );
}
