import { FileSignature, Info, ShoppingCart, Truck, ShieldCheck, Phone, Mail, MessageCircle } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { CONTAINER } from '@/components/home/ui/styles';
import { PolicySection, TableOfContents } from '@/components/legal/LegalSections';
import { PROSE, CONTACT_LINK, CONTACT_CHIP } from '@/components/legal/styles';

const SECTIONS = [
  {
    id: 'use-of-website',
    title: "Use of Website",
    icon: Info,
    content: (
      <>
        <p>The content on this website is for general informational purposes only and should not replace professional medical advice.</p>
        <p className="font-medium text-accent">Customers are encouraged to consult a qualified homeopathic practitioner before using medicines.</p>
      </>
    )
  },
  {
    id: 'product-information',
    title: "Product Information",
    icon: FileSignature,
    content: (
      <p>We strive to ensure that all product descriptions, prices, and availability are accurate. However, we reserve the right to correct errors or update information at any time without prior notice.</p>
    )
  },
  {
    id: 'orders',
    title: "Orders",
    icon: ShoppingCart,
    content: (
      <ul>
        <li>All orders are subject to availability and confirmation.</li>
        <li>1SkyStore reserves the right to cancel any order due to pricing errors, stock issues, or suspicious activity.</li>
      </ul>
    )
  },
  {
    id: 'shipping',
    title: "Shipping",
    icon: Truck,
    content: (
      <p>We deliver homeopathic medicines across India through reliable courier partners. Delivery timelines may vary depending on location and courier services.</p>
    )
  },
  {
    id: 'intellectual-property',
    title: "Intellectual Property",
    icon: ShieldCheck,
    content: (
      <p>All content on this website including text, images, logos, and design is the property of 1SkyStore and may not be copied or reproduced without permission.</p>
    )
  },
  { id: 'contact-information', title: 'Contact Information', icon: MessageCircle },
];

const CONTACT_INDEX = SECTIONS.length - 1;

export default function TermsConditions() {
  return (
    <div className="bg-canvas pb-24 sm:pb-32">
      <PageHeader
        eyebrow="Legal"
        title="Terms & Conditions"
        intro={
          <>
            Welcome to 1SkyStore. By accessing and using <strong className="font-medium text-ink">www.instahomeo.com</strong>, you agree to comply with the following terms and conditions.
          </>
        }
      />

      <div className={`${CONTAINER} grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-10`}>
        <aside className="lg:col-span-3">
          <TableOfContents sections={SECTIONS} />
        </aside>

        <div className="min-w-0 lg:col-span-8 lg:col-start-5">
          {SECTIONS.slice(0, CONTACT_INDEX).map((section, index) => (
            <PolicySection sections={SECTIONS} key={section.id} index={index}>
              <div className={PROSE}>{section.content}</div>
            </PolicySection>
          ))}

          <PolicySection sections={SECTIONS} index={CONTACT_INDEX} card>
            <div className={PROSE}>
              <p>For any questions regarding these Terms & Conditions:</p>
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
