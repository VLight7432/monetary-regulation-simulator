import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAnnualComparisonConfig } from '../services/annualComparison.js';

const loading = { status: 'loading', data: null, error: null };

export const useAnnualComparison = (pairId, indicatorId) => {
  const config = useMemo(() => getAnnualComparisonConfig(pairId, indicatorId), [pairId, indicatorId]);
  const [state, setState] = useState(loading);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (config.unavailable) {
      setState({ status: 'unavailable', data: null, error: null });
      return undefined;
    }
    const controller = new AbortController();
    setState(loading);
    config.fetch({ signal: controller.signal })
      .then((data) => setState({ status: 'ready', data, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ status: 'error', data: null, error });
      });
    return () => controller.abort();
  }, [config, reloadKey]);

  return { config, ...state, reload: useCallback(() => setReloadKey((key) => key + 1), []) };
};
