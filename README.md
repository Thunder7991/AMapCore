# 地图单例实例使用指南

## 概述

本项目提供了一个基于高德地图的单例实例管理工具，用于在多个组件中统一管理地图实例，避免重复加载和资源浪费。

## 核心特性

- **单例模式**：确保AMap只加载一次，提高性能
- **实例管理**：支持多个地图容器的实例管理
- **插件预加载**：预配置常用插件，支持动态加载额外插件
- **类型安全**：完整的TypeScript类型支持
- **资源管理**：自动管理地图实例的创建和销毁

## 快速开始

### 1. 基础用法

```typescript
import { mapInstance, initBasicMap } from '@/utils';

// 在Vue组件中使用
export default {
  async mounted() {
    try {
      const map = await initBasicMap('mapContainer');
      console.log('地图初始化成功', map);
    } catch (error) {
      console.error('地图初始化失败', error);
    }
  },
  
  beforeUnmount() {
    // 清理地图资源
    mapInstance.destroyMap('mapContainer');
  }
}
```

### 2. 自定义配置

```typescript
import { mapInstance, type MapConfig } from '@/utils';

const config: MapConfig = {
  containerId: 'myMap',
  center: [116.397428, 39.90923], // 北京天安门
  zoom: 12,
  mapStyle: 'amap://styles/blue'
};

const map = await mapInstance.createMap(config);
```

### 3. 带绘制功能的地图

```typescript
import { initDrawableMap } from '@/utils';

const { map, AMap } = await initDrawableMap('drawableMapContainer');
// 现在可以使用绘制功能
```

## API 参考

### MapInstance 类

#### 主要方法

- `loadAMap(additionalPlugins?: string[])`: 加载AMap，支持额外插件
- `createMap(config: MapConfig)`: 创建地图实例
- `getMap(containerId: string)`: 获取指定容器的地图实例
- `getAMap()`: 获取AMap类
- `destroyMap(containerId: string)`: 销毁指定地图实例
- `destroyAllMaps()`: 销毁所有地图实例
- `addControls(containerId: string, controls: object)`: 添加地图控件

#### 工厂方法

- `createPolygon(options)`: 创建多边形
- `createCircle(options)`: 创建圆形
- `createMarker(options)`: 创建标记
- `createMassMarks(data, options)`: 创建海量点标记
- `createPixel(x, y)`: 创建像素对象
- `createSize(width, height)`: 创建尺寸对象
- `createLngLat(lng, lat)`: 创建经纬度对象

### 配置接口

```typescript
interface MapConfig {
  containerId: string;        // 地图容器ID（必需）
  center?: [number, number];  // 地图中心点 [经度, 纬度]
  zoom?: number;              // 缩放级别
  mapStyle?: string;          // 地图样式
  resizeEnable?: boolean;     // 是否允许调整大小
  viewMode?: string;          // 视图模式（如 '3D'）
}
```

## 使用示例

### 在现有Map.vue中的改造

**改造前：**
```typescript
// 原始的Map.vue中的initMap函数
const initMap = () => {
  AMapLoader.load({
    key: '792ee42fedbafeba66f4ea7cda7f99a2',
    version: '2.0',
    plugins: ['AMap.MapboxVectorTileLayer', 'AMap.Scale', ...]
  }).then((AMap) => {
    BMap = AMap
    map = new AMap.Map('container', {
      resizeEnable: true,
      zoom: 8,
      center: [114.347106, 30.559794],
      mapStyle: 'amap://styles/whitesmoke',
    });
    // ... 其他初始化代码
  })
}
```

**改造后：**
```typescript
import { initBasicMap, mapInstance } from '@/utils';

const initMap = async () => {
  try {
    map = await initBasicMap('container');
    BMap = mapInstance.getAMap();
    
    // 设置绘制工具
    setDraw(BMap, map);
    maploaded.value = true;
    
    // 其他初始化代码...
    store.setRegionArgs('street');
    addMapEvent();
    changeRegionFn();
  } catch (error) {
    console.error('地图初始化失败:', error);
  }
}
```

### 添加区域边界

```typescript
import { addDistrictBoundary } from '@/utils';
import { wktToGeoJSON } from "@terraformer/wkt";

// 在获取到边界数据后
getDistrictFenceApi(store.regionCode, store.getStringLevel).then((res) => {
  const { data = [] } = res;
  if (data.length) {
    const polygons = addDistrictBoundary('container', data, wktToGeoJSON);
    // polygons 包含所有创建的多边形
  }
});
```

### 添加海量点标记

```typescript
import { addMassMarkers } from '@/utils';

const iconUrls = {
  small: new URL('@/assets/images/small.png', import.meta.url).href,
  middle: new URL('@/assets/images/middle.png', import.meta.url).href,
  big: new URL('@/assets/images/big.png', import.meta.url).href,
  large: new URL('@/assets/images/large.png', import.meta.url).href
};

const massMarks = addMassMarkers('container', pointData, iconUrls);
```

## 最佳实践

### 1. 组件生命周期管理

```typescript
// Vue 3 Composition API
import { onMounted, onUnmounted } from 'vue';
import { mapInstance } from '@/utils';

const containerId = 'myMapContainer';

onMounted(async () => {
  await initBasicMap(containerId);
});

onUnmounted(() => {
  mapInstance.destroyMap(containerId);
});
```

### 2. 错误处理

```typescript
try {
  const map = await mapInstance.createMap(config);
  // 地图创建成功
} catch (error) {
  if (error.message.includes('容器')) {
    console.error('地图容器不存在');
  } else {
    console.error('地图初始化失败:', error);
  }
}
```

### 3. 多地图实例管理

```typescript
// 创建多个地图实例
const mainMap = await mapInstance.createMap({ containerId: 'mainMap' });
const miniMap = await mapInstance.createMap({ containerId: 'miniMap', zoom: 5 });

// 获取所有地图实例ID
const mapIds = mapInstance.getMapIds();
console.log('当前地图实例:', mapIds); // ['mainMap', 'miniMap']

// 销毁特定实例
mapInstance.destroyMap('miniMap');

// 或销毁所有实例
mapInstance.destroyAllMaps();
```

## 注意事项

1. **容器ID唯一性**：确保每个地图容器的ID是唯一的
2. **资源清理**：在组件卸载时务必调用 `destroyMap()` 清理资源
3. **异步处理**：地图初始化是异步的，使用 `async/await` 或 `.then()` 处理
4. **插件加载**：如需特殊插件，在创建地图前调用 `loadAMap()` 加载
5. **错误处理**：始终包含错误处理逻辑，确保应用稳定性

## 迁移指南

如果你有现有的地图代码需要迁移到单例模式：

1. 将 `AMapLoader.load()` 替换为 `mapInstance.loadAMap()`
2. 将 `new AMap.Map()` 替换为 `mapInstance.createMap()`
3. 使用 `mapInstance.getAMap()` 获取AMap类
4. 在组件卸载时添加 `mapInstance.destroyMap()` 调用
5. 使用工厂方法创建地图对象（如 `mapInstance.createPolygon()`）

这样可以确保更好的性能和资源管理。