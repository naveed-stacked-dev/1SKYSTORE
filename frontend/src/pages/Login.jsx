import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

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
      navigate(from === '/' ? '/dashboard' : from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-white mb-2">Welcome back</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">Sign in to your 1SkyStore account</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input icon={Mail} label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input icon={Lock} label="Password" type="password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-neutral-500 cursor-pointer">
            <input type="checkbox" className="rounded border-neutral-300" />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-sm text-primary-500 hover:text-primary-600">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Sign In
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
        <span className="text-xs text-neutral-400">or continue with</span>
        <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
      </div>

      {/* Google Login */}
      <button
        onClick={() => toast('Google Sign-In: Configure VITE_GOOGLE_CLIENT_ID in .env')}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Google
      </button>

      <p className="text-sm text-neutral-500 text-center mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-500 hover:text-primary-600 font-medium">Sign up</Link>
      </p>
    </div>
  );
}
