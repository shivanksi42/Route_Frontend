const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  static async getStatus() {
    return this.get('/status');
  }

  static async getSettings() {
    return this.get('/settings');
  }

  static async getNetworkStats() {
    return this.get('/network/stats');
  }

  static async getNetworkNodes(limit = 100) {
    return this.get(`/network/nodes?limit=${limit}`);
  }

  static async getNearbyNodes(lat, lon, radius = 0.001, limit = 10) {
    return this.get(`/network/nearby-nodes?lat=${lat}&lon=${lon}&radius=${radius}&limit=${limit}`);
  }

  static async getCongestionHotspots(limit = 10) {
    return this.get(`/network/congestion-hotspots?limit=${limit}`);
  }

  static async predictTraffic(hour, dayOfWeek) {
    return this.post('/traffic/predict', { hour, day_of_week: dayOfWeek });
  }

  static async getCongestionClassification() {
    return this.get('/congestion/classify');
  }

  static async optimizeRoute(params) {
    return this.post('/route/optimize', params);
  }

  static async generateRouteMap(params) {
    const response = await fetch(`${API_BASE_URL}/map/route`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  static async predictTravelTime(fromNode, toNode, hour, dayOfWeek) {
    return this.post('/travel-time/predict', {
      from_node: fromNode,
      to_node: toNode,
      hour,
      day_of_week: dayOfWeek,
    });
  }

  static async reloadSystem() {
    return this.post('/system/reload', {});
  }

  static async get(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  }

  static async post(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  }
}

export default ApiService;