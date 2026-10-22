import { useCallback, useEffect, useState } from 'react';
import { allAdditionalMacroSeries } from '../services/macro.js';

const loadingState = () => ({ status: 'loading', data: null, error: null });

export const useMacroContext = () => {
  const [states, setStates] = useState(() => Object.fromEntries(
    allAdditionalMacroSeries.map(({ id }) => [id, loadingState()])
  ));
  const [reloadKeys, setReloadKeys] = useState({});

  useEffect(() => {
    const controllers = [];
    allAdditionalMacroSeries.forEach(({ id, fetch }) => {
      const controller = new AbortController();
      controllers.push(controller);
      setStates((current) => ({ ...current, [id]: loadingState() }));
      fetch({ signal: controller.signal })
        .then((data) => setStates((current) => ({ ...current, [id]: { status: 'ready', data, error: null } })))
        .catch((error) => {
          if (error.name !== 'AbortError') {
            setStates((current) => ({ ...current, [id]: { status: 'error', data: null, error } }));
          }
        });
    });
    return () => controllers.forEach((controller) => controller.abort());
  }, [reloadKeys]);

  const reload = useCallback((id) => {
    setReloadKeys((keys) => ({ ...keys, [id]: (keys[id] || 0) + 1 }));
  }, []);

  return { states, reload };
};
