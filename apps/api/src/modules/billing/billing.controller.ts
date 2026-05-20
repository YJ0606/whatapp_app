import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { User } from "@prisma/client";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { BillingService } from "./billing.service";
import { CheckoutDto } from "./dto/checkout.dto";
import { VerifyPaymentDto } from "./dto/verify-payment.dto";

@ApiTags("Billing")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("billing")
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Get()
  @ApiOperation({ summary: "Billing overview for current tenant" })
  overview(@CurrentUser() user: User) {
    return this.billing.getOverview(user.tenantId);
  }

  @Post("checkout")
  @ApiOperation({ summary: "Create Razorpay order for plan upgrade" })
  checkout(@CurrentUser() user: User, @Body() dto: CheckoutDto) {
    return this.billing.createCheckout(user.tenantId, user, dto.planId);
  }

  @Post("verify-payment")
  @ApiOperation({ summary: "Verify Razorpay payment and activate subscription" })
  verifyPayment(@CurrentUser() user: User, @Body() dto: VerifyPaymentDto) {
    return this.billing.verifyPayment(
      user.tenantId,
      dto.paymentId,
      dto.orderId,
      dto.signature,
      dto.planId,
    );
  }

  @Get("invoices")
  @ApiOperation({ summary: "List invoices for current tenant" })
  invoices(@CurrentUser() user: User) {
    return this.billing.listInvoices(user.tenantId);
  }

  @Get("usage")
  @ApiOperation({ summary: "Detailed usage for current billing period" })
  usage(@CurrentUser() user: User) {
    return this.billing.getUsageDetails(user.tenantId);
  }
}
