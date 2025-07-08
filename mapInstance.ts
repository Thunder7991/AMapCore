import AMapLoader from '@amap/amap-jsapi-loader';
import "@amap/amap-jsapi-types";

// 地图配置接口
interface MapConfig {
  containerId: string;
  center?: [number, number];
  zoom?: number;
  mapStyle?: string;
  resizeEnable?: boolean;
  viewMode?: string;
  plugins?: string[];
}

// 地图实例管理类
class MapInstance {
  private static instance: MapInstance;
  private AMap: any = null;
  private mapInstances: Map<string, AMap.Map> = new Map();
  private isLoaded: boolean = false;
  private loadPromise: Promise<any> | null = null;

  // 默认配置
  private defaultConfig = {
    key: '',
    version: '2.0',
    plugins: [
      'AMap.MapboxVectorTileLayer',
      'AMap.Scale',
      'AMap.ToolBar',
      'AMap.GeoJSON',
      'AMap.DistrictSearch',
      'AMap.MouseTool',
      'AMap.CircleEditor',
      'AMap.PolygonEditor',
      'AMap.Polygon',
      'AMap.Circle',
      'AMap.Marker',
      'AMap.MassMarks'
    ]
  };

  private constructor() {}

  // 获取单例实例
  public static getInstance(): MapInstance {
    if (!MapInstance.instance) {
      MapInstance.instance = new MapInstance();
    }
    return MapInstance.instance;
  }

  // 加载AMap
  public async loadAMap(additionalPlugins: string[] = []): Promise<any> {
    if (this.isLoaded && this.AMap) {
      return this.AMap;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = AMapLoader.load({
      ...this.defaultConfig,
      plugins: [...this.defaultConfig.plugins, ...additionalPlugins]
    });

    try {
      this.AMap = await this.loadPromise;
      this.isLoaded = true;
      return this.AMap;
    } catch (error) {
      console.error('AMap加载失败:', error);
      this.loadPromise = null;
      throw error;
    }
  }

  // 创建地图实例
  public async createMap(config: MapConfig): Promise<AMap.Map> {
    const AMap = await this.loadAMap();
    
    // 检查容器是否存在
    const container = document.getElementById(config.containerId);
    if (!container) {
      throw new Error(`地图容器 ${config.containerId} 不存在`);
    }

    // 如果已存在该容器的地图实例，先销毁
    if (this.mapInstances.has(config.containerId)) {
      this.destroyMap(config.containerId);
    }

    // 创建地图实例
    const mapInstance = new AMap.Map(config.containerId, {
      resizeEnable: config.resizeEnable ?? true,
      zoom: config.zoom ?? 8,
      center: config.center ?? [114.347106, 30.559794],
      mapStyle: config.mapStyle ?? 'amap://styles/whitesmoke',
      viewMode: config.viewMode
    });

    // 存储地图实例
    this.mapInstances.set(config.containerId, mapInstance);
    
    return mapInstance;
  }

  // 获取地图实例
  public getMap(containerId: string): AMap.Map | null {
    return this.mapInstances.get(containerId) || null;
  }

  // 获取AMap类
  public getAMap(): any {
    return this.AMap;
  }

  // 销毁指定地图实例
  public destroyMap(containerId: string): void {
    const mapInstance = this.mapInstances.get(containerId);
    if (mapInstance) {
      mapInstance.destroy();
      this.mapInstances.delete(containerId);
    }
  }

  // 销毁所有地图实例
  public destroyAllMaps(): void {
    this.mapInstances.forEach((mapInstance, containerId) => {
      mapInstance.destroy();
    });
    this.mapInstances.clear();
  }

  // 添加地图控件
  public addControls(containerId: string, controls: {
    scale?: { position?: any };
    toolbar?: { position?: any };
  }): void {
    const mapInstance = this.getMap(containerId);
    if (!mapInstance || !this.AMap) return;

    if (controls.scale) {
      const scale = new this.AMap.Scale(controls.scale);
      mapInstance.addControl(scale);
    }

    if (controls.toolbar) {
      const toolbar = new this.AMap.ToolBar(controls.toolbar);
      mapInstance.addControl(toolbar);
    }
  }

  // 创建多边形
  public createPolygon(options: any): any {
    if (!this.AMap) {
      throw new Error('AMap未加载');
    }
    return new this.AMap.Polygon(options);
  }

  // 创建圆形
  public createCircle(options: any): any {
    if (!this.AMap) {
      throw new Error('AMap未加载');
    }
    return new this.AMap.Circle(options);
  }

  // 创建标记
  public createMarker(options: any): any {
    if (!this.AMap) {
      throw new Error('AMap未加载');
    }
    return new this.AMap.Marker(options);
  }

  // 创建尺寸对象
  public createSize(width: number, height: number): any {
    if (!this.AMap) {
      throw new Error('AMap未加载');
    }
    return new this.AMap.Size(width, height);
  }

  // 创建经纬度对象
  public createLngLat(lng: number, lat: number): any {
    if (!this.AMap) {
      throw new Error('AMap未加载');
    }
    return new this.AMap.LngLat(lng, lat);
  }

  // 检查是否已加载
  public isAMapLoaded(): boolean {
    return this.isLoaded;
  }

  // 获取所有地图实例的ID
  public getMapIds(): string[] {
    return Array.from(this.mapInstances.keys());
  }
}

// 导出单例实例
export const mapInstance = MapInstance.getInstance();

// 导出类型
export type { MapConfig };

// 导出默认方法（向后兼容）
export default mapInstance;