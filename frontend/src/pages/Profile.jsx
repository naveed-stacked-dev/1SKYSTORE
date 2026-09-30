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
import PageHeader from '@/components/common/PageHeader';
import { CONTAINER } from '@/components/home/ui/styles';
import { pageTransition } from '@/animations/variants';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';
import { EMPTY_ADDRESS_FORM, getAddressApiErrors, validateAddressForm } from '@/utils/addressForm';

const MotionDiv = motion.div;

const CARD = 'rounded-[1.75rem] bg-surface p-5 ring-1 ring-line sm:p-8';

/** Settings row: numbered label column on the left, content on the right */
function SettingsSection({ index, icon, title, action, children }) {
  const Icon = icon;
  return (
    <section className="grid grid-cols-1 gap-6 py-10 sm:py-12 lg:grid-cols-12 lg:gap-10">
      <div className="flex items-start justify-between gap-4 lg:col-span-4 lg:flex-col lg:justify-start">
        <div>
          <p className="inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.22em] text-ink-faint">
            <span className="font-display tabular-nums text-accent">{index}</span>
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          </p>
          <h2 className="font-display mt-3 text-2xl font-medium leading-[1.05] tracking-[-0.03em] text-ink sm:text-[1.75rem]">{title}</h2>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="min-w-0 lg:col-span-8">{children}</div>
    </section>
  );
}

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
    <MotionDiv {...pageTransition} className="pb-20 sm:pb-28">
      <PageHeader eyebrow="Account" title="My Profile" size="sm">
        <Button variant="ghost" className="gap-2 text-error-500! ring-1 ring-inset ring-line hover:bg-error-500/10!" onClick={logout}>
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </PageHeader>

      <div className={cn(CONTAINER, 'divide-y divide-line border-t border-line')}>
        {/* Profile Info */}
        <SettingsSection index="01" icon={User} title="Personal Info">
          <div className={CARD}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              <Input label="Email" value={user?.email || ''} disabled />
              <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="mt-6 flex justify-end border-t border-line pt-6">
              <Button onClick={handleSaveProfile} loading={saving}>Save Changes</Button>
            </div>
          </div>
        </SettingsSection>

        {/* Addresses */}
        <SettingsSection
          index="02"
          icon={MapPin}
          title="Addresses"
          action={
            <Button variant="outline" size="md" onClick={() => { setEditAddress(null); setAddressForm(EMPTY_ADDRESS_FORM); setAddressErrors({}); setAddressModal(true); }} className="gap-1.5">
              <Plus className="w-4 h-4" /> Add
            </Button>
          }
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {addresses.map((addr) => (
              <AddressCard key={addr.id} address={addr} onEdit={openEditAddress} onDelete={handleDeleteAddress} />
            ))}
          </div>
          {addresses.length === 0 && (
            <div className="rounded-[1.75rem] border border-dashed border-line p-8 text-center">
              <p className="text-[15px] text-ink-soft">No addresses saved yet</p>
            </div>
          )}
        </SettingsSection>

        {/* Change Password */}
        <SettingsSection index="03" icon={Lock} title="Change Password">
          <div className={CARD}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input type="password" label="Current Password" value={passwordForm.oldPassword} onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })} />
              <Input type="password" label="New Password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
            </div>
            <div className="mt-6 flex justify-end border-t border-line pt-6">
              <Button onClick={handleChangePassword} loading={changingPw}>Update Password</Button>
            </div>
          </div>
        </SettingsSection>
      </div>

      {/* Address Modal */}
      <Modal isOpen={addressModal} onClose={() => { setAddressModal(false); setAddressErrors({}); }} title={editAddress ? 'Edit Address' : 'Add Address'}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Full Name" error={addressErrors.full_name} value={addressForm.full_name || ''} onChange={(e) => updateAddressField('full_name', e.target.value)} />
            <Input label="Phone" error={addressErrors.phone} value={addressForm.phone || ''} onChange={(e) => updateAddressField('phone', e.target.value)} />
            <div className="sm:col-span-2">
              <Input label="Address" error={addressErrors.address_line1} value={addressForm.address_line1 || ''} onChange={(e) => updateAddressField('address_line1', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Input label="Address Line 2 (Optional)" error={addressErrors.address_line2} value={addressForm.address_line2 || ''} onChange={(e) => updateAddressField('address_line2', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Input label="Landmark" error={addressErrors.landmark} value={addressForm.landmark || ''} onChange={(e) => updateAddressField('landmark', e.target.value)} placeholder="e.g. Near City Hospital" />
            </div>
            <Input label="City" error={addressErrors.city} value={addressForm.city || ''} onChange={(e) => updateAddressField('city', e.target.value)} />
            <Input label="State" error={addressErrors.state} value={addressForm.state || ''} onChange={(e) => updateAddressField('state', e.target.value)} />
            <Input label="Country" error={addressErrors.country} value="India" disabled />
            <Input label="Postal Code" error={addressErrors.postal_code} value={addressForm.postal_code || ''} onChange={(e) => updateAddressField('postal_code', e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveAddress} loading={saving} className="w-full sm:w-auto">{editAddress ? 'Update' : 'Save'}</Button>
          </div>
        </div>
      </Modal>
    </MotionDiv>
  );
}
