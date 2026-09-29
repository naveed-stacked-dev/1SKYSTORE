import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState } from 'react';
import Button from '@/components/ui/Button';

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-12 md:py-20 max-w-6xl"
    >
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-neutral-900 dark:text-white mb-4">
          Contact Us
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          We're here to help! If you have any questions about our products, your order, or homeopathy in general, please don't hesitate to reach out.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        {/* Contact Info */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">Get in Touch</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
              Our support team is available Monday to Saturday, 11 AM – 9 PM. We aim to respond to all inquiries within 24 hours.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl shrink-0">
                <Phone className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white text-lg">Phone</h3>
                <p className="text-neutral-500 dark:text-neutral-400 mb-1">Call us directly</p>
                <a href="tel:9705950500" className="text-primary-600 hover:text-primary-700 font-medium">9705950500</a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl shrink-0">
                <Mail className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white text-lg">Email</h3>
                <p className="text-neutral-500 dark:text-neutral-400 mb-1">Send us an email</p>
                <a href="mailto:instahomeo4u@gmail.com" className="text-primary-600 hover:text-primary-700 font-medium">instahomeo4u@gmail.com</a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl shrink-0">
                <MapPin className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white text-lg">Location</h3>
                <p className="text-neutral-500 dark:text-neutral-400 mb-1">Visit our store</p>
                <p className="text-neutral-900 dark:text-white font-medium">Hyderabad, India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-8 md:p-10 rounded-3xl shadow-sm">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">Send us a Message</h2>
          
          {isSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              Your message has been sent successfully. We will get back to you soon!
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
                placeholder="How can we help?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Message</label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors resize-none"
                placeholder="Write your message here..."
              />
            </div>

            <Button
              type="submit"
              className="w-full py-3.5 text-base flex justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
