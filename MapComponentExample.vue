<template>
  <div class="map-example-container">
    <div class="map-controls">
      <button @click="initMap" :disabled="mapLoading">初始化地图</button>
      <button @click="addMarkers" :disabled="!mapReady">添加标记</button>
      <button @click="addBoundary" :disabled="!mapReady">添加边界</button>
      <button @click="clearMap" :disabled="!mapReady">清空地图</button>
      <button @click="destroyMap" :disabled="!mapReady">销毁地图</button>
    </div>
    
    <div class="map-status">
      <span :class="{ 'status-loading': mapLoading, 'status-ready': mapReady, 'status-error': mapError }">
        {{ mapStatus }}
      </span>
    </div>
    
    <div id="mapContainer" class="map-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { 
  mapInstance, 
  initBasicMap, 
  addMassMarkers, 
  addDistrictBoundary,
  cleanupMap,
  getMapInstance 
} from '@/utils';

// 响应式状态
const mapLoading = ref(false);
const mapReady = ref(false);
const mapError = ref(false);
const mapStatus = ref('未初始化');

const containerId = 'mapContainer';
let currentMap: any = null;
let massMarks: any = null;
let polygons: any[] = [];

// 初始化地图
const initMap = async () => {
  if (mapReady.value) {
    mapStatus.value = '地图已存在';
    return;
  }
  
  mapLoading.value = true;
  mapError.value = false;
  mapStatus.value = '正在初始化地图...';
  
  try {
    currentMap = await initBasicMap(containerId);
    mapReady.value = true;
    mapLoading.value = false;
    mapStatus.value = '地图初始化成功';
    
    // 添加地图事件监听
    currentMap.on('click', (e: any) => {
      console.log('地图点击位置:', e.lnglat.getLng(), e.lnglat.getLat());
    });
    
  } catch (error) {
    mapError.value = true;
    mapLoading.value = false;
    mapStatus.value = `初始化失败: ${error.message}`;
    console.error('地图初始化失败:', error);
  }
};

// 添加标记点
const addMarkers = () => {
  if (!mapReady.value) return;
  
  // 模拟点位数据
  const pointData = [
    { lng: 114.347106, lat: 30.559794, health_risk_level: '低风险' },
    { lng: 114.357106, lat: 30.569794, health_risk_level: '中低风险' },
    { lng: 114.337106, lat: 30.549794, health_risk_level: '中高风险' },
    { lng: 114.367106, lat: 30.579794, health_risk_level: '高风险' }
  ];
  
  // 图标URL（这里使用占位符，实际项目中替换为真实图标）
  const iconUrls = {
    small: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNiIgY3k9IjYiIHI9IjYiIGZpbGw9IiM0Q0FGNTASCZ8L3N2Zz4K',
    middle: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNiIgY3k9IjYiIHI9IjYiIGZpbGw9IiNGRkE1MDAiLz4KPHN2Zz4K',
    big: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNiIgY3k9IjYiIHI9IjYiIGZpbGw9IiNGRjY1MDAiLz4KPHN2Zz4K',
    large: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNiIgY3k9IjYiIHI9IjYiIGZpbGw9IiNGRjAwMDAiLz4KPHN2Zz4K'
  };
  
  try {
    // 清除之前的标记
    if (massMarks) {
      massMarks.setMap(null);
      massMarks.clear();
    }
    
    massMarks = addMassMarkers(containerId, pointData, iconUrls);
    mapStatus.value = `已添加 ${pointData.length} 个标记点`;
  } catch (error) {
    mapStatus.value = `添加标记失败: ${error.message}`;
    console.error('添加标记失败:', error);
  }
};

// 添加区域边界（模拟数据）
const addBoundary = () => {
  if (!mapReady.value) return;
  
  try {
    // 清除之前的边界
    polygons.forEach(polygon => {
      currentMap.remove(polygon);
    });
    polygons = [];
    
    // 创建一个简单的多边形边界
    const polygon = mapInstance.createPolygon({
      path: [
        [114.327106, 30.539794],
        [114.367106, 30.539794],
        [114.367106, 30.579794],
        [114.327106, 30.579794]
      ],
      fillOpacity: 0.1,
      fillColor: 'rgb(22, 119, 255)',
      strokeColor: 'rgba(22, 119, 255, 0.8)',
      strokeWidth: 2,
      strokeWeight: 2,
      zIndex: 1
    });
    
    currentMap.add(polygon);
    polygons.push(polygon);
    
    // 调整视野以适应边界
    currentMap.setFitView([polygon], false, [60, 60, 60, 60]);
    
    mapStatus.value = '已添加区域边界';
  } catch (error) {
    mapStatus.value = `添加边界失败: ${error.message}`;
    console.error('添加边界失败:', error);
  }
};

// 清空地图
const clearMap = () => {
  if (!mapReady.value) return;
  
  try {
    // 清除标记
    if (massMarks) {
      massMarks.setMap(null);
      massMarks.clear();
      massMarks = null;
    }
    
    // 清除边界
    polygons.forEach(polygon => {
      currentMap.remove(polygon);
    });
    polygons = [];
    
    mapStatus.value = '地图已清空';
  } catch (error) {
    mapStatus.value = `清空地图失败: ${error.message}`;
    console.error('清空地图失败:', error);
  }
};

// 销毁地图
const destroyMap = () => {
  if (!mapReady.value) return;
  
  try {
    cleanupMap(containerId);
    currentMap = null;
    massMarks = null;
    polygons = [];
    mapReady.value = false;
    mapStatus.value = '地图已销毁';
  } catch (error) {
    mapStatus.value = `销毁地图失败: ${error.message}`;
    console.error('销毁地图失败:', error);
  }
};

// 组件挂载时自动初始化地图
onMounted(() => {
  // 可以选择自动初始化或手动初始化
  // initMap();
});

// 组件卸载时清理资源
onUnmounted(() => {
  if (mapReady.value) {
    cleanupMap(containerId);
  }
});
</script>

<style scoped>
.map-example-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.map-controls {
  padding: 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.map-controls button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.map-controls button:hover:not(:disabled) {
  background: #e6f7ff;
  border-color: #1890ff;
}

.map-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.map-status {
  padding: 8px 16px;
  background: #fafafa;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

.status-loading {
  color: #1890ff;
}

.status-ready {
  color: #52c41a;
}

.status-error {
  color: #ff4d4f;
}

.map-container {
  flex: 1;
  min-height: 400px;
  background: #f0f0f0;
}
</style>