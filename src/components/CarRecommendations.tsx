import React, { useState, useEffect } from 'react';
import { CarDetail, CrowdLevel } from '../types';

interface CarRecommendationsProps {
  carDetails: CarDetail[];
  toStationName: string;
}

export const CarRecommendations: React.FC<CarRecommendationsProps> = ({ carDetails, toStationName }) => {
  const [selectedCarNum, setSelectedCarNum] = useState<number>(1);
  const [filterType, setFilterType] = useState<'all' | 'empty' | 'transfer' | 'elevator'>('all');

  // 初期選択を「何か特徴のある車両」に設定する
  useEffect(() => {
    const recommended = carDetails.find(car => 
      car.features.some(f => f.type !== 'none')
    );
    if (recommended) {
      setSelectedCarNum(recommended.carNumber);
    } else {
      setSelectedCarNum(1);
    }
  }, [carDetails]);

  const selectedCar = carDetails.find(car => car.carNumber === selectedCarNum);

  // 設備に応じたSVGアイコン
  const getFeatureIcon = (type: string) => {
    switch (type) {
      case 'stairs':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        );
      case 'escalator':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'elevator':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        );
      case 'exit':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        );
      case 'transfer':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getCrowdColor = (level: CrowdLevel) => {
    switch (level) {
      case 'empty':
        return 'bg-emerald-500 text-white';
      case 'normal':
        return 'bg-amber-400 text-slate-800';
      case 'crowded':
        return 'bg-rose-500 text-white';
    }
  };

  const getCrowdLabel = (level: CrowdLevel) => {
    switch (level) {
      case 'empty': return '空き';
      case 'normal': return '普通';
      case 'crowded': return '混雑';
    }
  };

  // フィルター処理
  const filteredCars = carDetails.filter(car => {
    if (filterType === 'empty') return car.crowdLevel === 'empty';
    if (filterType === 'transfer') return car.features.some(f => f.type === 'transfer' || f.type === 'exit');
    if (filterType === 'elevator') return car.features.some(f => f.type === 'elevator');
    return true;
  });

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-5 flex flex-col gap-4">
      <div>
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5 mb-1">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          {toStationName}駅 到着時の車両おすすめ
        </h3>
        <p className="text-xs text-slate-500">
          乗車位置によって、混雑度や到着後の移動のしやすさが変わります。
        </p>
      </div>

      {/* 目的別クイックフィルター */}
      <div className="flex flex-wrap gap-1.5 pb-1">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            filterType === 'all'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          全車両 ({carDetails.length})
        </button>
        <button
          onClick={() => setFilterType('empty')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
            filterType === 'empty'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          空いている車両
        </button>
        <button
          onClick={() => setFilterType('transfer')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
            filterType === 'transfer'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
          }`}
        >
          出口・乗換重視
        </button>
        <button
          onClick={() => setFilterType('elevator')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
            filterType === 'elevator'
              ? 'bg-amber-600 text-white shadow-sm shadow-amber-200'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          }`}
        >
          エレベーター優先
        </button>
      </div>

      {/* 電車のグラフィカルUI */}
      <div className="relative">
        {/* 線路 */}
        <div className="absolute left-0 right-0 bottom-4 h-1 bg-slate-300 rounded-full"></div>

        {/* 電車車両の横スクロール */}
        <div className="flex gap-2 overflow-x-auto pb-6 pt-2 px-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {carDetails.map((car) => {
            const isSelected = selectedCarNum === car.carNumber;
            const isFiltered = filteredCars.some(fc => fc.carNumber === car.carNumber);
            const hasFeatures = car.features.some(f => f.type !== 'none');

            return (
              <button
                key={car.carNumber}
                onClick={() => setSelectedCarNum(car.carNumber)}
                className={`flex-shrink-0 w-16 h-18 rounded-lg border-2 relative flex flex-col justify-between p-1.5 transition-all duration-300 ${
                  isSelected
                    ? 'border-blue-600 ring-4 ring-blue-50 shadow-md transform -translate-y-1'
                    : 'border-slate-200 hover:border-slate-300'
                } ${
                  isFiltered ? 'opacity-100' : 'opacity-40'
                } bg-slate-50`}
              >
                {/* 車両番号 */}
                <span className="text-[10px] font-bold text-slate-500">
                  {car.carNumber}号車
                </span>

                {/* 設備ミニマーク */}
                <div className="flex justify-center gap-0.5">
                  {hasFeatures && car.features.slice(0, 2).map((feat, i) => (
                    <span key={i} className="text-slate-600 text-opacity-80">
                      {feat.type === 'stairs' && '🛗'} {/* 階段は文字記号や絵文字等で仮表示 */}
                      {feat.type === 'escalator' && '🪜'}
                      {feat.type === 'elevator' && '♿'}
                      {feat.type === 'exit' && '🚪'}
                      {feat.type === 'transfer' && '🔄'}
                    </span>
                  ))}
                </div>

                {/* 車両混雑度カラーバー */}
                <div className={`w-full h-2.5 rounded-sm flex items-center justify-center text-[8px] font-black tracking-tighter ${getCrowdColor(car.crowdLevel)}`}>
                  {getCrowdLabel(car.crowdLevel)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 選択された車両の詳細表示 */}
      {selectedCar && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
              {selectedCar.carNumber}号車 の詳細
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">混雑度:</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getCrowdColor(selectedCar.crowdLevel)}`}>
                {selectedCar.crowdLevel === 'empty' && '空いています'}
                {selectedCar.crowdLevel === 'normal' && '通常の混み具合'}
                {selectedCar.crowdLevel === 'crowded' && '混雑しています'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {toStationName}駅での近接設備・乗り換え
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedCar.features.map((feat, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white border border-slate-100 shadow-sm"
                >
                  <div className={`p-1.5 rounded-md ${
                    feat.type === 'none' ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {getFeatureIcon(feat.type)}
                  </div>
                  <span className="text-xs font-semibold text-slate-700">
                    {feat.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
