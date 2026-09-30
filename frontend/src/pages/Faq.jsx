import { motion } from 'framer-motion';
import { Mail, Phone, Plus } from 'lucide-react';
import { useId, useState } from 'react';
import { revealGroup, revealUp, EASE_OUT } from '@/animations/variants';
import PageHeader from '@/components/common/PageHeader';
import { CONTAINER } from '@/components/home/ui/styles';

const MotionDiv = motion.div;
const MotionAside = motion.aside;

export default function Faq() {
  const faqs = [
    {
      question: "What is homeopathy?",
      answer: "Homeopathy is a natural system of medicine that uses highly diluted substances to stimulate the body’s healing process."
    },
    {
      question: "Are homeopathic medicines safe?",
      answer: "Yes. Homeopathic medicines are generally considered safe when used according to proper guidance."
    },
    {
      question: "Do I need a prescription to buy homeopathic medicines?",
      answer: "Many homeopathic medicines can be purchased without a prescription, but it is recommended to consult a qualified practitioner for the best results."
    },
    {
      question: "How long does delivery take?",
      answer: (
        <div>
          <p className="mb-3 font-medium text-ink">Estimated delivery time:</p>
          <ul className="divide-y divide-line rounded-2xl border border-line">
            <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3"><span className="font-medium text-ink">Metro Cities:</span> 2–4 business days</li>
            <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3"><span className="font-medium text-ink">Other Cities:</span> 3–6 business days</li>
            <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3"><span className="font-medium text-ink">Remote Areas:</span> 5–8 business days</li>
          </ul>
        </div>
      )
    },
    {
      question: "Can I cancel my order?",
      answer: "Yes, orders can be cancelled before they are shipped."
    },
    {
      question: "What should I do if I receive a damaged product?",
      answer: "Please contact us within 48 hours of delivery with photos of the damaged product."
    }
  ];

  return (
    <div className="bg-canvas pb-24 sm:pb-32">
      <PageHeader
        eyebrow="Help centre"
        title="FAQ"
        intro="Frequently Asked Questions for Homeopathic Medicine Buyers"
      />

      <div className={`${CONTAINER} grid grid-cols-1 items-start gap-14 lg:grid-cols-12 lg:gap-10`}>
        <MotionDiv
          variants={revealGroup(0.06, 0.2)}
          initial="hidden"
          animate="show"
          className="border-t border-line lg:col-span-8"
        >
          {faqs.map((faq, index) => (
            <FaqItem key={index} faq={faq} index={index} />
          ))}
        </MotionDiv>

        <MotionAside
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: EASE_OUT }}
          aria-labelledby="faq-support"
          className="rounded-[2rem] bg-deep p-8 text-on-deep sm:p-10 lg:sticky lg:top-32 lg:col-span-4"
        >
          <h2 id="faq-support" className="font-display text-[clamp(1.6rem,2.6vw,2.1rem)] font-medium leading-[1.08] tracking-[-0.03em] text-on-deep">
            Still have questions?
          </h2>
          <p className="mt-4 text-base text-on-deep">How can I contact 1SkyStore support?</p>
          <p className="mt-1.5 text-sm leading-relaxed text-on-deep-soft">Our support team is available Monday to Saturday, 11 AM – 9 PM.</p>

          <div className="mt-8 flex flex-col gap-3">
            <a
              href="mailto:instahomeo4u@gmail.com"
              className="group flex min-h-12 items-center gap-3 rounded-full bg-on-deep/8 py-1.5 pl-1.5 pr-5 text-[15px] font-medium text-on-deep ring-1 ring-inset ring-on-deep/10 transition-colors duration-500 hover:bg-on-deep hover:text-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9EC3ED]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-on-deep/10 transition-colors duration-500 group-hover:bg-deep group-hover:text-on-deep" aria-hidden="true">
                <Mail className="h-4 w-4" />
              </span>
              <span className="min-w-0 break-all">instahomeo4u@gmail.com</span>
            </a>
            <a
              href="tel:9705950500"
              className="group flex min-h-12 items-center gap-3 rounded-full bg-on-deep/8 py-1.5 pl-1.5 pr-5 text-[15px] font-medium text-on-deep ring-1 ring-inset ring-on-deep/10 transition-colors duration-500 hover:bg-on-deep hover:text-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9EC3ED]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-on-deep/10 transition-colors duration-500 group-hover:bg-deep group-hover:text-on-deep" aria-hidden="true">
                <Phone className="h-4 w-4" />
              </span>
              9705950500
            </a>
          </div>
        </MotionAside>
      </div>
    </div>
  );
}

function FaqItem({ faq, index }) {
  const [isOpen, setIsOpen] = useState(false);
  const id = useId();
  const buttonId = `${id}-question`;
  const panelId = `${id}-answer`;

  return (
    <MotionDiv variants={revealUp} className="border-b border-line">
      <h2 className="font-display">
        <button
          type="button"
          id={buttonId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen(!isOpen)}
          className="group flex min-h-16 w-full items-start gap-4 py-6 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:gap-6 sm:py-7"
        >
          <span className="w-7 shrink-0 pt-1 font-display text-sm tabular-nums text-ink-faint" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="flex-1 font-display text-[clamp(1.1rem,1.8vw,1.4rem)] font-medium leading-snug tracking-[-0.02em] text-ink transition-colors duration-300 group-hover:text-accent">
            {faq.question}
          </span>
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 ring-inset transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isOpen ? 'rotate-45 bg-ink text-canvas ring-ink' : 'text-ink ring-line group-hover:bg-ink/6'
            }`}
            aria-hidden="true"
          >
            <Plus className="h-4 w-4" />
          </span>
        </button>
      </h2>

      {/* Kept mounted so answers stay in the document for search and find-in-page */}
      <MotionDiv
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        aria-hidden={!isOpen}
        inert={!isOpen}
        initial={false}
        animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ height: { duration: 0.55, ease: EASE_OUT }, opacity: { duration: 0.4, ease: EASE_OUT } }}
        className="overflow-hidden"
      >
        <div className="max-w-[62ch] pb-7 pl-11 pr-2 text-base leading-relaxed text-ink-soft sm:pb-8 sm:pl-13 sm:pr-14 sm:text-[17px]">
          {faq.answer}
        </div>
      </MotionDiv>
    </MotionDiv>
  );
}
