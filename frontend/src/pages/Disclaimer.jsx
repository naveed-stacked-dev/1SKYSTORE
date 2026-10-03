import { Info, Stethoscope, Users, FileText, ShieldAlert } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { CONTAINER } from '@/components/home/ui/styles';
import { PolicySection, TableOfContents } from '@/components/legal/LegalSections';
import { PROSE } from '@/components/legal/styles';

const SECTIONS = [
  {
    id: 'general-information',
    title: 'General Information',
    icon: Info,
    content: (
      <p>
        The information and products provided on 1SkyStore are intended for general informational and supportive healthcare purposes. Homeopathic medicines are offered as part of a complementary approach to health and wellness and should be used responsibly and, where appropriate, under the guidance of a qualified and registered healthcare practitioner.
      </p>
    ),
  },
  {
    id: 'not-a-substitute',
    title: 'Not a Substitute for Medical Care',
    icon: Stethoscope,
    content: (
      <>
        <p>
          Homeopathic medicines should not be considered a replacement or substitute for conventional medical treatment, prescribed medicines, emergency care, vaccination, surgery, or any other appropriate standard of care. They may be used as a complementary/supportive approach alongside appropriate standard medical care, as advised by a qualified healthcare professional.
        </p>
        <p>
          Do not stop, reduce, delay, or discontinue any prescribed medication or medical treatment without first consulting your treating doctor. Medicines prescribed for chronic or serious conditions should be continued as directed by your healthcare provider.
        </p>
        <p>
          Do not delay seeking appropriate medical attention for serious, worsening, persistent, or emergency symptoms. Homeopathic products should not be used to postpone diagnosis, investigation, referral, or treatment when conventional medical care is indicated.
        </p>
      </>
    ),
  },
  {
    id: 'consult-a-professional',
    title: 'Consult a Professional',
    icon: Users,
    content: (
      <>
        <p>
          Pregnant or breastfeeding individuals, children, elderly persons, and people with chronic or serious medical conditions should consult a qualified healthcare professional before using any medicine or health product.
        </p>
        <p>
          Self-diagnosis and self-medication are discouraged. The selection of a homeopathic medicine, potency, dosage, frequency, and duration should be determined according to the individual’s circumstances and, when appropriate, the advice of a registered practitioner.
        </p>
      </>
    ),
  },
  {
    id: 'product-information',
    title: 'Product Information & Results',
    icon: FileText,
    content: (
      <>
        <p>
          Product descriptions, indications, traditional uses, and other information displayed on this website are provided for educational and informational purposes only and should not be interpreted as a diagnosis, medical advice, or a guarantee of therapeutic results.
        </p>
        <p>
          Individual responses to any healthcare product may vary. 1SkyStore does not claim or guarantee that any particular homeopathic product will diagnose, treat, cure, or prevent a specific disease or medical condition.
        </p>
      </>
    ),
  },
  { id: 'important-notice', title: 'Important Notice', icon: ShieldAlert },
];

const NOTICE_INDEX = SECTIONS.length - 1;

export default function Disclaimer() {
  return (
    <div className="bg-canvas pb-24 sm:pb-32">
      <PageHeader eyebrow="Legal" title="Homeopathic Product Disclaimer" />

      <div className={`${CONTAINER} grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-10`}>
        <aside className="lg:col-span-3">
          <TableOfContents sections={SECTIONS} />
        </aside>

        <div className="min-w-0 lg:col-span-8 lg:col-start-5">
          {SECTIONS.slice(0, NOTICE_INDEX).map((section, index) => (
            <PolicySection sections={SECTIONS} key={section.id} index={index}>
              <div className={PROSE}>{section.content}</div>
            </PolicySection>
          ))}

          <PolicySection sections={SECTIONS} index={NOTICE_INDEX} card>
            <div className={PROSE}>
              <p className="font-medium text-accent">
                Important: Do not delay, discontinue, or replace vaccination, prescribed medicines, or other appropriate standard medical care with homeopathic products. Seek advice from a qualified healthcare professional whenever medical assessment or treatment is required.
              </p>
              <p>
                1SkyStore encourages customers to make informed healthcare decisions and to consult an appropriately qualified healthcare professional for individual medical concerns.
              </p>
            </div>
          </PolicySection>
        </div>
      </div>
    </div>
  );
}
