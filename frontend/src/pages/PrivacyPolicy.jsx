import { motion } from 'framer-motion';
import { Shield, Eye, Lock, FileText, Database, Mail, Phone } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-12 md:py-20 max-w-4xl"
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-neutral-900 dark:text-white mb-4">
          Privacy Policy
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          At 1SkyStore, we respect your privacy and are committed to protecting your personal information.
        </p>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none space-y-12">
        <p className="text-neutral-600 dark:text-neutral-400 lead">
          This Privacy Policy explains how we collect, use, and safeguard your information when you use our website <strong>www.instahomeo.com</strong>.
        </p>

        <section className="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3 mb-6">
            <Eye className="w-7 h-7 text-primary-500" />
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white m-0">Information We Collect</h2>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">We may collect the following information:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {['Name', 'Email address', 'Phone number', 'Shipping and billing address', 'Payment information', 'Order history'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-7 h-7 text-secondary-500" />
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white m-0">How We Use Your Information</h2>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">Your information is used to:</p>
          <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400 mb-6 ml-4">
            <li>Process and deliver your orders</li>
            <li>Provide customer support</li>
            <li>Improve our website and services</li>
            <li>Send order updates and notifications</li>
            <li>Comply with legal and regulatory requirements</li>
          </ul>
          <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-xl border border-primary-100 dark:border-primary-800/30">
            <p className="text-primary-800 dark:text-primary-200 m-0 font-medium">
              We do not sell, rent, or share your personal information with third parties for marketing purposes.
            </p>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-8">
          <section className="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-primary-500" />
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white m-0">Data Security</h2>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              We take appropriate security measures to protect your personal information from unauthorized access, misuse, or disclosure.
            </p>
          </section>

          <section className="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white m-0">Cookies</h2>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              Our website may use cookies to enhance your browsing experience and improve website functionality.
            </p>
          </section>
        </div>

        <section className="bg-neutral-50 dark:bg-neutral-800/50 p-8 rounded-2xl text-center">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Contact Us</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">If you have questions about this Privacy Policy, please contact us:</p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <a href="mailto:instahomeo4u@gmail.com" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors">
              <Mail className="w-5 h-5" /> instahomeo4u@gmail.com
            </a>
            <a href="tel:9705950500" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors">
              <Phone className="w-5 h-5" /> 9705950500
            </a>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
