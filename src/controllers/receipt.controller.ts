import { Request, Response } from "express";
import { z } from "zod";
import { getReceiptPayment } from "../services/receipt.service.js";
import { buildReceiptPdf } from "../services/receipt.service.js";

export async function downloadReceiptPdf(req: Request, res: Response) {
  try {
    const userId = (req as any).user.sub;

    const { paymentId } = z
      .object({ paymentId: z.string().uuid() })
      .parse(req.params);

    const payment = await getReceiptPayment(userId, paymentId);

    const pdf = await buildReceiptPdf(payment as any);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="SLREPSMS_Receipt_${payment.receiptNo}.pdf"`,
    );

    res.send(pdf);
  } catch (err: any) {
    console.error("downloadReceiptPdf:", err);
    res.status(err?.status || 500).json({
      message: err?.message || "Internal Server Error",
    });
  }
}