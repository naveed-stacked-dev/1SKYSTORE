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
import { EMPTY_ADDRESS_FORM, getAddressApiErrors, validateAddressForm } from '@/utils/addressForm';

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [addressModal, setAddressModal] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS_FORM);
  const [addressErrors, setAddressErrors] = useState({});

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
    const { values, errors, isValid } = validateAddressForm(addressForm);
    setAddressErrors(errors);

    if (!isValid) {
      toast.error('Please fix the highlighted address fields');
      return;
    }

    try {
      setSaving(true);
      if (editAddress) {
        await addressService.updateAddress(editAddress.id, values);
      } else {
        await addressService.createAddress(values);
      }
      await loadAddresses();
      setAddressModal(false);
      setEditAddress(null);
      setAddressForm(EMPTY_ADDRESS_FORM);
      setAddressErrors({});
      toast.success(editAddress ? 'Address updated' : 'Address added');
    } catch (err) {
      const apiErrors = getAddressApiErrors(err);
      if (Object.keys(apiErrors).length > 0) {
        setAddressErrors(apiErrors);
        toast.error('Please check the address details and try again');
      } else {
        toast.error(err.message || 'Failed to save');
      }
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
    setAddressErrors({});
    // Map existing data strictly to string literals to prevent uncontrolled input warnings
    setAddressForm({ 
      full_name: addr.full_name || '', 
      phone: addr.phone || addr.phone_enc || '', 
      address_line1: addr.address_line1 || '', 
      address_line2: addr.address_line2 || '',
      landmark: addr.landmark || '',
      city: addr.city || '', 
      state: addr.state || '', 
      country: addr.country || 'India', 
      postal_code: addr.postal_code || '', 
      is_default: addr.is_default || false 
    });
    setAddressModal(true);
  }

  function updateAddressField(field, value) {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
    setAddressErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
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
            <Button variant="outline" size="sm" onClick={() => { setEditAddress(null); setAddressForm(EMPTY_ADDRESS_FORM); setAddressErrors({}); setAddressModal(true); }} className="gap-1">
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
      <Modal isOpen={addressModal} onClose={() => { setAddressModal(false); setAddressErrors({}); }} title={editAddress ? 'Edit Address' : 'Add Address'}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" error={addressErrors.full_name} value={addressForm.full_name || ''} onChange={(e) => updateAddressField('full_name', e.target.value)} />
            <Input label="Phone" error={addressErrors.phone} value={addressForm.phone || ''} onChange={(e) => updateAddressField('phone', e.target.value)} />
            <Input label="Address" error={addressErrors.address_line1} className="sm:col-span-2" value={addressForm.address_line1 || ''} onChange={(e) => updateAddressField('address_line1', e.target.value)} />
            <Input label="Address Line 2 (Optional)" error={addressErrors.address_line2} className="sm:col-span-2" value={addressForm.address_line2 || ''} onChange={(e) => updateAddressField('address_line2', e.target.value)} />
            <Input label="Landmark" error={addressErrors.landmark} className="sm:col-span-2" value={addressForm.landmark || ''} onChange={(e) => updateAddressField('landmark', e.target.value)} placeholder="e.g. Near City Hospital" />
            <Input label="City" error={addressErrors.city} value={addressForm.city || ''} onChange={(e) => updateAddressField('city', e.target.value)} />
            <Input label="State" error={addressErrors.state} value={addressForm.state || ''} onChange={(e) => updateAddressField('state', e.target.value)} />
            <Input label="Country" error={addressErrors.country} value="India" disabled />
            <Input label="Postal Code" error={addressErrors.postal_code} value={addressForm.postal_code || ''} onChange={(e) => updateAddressField('postal_code', e.target.value)} />
          </div>
          <Button onClick={handleSaveAddress} loading={saving}>{editAddress ? 'Update' : 'Save'}</Button>
        </div>
      </Modal>
    </motion.div>
  );
}
