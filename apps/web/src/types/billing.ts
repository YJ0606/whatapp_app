export interface BillingPlan {
  id: string;
  name: string;
  priceInr: number;
  pricePaise: number;
  messages: number;
  seats: string | number;
}

export interface BillingOverview {
  subscription: {
    planId: string;
    planName: string;
    status: string;
    monthlyMessages: number;
    currentPeriodEnd: string | null;
    trialEndsAt: string | null;
  };
  usage: {
    messages: number;
    messageLimit: number;
    teamMembers: number;
    teamLimit: number | null;
    catalogItems: number;
    catalogLimit: number;
  };
  plans: BillingPlan[];
  invoices: BillingInvoice[];
  razorpayConfigured: boolean;
  keyId: string;
}

export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  period: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
  paidAt: string | null;
}

export interface BillingUsageItem {
  label: string;
  used: number;
  total: number | null;
  unit: string;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  keyId: string;
  devMode?: boolean;
}
