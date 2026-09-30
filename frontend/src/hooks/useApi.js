import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchWithCache } from '@/utils/apiCache';

/**
 * Fetch a resource through the shared promise cache, so components that need
 * the same data (navbar, footer, homepage sections) share a single request.
 *
 * @param {string|null} key     Cache key; pass null to skip fetching
 * @param {Function}    fetcher Returns the axios promise
 * @param {Function}    select  Maps the raw response to the data you need
 */
export function useApi(key, fetcher, select = (res) => res) {
  const fetcherRef = useRef(fetcher);
  const selectRef = useRef(select);
  const [state, setState] = useState({ data: null, loading: Boolean(key), error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    fetcherRef.current = fetcher;
    selectRef.current = select;
  });

  useEffect(() => {
    if (!key) return undefined;
    let active = true;

    fetchWithCache(key, () => fetcherRef.current())
      .then((res) => {
        if (active) setState({ data: selectRef.current(res), loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ data: null, loading: false, error });
      });

    return () => {
      active = false;
    };
  }, [key, attempt]);

  // fetchWithCache drops failed promises, so a retry always hits the network
  const retry = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, retry };
}
