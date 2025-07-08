// 地图单例使用示例
import { mapInstance, type MapConfig } from './mapInstance';

/**
 * 基础地图初始化示例
 * 适用于大多数地图页面
 */
export async function initBasicMap(containerId: string) {
  try {
    const config: MapConfig = {
      containerId,
      center: [114.347106, 30.559794], // 武汉市中心
      zoom: 8,
      mapStyle: 'amap://styles/whitesmoke'
    };

    const map = await mapInstance.createMap(config);
    
    // 添加控件
    mapInstance.addControls(containerId, {
      scale: {
        position: {
          bottom: '15px',
          right: '598px'
        }
      },
      toolbar: {
        position: {
          bottom: '10px',
          right: '563px'
        }
      }
    });

    return map;
  } catch (error) {
    console.error('地图初始化失败:', error);
    throw error;
  }
}

/**
 * 带绘制功能的地图初始化示例
 * 适用于需要绘制功能的页面
 */
export async function initDrawableMap(containerId: string) {
  try {
    // 加载额外的绘制相关插件
    await mapInstance.loadAMap(['AMap.MouseTool', 'AMap.CircleEditor', 'AMap.PolygonEditor']);
    
    const config: MapConfig = {
      containerId,
      center: [114.347106, 30.559794],
      zoom: 10,
      mapStyle: 'amap://styles/whitesmoke'
    };

    const map = await mapInstance.createMap(config);
    const AMap = mapInstance.getAMap();
    
    // 可以在这里设置绘制工具
    // 例如：setDraw(AMap, map) - 如果有DrawControl组件
    
    return { map, AMap };
  } catch (error) {
    console.error('可绘制地图初始化失败:', error);
    throw error;
  }
}

/**
 * 添加区域边界示例
 * 根据区域代码添加行政区边界
 */
export async function addDistrictBoundary(
  containerId: string, 
  boundaryData: any[],
  wktToGeoJSON: (wkt: string) => any
) {
  const map = mapInstance.getMap(containerId);
  if (!map) {
    throw new Error(`地图实例 ${containerId} 不存在`);
  }

  const polygons: any[] = [];
  
  boundaryData.forEach((item: any) => {
    const path = wktToGeoJSON(item.boundary_wkt).coordinates;
    const polygon = mapInstance.createPolygon({
      path: path,
      fillOpacity: 0.1,
      fillColor: 'rgb(22, 119, 255)',
      strokeColor: 'rgba(22, 119, 255, 0.30)',
      strokeWidth: 1,
      strokeWeight: 1,
      zIndex: 1
    });
    
    polygons.push(polygon);
    map.add(polygon);
  });

  // 视口自适应
  if (polygons.length > 0) {
    map.setFitView(polygons, false, [60, 60, 60, 450]);
  }

  return polygons;
}

/**
 * 添加海量点标记示例
 * 用于显示大量的点位数据
 */
export function addMassMarkers(
  containerId: string,
  pointData: any[],
  iconUrls: { small: string; middle: string; big: string; large: string }
) {
  const map = mapInstance.getMap(containerId);
  if (!map) {
    throw new Error(`地图实例 ${containerId} 不存在`);
  }

  // 定义标记样式
  const style = [
    {
      url: iconUrls.small,
      zIndex: 0,
      anchor: mapInstance.createPixel(4, 4),
      size: mapInstance.createSize(12, 12),
    },
    {
      url: iconUrls.middle,
      zIndex: 1,
      anchor: mapInstance.createPixel(4, 4),
      size: mapInstance.createSize(12, 12),
    },
    {
      url: iconUrls.big,
      zIndex: 2,
      anchor: mapInstance.createPixel(4, 4),
      size: mapInstance.createSize(12, 12),
    },
    {
      url: iconUrls.large,
      zIndex: 3,
      anchor: mapInstance.createPixel(4, 4),
      size: mapInstance.createSize(12, 12),
    }
  ];

  // 转换数据格式
  const mapPoiList = pointData.map((item: any) => {
    const styleIndex = item.health_risk_level === '低风险' ? 0 : 
                      item.health_risk_level === '中低风险' ? 1 : 
                      item.health_risk_level === '中高风险' ? 2 : 3;
    
    return {
      lnglat: [item.lng, item.lat],
      style: styleIndex
    };
  });

  // 创建海量点标记
  const massMarks = mapInstance.createMassMarks(mapPoiList, {
    opacity: 0.8,
    zIndex: 111,
    cursor: 'pointer',
    style: style
  });

  massMarks.setMap(map);
  return massMarks;
}

/**
 * 清理地图资源示例
 * 在组件卸载时调用
 */
export function cleanupMap(containerId: string) {
  mapInstance.destroyMap(containerId);
}

/**
 * 获取地图实例示例
 * 用于在其他地方获取已创建的地图实例
 */
export function getMapInstance(containerId: string) {
  return mapInstance.getMap(containerId);
}

/**
 * 检查地图是否已加载
 */
export function isMapLoaded() {
  return mapInstance.isAMapLoaded();
}

/**
 * 获取AMap类
 * 用于创建其他地图相关对象
 */
export function getAMapClass() {
  return mapInstance.getAMap();
}