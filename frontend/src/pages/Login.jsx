import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Accent from '@/components/home/ui/Accent';
import Eyebrow from '@/components/home/ui/Eyebrow';
import { TextLink } from '@/components/home/ui/PillLink';
import toast from 'react-hot-toast';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const UNDERLINE_LINK =
  'inline-flex min-h-11 items-center rounded-sm text-sm font-medium text-ink underline decoration-ink/25 underline-offset-4 transition-colors duration-300 hover:text-accent hover:decoration-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

export default function Login() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      await googleLogin(idToken);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Eyebrow>Sign in</Eyebrow>
      <h1 className="mt-4 font-display text-[clamp(2.25rem,9vw,3.25rem)] font-medium leading-[0.98] tracking-[-0.035em] text-ink">
        Welcome <Accent>back</Accent>
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">Sign in to your 1SkyStore account</p>

      <form onSubmit={handleSubmit} className="mt-9 space-y-5">
        <Input icon={Mail} label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input icon={Lock} label="Password" type="password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-ink-soft">
            <input type="checkbox" className="h-4 w-4 cursor-pointer rounded border-line accent-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" />
            Remember me
          </label>
          <Link to="/forgot-password" className={UNDERLINE_LINK}>
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Sign In
        </Button>
      </form>

      {/* Divider */}
      <div className="my-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-line" />
        <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink-faint">or continue with</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      {/* Google Login */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-surface px-6 py-3 text-[15px] font-medium text-ink ring-1 ring-inset ring-line transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-mist focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Google
      </button>

      <p className="mt-8 flex flex-wrap items-center justify-center gap-x-2 border-t border-line pt-6 text-sm text-ink-soft">
        Don't have an account?
        <TextLink to="/register" className="min-h-11 text-sm">Sign up</TextLink>
      </p>
    </div>
  );
}
