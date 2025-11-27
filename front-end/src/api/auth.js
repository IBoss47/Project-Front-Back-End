import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Refresh token function
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh on 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ถ้าเป็น endpoint login หรือ register ให้ส่ง error กลับไปโดยตรง ไม่ redirect
    if (originalRequest.url?.includes('/login') || originalRequest.url?.includes('/register')) {
      return Promise.reject(error);
    }

    // ถ้าได้ 401 และยังไม่ได้ retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // ถ้ากำลัง refresh อยู่ ให้รอจนกว่าจะเสร็จ
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        // ไม่มี refresh token ให้ logout (แต่ไม่ redirect ทันที)
        authAPI.logout();
        return Promise.reject(error);
      }

      try {
        // ขอ access token ใหม่
        const response = await axios.post(`${API_URL}/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);

        // อัพเดท token ใน request ทั้งหมดที่รออยู่
        onRefreshed(access_token);
        isRefreshing = false;

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token หมดอายุหรือไม่ valid
        isRefreshing = false;
        authAPI.logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // Register
  register: async (userData) => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  // Login
  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    
    console.log('🔍 API Response:', response);
    console.log('📦 Response.data:', response.data);
    console.log('📦 Response.data.data:', response.data.data);
    
    if (response.data && response.data.data) {
      const { access_token, refresh_token, user } = response.data.data;
      
      console.log('💾 Storing tokens...');
      console.log('  - Access Token:', access_token);
      console.log('  - Refresh Token:', refresh_token);
      
      // เก็บ tokens
      if (access_token) {
        localStorage.setItem('access_token', access_token);
        console.log('✅ Access token saved');
      }
      if (refresh_token) {
        localStorage.setItem('refresh_token', refresh_token);
        console.log('✅ Refresh token saved');
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        console.log('✅ User data saved');
      }
    } else {
      console.warn('⚠️ No data.data in response');
    }
    
    return response.data;
  },

  // Logout
  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (refreshToken) {
      try {
        await api.post('/logout', { refresh_token: refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    // ลบข้อมูลทั้งหมด
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('name');
    localStorage.removeItem('roles');
  },

  // Refresh access token manually
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post('/refresh', {
      refresh_token: refreshToken,
    });

    const { access_token } = response.data;
    localStorage.setItem('access_token', access_token);
    
    return access_token;
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
};

// Profile API
export const profileAPI = {
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },
};

export default api;
