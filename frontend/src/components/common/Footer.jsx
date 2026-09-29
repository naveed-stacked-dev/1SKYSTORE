import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Send, Heart } from 'lucide-react';
import { FOOTER_LINKS, SOCIAL_LINKS } from '@/constants/navigation';
import Button from '@/components/ui/Button';
import BrandWordmark from '@/components/common/BrandWordmark';

import paymentAmex from '@/assets/payments/amex-svgrepo-com.svg';
import paymentGpay from '@/assets/payments/google-pay-primary-logo-logo-svgrepo-com.svg';
import paymentMastercard from '@/assets/payments/mastercard-svgrepo-com.svg';
import paymentPaytm from '@/assets/payments/paytm-svgrepo-com.svg';
import paymentVisa from '@/assets/payments/visa-3-svgrepo-com.svg';
import paymentWallet from '@/assets/payments/wallet-svgrepo-com.svg';
import paymentL3 from '@/assets/payments/L3Xst01.svg';
import paymentTn from '@/assets/payments/tnI9201.svg';

export default function Footer() {
  const [email, setEmail] = useState('');

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 border-t border-neutral-100 dark:border-neutral-800 transition-colors" role="contentinfo">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/60 to-transparent" />
      <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-primary-100/40 blur-3xl pointer-events-none dark:bg-primary-900/20" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center" aria-label="1SKYSTORE home">
              <BrandWordmark className="text-2xl" />
            </Link>
            <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-sm">
              Premium homeopathy products and natural wellness solutions. Trusted by thousands of customers worldwide.
            </p>
            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Stay updated</p>
              <div className="flex gap-2 max-w-sm p-1 rounded-2xl border border-neutral-200 bg-white shadow-sm dark:bg-neutral-800 dark:border-neutral-700 focus-within:ring-2 focus-within:ring-primary-500/30 focus-within:border-primary-400 transition-all">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-transparent text-sm dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none"
                />
                <Button size="icon" className="px-3">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-900 dark:text-neutral-100 mb-5 flex items-center gap-2"><span className="h-1 w-4 rounded-full bg-gradient-to-r from-primary-500 to-secondary-400" />Shop</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="inline-block text-sm text-neutral-500 hover:text-primary-500 hover:translate-x-1 dark:text-neutral-400 dark:hover:text-primary-400 transition-all duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-900 dark:text-neutral-100 mb-5 flex items-center gap-2"><span className="h-1 w-4 rounded-full bg-gradient-to-r from-primary-500 to-secondary-400" />Support</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="inline-block text-sm text-neutral-500 hover:text-primary-500 hover:translate-x-1 dark:text-neutral-400 dark:hover:text-primary-400 transition-all duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-900 dark:text-neutral-100 mb-5 flex items-center gap-2"><span className="h-1 w-4 rounded-full bg-gradient-to-r from-primary-500 to-secondary-400" />Company</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="inline-block text-sm text-neutral-500 hover:text-primary-500 hover:translate-x-1 dark:text-neutral-400 dark:hover:text-primary-400 transition-all duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            © {new Date().getFullYear()} 1SkyStore. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 mt-4 sm:mt-0">
            {[paymentVisa, paymentMastercard, paymentAmex, paymentGpay, paymentPaytm, paymentWallet, paymentL3, paymentTn].map((icon, idx) => (
              <div key={idx} className="w-12 h-8 bg-white dark:bg-neutral-800 rounded-md border border-neutral-200 dark:border-neutral-700 flex items-center justify-center p-1 shadow-sm transition-transform hover:-translate-y-0.5">
                <img src={icon} alt="Payment Method" className="max-w-full max-h-full object-contain" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
