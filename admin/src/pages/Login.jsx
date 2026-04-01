import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Mail, Lock, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/20 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 p-4 relative">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors shadow-soft"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-4 shadow-premium">
            <span className="text-white font-bold text-xl font-heading">1S</span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-neutral-50">
            Admin Dashboard
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Sign in to manage your store
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-800 p-8 shadow-elevated">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="admin@hp.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
            />
            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
            />
            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-neutral-400 dark:text-neutral-500 mt-6">
          © {new Date().getFullYear()} 1SKYSTORE. Admin access only.
        </p>
      </motion.div>
    </div>
  );
}
