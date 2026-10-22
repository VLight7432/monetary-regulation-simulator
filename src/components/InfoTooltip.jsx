import React, { useState } from 'react';

const InfoTooltip = ({ text }) => {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="relative ml-2"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <button
        type="button"
        className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center"
        onClick={() => setVisible(!visible)}
        aria-label="Afficher l'explication"
        aria-describedby={visible ? "tooltip-desc" : undefined}
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Escape') setVisible(false); }}
      >
        ?
      </button>
      {visible && (
        <div
          id="tooltip-desc"
          role="tooltip"
          className="absolute left-6 top-0 z-10 w-72 p-3 bg-white border rounded shadow text-sm"
        >
          {text}
          <button
            className="block mt-2 text-xs text-blue-600 underline"
            onClick={() => setVisible(false)}
          >
            Fermer
          </button>
        </div>
      )}
    </span>
  );
};

export default InfoTooltip;