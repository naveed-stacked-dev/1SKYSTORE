import { motion } from 'framer-motion';
import { PackageX, ShieldAlert, RefreshCcw, Mail, Phone, CreditCard } from 'lucide-react';

export default function ReturnPolicy() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-12 md:py-20 max-w-4xl"
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-neutral-900 dark:text-white mb-4">
          Return & Refund Policy
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          At 1SkyStore, we strive to deliver genuine and high-quality homeopathic medicines to our customers across India. Due to the nature of healthcare products, our return and refund policy is designed to ensure safety, hygiene, and product integrity.
        </p>
      </div>

      <div className="space-y-12">
        {/* Returns Section */}
        <section className="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3 mb-6">
            <PackageX className="w-8 h-8 text-primary-500" />
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Returns</h2>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4 font-medium">
            Homeopathic medicines are non-returnable once delivered because they fall under healthcare and consumable products.
          </p>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            However, returns may be accepted under the following conditions:
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400 mb-6 ml-4">
            <li>The product received is damaged during transit</li>
            <li>The product received is incorrect or different from the order placed</li>
            <li>The package received is tampered or leaking</li>
          </ul>
          <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-xl border border-primary-100 dark:border-primary-800/30">
            <h3 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">To request a return:</h3>
            <p className="text-sm text-primary-800 dark:text-primary-200 mb-2">Please contact us within 48 hours of delivery with the following details:</p>
            <ul className="list-disc list-inside text-sm text-primary-800 dark:text-primary-200 ml-2 space-y-1">
              <li>Order ID</li>
              <li>Photos of the product and packaging</li>
              <li>Description of the issue</li>
            </ul>
            <div className="mt-4 flex items-center gap-2 text-sm text-primary-800 dark:text-primary-200">
              <Mail className="w-4 h-4" /> instahomeo4u@gmail.com
            </div>
          </div>
        </section>

        {/* Refunds Section */}
        <section className="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3 mb-6">
            <RefreshCcw className="w-8 h-8 text-secondary-500" />
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Refunds</h2>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Once your request is verified, we will process your refund or replacement. Refunds will be issued in the following situations:
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400 mb-6 ml-4">
            <li>Damaged product received</li>
            <li>Incorrect product delivered</li>
            <li>Order cancelled before dispatch</li>
          </ul>
          <div className="flex items-start gap-3 bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl">
            <CreditCard className="w-5 h-5 text-neutral-500 mt-0.5 shrink-0" />
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Refunds are typically processed within <span className="font-semibold">5–7 business days</span> after approval and will be credited to the original payment method.
            </p>
          </div>
        </section>

        {/* Cancellation Section */}
        <section className="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3 mb-6">
            <ShieldAlert className="w-8 h-8 text-red-500" />
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Order Cancellation</h2>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Orders can be cancelled before they are shipped. Once the order has been dispatched, cancellation may not be possible.
          </p>
          <div className="bg-neutral-50 dark:bg-neutral-800/50 p-6 rounded-xl text-center">
            <p className="font-semibold text-neutral-900 dark:text-white mb-4">For cancellation requests, contact us immediately:</p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <a href="mailto:instahomeo4u@gmail.com" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors">
                <Mail className="w-5 h-5" /> instahomeo4u@gmail.com
              </a>
              <a href="tel:9705950500" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors">
                <Phone className="w-5 h-5" /> 9705950500
              </a>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
