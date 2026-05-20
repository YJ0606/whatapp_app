import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";
import Razorpay from "razorpay";
import type { User } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { addDays, formatPeriod } from "../../common/utils/date.util";

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  growth: "Growth",
  pro: "Pro",
};

type PlanConfig = { id: string; price: number; messages: number; seats: number };

@Injectable()
export class BillingService {
  private razorpay: InstanceType<typeof Razorpay> | null = null;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const keyId = this.config.get<string>("billing.razorpayKeyId");
    const keySecret = this.config.get<string>("billing.razorpayKeySecret");
    if (keyId && keySecret) {
      this.razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    }
  }

  private get plans(): Record<string, PlanConfig> {
    return this.config.get<Record<string, PlanConfig>>("billing.plans") ?? {};
  }

  async getOverview(tenantId: string) {
    const [subscription, teamMembers, catalogItems, messageCount, invoices] =
      await Promise.all([
        this.prisma.subscription.findUnique({ where: { tenantId } }),
        this.prisma.user.count({ where: { tenantId, isActive: true } }),
        this.prisma.catalogItem.count({ where: { tenantId } }),
        this.prisma.message.count({
          where: {
            tenantId,
            createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
          },
        }),
        this.prisma.invoice.findMany({
          where: { tenantId },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
      ]);

    const planId = subscription?.planId ?? "starter";
    const plan = this.plans[planId] ?? this.plans.starter;

    return {
      subscription: {
        planId,
        planName: PLAN_LABELS[planId] ?? planId,
        status: subscription?.status ?? "TRIALING",
        monthlyMessages: subscription?.monthlyMessages ?? plan?.messages ?? 500,
        currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString() ?? null,
        trialEndsAt: subscription?.trialEndsAt?.toISOString() ?? null,
      },
      usage: {
        messages: messageCount,
        messageLimit: subscription?.monthlyMessages ?? plan?.messages ?? 500,
        teamMembers,
        teamLimit: plan?.seats === -1 ? null : (plan?.seats ?? 2),
        catalogItems,
        catalogLimit: 500,
      },
      plans: Object.entries(this.plans).map(([id, p]) => ({
        id,
        name: PLAN_LABELS[id] ?? id,
        priceInr: Math.round(p.price / 100),
        pricePaise: p.price,
        messages: p.messages,
        seats: p.seats === -1 ? "Unlimited" : p.seats,
      })),
      invoices: invoices.map((inv) => this.formatInvoice(inv)),
      razorpayConfigured: Boolean(this.razorpay),
      keyId: this.config.get<string>("billing.razorpayKeyId") ?? "",
    };
  }

  async createCheckout(tenantId: string, user: User, planId: string) {
    const plan = this.plans[planId];
    if (!plan) throw new BadRequestException("Invalid plan selected");

    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });
    if (subscription?.planId === planId && subscription.status === "ACTIVE") {
      throw new BadRequestException("You are already on this plan");
    }

    let orderId: string;
    const amount = plan.price;
    const devMode = !this.razorpay;

    if (this.razorpay) {
      const order = await this.razorpay.orders.create({
        amount,
        currency: "INR",
        receipt: `waai_${tenantId.slice(0, 8)}_${Date.now()}`,
        notes: { tenantId, planId, userId: user.id },
      });
      orderId = order.id;
    } else {
      orderId = `order_dev_${crypto.randomBytes(12).toString("hex")}`;
    }

    const now = new Date();
    const periodEnd = addDays(now, 30);
    const amountInr = amount / 100;

    await this.prisma.invoice.create({
      data: {
        tenantId,
        invoiceNumber: `INV-${Date.now()}`,
        status: "DRAFT",
        amount: amountInr,
        tax: 0,
        total: amountInr,
        currency: "INR",
        periodStart: now,
        periodEnd,
        dueDate: addDays(now, 7),
        lineItems: [
          {
            description: `${PLAN_LABELS[planId]} Plan – Monthly`,
            amount: amountInr,
          },
        ],
        metadata: {
          razorpayOrderId: orderId,
          planId,
          userEmail: user.email,
          devMode,
        },
      },
    });

    return {
      id: orderId,
      amount,
      currency: "INR",
      keyId: this.config.get<string>("billing.razorpayKeyId") ?? "",
      devMode,
    };
  }

  async verifyPayment(
    tenantId: string,
    paymentId: string,
    orderId: string,
    signature: string,
    planId: string,
  ) {
    const plan = this.plans[planId];
    if (!plan) throw new BadRequestException("Invalid plan");

    const invoice = await this.prisma.invoice.findFirst({
      where: {
        tenantId,
        metadata: { path: ["razorpayOrderId"], equals: orderId },
      },
    });

    if (!invoice) throw new NotFoundException("Payment order not found");

    const metadata = invoice.metadata as { devMode?: boolean; planId?: string };
    const devMode = metadata?.devMode === true || orderId.startsWith("order_dev_");

    if (!devMode) {
      const secret = this.config.get<string>("billing.razorpayKeySecret");
      if (!secret) throw new BadRequestException("Razorpay is not configured");

      const expected = crypto
        .createHmac("sha256", secret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      if (expected !== signature) {
        throw new UnauthorizedException("Invalid payment signature");
      }
    }

    const now = new Date();
    const periodEnd = addDays(now, 30);

    await this.prisma.$transaction([
      this.prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: "PAID",
          paidAt: now,
          razorpayPaymentId: paymentId,
        },
      }),
      this.prisma.subscription.upsert({
        where: { tenantId },
        create: {
          tenantId,
          planId,
          status: "ACTIVE",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          monthlyMessages: plan.messages,
        },
        update: {
          planId,
          status: "ACTIVE",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          monthlyMessages: plan.messages,
          cancelAtPeriodEnd: false,
        },
      }),
      this.prisma.usageRecord.upsert({
        where: {
          tenantId_period: { tenantId, period: formatPeriod(now) },
        },
        create: {
          tenantId,
          period: formatPeriod(now),
          messages: 0,
          aiReplies: 0,
        },
        update: {},
      }),
    ]);

    return {
      success: true,
      planId,
      planName: PLAN_LABELS[planId],
      invoiceNumber: invoice.invoiceNumber,
    };
  }

  async listInvoices(tenantId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });
    return invoices.map((inv) => this.formatInvoice(inv));
  }

  async getUsageDetails(tenantId: string) {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });
    const plan = this.plans[subscription?.planId ?? "starter"] ?? this.plans.starter;

    const [messages, aiReplies, templateSends, manualReplies, bookings, orders, teamMembers, catalogItems] =
      await Promise.all([
        this.prisma.message.count({ where: { tenantId, createdAt: { gte: monthStart } } }),
        this.prisma.message.count({
          where: { tenantId, isAiGenerated: true, createdAt: { gte: monthStart } },
        }),
        this.prisma.message.count({
          where: { tenantId, type: "TEMPLATE", createdAt: { gte: monthStart } },
        }),
        this.prisma.message.count({
          where: {
            tenantId,
            isAiGenerated: false,
            sentByUserId: { not: null },
            createdAt: { gte: monthStart },
          },
        }),
        this.prisma.booking.count({ where: { tenantId, createdAt: { gte: monthStart } } }),
        this.prisma.order.count({ where: { tenantId, createdAt: { gte: monthStart } } }),
        this.prisma.user.count({ where: { tenantId, isActive: true } }),
        this.prisma.catalogItem.count({ where: { tenantId } }),
      ]);

    const limit = subscription?.monthlyMessages ?? plan.messages;

    return {
      items: [
        {
          label: "AI Messages",
          used: messages,
          total: limit,
          unit: "messages",
        },
        {
          label: "AI Auto-replies",
          used: aiReplies,
          total: limit,
          unit: "replies",
        },
        {
          label: "Template Sends",
          used: templateSends,
          total: null,
          unit: "sends",
        },
        {
          label: "Manual Replies",
          used: manualReplies,
          total: null,
          unit: "replies",
        },
        {
          label: "Team Members",
          used: teamMembers,
          total: plan.seats === -1 ? null : plan.seats,
          unit: "seats",
        },
        {
          label: "Catalog Items",
          used: catalogItems,
          total: 500,
          unit: "items",
        },
        { label: "Bookings", used: bookings, total: null, unit: "bookings" },
        { label: "Orders", used: orders, total: null, unit: "orders" },
      ],
      periodStart: monthStart.toISOString(),
      periodEnd: subscription?.currentPeriodEnd?.toISOString() ?? null,
    };
  }

  private formatInvoice(inv: {
    id: string;
    invoiceNumber: string;
    status: string;
    total: { toString(): string } | number;
    currency: string;
    periodStart: Date;
    periodEnd: Date;
    createdAt: Date;
    paidAt: Date | null;
  }) {
    return {
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      period: inv.periodStart.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      amount: Number(inv.total),
      currency: inv.currency,
      status: inv.status,
      date: inv.createdAt.toISOString(),
      paidAt: inv.paidAt?.toISOString() ?? null,
    };
  }
}
