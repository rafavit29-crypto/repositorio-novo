import React from 'react';
import { Flame } from 'lucide-react';

interface CalorieRingProps {
  consumed: number;
  target: number;
}

const CalorieRing: React.FC<CalorieRingProps> = ({ consumed, target }) => {
  const radius = 80;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const percent = Math.min((consumed / target) * 100, 100);
  const strokeDashoffset = circumference - (percent / 100) * circumference;
  const remaining = Math.max(0, target - consumed);

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        <circle
          stroke="#F3F4F6"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="#3CB371" // Primary Green
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <Flame size={24} className="text-primary mb-1" strokeWidth={2} />
        <span className="text-3xl font-bold text-main">{remaining}</span>
        <span className="text-xs text-secondary font-medium uppercase tracking-wide">Restantes</span>
      </div>
    </div>
  );
};

export default CalorieRing;