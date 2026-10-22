export const workspaceTabs = [
  { id: 'overview', label: 'Vue d’ensemble' },
  { id: 'observed-data', label: 'Données observées' },
  { id: 'scenarios', label: 'Scénarios et politiques' },
  { id: 'forecasts-models', label: 'Prévisions et modèles' },
  { id: 'methodology-audit', label: 'Méthodologie et audit' }
];

export const getNextWorkspace = (currentId, key) => {
  const currentIndex = workspaceTabs.findIndex(({ id }) => id === currentId);
  if (currentIndex === -1) return null;
  if (key === 'Home') return workspaceTabs[0].id;
  if (key === 'End') return workspaceTabs.at(-1).id;
  if (key === 'ArrowRight') return workspaceTabs[(currentIndex + 1) % workspaceTabs.length].id;
  if (key === 'ArrowLeft') return workspaceTabs[(currentIndex - 1 + workspaceTabs.length) % workspaceTabs.length].id;
  return null;
};
