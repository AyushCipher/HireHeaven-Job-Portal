import { describe, expect, it } from "vitest";
import { paymentVerificationSchema } from "./validators.js";

describe("payment validators", () => {
  it("accepts a fully populated verification payload", () => {
    const result = paymentVerificationSchema.safeParse({
      razorpay_order_id: "order_1",
      razorpay_payment_id: "pay_1",
      razorpay_signature: "sig_1",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a payload missing the signature", () => {
    const result = paymentVerificationSchema.safeParse({
      razorpay_order_id: "order_1",
      razorpay_payment_id: "pay_1",
    });

    expect(result.success).toBe(false);
  });

  it("rejects empty string fields", () => {
    const result = paymentVerificationSchema.safeParse({
      razorpay_order_id: "",
      razorpay_payment_id: "pay_1",
      razorpay_signature: "sig_1",
    });

    expect(result.success).toBe(false);
  });
});
