import { IsIn, IsString } from "class-validator";

export class VerifyPaymentDto {
  @IsString()
  paymentId: string;

  @IsString()
  orderId: string;

  @IsString()
  signature: string;

  @IsString()
  @IsIn(["starter", "growth", "pro"])
  planId: string;
}
