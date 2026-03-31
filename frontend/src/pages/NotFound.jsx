import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 bg-white dark:bg-neutral-950"
    >
      <div className="text-center">
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="text-8xl sm:text-9xl font-heading font-bold bg-gradient-to-r from-primary-500 to-secondary-400 bg-clip-text text-transparent"
        >
          404
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-neutral-600 dark:text-neutral-400 mt-4 mb-8"
        >
          Oops! This page doesn't exist
        </motion.p>
        <Link to="/">
          <Button size="lg" className="gap-2">
            <Home className="w-4 h-4" /> Go Home
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
