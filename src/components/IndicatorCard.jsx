import React from 'react';
import { motion } from 'framer-motion';

const IndicatorCard = ({ title, value, color, icon, description }) => {
  // Vérification de la valeur pour éviter NaN et affichage institutionnel
  const safeValue =
    value !== undefined && value !== null && value !== '' && !isNaN(Number(value))
      ? value
      : '—';

  return (
    <motion.div
      className="bg-gradient-to-br from-white via-slate-50 to-gray-50 border border-slate-200/50 p-6 rounded-2xl shadow-lg hover:shadow-xl backdrop-blur-sm"
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      role="region"
      aria-label={title}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-100/70 border border-slate-200/50">
            {icon}
          </div>
          <span className="text-sm font-semibold text-slate-700 tracking-wide">{title}</span>
        </div>
      </div>
      
      <div className={`text-3xl font-bold mb-2 tracking-tight ${color}`}>
        {safeValue}
      </div>
      
      {description && (
        <div className="text-xs text-slate-500 bg-slate-50/50 rounded-lg p-2 border border-slate-100">
          {description}
        </div>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-100/10 rounded-2xl pointer-events-none"></div>
    </motion.div>
  );
};

export default IndicatorCard;