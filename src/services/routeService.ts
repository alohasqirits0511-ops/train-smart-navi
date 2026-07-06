import { Station, RouteOption } from '../types';
import { STATIONS, getMockRoutes, findNearestStation } from './mockData';

/**
 * 経路検索および位置情報サービス
 * 将来的に鉄道会社のリアルタイムAPIやODPT (公共交通オープンデータセンター)、
 * GTFSデータ等に差し替えられるよう、サービス層として定義。
 */
export class RouteService {
  /**
   * すべての駅リストを取得する
   */
  static async getStations(): Promise<Station[]> {
    // 将来的なAPI呼び出しのモックとして Promise.resolve を使用
    return Promise.resolve(STATIONS);
  }

  /**
   * 緯度・経度から最も近い駅を取得する
   */
  static async getNearestStation(lat: number, lng: number): Promise<Station> {
    const nearest = findNearestStation(lat, lng);
    return Promise.resolve(nearest);
  }

  /**
   * 出発駅、目的駅、日時、時間から最適な経路候補を取得する
   */
  static async searchRoutes(
    fromStationId: string,
    toStationId: string,
    dayOfWeek: 'weekday' | 'weekend',
    time: string
  ): Promise<RouteOption[]> {
    // 将来的なAPI呼び出しのモックとして Promise.resolve を使用
    const routes = getMockRoutes(fromStationId, toStationId, dayOfWeek, time);
    return Promise.resolve(routes);
  }
}
