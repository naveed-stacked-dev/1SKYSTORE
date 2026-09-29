import AppRoutes from '@/routes/AppRoutes';
import { useEffect } from "react";
import { useLocation } from "react-router-dom";


// google analytics page tracking
function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    window.gtag('config', 'G-DDMFEKTTHX', {
      page_path: location.pathname,
    });
  }, [location]);
}

function App() {
  usePageTracking();
  return <AppRoutes />;
}

export default App;
