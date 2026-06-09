export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  MENU: {
    BASE: '/menu',
    BY_ID: (id: string) => `/menu/${id}`,
    AVAILABILITY: (id: string) => `/menu/${id}/availability`,
    IMAGE: (id: string) => `/menu/${id}/gambar`,
  },
  KATEGORI: {
    BASE: '/kategori',
    BY_ID: (id: string) => `/kategori/${id}`,
  },
  QUEUE: {
    BASE: '/queue',
    CURRENT: '/queue/current',
    STATS: '/queue/stats',
  },
  ORDER: {
    BASE: '/order',
    ACTIVE: '/order/active',
    BY_ID: (id: string) => `/order/${id}`,
    COMPLETE: (id: string) => `/order/${id}/complete`,
    CANCEL: (id: string) => `/order/${id}/cancel`,
    RECEIPT: (id: string) => `/order/${id}/receipt`,
  },
  REPORT: {
    SALES: '/report/sales',
    SALES_PDF: '/report/sales/pdf',
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
  },
  HEALTH: '/health',
};
