import { Station, CarDetail, CrowdLevel, RouteOption } from '../types';

// 主要な駅の定義（山手線を中心としたモック）
export const STATIONS: Station[] = [
  { id: 'tokyo', name: '東京', nameEn: 'Tokyo', line: '山手線', lat: 35.681236, lng: 139.767125 },
  { id: 'akihabara', name: '秋葉原', nameEn: 'Akihabara', line: '山手線', lat: 35.698383, lng: 139.773072 },
  { id: 'ueno', name: '上野', nameEn: 'Ueno', line: '山手線', lat: 35.713768, lng: 139.777254 },
  { id: 'ikebukuro', name: '池袋', nameEn: 'Ikebukuro', line: '山手線', lat: 35.729503, lng: 139.710953 },
  { id: 'shinjuku', name: '新宿', nameEn: 'Shinjuku', line: '山手線', lat: 35.689508, lng: 139.700688 },
  { id: 'shibuya', name: '渋谷', nameEn: 'Shibuya', line: '山手線', lat: 35.658034, lng: 139.701636 },
  { id: 'shinagawa', name: '品川', nameEn: 'Shinagawa', line: '山手線', lat: 35.628471, lng: 139.73876 },
  { id: 'shimbashi', name: '新橋', nameEn: 'Shimbashi', line: '山手線', lat: 35.666495, lng: 139.758368 },
];

// 山手線外回りの順序 (東京 -> 秋葉原 -> 上野 -> 池袋 -> 新宿 -> 渋谷 -> 品川 -> 新橋 -> 東京)
const YAMANOTE_OUTER_ORDER = [
  'tokyo',
  'akihabara',
  'ueno',
  'ikebukuro',
  'shinjuku',
  'shibuya',
  'shinagawa',
  'shimbashi'
];

// 駅間の標準所要時間（分）
const STATION_INTERVALS: { [key: string]: number } = {
  'tokyo-akihabara': 4,
  'akihabara-ueno': 3,
  'ueno-ikebukuro': 16,
  'ikebukuro-shinjuku': 9,
  'shinjuku-shibuya': 6,
  'shibuya-shinagawa': 12,
  'shinagawa-shimbashi': 8,
  'shimbashi-tokyo': 4,
};

// 曜日と時間帯から混雑レベルを推定する
export function estimateBaseCrowdLevel(dayOfWeek: 'weekday' | 'weekend', timeStr: string): CrowdLevel {
  const [hourStr, minStr] = timeStr.split(':');
  const hour = parseInt(hourStr, 10);

  if (dayOfWeek === 'weekday') {
    // 平日の朝ラッシュ (7:30 - 9:30)
    if ((hour === 7 && parseInt(minStr, 10) >= 30) || hour === 8 || (hour === 9 && parseInt(minStr, 10) <= 30)) {
      return 'crowded';
    }
    // 平日の夕方ラッシュ (17:30 - 19:30)
    if ((hour === 17 && parseInt(minStr, 10) >= 30) || hour === 18 || (hour === 19 && parseInt(minStr, 10) <= 30)) {
      return 'crowded';
    }
    // 深夜帯 (23:00 - 24:59) もそこそこ混む
    if (hour >= 23 || hour <= 1) {
      return 'normal';
    }
    // 日中は比較的空いている
    return 'empty';
  } else {
    // 休日
    // 日中 (11:00 - 18:00) はそこそこ混む
    if (hour >= 11 && hour <= 18) {
      return 'normal';
    }
    return 'empty';
  }
}

