// Primary storefront navigation. `menu` items open a panel instead of routing.
export const STORE_NAV = [
  { name: 'Home', path: '/' },
  { name: 'Shop', path: '/shop' },
  { name: 'Categories', menu: 'categories' },
  { name: 'Journal', path: '/blog' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

// Signed-in account shortcuts (account menu + mobile menu)
export const ACCOUNT_LINKS = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Orders', path: '/orders' },
  { name: 'Profile', path: '/profile' },
];

export const FOOTER_LINKS = {
  shop: [
    { name: 'All Products', path: '/shop' },
    { name: 'Brands', path: '/shop?view=brands' },
    { name: 'Categories', path: '/shop?view=categories' },
    { name: 'Cart', path: '/cart' },
  ],
  support: [
    { name: 'Contact Us', path: '/contact' },
    { name: 'FAQs', path: '/faq' },
    // { name: 'Shipping Info', path: '/shipping-info' },
    { name: 'Returns', path: '/return-policy' },
    { name: 'Track an Order', path: '/orders' },
  ],
  company: [
    { name: 'About', path: '/about' },
    { name: 'Journal', path: '/blog' },
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Terms of Service', path: '/terms-conditions' },
    { name: 'Disclaimer', path: '/disclaimer' },
  ],
};

// Set real profile URLs to show these in the footer; '#' entries are hidden
export const SOCIAL_LINKS = [
  { name: 'Instagram', url: '#', icon: 'instagram' },
  { name: 'Twitter', url: '#', icon: 'twitter' },
  { name: 'Facebook', url: '#', icon: 'facebook' },
];
