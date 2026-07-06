import React, { useState, useEffect, useRef } from 'react';
import { Station } from '../types';
import { RouteService } from '../services/routeService';

interface SearchFormProps {
  onSearch: (fromIdOrName: string, toIdOrName: string, dayOfWeek: 'weekday' | 'weekend', time: string) => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [fromInput, setFromInput] = useState('');
  const [toInput, setToInput] = useState('');
  const [selectedFrom, setSelectedFrom] = useState<Station | null>(null);
  const [selectedTo, setSelectedTo] = useState<Station | null>(null);
  
  const [dayOfWeek, setDayOfWeek] = useState<'weekday' | 'weekend'>('weekday');
  const [time, setTime] = useState('08:00');

  const [fromSuggestions, setFromSuggestions] = useState<Station[]>([]);
  const [toSuggestions, setToSuggestions] = useState<Station[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  // 初期ロードで駅一覧を取得し、現在時刻を設定する
  useEffect(() => {
    const init = async () => {
      const list = await RouteService.getStations();
      setStations(list);

      // 現在の日時を設定
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${mins}`);

      const day = now.getDay();
      setDayOfWeek(day === 0 || day === 6 ? 'weekend' : 'weekday');
    };
    init();
  }, []);

  // ドロップダウン外クリックでサジェストを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fromRef.current && !fromRef.current.contains(event.target as Node)) {
        setFromSuggestions([]);
      }
      if (toRef.current && !toRef.current.contains(event.target as Node)) {
        setToSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 入力値変更時のサジェストフィルタリングと駅特定
  const handleFromChange = (val: string) => {
    setFromInput(val);
    if (!val.trim()) {
      setFromSuggestions([]);
      setSelectedFrom(null);
      return;
    }
    
    // 完全一致する駅名があればセット
    const matched = stations.find(s => s.name === val || s.nameEn.toLowerCase() === val.toLowerCase());
    if (matched) {
      setSelectedFrom(matched);
    } else {
      setSelectedFrom(null); // 自由入力
    }

    const filtered = stations.filter(s =>
      s.name.includes(val) || s.nameEn.toLowerCase().includes(val.toLowerCase())
    );
    setFromSuggestions(filtered);
  };

  const handleToChange = (val: string) => {
    setToInput(val);
    if (!val.trim()) {
      setToSuggestions([]);
      setSelectedTo(null);
      return;
    }

    const matched = stations.find(s => s.name === val || s.nameEn.toLowerCase() === val.toLowerCase());
    if (matched) {
      setSelectedTo(matched);
    } else {
      setSelectedTo(null); // 自由入力
    }

    const filtered = stations.filter(s =>
      s.name.includes(val) || s.nameEn.toLowerCase().includes(val.toLowerCase())
    );
    setToSuggestions(filtered);
  };

  // 駅選択
  const selectFromStation = (station: Station) => {
    setSelectedFrom(station);
    setFromInput(station.name);
    setFromSuggestions([]);
  };

  const selectToStation = (station: Station) => {
    setSelectedTo(station);
    setToInput(station.name);
    setToSuggestions([]);
  };

  // Geolocation APIで現在地を取得
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('ブラウザが位置情報に対応していません。');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const nearest = await RouteService.getNearestStation(latitude, longitude);
          selectFromStation(nearest);
        } catch (err) {
          setLocationError('最寄り駅の特定に失敗しました。');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('位置情報の利用許可が拒否されました。出発駅を手入力してください。');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('位置情報を取得できませんでした。');
            break;
          case error.TIMEOUT:
            setLocationError('位置情報の取得がタイムアウトしました。');
            break;
          default:
            setLocationError('位置情報の取得中にエラーが発生しました。');
        }
      },
      { timeout: 10000 }
    );
  };

  // 検索実行
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromInput.trim() || !toInput.trim()) {
      alert('出発駅と目的地駅を入力してください。');
      return;
    }

    // マスターデータになければ、手入力された文字列そのものを渡す
    const fromVal = selectedFrom ? selectedFrom.id : fromInput.trim();
    const toVal = selectedTo ? selectedTo.id : toInput.trim();

    if (fromVal === toVal) {
      alert('出発駅と目的地駅が同じです。異なる駅を入力してください。');
      return;
    }

    onSearch(fromVal, toVal, dayOfWeek, time);
  };

  // 入力を入れ替える
  const swapStations = () => {
    const tempStation = selectedFrom;
    const tempInput = fromInput;

    setSelectedFrom(selectedTo);
    setFromInput(toInput);
    
    setSelectedTo(tempStation);
    setToInput(tempInput);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* 出発地と目的地 */}
        <div className="flex flex-col md:flex-row gap-3 relative items-stretch">
          {/* 出発地入力 */}
          <div ref={fromRef} className="flex-1 relative">
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">出発駅</label>
            <div className="relative">
              <input
                type="text"
                value={fromInput}
                onChange={(e) => handleFromChange(e.target.value)}
                placeholder="駅名を入力（JR東日本のすべての駅）"
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-slate-800 placeholder-slate-400 text-sm shadow-sm transition-all"
              />
              <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-blue-500 font-bold text-base">●</span>
              
              {/* 現在地取得ボタン */}
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-500 focus:outline-none transition-colors"
                title="現在地から取得"
              >
                {isLocating ? (
                  <svg className="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="h-5 w-5 hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>

            {/* サジェストリスト */}
            {fromSuggestions.length > 0 && (
              <ul className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-50">
                {fromSuggestions.map((st) => (
                  <li
                    key={st.id}
                    onClick={() => selectFromStation(st)}
                    className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700 flex justify-between items-center"
                  >
                    <span>{st.name}</span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold">{st.line}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 入れ替えボタン */}
          <div className="flex items-center justify-center my-1 md:my-0 md:pt-5">
            <button
              type="button"
              onClick={swapStations}
              className="p-2.5 rounded-full border border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 focus:outline-none shadow-sm transition-all transform hover:rotate-180 duration-500"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          {/* 目的地入力 */}
          <div ref={toRef} className="flex-1 relative">
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">目的地駅</label>
            <div className="relative">
              <input
                type="text"
                value={toInput}
                onChange={(e) => handleToChange(e.target.value)}
                placeholder="駅名を入力（例: 仙台、熱海、いわき）"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-slate-800 placeholder-slate-400 text-sm shadow-sm transition-all"
              />
              <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-rose-500 font-bold text-base">■</span>
            </div>

            {/* サジェストリスト */}
            {toSuggestions.length > 0 && (
              <ul className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-50">
                {toSuggestions.map((st) => (
                  <li
                    key={st.id}
                    onClick={() => selectToStation(st)}
                    className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700 flex justify-between items-center"
                  >
                    <span>{st.name}</span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold">{st.line}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* 位置情報エラー表示 */}
        {locationError && (
          <div className="text-[11px] font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-100 flex items-start gap-1.5">
            <svg className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{locationError}</span>
          </div>
        )}

        {/* 曜日・時間設定 */}
        <div className="flex gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-slate-400 mb-1">乗車曜日</label>
            <div className="flex bg-white rounded-lg p-0.5 border border-slate-200">
              <button
                type="button"
                onClick={() => setDayOfWeek('weekday')}
                className={`flex-1 py-1 rounded text-xs font-bold transition-all ${
                  dayOfWeek === 'weekday' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                平日
              </button>
              <button
                type="button"
                onClick={() => setDayOfWeek('weekend')}
                className={`flex-1 py-1 rounded text-xs font-bold transition-all ${
                  dayOfWeek === 'weekend' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                土休日
              </button>
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-[10px] font-bold text-slate-400 mb-1">乗車時刻</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 検索ボタン */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all transform active:scale-98 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          最適な経路を検索する
        </button>
      </form>
    </div>
  );
};
