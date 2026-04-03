import { useState } from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '@/animations/variants';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { User, Palette, Shield, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '@/api/auth.service';

export default function Settings() {
  const { admin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    setLoading(true);
    try {
      await authService.changePassword({ oldPassword: passwords.oldPassword, newPassword: passwords.newPassword });
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div {...pageTransition}>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-neutral-50">Settings</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Manage your account and preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-5">
            <User className="w-5 h-5 text-primary-500" />
            <h2 className="text-base font-heading font-semibold text-neutral-900 dark:text-neutral-50">Profile</h2>
          </div>
          <div className="flex items-center gap-5 mb-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {admin?.first_name?.[0] || admin?.email?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                {admin?.first_name || 'Admin'} {admin?.last_name || ''}
              </h3>
              <p className="text-sm text-neutral-500">{admin?.email}</p>
              <p className="text-xs text-neutral-400 capitalize">{admin?.role || 'admin'}</p>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-5">
            <Palette className="w-5 h-5 text-primary-500" />
            <h2 className="text-base font-heading font-semibold text-neutral-900 dark:text-neutral-50">Appearance</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Dark Mode</p>
              <p className="text-xs text-neutral-400">Switch between light and dark theme</p>
            </div>
            <Toggle checked={theme === 'dark'} onChange={toggleTheme} />
          </div>
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-5">
            <Shield className="w-5 h-5 text-primary-500" />
            <h2 className="text-base font-heading font-semibold text-neutral-900 dark:text-neutral-50">Security</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Change Password</p>
                <p className="text-xs text-neutral-400">Update your admin password</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)}>Change</Button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-5">
            <Bell className="w-5 h-5 text-primary-500" />
            <h2 className="text-base font-heading font-semibold text-neutral-900 dark:text-neutral-50">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Email Alerts</p>
                <p className="text-xs text-neutral-400">Get notified on new orders</p>
              </div>
              <Toggle checked={true} onChange={() => {}} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Low Stock Alerts</p>
                <p className="text-xs text-neutral-400">When product stock is below 10</p>
              </div>
              <Toggle checked={true} onChange={() => {}} />
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password" size="sm">
        <form onSubmit={handlePasswordChange} className="space-y-4 pt-4">
          <Input 
            label="Current Password" 
            type="password" 
            value={passwords.oldPassword} 
            onChange={e => setPasswords({...passwords, oldPassword: e.target.value})} 
            required 
          />
          <Input 
            label="New Password" 
            type="password" 
            value={passwords.newPassword} 
            onChange={e => setPasswords({...passwords, newPassword: e.target.value})} 
            required 
            minLength={8}
          />
          <Input 
            label="Confirm New Password" 
            type="password" 
            value={passwords.confirmPassword} 
            onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} 
            required 
            minLength={8}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <Button type="button" variant="ghost" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
