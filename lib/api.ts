import axios from 'axios';
import {
  ApiResponse,
  IUser,
  RegisterData,
  KYCData,
  ITreeNode,
  CreateSaleData,
  ISale,
  PaginatedResponse,
  IWallet,
  GenerateEPinData,
  IEPin,
  IPlan
} from '../types';

const api = axios.create({
  // Use relative path for client-side to leverage Next.js rewrites (handles CORS/Cookies)
  baseURL: '/api',
  withCredentials: true,
});

// Response interceptor - handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// AUTH
export const authAPI = {
  login: (mobile: string, password: string, location?: { lat: number; lng: number }, otp?: string) =>
    api.post<ApiResponse<IUser>>('/auth/login', { mobile, password, location, otp }),
  register: (data: RegisterData) =>
    api.post('/auth/register', data),
  getMe: () =>
    api.get<ApiResponse<IUser>>('/auth/me'),
  logout: () =>
    api.post('/auth/logout'),
  changePassword: (data: any) =>
    api.post<ApiResponse<any>>('/auth/change-password', data),
};

// PUBLIC SALES (REFERRAL LINKS)
export const publicAPI = {
  getSeller: (memberId: string) =>
    api.get(`/public/seller/${memberId}`),
  createOrder: (data: {
    planId: string;
    refCode: string;
    customerName?: string;
    customerMobile?: string;
    customerEmail?: string;
  }) =>
    api.post('/public/create-order', data),
  verifyPayment: (data: any) =>
    api.post('/public/verify-payment', data),
};

// SUBSCRIPTIONS (AutoPay)
export const subscriptionAPI = {
  create: (data: any) =>
    api.post('/subscriptions/create', data),
  getStatus: (subscriptionId: string) =>
    api.get(`/subscriptions/status/${subscriptionId}`),
};

// USERS
export const usersAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; role?: string; state?: string; refer?: string }) =>
    api.get<PaginatedResponse<IUser>>('/users', { params }),
  getStats: () =>
    api.get<ApiResponse<any>>('/users/stats'),
  getById: (id: string) =>
    api.get<ApiResponse<IUser>>(`/users/${id}`),
  updateKYC: (id: string, data: any) =>
    api.put<ApiResponse<any>>(`/users/${id}/kyc`, data),
  updateProfile: (id: string, data: { name?: string; email?: string; mobile?: string; bankDetails?: any; nomineeDetails?: any }) =>
    api.put<ApiResponse<IUser>>(`/users/${id}/profile`, data),
  getDownline: (id: string) =>
    api.get<ApiResponse<ITreeNode>>(`/users/${id}/downline`),
  trackHeartbeat: () =>
    api.post('/users/heartbeat'),
  requestBankUpdateOTP: (data: { bankName: string; accountNumber: string; ifscCode: string }) =>
    api.post<ApiResponse<any>>('/users/bank-update/request', data),
  verifyBankUpdateOTP: (data: { bankName: string; accountNumber: string; ifscCode: string; otp: string }) =>
    api.post<ApiResponse<any>>('/users/bank-update/verify', data),
};

// SALES
export const salesAPI = {
  create: (data: CreateSaleData) =>
    api.post<ApiResponse<ISale>>('/sales', data),
  getAll: (params?: { page?: number; limit?: number; cycleMonth?: string; search?: string; status?: string }) =>
    api.get<PaginatedResponse<ISale>>('/sales', { params }),
  getFTDAnalytics: (date: string) =>
    api.get<ApiResponse<any>>('/sales/analytics/ftd', { params: { date } }),
  getMTDAnalytics: (month: string) =>
    api.get<ApiResponse<any>>('/sales/analytics/mtd', { params: { month } }),
  getById: (id: string) =>
    api.get<ApiResponse<ISale>>(`/sales/${id}`),
};

// WALLET
export const walletAPI = {
  getMyWallet: () =>
    api.get<ApiResponse<IWallet>>('/wallet/my'),
  requestWithdrawal: (amount: number) =>
    api.post('/wallet/withdraw', { amount }),
  getMyWithdrawals: () =>
    api.get<ApiResponse<any[]>>('/wallet/withdrawals'),
  triggerPayoutCycle: (cycleMonth: string) =>
    api.post('/wallet/payout-cycle', { cycleMonth }),
  getAllWithdrawalRequests: (status?: string) =>
    api.get<ApiResponse<any[]>>('/wallet/withdrawal-requests', { params: { status } }),
  updateWithdrawalStatus: (id: string, action: 'approve' | 'reject' | 'freeze', remarks?: string) =>
    api.patch(`/wallet/withdrawal-requests/${id}`, { action, remarks }),
  unfreezeWallet: (id: string) =>
    api.patch(`/wallet/${id}/unfreeze`),
};

// NOTIFICATIONS
export const notificationAPI = {
  getAll: () =>
    api.get<ApiResponse<any[]>>('/notifications'),
  markAsRead: (id: string) =>
    api.put(`/notifications/${id}/read`),
  markAllAsRead: () =>
    api.put('/notifications/read-all'),
  clearAll: () =>
    api.delete('/notifications/clear'),
};

