export const assessDataQuality = (state, updatedAt) => {
  if (state?.status === 'error') return { level: 'incomplete', label: 'Incomplètes' };
  if (state?.status !== 'ready' || !updatedAt || !Number.isFinite(new Date(updatedAt).getTime())) {
    return { level: 'incomplete', label: 'Incomplètes' };
  }

  const ageInDays = Math.max(0, (Date.now() - new Date(updatedAt).getTime()) / 86_400_000);
  if (ageInDays <= 7) return { level: 'current', label: 'À jour', ageInDays };
  if (ageInDays <= 45) return { level: 'delayed', label: 'Délai acceptable', ageInDays };
  return { level: 'stale', label: 'Anciennes', ageInDays };
};
