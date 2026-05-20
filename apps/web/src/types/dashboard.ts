import type { UserRole } from "@/types/auth";

export interface DashboardAccount {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
}

export interface DashboardActivity {
  id: string;
  type: "message" | "booking" | "order" | "handoff";
  text: string;
  createdAt: string;
}

export interface DashboardWeeklyVolume {
  name: string;
  date: string;
  messages: number;
  bookings: number;
  orders: number;
  resolved: number;
}

export interface DashboardUsage {
  used: number;
  limit: number;
  aiMessages: number;
  templateSends: number;
  manualReplies: number;
  resetsInDays: number;
}

export interface DashboardMetrics {
  account: DashboardAccount;
  messagesHandled: number;
  activeConversations: number;
  bookings: number;
  orders: number;
  aiResolutionRate: number;
  humanHandoffs: number;
  avgResponseTimeMs: number;
  topFAQs: Array<{ question: string; hits: number }>;
  weeklyVolume: DashboardWeeklyVolume[];
  recentActivity: DashboardActivity[];
  usage: DashboardUsage;
  refreshedAt: string;
}
