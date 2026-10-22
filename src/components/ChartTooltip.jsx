import React from 'react';

const ChartTooltip = ({ label, value, description }) => (
  <div className="p-2 bg-white border rounded shadow text-sm max-w-xs">
    <div className="font-semibold">{label} : {value}</div>
    <div className="mt-1 text-gray-700">{description}</div>
  </div>
);

export default ChartTooltip;