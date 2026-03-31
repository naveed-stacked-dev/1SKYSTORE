import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import { pageTransition } from '@/animations/variants';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950 transition-colors duration-300">
      <Navbar />
      <motion.main
        className="flex-1"
        initial={pageTransition.initial}
        animate={pageTransition.animate}
        exit={pageTransition.exit}
        transition={pageTransition.transition}
      >
        <Outlet />
      </motion.main>
      <Footer />
    </div>
  );
}
