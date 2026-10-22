import React from 'react';
import { assessDataQuality } from '../utils/dataQuality.js';

const qualityClasses = {
  current: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  delayed: 'bg-amber-50 text-amber-900 ring-amber-200',
  stale: 'bg-red-50 text-red-800 ring-red-200',
  incomplete: 'bg-slate-100 text-slate-700 ring-slate-200'
};

const DataQualityBadge = ({ state, updatedAt, definition, source }) => {
  const quality = assessDataQuality(state, updatedAt);
  const vintage = updatedAt ? new Date(updatedAt).toLocaleDateString('fr-FR') : 'non communiqué';

  return (
    <div className="mt-3 text-xs text-slate-600">
      <span className={`inline-flex rounded-full px-2.5 py-1 font-semibold ring-1 ring-inset ${qualityClasses[quality.level]}`}>
        Données {quality.label}{quality.ageInDays !== undefined ? ` · ${quality.ageInDays.toFixed(0)} j` : ''}
      </span>
      <p className="mt-2 leading-5">
        <strong>Définition :</strong> {definition} · <strong>Source :</strong> {source} · <strong>Millésime :</strong> {vintage}.
      </p>
    </div>
  );
};

export default DataQualityBadge;
