import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-white dark:bg-neutral-950 transition-colors duration-300">
      {/* Left — Branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-200 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <Link to="/" className="text-3xl font-heading font-bold mb-8 tracking-tight">
            1SkyStore
          </Link>
          <h2 className="text-4xl font-heading font-semibold leading-tight mb-4">
            Natural wellness,<br />delivered to you.
          </h2>
          <p className="text-lg text-white/70 leading-relaxed max-w-md">
            Premium homeopathy remedies and holistic health solutions from trusted brands worldwide.
          </p>
        </div>
      </div>

      {/* Right — Form area */}
      <div className="flex-1 flex flex-col">
        <div className="p-6 lg:p-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary-500 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to store
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
