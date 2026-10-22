import { useCallback, useEffect, useState } from 'react';
import { fetchEurostatUnemployment } from '../services/eurostat.js';

const initialState = {
  status: 'loading',
  data: null,
  error: null
};

export const useEconomicContext = () => {
  const [state, setState] = useState(initialState);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState(initialState);

    fetchEurostatUnemployment({ signal: controller.signal })
      .then((data) => setState({ status: 'ready', data, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setState({ status: 'error', data: null, error });
        }
      });

    return () => controller.abort();
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return { ...state, reload };
};
