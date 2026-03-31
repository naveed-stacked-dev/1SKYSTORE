import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Send, Heart } from 'lucide-react';
import { FOOTER_LINKS, SOCIAL_LINKS } from '@/constants/navigation';
import Button from '@/components/ui/Button';

export default function Footer() {
  const [email, setEmail] = useState('');

  return (
    <footer className="bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 transition-colors" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="text-xl font-heading font-bold text-primary-500">
              1SkyStore
            </Link>
            <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-sm">
              Premium homeopathy products and natural wellness solutions. Trusted by thousands of customers worldwide.
            </p>
            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Stay updated</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
                <Button size="icon" className="px-3">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-neutral-500 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Support</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-neutral-500 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Company</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-neutral-500 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors"
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
          <p className="text-xs text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-error-500 fill-error-500" /> for natural wellness
          </p>
        </div>
      </div>
    </footer>
  );
}
