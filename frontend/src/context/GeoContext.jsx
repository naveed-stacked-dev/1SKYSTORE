// import { createContext, useContext, useState, useEffect } from 'react';
// import geoService from '@/api/geo.service';
// import { formatPrice } from '@/utils/formatPrice';
// import { getStorage, setStorage } from '@/utils/storage';

// const GeoContext = createContext(null);

// export function GeoProvider({ children }) {
//   const [geo, setGeo] = useState(() => getStorage('geo') || { country: null, currency: 'USD' });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     detectGeo();
//   }, []);

//   async function detectGeo() {
//     try {
//       const res = await geoService.detectGeo();
//       const data = res.data?.data || res.data;
//       const country = data?.country || data?.country_code || null;
//       const isIndia = country === 'IN' || country === 'India';
//       const geoData = {
//         country,
//         currency: isIndia ? 'INR' : 'USD',
//         countryName: data?.country_name || country,
//       };
//       setGeo(geoData);
//       setStorage('geo', geoData);
//     } catch {
//       // Fallback to USD
//       const fallback = { country: null, currency: 'USD', countryName: null };
//       setGeo(fallback);
//       setStorage('geo', fallback);
//     } finally {
//       setLoading(false);
//     }
//   }

//   function getPrice(priceInr, priceUsd) {
//     const value = geo.currency === 'INR' ? priceInr : priceUsd;
//     return formatPrice(value, geo.currency);
//   }

//   function getRawPrice(priceInr, priceUsd) {
//     return geo.currency === 'INR' ? priceInr : priceUsd;
//   }

//   return (
//     <GeoContext.Provider value={{ ...geo, loading, getPrice, getRawPrice, formatPrice: (v) => formatPrice(v, geo.currency) }}>
//       {children}
//     </GeoContext.Provider>
//   );
// }

// export function useGeo() {
//   const context = useContext(GeoContext);
//   if (!context) throw new Error('useGeo must be used within GeoProvider');
//   return context;
// }


import { createContext, useContext, useState, useEffect, useRef } from 'react';
import geoService from '@/api/geo.service';
import { formatPrice } from '@/utils/formatPrice';
import { getStorage, setStorage } from '@/utils/storage';

const GeoContext = createContext(null);

export function GeoProvider({ children }) {
  const [geo, setGeo] = useState(() => getStorage('geo') || { country: null, currency: 'USD' });
  const [loading, setLoading] = useState(true);

  const hasFetched = useRef(false); // ✅ prevents multiple calls

  useEffect(() => {
    if (hasFetched.current) return; // ✅ guard for Strict Mode
    hasFetched.current = true;

    const storedGeo = getStorage('geo');

    // ✅ Skip API call if already stored
    if (storedGeo?.country) {
      setGeo(storedGeo);
      setLoading(false);
      return;
    }

    detectGeo();
  }, []);

  async function detectGeo() {
    try {
      const res = await geoService.detectGeo();
      const data = res.data?.data || res.data;

      const country = data?.country || data?.country_code || null;
      const isIndia = country === 'IN' || country === 'India';

      const geoData = {
        country,
        currency: isIndia ? 'INR' : 'USD',
        countryName: data?.country_name || country,
      };

      setGeo(geoData);
      setStorage('geo', geoData);
    } catch {
      // Fallback to USD
      const fallback = { country: null, currency: 'USD', countryName: null };
      setGeo(fallback);
      setStorage('geo', fallback);
    } finally {
      setLoading(false);
    }
  }

  function getPrice(priceInr, priceUsd) {
    const value = geo.currency === 'INR' ? priceInr : priceUsd;
    return formatPrice(value, geo.currency);
  }

  function getRawPrice(priceInr, priceUsd) {
    return geo.currency === 'INR' ? priceInr : priceUsd;
  }

  return (
    <GeoContext.Provider
      value={{
        ...geo,
        loading,
        getPrice,
        getRawPrice,
        formatPrice: (v) => formatPrice(v, geo.currency),
      }}
    >
      {children}
    </GeoContext.Provider>
  );
}

export function useGeo() {
  const context = useContext(GeoContext);
  if (!context) throw new Error('useGeo must be used within GeoProvider');
  return context;
}