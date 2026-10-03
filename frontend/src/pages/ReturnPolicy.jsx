import { PackageX, ShieldAlert, RefreshCcw, Mail, Phone, CreditCard } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { CONTAINER } from '@/components/home/ui/styles';
import { PolicySection, TableOfContents } from '@/components/legal/LegalSections';
import { PROSE, CONTACT_LINK, CONTACT_CHIP } from '@/components/legal/styles';

const SECTIONS = [
  { id: 'returns', title: 'Returns', icon: PackageX },
  { id: 'refunds', title: 'Refunds', icon: RefreshCcw },
  { id: 'order-cancellation', title: 'Order Cancellation', icon: ShieldAlert },
];

export default function ReturnPolicy() {
  return (
    <div className="bg-canvas pb-24 sm:pb-32">
      <PageHeader eyebrow="Legal" title="Return & Refund Policy" />

      <div className={`${CONTAINER} grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-10`}>
        <aside className="lg:col-span-3">
          <TableOfContents sections={SECTIONS} />
        </aside>

        <div className="min-w-0 lg:col-span-8 lg:col-start-5">
          <p className="max-w-[68ch] border-b border-line pb-10 font-display text-[clamp(1.2rem,2vw,1.45rem)] leading-[1.45] tracking-[-0.015em] text-ink sm:pb-14">
            At 1SkyStore, we strive to deliver genuine and high-quality homeopathic medicines to our customers across India. Due to the nature of healthcare products, our return and refund policy is designed to ensure safety, hygiene, and product integrity.
          </p>

          {/* Returns Section */}
          <PolicySection sections={SECTIONS} index={0}>
            <div className={PROSE}>
              <p className="font-medium text-ink">
                Homeopathic medicines are non-returnable once delivered because they fall under healthcare and consumable products.
              </p>
              <p>
                However, returns may be accepted under the following conditions:
              </p>
              <ul>
                <li>The product received is damaged during transit</li>
                <li>The product received is incorrect or different from the order placed</li>
                <li>The package received is tampered or leaking</li>
              </ul>
            </div>
            <div className="mt-8 max-w-[68ch] rounded-[1.75rem] bg-accent-soft/60 p-6 sm:p-8">
              <h3 className="font-display text-xl font-medium tracking-[-0.02em] text-ink">To request a return:</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">Please contact us within 48 hours of delivery with the following details:</p>
              <ul className="mt-4 divide-y divide-line border-y border-line text-[15px] text-ink">
                <li className="flex items-center gap-3 py-3"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />Order ID</li>
                <li className="flex items-center gap-3 py-3"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />Photos of the product and packaging</li>
                <li className="flex items-center gap-3 py-3"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />Description of the issue</li>
              </ul>
              <p className="mt-5 flex min-w-0 items-center gap-2.5 text-[15px] font-medium text-ink">
                <Mail className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <span className="break-all">1skystoreofficial@gmail.com</span>
              </p>
            </div>
          </PolicySection>

          {/* Refunds Section */}
          <PolicySection sections={SECTIONS} index={1}>
            <div className={PROSE}>
              <p>
                Once your request is verified, we will process your refund or replacement. Refunds will be issued in the following situations:
              </p>
              <ul>
                <li>Damaged product received</li>
                <li>Incorrect product delivered</li>
                <li>Order cancelled before dispatch</li>
              </ul>
            </div>
            <div className="mt-8 flex max-w-[68ch] items-start gap-4 rounded-2xl border border-line bg-surface p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mist text-ink" aria-hidden="true">
                <CreditCard className="h-4 w-4" />
              </span>
              <p className="text-[15px] leading-relaxed text-ink-soft">
                Refunds are typically processed within <span className="font-semibold text-ink">5–7 business days</span> after approval and will be credited to the original payment method.
              </p>
            </div>
          </PolicySection>

          {/* Cancellation Section */}
          <PolicySection sections={SECTIONS} index={2}>
            <div className={PROSE}>
              <p>
                Orders can be cancelled before they are shipped. Once the order has been dispatched, cancellation may not be possible.
              </p>
            </div>
            <div className="mt-8 max-w-[68ch] rounded-[2rem] border border-line bg-surface px-6 py-8 sm:px-10 sm:py-10">
              <p className="font-display text-xl font-medium tracking-[-0.02em] text-ink">For cancellation requests, contact us immediately:</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a href="mailto:1skystoreofficial@gmail.com" className={CONTACT_LINK}>
                  <span className={CONTACT_CHIP} aria-hidden="true"><Mail className="h-4 w-4" /></span>
                  <span className="min-w-0 break-all">1skystoreofficial@gmail.com</span>
                </a>
                <a href="tel:9705950500" className={CONTACT_LINK}>
                  <span className={CONTACT_CHIP} aria-hidden="true"><Phone className="h-4 w-4" /></span>
                  9705950500
                </a>
              </div>
            </div>
          </PolicySection>
        </div>
      </div>
    </div>
  );
}
