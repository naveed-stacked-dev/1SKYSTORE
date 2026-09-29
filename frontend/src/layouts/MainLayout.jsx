import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import { pageTransition } from '@/animations/variants';
import { FloatingWhatsApp } from 'react-floating-whatsapp'
import logo from '@/assets/1skystore-avatar.svg';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
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


      {/* Floating WhatsApp */}
      <FloatingWhatsApp
        phoneNumber="9705950500"
        accountName="1SKYSTORE"
        chatState="unread"

        // Chat content
        statusMessage="Typically replies within 10 min"
        chatMessage={
          "Hi there! 👋\n\nWelcome to 1SKYSTORE 🛍️\nHow can we help you today?"
        }
        placeholder="Type your message..."

        // Timing & behavior
        messageDelay={2}
        allowClickAway={true}
        allowEsc={true}

        // Notification (very useful for ecommerce)
        notification={true}
        notificationDelay={45}
        notificationLoop={2}
        notificationSound={false}

        // Appearance
        darkMode={false}
        chatboxHeight={350}

        // Avatar (replace with your logo or support image)
        avatar={logo}

        // Callbacks (optional but powerful)
        onClick={() => console.log("WhatsApp button clicked")}
        onClose={() => console.log("Chat closed")}
        onSubmit={(event, value) => {
          console.log("User message:", value);
        }}

        // Custom styling (optional)
        buttonStyle={{
          backgroundColor: "#25D366",
        }}

        style={{
          zIndex: 1000,
        }}
      />

    </div>
  );
}
