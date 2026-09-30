import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PageHeader from '@/components/common/PageHeader';
import { CONTAINER } from '@/components/home/ui/styles';
import { revealGroup, revealUp, IN_VIEW, EASE_OUT } from '@/animations/variants';

const MotionDiv = motion.div;
const MotionLi = motion.li;

const LABEL = 'mb-1.5 block text-[13px] font-medium text-ink-soft';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    }, 1500);
  };

  const channels = [
    { icon: Phone, title: 'Phone', note: 'Call us directly', value: '9705950500', href: 'tel:9705950500' },
    { icon: Mail, title: 'Email', note: 'Send us an email', value: 'instahomeo4u@gmail.com', href: 'mailto:instahomeo4u@gmail.com' },
    { icon: MapPin, title: 'Location', note: 'Visit our store', value: 'Hyderabad, India' },
  ];

  return (
    <div className="bg-canvas pb-24 sm:pb-32">
      <PageHeader
        eyebrow="Support"
        title="Contact Us"
        intro="We're here to help! If you have any questions about our products, your order, or homeopathy in general, please don't hesitate to reach out."
      />

      <div className={`${CONTAINER} grid grid-cols-1 items-start gap-14 lg:grid-cols-12 lg:gap-10`}>
        {/* Contact Info */}
        <MotionDiv
          variants={revealGroup(0.08, 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="lg:col-span-5"
        >
          <MotionDiv variants={revealUp}>
            <h2 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-[1.05] tracking-[-0.035em] text-ink">
              Get in Touch
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft sm:text-[17px]">
              Our support team is available Monday to Saturday, 11 AM – 9 PM. We aim to respond to all inquiries within 24 hours.
            </p>
          </MotionDiv>

          <ul className="mt-10 space-y-3">
            {channels.map((channel) => (
              <MotionLi key={channel.title} variants={revealUp}>
                <ContactCard {...channel} />
              </MotionLi>
            ))}
          </ul>
        </MotionDiv>

        {/* Contact Form */}
        <MotionDiv
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: EASE_OUT }}
          className="rounded-[2rem] border border-line bg-surface p-6 sm:p-10 lg:col-span-7 lg:p-12"
        >
          <h2 className="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-medium leading-[1.1] tracking-[-0.03em] text-ink">
            Send us a Message
          </h2>

          <AnimatePresence initial={false}>
            {isSuccess && (
              <MotionDiv
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.45, ease: EASE_OUT }}
                className="overflow-hidden"
              >
                <div
                  role="status"
                  className="mt-6 flex items-start gap-3 rounded-2xl bg-success-50 p-4 text-[15px] text-success-700 ring-1 ring-inset ring-success-500/20 dark:bg-success-500/10 dark:text-success-500"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                  Your message has been sent successfully. We will get back to you soon!
                </div>
              </MotionDiv>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className={LABEL}>Full Name</label>
              <Input
                type="text"
                id="name"
                name="name"
                required
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className={LABEL}>Email Address</label>
              <Input
                type="email"
                id="email"
                name="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="subject" className={LABEL}>Subject</label>
              <Input
                type="text"
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                placeholder="How can we help?"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="message" className={LABEL}>Message</label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                value={formData.message}
                onChange={handleChange}
                className="block w-full resize-none rounded-2xl border border-line bg-surface px-4 py-3 text-[15px] leading-relaxed text-ink transition-[border-color,box-shadow] duration-200 placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15"
                placeholder="Write your message here..."
              />
            </div>

            <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[13px] text-ink-faint">All fields are required.</p>
              <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : (
                  <>
                    <Send className="h-4 w-4" aria-hidden="true" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </form>
        </MotionDiv>
      </div>
    </div>
  );
}

function ContactCard({ icon, title, note, value, href }) {
  const Icon = icon;

  return (
    <div className="group relative flex items-center gap-5 rounded-[1.75rem] border border-line bg-surface/60 p-5 transition-colors duration-500 hover:border-ink/20 hover:bg-surface sm:p-6">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent" aria-hidden="true">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-[11px] font-medium uppercase tracking-[0.2em] text-ink-faint">{title}</h3>
        <p className="mt-0.5 text-[13px] text-ink-faint">{note}</p>
        {href ? (
          <a
            href={href}
            className="mt-1.5 block break-words font-display text-lg font-medium tracking-[-0.015em] text-ink transition-colors duration-300 before:absolute before:inset-0 before:rounded-[1.75rem] before:content-[''] group-hover:text-accent focus-visible:outline-none focus-visible:before:outline-2 focus-visible:before:outline-offset-2 focus-visible:before:outline-accent sm:text-xl"
          >
            {value}
          </a>
        ) : (
          <p className="mt-1.5 font-display text-lg font-medium tracking-[-0.015em] text-ink sm:text-xl">{value}</p>
        )}
      </div>
    </div>
  );
}
