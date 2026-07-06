import React from 'react';
import { CrowdLevel } from '../types';

interface CrowdStatusProps {
  level: CrowdLevel;
  dayOfWeek?: 'weekday' | 'weekend';
  time?: string;
}

export const CrowdStatus: React.FC<CrowdStatusProps> = ({ level, dayOfWeek, time }) => {
  const getStatusDetails = (lvl: CrowdLevel) => {
    switch (lvl) {
      case 'empty':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          indicator: 'bg-emerald-500',
          label: '空いている',
          description: '座席に余裕があるか、立っている人が少ない状態です。',
        };
      case 'normal':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          indicator: 'bg-amber-500',
          label: '普通',
          description: '肩が触れ合わない程度の混雑です。吊り革や手すりは適度に使えます。',
        };
      case 'crowded':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          indicator: 'bg-rose-500',
          label: '混雑',
          description: '通勤・通学ラッシュ等により、車内が非常に混雑しています。',
        };
    }
  };

  const details = getStatusDetails(level);

  return (
    <div className={`p-4 rounded-xl border ${details.bg} transition-all duration-300 shadow-sm`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${details.indicator} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${details.indicator}`}></span>
          </span>
          <span className="font-bold text-sm tracking-wider">車内混雑度</span>
        </div>
        <span className="font-extrabold text-base px-2.5 py-0.5 rounded-full bg-white bg-opacity-70 shadow-sm">
          {details.label}
        </span>
      </div>
      <p className="text-xs leading-relaxed opacity-90">{details.description}</p>
      
      {dayOfWeek && time && (
        <div className="mt-2 pt-2 border-t border-current border-opacity-10 text-[10px] opacity-75 flex justify-between">
          <span>予測基準: {dayOfWeek === 'weekday' ? '平日' : '休日'} {time}頃の統計</span>
          <span>※リアルタイム予測は将来対応予定</span>
        </div>
      )}
    </div>
  );
};
