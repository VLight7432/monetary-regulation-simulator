import React, { useId } from 'react';
import { motion } from 'framer-motion';

const ChartContainer = ({ title, question, description, children }) => {
  const descriptionId = useId();
  return (
    <motion.div 
      className="bg-white rounded-lg shadow-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {question && <p className="mb-4 text-sm font-medium text-slate-700">{question}</p>}
      <figure aria-describedby={description ? descriptionId : undefined}>
        {children}
        {description && <figcaption id={descriptionId} className="mt-3 text-xs leading-5 text-slate-600">{description}</figcaption>}
      </figure>
    </motion.div>
  );
};

export default ChartContainer;