import { IsIn, IsString } from "class-validator";

export class CheckoutDto {
  @IsString()
  @IsIn(["starter", "growth", "pro"])
  planId: string;
}
