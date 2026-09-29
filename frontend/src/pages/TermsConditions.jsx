import { motion } from 'framer-motion';
import { FileSignature, Info, ShoppingCart, Truck, ShieldCheck, Phone, Mail } from 'lucide-react';

export default function TermsConditions() {
  const sections = [
    {
      title: "Use of Website",
      icon: <Info className="w-6 h-6 text-blue-500" />,
      content: (
        <>
          <p className="mb-2">The content on this website is for general informational purposes only and should not replace professional medical advice.</p>
          <p className="font-medium text-primary-600 dark:text-primary-400">Customers are encouraged to consult a qualified homeopathic practitioner before using medicines.</p>
        </>
      )
    },
    {
      title: "Product Information",
      icon: <FileSignature className="w-6 h-6 text-purple-500" />,
      content: (
        <p>We strive to ensure that all product descriptions, prices, and availability are accurate. However, we reserve the right to correct errors or update information at any time without prior notice.</p>
      )
    },
    {
      title: "Orders",
      icon: <ShoppingCart className="w-6 h-6 text-primary-500" />,
      content: (
        <ul className="list-disc list-inside space-y-2">
          <li>All orders are subject to availability and confirmation.</li>
          <li>1SkyStore reserves the right to cancel any order due to pricing errors, stock issues, or suspicious activity.</li>
        </ul>
      )
    },
    {
      title: "Shipping",
      icon: <Truck className="w-6 h-6 text-orange-500" />,
      content: (
        <p>We deliver homeopathic medicines across India through reliable courier partners. Delivery timelines may vary depending on location and courier services.</p>
      )
    },
    {
      title: "Intellectual Property",
      icon: <ShieldCheck className="w-6 h-6 text-red-500" />,
      content: (
        <p>All content on this website including text, images, logos, and design is the property of 1SkyStore and may not be copied or reproduced without permission.</p>
      )
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
          Terms & Conditions
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Welcome to 1SkyStore. By accessing and using <strong>www.instahomeo.com</strong>, you agree to comply with the following terms and conditions.
        </p>
      </div>

      <div className="space-y-8">
        {sections.map((section, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-neutral-900 p-6 md:p-8 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl shrink-0">
                {section.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">{section.title}</h2>
                <div className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {section.content}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800/20 p-8 rounded-2xl text-center">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">Contact Information</h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">For any questions regarding these Terms & Conditions:</p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          <a href="mailto:instahomeo4u@gmail.com" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors">
            <Mail className="w-5 h-5" /> instahomeo4u@gmail.com
          </a>
          <a href="tel:9705950500" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors">
            <Phone className="w-5 h-5" /> 9705950500
          </a>
        </div>
      </div>
    </motion.div>
  );
}
