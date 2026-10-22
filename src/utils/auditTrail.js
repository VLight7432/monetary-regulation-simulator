const auditStorageKey = 'monetary-regulation-simulator-audit-v1';
const maximumEntries = 50;

const browserStorage = () => {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
};

export const loadAuditTrail = (storage = browserStorage()) => {
  if (!storage) return [];
  try {
    const entries = JSON.parse(storage.getItem(auditStorageKey) || '[]');
    return Array.isArray(entries) ? entries : [];
  } catch {
    return [];
  }
};

export const appendAuditEntry = (entry, storage = browserStorage()) => {
  if (!storage) return null;
  const entries = [...loadAuditTrail(storage), entry].slice(-maximumEntries);
  try {
    storage.setItem(auditStorageKey, JSON.stringify(entries));
    return entries;
  } catch {
    return null;
  }
};

export const createAuditEntry = ({
  scenario,
  parameters,
  sourceUpdatedAt,
  dataMetadata,
  recommendation,
  eligible
}) => ({
  recordedAt: new Date().toISOString(),
  scenario,
  configuration: { ...parameters },
  dataSourceUpdatedAt: sourceUpdatedAt || null,
  dataMetadata: dataMetadata || null,
  recommendation,
  eligible
});
