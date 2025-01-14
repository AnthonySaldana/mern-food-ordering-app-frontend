// mern-food-ordering-app-frontend/src/components/NutritionalInfoCard.tsx

import React from 'react';

interface NutritionalInfoCardProps {
  label: string;
  value: number | string;
  unit: string;
  color: string;
  iconColor: string;
  svgPath: string;
}

const NutritionalInfoCard: React.FC<NutritionalInfoCardProps> = ({ label, value, unit, color, iconColor, svgPath }) => {
  return (
    <div className={`bg-[${color}] rounded-lg p-4 flex flex-col w-[240px] h-[150px]`}>
      <div className="flex justify-between items-center mb-3">
        <span className={`text-sm font-medium text-${iconColor}`}>{label}</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d={svgPath} stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="mt-auto">
        <p className="text-xs text-[#7E847C]">Average</p>
        <p className={`font-semibold text-xs text-${iconColor}`}>{value}{unit}</p>
      </div>
    </div>
  );
};

export default NutritionalInfoCard;