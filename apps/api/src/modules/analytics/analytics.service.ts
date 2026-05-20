import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { startOfDay, addDays } from "../../common/utils/date.util";

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getReport(tenantId: string) {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const now = new Date();

    const [
      totalMessages,
      monthMessages,
      aiMessages,
      conversations,
      resolvedConversations,
      handoffs,
      bookings,
      orders,
    ] = await Promise.all([
      this.prisma.message.count({ where: { tenantId } }),
      this.prisma.message.count({ where: { tenantId, createdAt: { gte: monthStart } } }),
      this.prisma.message.count({
        where: { tenantId, isAiGenerated: true, createdAt: { gte: monthStart } },
      }),
      this.prisma.conversation.count({ where: { tenantId } }),
      this.prisma.conversation.count({
        where: { tenantId, resolvedAt: { gte: monthStart } },
      }),
      this.prisma.conversation.count({
        where: { tenantId, status: "HUMAN_HANDOFF" },
      }),
      this.prisma.booking.count({ where: { tenantId, createdAt: { gte: monthStart } } }),
      this.prisma.order.count({ where: { tenantId, createdAt: { gte: monthStart } } }),
    ]);

    const resolutionRate =
      monthMessages > 0 ? Math.round((aiMessages / monthMessages) * 1000) / 10 : 0;

    const weeklyVolume = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const dayStart = addDays(startOfDay(now), -i);
      const dayEnd = addDays(dayStart, 1);
      const [messages, resolved] = await Promise.all([
        this.prisma.message.count({
          where: { tenantId, createdAt: { gte: dayStart, lt: dayEnd } },
        }),
        this.prisma.conversation.count({
          where: { tenantId, resolvedAt: { gte: dayStart, lt: dayEnd } },
        }),
      ]);
      weeklyVolume.push({
        day: dayNames[dayStart.getDay()],
        messages,
        resolved,
        bookings: await this.prisma.booking.count({
          where: { tenantId, createdAt: { gte: dayStart, lt: dayEnd } },
        }),
        orders: await this.prisma.order.count({
          where: { tenantId, createdAt: { gte: dayStart, lt: dayEnd } },
        }),
      });
    }

    return {
      totalMessages,
      monthMessages,
      aiResolutionRate: resolutionRate,
      conversations,
      resolvedConversations,
      humanHandoffs: handoffs,
      bookings,
      orders,
      weeklyVolume,
      breakdown: [
        { label: "AI auto-replies", count: aiMessages, pct: resolutionRate },
        {
          label: "Human handoffs",
          count: handoffs,
          pct: conversations > 0 ? Math.round((handoffs / conversations) * 100) : 0,
        },
        { label: "Bookings this month", count: bookings, pct: 0 },
        { label: "Orders this month", count: orders, pct: 0 },
      ],
    };
  }
}
