import { motion } from 'framer-motion';
import { HelpCircle, Mail, Phone } from 'lucide-react';
import { useState } from 'react';

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
        <div className="mt-2">
          <p className="mb-2 font-medium">Estimated delivery time:</p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
            <li><span className="font-medium text-neutral-700 dark:text-neutral-300">Metro Cities:</span> 2–4 business days</li>
            <li><span className="font-medium text-neutral-700 dark:text-neutral-300">Other Cities:</span> 3–6 business days</li>
            <li><span className="font-medium text-neutral-700 dark:text-neutral-300">Remote Areas:</span> 5–8 business days</li>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-12 md:py-20 max-w-4xl"
    >
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-neutral-900 dark:text-white mb-4">
          FAQ
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Frequently Asked Questions for Homeopathic Medicine Buyers
        </p>
      </div>

      <div className="space-y-6 max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <FaqItem key={index} faq={faq} index={index} />
        ))}
      </div>

      <div className="mt-16 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-8 rounded-3xl text-center shadow-sm">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-full">
            <HelpCircle className="w-8 h-8 text-primary-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Still have questions?</h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-2">How can I contact 1SkyStore support?</p>
        <p className="text-sm text-neutral-500 dark:text-neutral-500 mb-6">Our support team is available Monday to Saturday, 11 AM – 9 PM.</p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          <a href="mailto:instahomeo4u@gmail.com" className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-800 px-6 py-3 rounded-xl text-primary-600 hover:text-primary-700 transition-colors font-medium">
            <Mail className="w-5 h-5" /> instahomeo4u@gmail.com
          </a>
          <a href="tel:9705950500" className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-800 px-6 py-3 rounded-xl text-primary-600 hover:text-primary-700 transition-colors font-medium">
            <Phone className="w-5 h-5" /> 9705950500
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function FaqItem({ faq, index }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`border rounded-2xl overflow-hidden transition-colors ${isOpen ? 'border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10' : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-6 text-left focus:outline-none"
      >
        <span className="font-semibold text-lg text-neutral-900 dark:text-white pr-4">{faq.question}</span>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'}`}>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>
      
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="p-6 pt-0 text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-transparent">
          {faq.answer}
        </div>
      </div>
    </motion.div>
  );
}
