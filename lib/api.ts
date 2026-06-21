"use client";

import axios, { AxiosError } from "axios";
import { getSession, signOut } from "next-auth/react";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
};

export type UserLocation = {
  address?: string;
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
};

export type AdminUser = {
  _id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  age?: number | null;
  dob?: string;
  location?: UserLocation;
  cardStatus?: string;
  accountStatus?: { status?: string; reason?: string };
  verificationStatus?: string;
  verification?: { status?: string; faceVerified?: boolean; ageVerified?: boolean };
  avatar?: { url?: string };
  profilePhotos?: { url: string; publicId?: string }[];
  about?: string;
  bio?: string;
  createdAt?: string;
};

export type UsersPayload = {
  users: AdminUser[];
  pagination: Pagination;
};

export type InterestCategory = {
  _id: string;
  name: string;
  interests: { name: string }[];
  isActive?: boolean;
};

export type SubscriptionPlan = {
  _id: string;
  title: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  billingFrequency: "per_week" | "per_month" | "per_year";
  benefits: string[];
  isCurrentPlan?: boolean;
  isActive?: boolean;
};

export type Report = {
  _id: string;
  reporter?: AdminUser;
  reportedUser?: AdminUser;
  title: string;
  description: string;
  status: "pending" | "resolved" | "ignored";
  adminFeedback?: string;
  createdAt?: string;
};

export type ReportsPayload = {
  reports: Report[];
  pagination: Pagination;
};

export type DashboardOverview = {
  metrics: {
    totalUsers: number;
    activeUsers: number;
    newSignups: number;
    pendingVerification: number;
    pendingReports: number;
  };
  signupsChart: { _id: { year: number; month: number; day: number }; count: number }[];
  userMap: { country: string; users: number }[];
  chatRequests: { _id: string; name: string; email: string; status: string }[];
};

type LoginPayload = {
  email: string;
  password: string;
};

type PlanPayload = {
  title: string;
  price: number;
  billingFrequency: SubscriptionPlan["billingFrequency"];
  benefits: string[];
  description?: string;
};

export type ProfilePayload = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  about?: string;
  locationAddress?: string;
  locationCity?: string;
  locationCountry?: string;
  avatar?: File;
};

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response?.status === 401) {
      await signOut({ callbackUrl: "/auth/login" });
    }
    return Promise.reject(error);
  }
);

const unwrap = <T>(response: { data: ApiResponse<T> }) => response.data.data;

export const api = {
  login: async (payload: LoginPayload) =>
    unwrap<{ accessToken: string; refreshToken: string; user: AdminUser }>(
      await apiClient.post("/auth/login", payload)
    ),

  forgotPassword: async (email: string) =>
    unwrap<{ email: string }>(await apiClient.post("/auth/forgot-password", { email })),

  verifyEmail: async (payload: { email: string; otp: string }) =>
    unwrap(await apiClient.post("/auth/verify-email", payload)),

  resetPassword: async (payload: {
    email: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
  }) => unwrap(await apiClient.post("/auth/reset-password", payload)),

  getProfile: async () => unwrap<AdminUser>(await apiClient.get("/user/profile")),

  updateProfile: async (payload: ProfilePayload) => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, value);
      }
    });

    return unwrap<AdminUser>(
      await apiClient.patch("/user/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },

  changePassword: async (payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => unwrap(await apiClient.patch("/user/password", payload)),

  getDashboardOverview: async (range = "15d") =>
    unwrap<DashboardOverview>(
      await apiClient.get("/admin/dashboard/overview", { params: { range } })
    ),

  getUsers: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    verification?: string;
  }) => unwrap<UsersPayload>(await apiClient.get("/admin/users", { params })),

  getPendingUsers: async () =>
    unwrap<AdminUser[]>(await apiClient.get("/admin/users/pending-verification")),

  getUser: async (id: string) =>
    unwrap<AdminUser>(await apiClient.get(`/admin/users/${id}`)),

  updateUserStatus: async (id: string, status: "active" | "suspended" | "banned") =>
    unwrap<AdminUser>(await apiClient.patch(`/admin/users/${id}/status`, { status })),

  reviewUserVerification: async (id: string, status: "approved" | "rejected") =>
    unwrap(await apiClient.patch(`/admin/users/${id}/verification`, { status })),

  getReports: async (params: { page?: number; limit?: number; status?: string }) =>
    unwrap<ReportsPayload>(await apiClient.get("/report", { params })),

  getReport: async (id: string) => unwrap<Report>(await apiClient.get(`/report/${id}`)),

  handleReport: async (
    id: string,
    payload: { status: "resolved" | "ignored"; adminFeedback?: string }
  ) => unwrap<Report>(await apiClient.patch(`/report/${id}/handle`, payload)),

  deleteReport: async (id: string) => unwrap(await apiClient.delete(`/report/${id}`)),

  getInterests: async () =>
    unwrap<InterestCategory[]>(await apiClient.get("/admin/interests")),

  addInterestItem: async (payload: {
    categoryId?: string;
    categoryName?: string;
    interestName: string;
  }) => unwrap<InterestCategory>(await apiClient.post("/admin/interests/items", payload)),

  createInterestCategory: async (name: string) =>
    unwrap<InterestCategory>(await apiClient.post("/admin/interests/categories", { name })),

  getSubscriptionPlans: async () =>
    unwrap<SubscriptionPlan[]>(await apiClient.get("/admin/subscription-plans")),

  createSubscriptionPlan: async (payload: PlanPayload) =>
    unwrap<SubscriptionPlan>(await apiClient.post("/admin/subscription-plans", payload)),

  updateSubscriptionPlan: async (id: string, payload: Partial<PlanPayload>) =>
    unwrap<SubscriptionPlan>(await apiClient.patch(`/admin/subscription-plans/${id}`, payload)),

  deleteSubscriptionPlan: async (id: string) =>
    unwrap(await apiClient.delete(`/admin/subscription-plans/${id}`)),
};

export function apiErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.message || error.message;
  }
  return error instanceof Error ? error.message : "Something went wrong";
}
