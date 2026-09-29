export const EMPTY_ADDRESS_FORM = {
  full_name: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  landmark: '',
  city: '',
  state: '',
  country: 'India',
  postal_code: '',
  is_default: false,
};

const REQUIRED_ADDRESS_FIELDS = {
  full_name: 'Full name is required',
  phone: 'Phone is required',
  address_line1: 'Address line 1 is required',
  landmark: 'Landmark is required',
  city: 'City is required',
  state: 'State is required',
  country: 'Country is required',
  postal_code: 'Postal code is required',
};

export function normalizeAddressForm(form) {
  return {
    ...EMPTY_ADDRESS_FORM,
    ...form,
    full_name: form.full_name?.trim() || '',
    phone: form.phone?.trim() || '',
    address_line1: form.address_line1?.trim() || '',
    address_line2: form.address_line2?.trim() || '',
    landmark: form.landmark?.trim() || '',
    city: form.city?.trim() || '',
    state: form.state?.trim() || '',
    country: form.country?.trim() || '',
    postal_code: form.postal_code?.trim() || '',
  };
}

export function validateAddressForm(form) {
  const normalized = normalizeAddressForm(form);
  const errors = {};

  Object.entries(REQUIRED_ADDRESS_FIELDS).forEach(([field, message]) => {
    if (!normalized[field]) {
      errors[field] = message;
    }
  });

  return {
    values: normalized,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

export function getAddressApiErrors(err) {
  const apiErrors = err?.data?.error?.errors;

  if (!Array.isArray(apiErrors)) {
    return {};
  }

  return apiErrors.reduce((acc, item) => {
    if (item?.field && item?.message && !acc[item.field]) {
      acc[item.field] = item.message;
    }
    return acc;
  }, {});
}
