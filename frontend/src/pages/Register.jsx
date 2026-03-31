import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm({ ...form, [key]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await register(form);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

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
