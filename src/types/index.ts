export interface Station {
  id: string;
  name: string;
  nameEn: string;
  line: string;
  lat: number; // 緯度（現在地からの最寄り駅特定用）
  lng: number; // 経度
}

export type CrowdLevel = 'empty' | 'normal' | 'crowded'; // 空いている・普通・混雑

export interface CarDetail {
  carNumber: number;
  crowdLevel: CrowdLevel;
  features: {
    type: 'stairs' | 'escalator' | 'elevator' | 'exit' | 'transfer' | 'none';
    description: string;
  }[];
}

export interface RouteSegment {
  id: string;
  lineName: string;
  lineColor: string; // TailwindカラークラスやHex
  fromStation: Station;
  toStation: Station;
  durationMinutes: number;
  crowdLevel: CrowdLevel;
  carDetails: CarDetail[];
}

export interface RouteOption {
  id: string;
  totalDurationMinutes: number;
  transferCount: number;
  startTime: string;
  endTime: string;
  segments: RouteSegment[];
}

export interface SearchQuery {
  fromStationId: string;
  toStationId: string;
  dayOfWeek: 'weekday' | 'weekend';
  time: string; // "HH:MM" 形式
}
