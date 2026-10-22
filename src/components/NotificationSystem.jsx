import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

const NotificationSystem = ({ notifications, onClear, onClearAll }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            className="absolute bottom-14 right-0 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Alertes</h3>
                <p className="text-xs text-slate-500">
                  {notifications.length === 0 ? 'Aucune alerte active' : `${notifications.length} alerte${notifications.length > 1 ? 's' : ''} active${notifications.length > 1 ? 's' : ''}`}
                </p>
              </div>
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={onClearAll}
                  className="text-xs font-medium text-blue-700 hover:text-blue-900"
                >
                  Tout effacer
                </button>
              )}
            </div>
            <div className="max-h-80 space-y-2 overflow-y-auto p-3">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className={`rounded-xl border p-3 ${getColors(notification.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">{getIcon(notification.type)}</div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{notification.title}</h4>
                      <p className="mt-1 text-xs opacity-90">{notification.message}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onClear(notification.id)}
                      className="flex-shrink-0 rounded p-1 hover:bg-black/10"
                      aria-label="Fermer l'alerte"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="relative flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition hover:bg-slate-700 hover:shadow-xl"
        aria-label={isOpen ? 'Fermer les alertes' : 'Ouvrir les alertes'}
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1 text-xs font-bold leading-5 text-white">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>
    </div>
  );
};

export default NotificationSystem;