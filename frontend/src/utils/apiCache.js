const fetchCache = new Map();

/**
 * Caches API promises so multiple components calling the same API concurrently
 * wait for the exact same network request instead of triggering duplicates.
 * 
 * @param {string} key Unique key for the cache (e.g. 'categories', 'brands')
 * @param {Function} fetcher Function returning a Promise (e.g. () => api.get('/categories'))
 * @param {number} ttl Time to live in milliseconds (default 10 mins)
 * @returns {Promise} The cached or new Promise
 */
export function fetchWithCache(key, fetcher, ttl = 600000) {
  if (fetchCache.has(key)) {
    const cached = fetchCache.get(key);
    if (Date.now() - cached.timestamp < ttl) {
      return cached.promise;
    }
  }

  const promise = fetcher().catch(err => {
    fetchCache.delete(key);
    throw err;
  });

  fetchCache.set(key, { promise, timestamp: Date.now() });
  return promise;
}