// ACTIVITY LOGS
export const activityAPI = {
  getAll: (params?: { page?: number; limit?: number; role?: string; category?: string; search?: string }) =>
    api.get<PaginatedResponse<any>>('/activity', { params }),
};

// EPINS
export const epinsAPI = {
  generate: (data: GenerateEPinData) =>
    api.post('/epins/generate', data),
  transfer: (pinCode: string, toMemberId: string) =>
    api.post('/epins/transfer', { pinCode, toMemberId }),
  getMyPins: () =>
    api.get<ApiResponse<{ unused: IEPin[]; used: IEPin[]; totalUnused: number }>>('/epins/my-pins'),
};

// PLANS
export const plansAPI = {
  getAll: () =>
    api.get<ApiResponse<IPlan[]>>('/plans'),
  getAllAdmin: () =>
    api.get<ApiResponse<IPlan[]>>('/plans/admin/all'),
  create: (data: Partial<IPlan>) =>
    api.post<ApiResponse<IPlan>>('/plans', data),
  update: (id: string, data: Partial<IPlan>) =>
    api.put<ApiResponse<IPlan>>(`/plans/${id}`, data),
  delete: (id: string) =>
    api.delete<ApiResponse<any>>(`/plans/${id}`),
};

// ADMIN
export const adminAPI = {
  getPendingKYC: () =>
    api.get<ApiResponse<IUser[]>>('/admin/kyc/pending'),
  getPendingBankUpdates: () =>
    api.get<ApiResponse<IUser[]>>('/admin/bank-updates/pending'),
  updateKYCStatus: (id: string, status: 'approved' | 'rejected') =>
    api.put<ApiResponse<any>>(`/admin/kyc/${id}/status`, { status }),
  verifyBankDetails: (id: string, status: 'verified' | 'rejected') =>
    api.put<ApiResponse<any>>(`/admin/users/${id}/bank-verify`, { status }),
  updateUserStatus: (id: string, status: string) =>
    api.put<ApiResponse<any>>(`/admin/users/${id}/status`, { status }),
  getCommissionConfig: () =>
    api.get<ApiResponse<any>>('/admin/commission-config'),
  updateCommissionConfig: (data: any) =>
    api.put<ApiResponse<any>>('/admin/commission-config', data),
  triggerPayoutCycle: (cycleMonth: string) =>
    api.post<ApiResponse<any>>('/wallet/payout-cycle', { cycleMonth }),
  getAllProvisional: () =>
    api.get<ApiResponse<{ wallets: any[]; summary: any }>>('/wallet/all-provisional'),
  getGlobalLedger: (params?: { page?: number; limit?: number; type?: string }) =>
    api.get<PaginatedResponse<any>>('/wallet/global-ledger', { params }),
  getTree: () =>
    api.get<ApiResponse<any>>('/admin/tree'),
  createManualAdjustment: (data: { memberId: string, amount: number, type: 'credit' | 'debit', reason: string }) =>
    api.post<ApiResponse<any>>('/admin/manual-adjustment', data),
  getAdjustmentHistory: (params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<any>>('/wallet/global-ledger', { params: { ...params, type: 'manual' } }),
  getStatePerformance: () =>
    api.get<ApiResponse<any[]>>('/admin/state-performance'),
  sendAnnouncement: (data: { userIds?: string[], title: string, message: string, type: string, sendToAll?: boolean }) =>
    api.post<ApiResponse<any>>('/admin/announcements', data),
};

// TEAM
export const teamAPI = {
  getStats: () =>
    api.get<ApiResponse<any>>('/team/stats'),
  getMembers: (params?: { role?: string; search?: string; page?: number; limit?: number; parentId?: string }) =>
    api.get<PaginatedResponse<any>>('/team/members', { params }),
};

// DASHBOARD
export const dashboardAPI = {
  getSummary: (params?: { period?: string; state?: string }) =>
    api.get<ApiResponse<any>>('/dashboard/summary', { params }),
  getLeaders: (params?: { role?: string }) =>
    api.get<ApiResponse<any>>('/dashboard/leaders', { params }),
};

// COMPLAINTS
export const complaintsAPI = {
  create: (data: { subject: string; category: string; priority: string; description: string }) =>
    api.post<ApiResponse<any>>('/complaints', data),
  getMy: () =>
    api.get<ApiResponse<any[]>>('/complaints/my'),
  getAll: () =>
    api.get<ApiResponse<any[]>>('/complaints/all'),
  updateStatus: (id: string, status: string) =>
    api.put<ApiResponse<any>>(`/complaints/${id}/status`, { status }),
  reply: (id: string, message: string) =>
    api.post<ApiResponse<any>>(`/complaints/${id}/reply`, { message }),
};

// PAYMENTS (Cashfree)
export const paymentAPI = {
  createOrder: (data: { amount: number; purpose?: string }) =>
    api.post<any>('/payment/create-order', data),
  verifyPayment: (orderId: string) =>
    api.get<any>(`/payment/verify/${orderId}`),
  getHistory: () =>
    api.get<any>('/payment/history'),
  // Admin
  getAllPayments: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<any>('/payment/all', { params }),
};

export default api;