// 特定の駅に到着する際のおすすめ車両情報を取得する
// 山手線は11両編成 (1号車〜11号車)
// 1号車が品川・東京方面（内回り先頭）、11号車が池袋・上野方面（外回り先頭）
export function getCarDetailsForArrival(
  toStationId: string,
  baseCrowd: CrowdLevel
): CarDetail[] {
  const details: CarDetail[] = [];

  // 駅ごとの特徴的な設備のある車両番号（仮データ）
  // 1〜11号車の設備マップ
  const stationFeatures: {
    [key: string]: {
      stairs?: number[];
      escalator?: number[];
      elevator?: number[];
      exit?: number[];
      transfer?: number[];
    };
  } = {
    tokyo: {
      stairs: [3, 8],
      escalator: [4, 9],
      elevator: [5],
      exit: [1, 2, 10],
      transfer: [3, 4, 7, 8], // 中央線、東海道線などへの乗り換え
    },
    akihabara: {
      stairs: [2, 9],
      escalator: [3, 8],
      elevator: [6],
      exit: [1, 11],
      transfer: [3, 4, 9], // 総武線、つくばエクスプレスなど
    },
    ueno: {
      stairs: [3, 7],
      escalator: [4, 8],
      elevator: [5],
      exit: [2, 11],
      transfer: [3, 4, 7], // 新幹線、常磐線など
    },
    ikebukuro: {
      stairs: [2, 8, 10],
      escalator: [3, 9, 11],
      elevator: [6],
      exit: [1, 8, 11],
      transfer: [2, 3, 8, 9], // 丸ノ内線、西武線、東武線
    },
    shinjuku: {
      stairs: [4, 7, 9],
      escalator: [5, 8, 10],
      elevator: [6],
      exit: [1, 2, 7, 8, 11],
      transfer: [4, 5, 7, 8], // 中央線、小田急、京王など
    },
    shibuya: {
      stairs: [1, 6, 9],
      escalator: [2, 7, 10],
      elevator: [5],
      exit: [1, 8, 11], // ハチ公口は1号車、スクランブルスクエア側は中程
      transfer: [1, 2, 8], // 半蔵門線、副都心線、東急線
    },
    shinagawa: {
      stairs: [3, 8],
      escalator: [4, 9],
      elevator: [6],
      exit: [1, 10],
      transfer: [3, 4, 8, 9], // 新幹線、京急線
    },
    shimbashi: {
      stairs: [2, 8],
      escalator: [3, 7],
      elevator: [5],
      exit: [1, 10, 11],
      transfer: [3, 8], // 浅草線、ゆりかもめ
    },
  };

  const features = stationFeatures[toStationId] || stationFeatures['tokyo'];

  for (let carNum = 1; carNum <= 11; carNum++) {
    const carFeatures: CarDetail['features'] = [];

    if (features.stairs?.includes(carNum)) {
      carFeatures.push({ type: 'stairs', description: '階段が近いです' });
    }
    if (features.escalator?.includes(carNum)) {
      carFeatures.push({ type: 'escalator', description: 'エスカレーターが近いです' });
    }
    if (features.elevator?.includes(carNum)) {
      carFeatures.push({ type: 'elevator', description: 'エレベーターが近いです' });
    }
    if (features.exit?.includes(carNum)) {
      carFeatures.push({ type: 'exit', description: '出口改札が近いです' });
    }
    if (features.transfer?.includes(carNum)) {
      carFeatures.push({ type: 'transfer', description: '乗り換え連絡通路が近いです' });
    }

    // 車両固有の混雑レベルの補正
    // 一般的に階段やエスカレーターが近い車両(中程)は混みやすく、端(1号車や11号車など)や設備のない車両は比較的空いている
    let crowdLevel: CrowdLevel = baseCrowd;
    if (baseCrowd === 'crowded') {
      // 激混み時間帯：階段付近は「激混み(crowded)」のまま、端の車両は「普通(normal)」に緩和される可能性
      if (carFeatures.length === 0 && (carNum <= 2 || carNum >= 10)) {
        crowdLevel = 'normal';
      }
    } else if (baseCrowd === 'normal') {
      // 普通時間帯：設備付近は「混雑(crowded)」になりやすく、端は「空いている(empty)」になりやすい
      if (carFeatures.some(f => f.type === 'stairs' || f.type === 'escalator' || f.type === 'transfer')) {
        crowdLevel = 'crowded';
      } else if (carFeatures.length === 0 && (carNum <= 2 || carNum >= 10)) {
        crowdLevel = 'empty';
      }
    } else {
      // 空いている時間帯：設備付近でもせいぜい「普通(normal)」、端は「空いている(empty)」
      if (carFeatures.some(f => f.type === 'stairs' || f.type === 'escalator')) {
        crowdLevel = 'normal';
      } else {
        crowdLevel = 'empty';
      }
    }

    // 特に設備がない場合は none
    if (carFeatures.length === 0) {
      carFeatures.push({ type: 'none', description: '比較的空いている車両です' });
    }

    details.push({
      carNumber: carNum,
      crowdLevel,
      features: carFeatures,
    });
  }

  return details;
}

