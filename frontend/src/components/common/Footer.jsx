import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, MessagesSquare } from 'lucide-react';
import { FOOTER_LINKS, SOCIAL_LINKS } from '@/constants/navigation';
import { useCategories } from '@/hooks/useStoreData';
import { categoryPath } from '@/utils/product';
import BrandWordmark from '@/components/common/BrandWordmark';

import paymentAmex from '@/assets/payments/amex-svgrepo-com.svg';
import paymentGpay from '@/assets/payments/google-pay-primary-logo-logo-svgrepo-com.svg';
import paymentMastercard from '@/assets/payments/mastercard-svgrepo-com.svg';
import paymentVisa from '@/assets/payments/visa-3-svgrepo-com.svg';

const MotionDiv = motion.div;

const PAYMENT_METHODS = [
  { icon: paymentVisa, name: 'Visa' },
  { icon: paymentMastercard, name: 'Mastercard' },
  { icon: paymentAmex, name: 'American Express' },
  { icon: paymentGpay, name: 'Google Pay' },
];

const CATEGORY_LIMIT = 6;

export default function Footer() {
  const categories = useCategories();
  const socials = SOCIAL_LINKS.filter((s) => s.url && s.url !== '#');

  const columns = [
    { title: 'Shop', links: FOOTER_LINKS.shop },
    {
      title: 'Categories',
      links: (categories.data || []).slice(0, CATEGORY_LIMIT).map((name) => ({ name, path: categoryPath(name) })),
    },
    { title: 'Support', links: FOOTER_LINKS.support },
    { title: 'Company', links: FOOTER_LINKS.company },
  ].filter((col) => col.links.length);

  return (
    <footer className="relative overflow-hidden border-t border-line bg-canvas text-ink" role="contentinfo">
      <div className="mx-auto w-full max-w-[1360px] px-4 pt-20 sm:px-6 lg:px-10 lg:pt-28">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Link
              to="/"
              className="inline-flex rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              aria-label="1SKYSTORE home"
            >
              <BrandWordmark className="h-20 sm:h-24" />
            </Link>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-ink-soft">
              Genuine homeopathic medicines and natural wellness essentials from established brands — thoughtfully
              selected for everyday care.
            </p>

            <Link
              to="/contact"
              className="group mt-8 inline-flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-5 ring-1 ring-inset ring-line transition-colors hover:bg-ink hover:text-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white">
                <MessagesSquare className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-sm font-medium">Questions? Talk to our team</span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" aria-hidden="true" />
            </Link>

            {socials.length > 0 && (
              <ul className="mt-6 flex gap-2">
                {socials.map((s) => (
                  <li key={s.name}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-10 items-center rounded-full px-4 text-sm text-ink-soft ring-1 ring-inset ring-line transition-colors hover:text-ink"
                    >
                      {s.name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:col-span-8">
            {columns.map((col) => (
              <div key={col.title}>
                <h2 className="font-display text-[11px] font-medium uppercase tracking-[0.22em] text-ink-faint">
                  {col.title}
                </h2>
                <ul className="mt-5 space-y-1">
                  {col.links.map((link) => (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        className="group inline-flex min-h-9 items-center gap-1 text-[15px] text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
                          {link.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-20 flex flex-col gap-6 border-t border-line py-8 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-[13px] text-ink-faint">© {new Date().getFullYear()} 1SkyStore. All rights reserved.</p>
          <ul className="flex flex-wrap items-center gap-2" aria-label="Accepted payment methods">
            {PAYMENT_METHODS.map(({ icon, name }) => (
              <li
                key={name}
                className="flex h-8 w-12 items-center justify-center rounded-md bg-white p-1 ring-1 ring-line"
              >
                <img src={icon} alt={name} className="max-h-full max-w-full object-contain" />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Oversized wordmark bleeding off the bottom edge */}
      <MotionDiv
        aria-hidden="true"
        initial={{ y: '35%', opacity: 0 }}
        whileInView={{ y: '0%', opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none -mb-[3.6vw] select-none whitespace-nowrap text-center font-display text-[17.5vw] font-semibold leading-[0.8] tracking-[-0.06em] text-ink/[0.07]"
      >
        1SKYSTORE
      </MotionDiv>
    </footer>
  );
}
