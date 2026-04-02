import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Lock, Plus, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import authService from '@/api/auth.service';
import addressService from '@/api/address.service';
import AddressCard from '@/components/ecommerce/AddressCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { pageTransition } from '@/animations/variants';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [addressModal, setAddressModal] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({ full_name: '', phone: '', address_line1: '', city: '', state: '', country: '', postal_code: '', is_default: false });

  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    document.title = 'Profile — 1SkyStore';
    loadAddresses();
  }, []);

  async function loadAddresses() {
    try {
      const res = await addressService.getAddresses();
      const data = res.data?.data || res.data;
      setAddresses(Array.isArray(data) ? data : data?.addresses || []);
    } catch {}
  }

  async function handleSaveProfile() {
    try {
      setSaving(true);
      await updateProfile({ first_name: firstName, last_name: lastName, phone });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAddress() {
    try {
      setSaving(true);
      if (editAddress) {
        await addressService.updateAddress(editAddress.id, addressForm);
      } else {
        await addressService.createAddress(addressForm);
      }
      await loadAddresses();
      setAddressModal(false);
      setEditAddress(null);
      setAddressForm({ full_name: '', phone: '', address_line1: '', city: '', state: '', country: '', postal_code: '', is_default: false });
      toast.success(editAddress ? 'Address updated' : 'Address added');
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAddress(id) {
    try {
      await addressService.deleteAddress(id);
      await loadAddresses();
      toast.success('Address deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  }

  function openEditAddress(addr) {
    setEditAddress(addr);
    // Map existing data strictly to string literals to prevent uncontrolled input warnings
    setAddressForm({ 
      full_name: addr.full_name || '', 
      phone: addr.phone || addr.phone_enc || '', 
      address_line1: addr.address_line1 || '', 
      address_line2: addr.address_line2 || '',
      city: addr.city || '', 
      state: addr.state || '', 
      country: addr.country || '', 
      postal_code: addr.postal_code || '', 
      is_default: addr.is_default || false 
    });
    setAddressModal(true);
  }

  async function handleChangePassword() {
    try {
      setChangingPw(true);
      await authService.changePassword(passwordForm);
      setPasswordForm({ oldPassword: '', newPassword: '' });
      toast.success('Password changed');
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setChangingPw(false);
    }
  }

  return (
    <motion.div {...pageTransition} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-heading font-bold text-neutral-900 dark:text-white mb-8">My Profile</h1>

      <div className="space-y-8">
        {/* Profile Info */}
        <section className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2 mb-5">
            <User className="w-5 h-5 text-primary-500" /> Personal Info
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            <Input label="Email" value={user?.email || ''} disabled />
            <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Button className="mt-4" onClick={handleSaveProfile} loading={saving}>Save Changes</Button>
        </section>

        {/* Addresses */}
        <section className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-500" /> Addresses
            </h2>
            <Button variant="outline" size="sm" onClick={() => { setEditAddress(null); setAddressForm({ full_name: '', phone: '', address_line1: '', city: '', state: '', country: '', postal_code: '', is_default: false }); setAddressModal(true); }} className="gap-1">
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <AddressCard key={addr.id} address={addr} onEdit={openEditAddress} onDelete={handleDeleteAddress} />
            ))}
          </div>
          {addresses.length === 0 && <p className="text-sm text-neutral-400">No addresses saved yet</p>}
        </section>

        {/* Change Password */}
        <section className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2 mb-5">
            <Lock className="w-5 h-5 text-primary-500" /> Change Password
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input type="password" label="Current Password" value={passwordForm.oldPassword} onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })} />
            <Input type="password" label="New Password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
          </div>
          <Button className="mt-4" onClick={handleChangePassword} loading={changingPw}>Update Password</Button>
        </section>

        {/* Logout */}
        <Button variant="ghost" className="!text-error-500 bg-error-500/10 hover:bg-error-500/20 gap-2" onClick={logout}>
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </div>

      {/* Address Modal */}
      <Modal isOpen={addressModal} onClose={() => setAddressModal(false)} title={editAddress ? 'Edit Address' : 'Add Address'}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" value={addressForm.full_name || ''} onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })} />
            <Input label="Phone" value={addressForm.phone || ''} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} />
            <Input label="Address" className="sm:col-span-2" value={addressForm.address_line1 || ''} onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })} />
            <Input label="Address Line 2 (Optional)" className="sm:col-span-2" value={addressForm.address_line2 || ''} onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })} />
            <Input label="City" value={addressForm.city || ''} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} />
            <Input label="State" value={addressForm.state || ''} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} />
            <Input label="Country" value={addressForm.country || ''} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} />
            <Input label="Postal Code" value={addressForm.postal_code || ''} onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })} />
          </div>
          <Button onClick={handleSaveAddress} loading={saving}>{editAddress ? 'Update' : 'Save'}</Button>
        </div>
      </Modal>
    </motion.div>
  );
}
