import { useState } from 'react';
import { Mail, Lock, User, Phone, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Accent from '@/components/home/ui/Accent';
import Eyebrow from '@/components/home/ui/Eyebrow';
import PillLink, { TextLink } from '@/components/home/ui/PillLink';
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
      <div role="status" className="rounded-[2rem] border border-line bg-surface p-7 text-center sm:p-10">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Mail className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="font-display text-[clamp(2rem,8vw,2.5rem)] font-medium leading-none tracking-[-0.035em] text-ink">
          Verify your <Accent>email</Accent>
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-[15px] text-ink-soft">
          We've sent a verification link to
        </p>
        <p className="mt-1 break-all text-[15px] font-medium text-ink">
          {form.email}
        </p>
        <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-ink-soft">
          Please check your inbox and click the verification link to activate your account. Once verified, you can log in.
        </p>
        <div className="mt-8 flex justify-center">
          <PillLink to="/login">
            <span className="inline-flex items-center gap-2">
              <CheckCircle className="h-4 w-4" aria-hidden="true" />
              Go to Login
            </span>
          </PillLink>
        </div>
        <p className="mt-7 border-t border-line pt-5 text-xs text-ink-faint">
          Didn't receive the email? Check your spam folder.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Eyebrow>New here</Eyebrow>
      <h1 className="mt-4 font-display text-[clamp(2.25rem,9vw,3.25rem)] font-medium leading-[0.98] tracking-[-0.035em] text-ink">
        Create an <Accent>account</Accent>
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">Join 1SkyStore for a better experience</p>

      <form onSubmit={handleSubmit} className="mt-9 space-y-5">
        <div className="grid grid-cols-1 gap-5 min-[400px]:grid-cols-2 min-[400px]:gap-4">
          <Input icon={User} label="First Name" placeholder="John" value={form.first_name} onChange={(e) => update('first_name', e.target.value)} required />
          <Input label="Last Name" placeholder="Doe" value={form.last_name} onChange={(e) => update('last_name', e.target.value)} required />
        </div>
        <Input icon={Mail} label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update('email', e.target.value)} required />
        <Input icon={Phone} label="Phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
        <Input icon={Lock} label="Password" type="password" placeholder="Min 8 characters" value={form.password} onChange={(e) => update('password', e.target.value)} required />

        <div className="pt-2">
          <Button type="submit" className="w-full" size="lg" loading={loading}>Create Account</Button>
        </div>
      </form>

      <p className="mt-8 flex flex-wrap items-center justify-center gap-x-2 border-t border-line pt-6 text-sm text-ink-soft">
        Already have an account?
        <TextLink to="/login" className="min-h-11 text-sm">Sign in</TextLink>
      </p>
    </div>
  );
}