// 簡易的な経路計算（外回りと内回りの両方の経路を提示する）
export function getMockRoutes(
  fromId: string,
  toId: string,
  dayOfWeek: 'weekday' | 'weekend',
  timeStr: string
): RouteOption[] {
  const fromIndex = YAMANOTE_OUTER_ORDER.indexOf(fromId);
  const toIndex = YAMANOTE_OUTER_ORDER.indexOf(toId);

  if (fromIndex === -1 || toIndex === -1 || fromId === toId) {
    return [];
  }

  const baseCrowd = estimateBaseCrowdLevel(dayOfWeek, timeStr);
  const options: RouteOption[] = [];

  // --- パターン1: 外回り (Outer Loop) ---
  const outerSegments: string[] = [];
  let currentIdx = fromIndex;
  let outerDuration = 0;

  while (currentIdx !== toIndex) {
    const nextIdx = (currentIdx + 1) % YAMANOTE_OUTER_ORDER.length;
    const currentStationId = YAMANOTE_OUTER_ORDER[currentIdx];
    const nextStationId = YAMANOTE_OUTER_ORDER[nextIdx];
    const key = `${currentStationId}-${nextStationId}`;
    const reverseKey = `${nextStationId}-${currentStationId}`;
    
    const intervalTime = STATION_INTERVALS[key] || STATION_INTERVALS[reverseKey] || 3;
    outerDuration += intervalTime;
    outerSegments.push(currentStationId);
    currentIdx = nextIdx;
  }
  outerSegments.push(YAMANOTE_OUTER_ORDER[toIndex]);

  // --- パターン2: 内回り (Inner Loop) ---
  const innerSegments: string[] = [];
  currentIdx = fromIndex;
  let innerDuration = 0;

  while (currentIdx !== toIndex) {
    const nextIdx = (currentIdx - 1 + YAMANOTE_OUTER_ORDER.length) % YAMANOTE_OUTER_ORDER.length;
    const currentStationId = YAMANOTE_OUTER_ORDER[currentIdx];
    const nextStationId = YAMANOTE_OUTER_ORDER[nextIdx];
    const key = `${nextStationId}-${currentStationId}`;
    const reverseKey = `${currentStationId}-${nextStationId}`;
    
    const intervalTime = STATION_INTERVALS[key] || STATION_INTERVALS[reverseKey] || 3;
    innerDuration += intervalTime;
    innerSegments.push(currentStationId);
    currentIdx = nextIdx;
  }
  innerSegments.push(YAMANOTE_OUTER_ORDER[toIndex]);

  // 曜日・時間から出発時刻をパース
  const [hourStr, minStr] = timeStr.split(':');
  const startHour = parseInt(hourStr, 10);
  const startMin = parseInt(minStr, 10);

  // 到着時間の計算ヘルパー
  const formatTimePlusMinutes = (h: number, m: number, addMins: number): string => {
    const totalMins = h * 60 + m + addMins;
    const finalHour = Math.floor(totalMins / 60) % 24;
    const finalMin = totalMins % 60;
    return `${String(finalHour).padStart(2, '0')}:${String(finalMin).padStart(2, '0')}`;
  };

  // 外回りのルート生成
  const fromStation = STATIONS.find(s => s.id === fromId)!;
  const toStation = STATIONS.find(s => s.id === toId)!;

  options.push({
    id: 'outer-loop',
    totalDurationMinutes: outerDuration,
    transferCount: 0,
    startTime: timeStr,
    endTime: formatTimePlusMinutes(startHour, startMin, outerDuration),
    segments: [
      {
        id: 'yamanote-outer',
        lineName: '山手線 (外回り)',
        lineColor: 'bg-green-600',
        fromStation,
        toStation,
        durationMinutes: outerDuration,
        crowdLevel: baseCrowd,
        carDetails: getCarDetailsForArrival(toId, baseCrowd),
      },
    ],
  });

  // 内回りのルート生成
  options.push({
    id: 'inner-loop',
    totalDurationMinutes: innerDuration,
    transferCount: 0,
    startTime: timeStr,
    endTime: formatTimePlusMinutes(startHour, startMin, innerDuration),
    segments: [
      {
        id: 'yamanote-inner',
        lineName: '山手線 (内回り)',
        lineColor: 'bg-green-700',
        fromStation,
        toStation,
        durationMinutes: innerDuration,
        crowdLevel: baseCrowd,
        carDetails: getCarDetailsForArrival(toId, baseCrowd),
      },
    ],
  });

  // 時間が短い方を先頭にする
  return options.sort((a, b) => a.totalDurationMinutes - b.totalDurationMinutes);
}

// 2つの座標間の距離（km）をハバーサインの公式で計算
export function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // 地球の半径 (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 緯度・経度から最も近い駅を見つける
export function findNearestStation(lat: number, lng: number): Station {
  let minDistance = Infinity;
  let nearest: Station = STATIONS[0];

  for (const station of STATIONS) {
    const dist = getDistanceKm(lat, lng, station.lat, station.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = station;
    }
  }

  return nearest;
}
