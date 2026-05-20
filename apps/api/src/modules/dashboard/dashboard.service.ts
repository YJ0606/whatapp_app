import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { startOfDay, addDays } from "../../common/utils/date.util";
import type { User } from "@prisma/client";

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getMetrics(tenantId: string, user: User) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      tenant,
      subscription,
      totalMessages,
      activeConversations,
      bookings,
      orders,
      aiMessages,
      handoffs,
      topFAQs,
    ] = await Promise.all([
      this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { name: true, slug: true },
      }),
      this.prisma.subscription.findUnique({ where: { tenantId } }),
      this.prisma.message.count({ where: { tenantId, createdAt: { gte: monthStart } } }),
      this.prisma.conversation.count({
        where: { tenantId, status: { in: ["OPEN", "ASSIGNED", "HUMAN_HANDOFF"] } },
      }),
      this.prisma.booking.count({ where: { tenantId, createdAt: { gte: monthStart } } }),
      this.prisma.order.count({ where: { tenantId, createdAt: { gte: monthStart } } }),
      this.prisma.message.count({
        where: { tenantId, isAiGenerated: true, createdAt: { gte: monthStart } },
      }),
      this.prisma.conversation.count({ where: { tenantId, status: "HUMAN_HANDOFF" } }),
      this.prisma.fAQ.findMany({
        where: { tenantId, isActive: true },
        orderBy: { hitCount: "desc" },
        take: 5,
      }),
    ]);

    const resolutionRate = totalMessages > 0 ? Math.round((aiMessages / totalMessages) * 100) : 0;

    const [weeklyVolume, recentActivity, usage, avgResponseTimeMs] = await Promise.all([
      this.getWeeklyVolume(tenantId, now),
      this.getRecentActivity(tenantId),
      this.getUsage(tenantId, monthStart, subscription),
      this.getAvgResponseTime(tenantId, monthStart),
    ]);

    return {
      account: {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId,
        tenantName: tenant?.name ?? "Your Business",
        tenantSlug: tenant?.slug ?? "",
      },
      messagesHandled: totalMessages,
      activeConversations,
      bookings,
      orders,
      aiResolutionRate: resolutionRate,
      humanHandoffs: handoffs,
      avgResponseTimeMs,
      topFAQs: topFAQs.map((f) => ({ question: f.question, hits: f.hitCount })),
      weeklyVolume,
      recentActivity,
      usage,
      refreshedAt: now.toISOString(),
    };
  }

  private async getWeeklyVolume(tenantId: string, now: Date) {
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
      const end = i === 0 ? addDays(startOfDay(now), 1) : addDays(startOfDay(now), -7 * i);
      const start = addDays(end, -7);
      const [messages, bookings, orders, resolved] = await Promise.all([
        this.prisma.message.count({
          where: { tenantId, createdAt: { gte: start, lt: end } },
        }),
        this.prisma.booking.count({
          where: { tenantId, createdAt: { gte: start, lt: end } },
        }),
        this.prisma.order.count({
          where: { tenantId, createdAt: { gte: start, lt: end } },
        }),
        this.prisma.conversation.count({
          where: { tenantId, resolvedAt: { gte: start, lt: end } },
        }),
      ]);
      weeks.push({
        name: `Week ${4 - i}`,
        date: start.toISOString().slice(0, 10),
        messages,
        bookings,
        orders,
        resolved,
      });
    }
    return weeks;
  }

  private async getRecentActivity(tenantId: string) {
    const [messages, bookings, orders, handoffs] = await Promise.all([
      this.prisma.message.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 12,
        include: {
          conversation: { include: { customer: true } },
          sentByUser: { select: { firstName: true, lastName: true } },
        },
      }),
      this.prisma.booking.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { customer: true },
      }),
      this.prisma.order.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { customer: true },
      }),
      this.prisma.conversation.findMany({
        where: { tenantId, status: "HUMAN_HANDOFF" },
        orderBy: { updatedAt: "desc" },
        take: 4,
        include: { customer: true, assignedUser: true },
      }),
    ]);

    type Activity = {
      id: string;
      type: "message" | "booking" | "order" | "handoff";
      text: string;
      createdAt: string;
    };

    const items: Activity[] = [];

    for (const m of messages) {
      const customerName =
        m.conversation.customer.name ?? m.conversation.customer.phone ?? "Customer";
      if (m.isAiGenerated) {
        items.push({
          id: `msg-${m.id}`,
          type: "message",
          text: `AI handled message from ${customerName}`,
          createdAt: m.createdAt.toISOString(),
        });
      } else if (m.sentByUser) {
        items.push({
          id: `msg-${m.id}`,
          type: "message",
          text: `${m.sentByUser.firstName} replied to ${customerName}`,
          createdAt: m.createdAt.toISOString(),
        });
      }
    }

    for (const b of bookings) {
      const customerName = b.customer.name ?? b.customer.phone ?? "Customer";
      items.push({
        id: `booking-${b.id}`,
        type: "booking",
        text: `New booking: ${customerName} – ${b.serviceName}`,
        createdAt: b.createdAt.toISOString(),
      });
    }

    for (const o of orders) {
      const customerName = o.customer.name ?? o.customer.phone ?? "Customer";
      items.push({
        id: `order-${o.id}`,
        type: "order",
        text: `Order from ${customerName} – ${o.currency} ${Number(o.totalAmount).toLocaleString()}`,
        createdAt: o.createdAt.toISOString(),
      });
    }

    for (const c of handoffs) {
      const customerName = c.customer.name ?? c.customer.phone ?? "Customer";
      const agent = c.assignedUser
        ? `${c.assignedUser.firstName} ${c.assignedUser.lastName}`
        : "an agent";
      items.push({
        id: `handoff-${c.id}`,
        type: "handoff",
        text: `Conversation with ${customerName} assigned to ${agent}`,
        createdAt: c.updatedAt.toISOString(),
      });
    }

    return items
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 12);
  }

  private async getUsage(
    tenantId: string,
    monthStart: Date,
    subscription: { monthlyMessages: number; currentPeriodEnd: Date } | null,
  ) {
    const limit = subscription?.monthlyMessages ?? 2500;
    const [used, aiMessages, templateSends, manualReplies] = await Promise.all([
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
    ]);

    const periodEnd = subscription?.currentPeriodEnd ?? addDays(monthStart, 30);
    const resetsInDays = Math.max(
      0,
      Math.ceil((periodEnd.getTime() - Date.now()) / 86400000),
    );

    return { used, limit, aiMessages, templateSends, manualReplies, resetsInDays };
  }

  private async getAvgResponseTime(tenantId: string, since: Date): Promise<number> {
    const inbound = await this.prisma.message.findMany({
      where: { tenantId, direction: "INBOUND", createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 40,
      select: { conversationId: true, createdAt: true },
    });

    let total = 0;
    let count = 0;

    for (const inMsg of inbound) {
      const reply = await this.prisma.message.findFirst({
        where: {
          conversationId: inMsg.conversationId,
          direction: "OUTBOUND",
          isAiGenerated: true,
          createdAt: { gt: inMsg.createdAt },
        },
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      });
      if (reply) {
        total += reply.createdAt.getTime() - inMsg.createdAt.getTime();
        count++;
      }
    }

    return count > 0 ? Math.round(total / count) : 0;
  }
}
