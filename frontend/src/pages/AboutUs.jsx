import { motion } from 'framer-motion';
import { Info, Target, ShoppingBag, ShieldCheck, Star } from 'lucide-react';

export default function AboutUs() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-12 md:py-20 max-w-4xl"
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-neutral-900 dark:text-white mb-4">
          About Us
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Welcome to <strong className="text-primary-600 dark:text-primary-400">1SkyStore</strong>, your trusted online destination to buy homeopathic medicines in India. We are committed to making natural, safe, and effective healing accessible to every household across the country with fast and reliable delivery.
        </p>
      </div>

      <div className="space-y-12">
        {/* Who We Are */}
        <section className="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3 mb-6">
            <Info className="w-7 h-7 text-primary-500" />
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white m-0">Who We Are</h2>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
            1SkyStore is a dedicated <strong>e-commerce platform for homeopathy medicines</strong>, offering a wide selection of authentic remedies sourced from India’s and the world’s most trusted brands. Our goal is to simplify the process of purchasing homeopathic medicines online while ensuring quality, affordability, and convenience.
          </p>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Whether you are a long-time believer in homeopathy or just beginning your journey towards natural healing, 1SkyStore is here to support your wellness needs.
          </p>
        </section>

        {/* Our Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8">
          <section className="bg-primary-50 dark:bg-primary-900/20 p-8 rounded-2xl border border-primary-100 dark:border-primary-800/30">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white m-0">Our Mission</h2>
            </div>
            <p className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed">
              Our mission is to provide <strong>genuine homeopathic medicines online across India</strong> while promoting holistic healing and wellness. We aim to bridge the gap between traditional homeopathy and modern e-commerce by delivering trusted remedies right to your doorstep.
            </p>
          </section>

          <section className="bg-secondary-50 dark:bg-secondary-900/20 p-8 rounded-2xl border border-secondary-100 dark:border-secondary-800/30">
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white m-0">Our Vision</h2>
            </div>
            <p className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed">
              We envision becoming India’s most trusted online platform for homeopathy by delivering reliable products, spreading awareness about natural healing, and building long-term relationships with our customers.
            </p>
          </section>
        </div>

        {/* What We Offer & Brands */}
        <div className="grid md:grid-cols-2 gap-8">
          <section className="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-3 mb-4">
              <ShoppingBag className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white m-0">What We Offer</h2>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">At 1SkyStore, you can explore a comprehensive range of homeopathic products, including:</p>
            <ul className="space-y-2 text-neutral-600 dark:text-neutral-400 text-sm ml-2">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Single remedies</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Mother tinctures (Q)</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Dilutions (CH, X, LM potencies)</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Biochemic medicines</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Combination formulas</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Specialized wellness products</li>
            </ul>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-4">We cater to a wide range of health concerns such as immunity, hair fall, skin care, digestion, stress, and overall well-being.</p>
          </section>

          <section className="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-6 h-6 text-primary-500" />
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white m-0">Trusted Brands We Deal In</h2>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">We proudly offer products from some of the most renowned homeopathy brands, ensuring authenticity and quality:</p>
            <div className="grid grid-cols-2 gap-2 text-neutral-600 dark:text-neutral-400 text-sm ml-2">
              <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> SBL</div>
              <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Dr. Reckeweg</div>
              <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Adel</div>
              <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Bakson</div>
              <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Schwabe</div>
              <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Nipco</div>
              <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> New Life</div>
              <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> REPL</div>
              <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Adven</div>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-4">Our strong network with reliable suppliers ensures that every product you receive is <strong>100% genuine and properly stored</strong>.</p>
          </section>
        </div>

        {/* Why Choose Us */}
        <section className="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Why Choose 1SkyStore?</h2>
              <ul className="space-y-3 text-neutral-600 dark:text-neutral-400">
                <li className="flex items-center gap-3"><span className="text-primary-500">✔️</span> Wide range of homeopathic medicines</li>
                <li className="flex items-center gap-3"><span className="text-primary-500">✔️</span> 100% genuine and authentic products</li>
                <li className="flex items-center gap-3"><span className="text-primary-500">✔️</span> Competitive pricing</li>
                <li className="flex items-center gap-3"><span className="text-primary-500">✔️</span> Easy online ordering</li>
                <li className="flex items-center gap-3"><span className="text-primary-500">✔️</span> Fast and secure delivery across India</li>
                <li className="flex items-center gap-3"><span className="text-primary-500">✔️</span> Customer-focused support</li>
              </ul>
              <p className="mt-6 text-neutral-700 dark:text-neutral-300 font-medium">
                We prioritize your health and satisfaction, making us a preferred choice for <strong>buying homeopathic medicines online in India</strong>.
              </p>
            </div>
            <div className="flex-1 bg-neutral-50 dark:bg-neutral-800 p-6 rounded-xl text-center">
              <ShieldCheck className="w-12 h-12 text-primary-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Quality & Trust</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                At 1SkyStore, quality is our top priority. Every product listed on our website is carefully sourced and handled to maintain its effectiveness. We follow strict quality checks to ensure that you receive only the best.
              </p>
            </div>
          </div>
        </section>

        {/* Outro */}
        <div className="text-center pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Shop With Confidence</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            With 1SkyStore, you can shop for your homeopathic needs with confidence. We are here to make your journey toward natural healing simple, accessible, and effective.
          </p>
          <p className="text-primary-600 dark:text-primary-400 font-medium text-lg">
            1SkyStore – Buy Homeopathic Medicines Online in India with Trust & Confidence
          </p>
        </div>
      </div>
    </motion.div>
  );
}
