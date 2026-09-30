import { Eye, Lock, FileText, Database, Mail, Phone, MessageCircle } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { CONTAINER } from '@/components/home/ui/styles';
import { PolicySection, TableOfContents } from '@/components/legal/LegalSections';
import { PROSE, CONTACT_LINK, CONTACT_CHIP } from '@/components/legal/styles';

const SECTIONS = [
  { id: 'information-we-collect', title: 'Information We Collect', icon: Eye },
  { id: 'how-we-use-your-information', title: 'How We Use Your Information', icon: Database },
  { id: 'data-security', title: 'Data Security', icon: Lock },
  { id: 'cookies', title: 'Cookies', icon: FileText },
  { id: 'contact-us', title: 'Contact Us', icon: MessageCircle },
];

export default function PrivacyPolicy() {
  return (
    <div className="bg-canvas pb-24 sm:pb-32">
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        intro="At 1SkyStore, we respect your privacy and are committed to protecting your personal information."
      />

      <div className={`${CONTAINER} grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-10`}>
        <aside className="lg:col-span-3">
          <TableOfContents sections={SECTIONS} />
        </aside>

        <div className="min-w-0 lg:col-span-8 lg:col-start-5">
          <p className="max-w-[68ch] border-b border-line pb-10 font-display text-[clamp(1.2rem,2vw,1.45rem)] leading-[1.45] tracking-[-0.015em] text-ink sm:pb-14 [&_strong]:font-medium [&_strong]:text-accent">
            This Privacy Policy explains how we collect, use, and safeguard your information when you use our website <strong>www.instahomeo.com</strong>.
          </p>

          <PolicySection sections={SECTIONS} index={0}>
            <div className={PROSE}>
              <p>We may collect the following information:</p>
            </div>
            <ul className="mt-6 grid max-w-[68ch] grid-cols-1 border-t border-line text-[17px] text-ink sm:grid-cols-2 sm:gap-x-8">
              {['Name', 'Email address', 'Phone number', 'Shipping and billing address', 'Payment information', 'Order history'].map((item) => (
                <li key={item} className="flex items-center gap-3 border-b border-line py-3.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </PolicySection>

          <PolicySection sections={SECTIONS} index={1}>
            <div className={PROSE}>
              <p>Your information is used to:</p>
              <ul>
                <li>Process and deliver your orders</li>
                <li>Provide customer support</li>
                <li>Improve our website and services</li>
                <li>Send order updates and notifications</li>
                <li>Comply with legal and regulatory requirements</li>
              </ul>
            </div>
            <p className="mt-8 max-w-[68ch] rounded-2xl border-l-2 border-accent bg-accent-soft/60 px-5 py-4 text-[17px] font-medium leading-relaxed text-ink">
              We do not sell, rent, or share your personal information with third parties for marketing purposes.
            </p>
          </PolicySection>

          <PolicySection sections={SECTIONS} index={2}>
            <div className={PROSE}>
              <p>
                We take appropriate security measures to protect your personal information from unauthorized access, misuse, or disclosure.
              </p>
            </div>
          </PolicySection>

          <PolicySection sections={SECTIONS} index={3}>
            <div className={PROSE}>
              <p>
                Our website may use cookies to enhance your browsing experience and improve website functionality.
              </p>
            </div>
          </PolicySection>

          <PolicySection sections={SECTIONS} index={4} card>
            <div className={PROSE}>
              <p>If you have questions about this Privacy Policy, please contact us:</p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href="mailto:instahomeo4u@gmail.com" className={CONTACT_LINK}>
                <span className={CONTACT_CHIP} aria-hidden="true"><Mail className="h-4 w-4" /></span>
                <span className="min-w-0 break-all">instahomeo4u@gmail.com</span>
              </a>
              <a href="tel:9705950500" className={CONTACT_LINK}>
                <span className={CONTACT_CHIP} aria-hidden="true"><Phone className="h-4 w-4" /></span>
                9705950500
              </a>
            </div>
          </PolicySection>
        </div>
      </div>
    </div>
  );
}
