
import AppDataSource from "../config/data-source.js";
import { Payment } from "../entities/Payment.js";
import PDFDocument from "pdfkit";

/**
 * Loads payment + all needed relations for receipt.
 * Security:
 *  - Only the DRIVER who paid can access the receipt (paidBy_user_id)
 *  - Only SUCCESS payments can generate receipts
 */
export async function getReceiptPayment(driverUserId: string, paymentId: string) {
  const repo = AppDataSource.getRepository(Payment);

  const payment = await repo.findOne({
    where: {
      id: paymentId,
      paidBy: { id: driverUserId }, // ✅ only owner can download
    } as any,
    relations: {
      paidBy: true,
      penalty: {
        driverUser: true,
        issuedBy: true,      // ✅ officer details
        violationType: true,
        vehicle: true,
      },
    } as any,
  });

  if (!payment) {
    throw Object.assign(new Error("Receipt not found"), { status: 404 });
  }

  if (payment.status !== "SUCCESS") {
    throw Object.assign(new Error("Receipt available only for SUCCESS payments"), { status: 409 });
  }

  return payment;
}
function safe(v: any) {
  return v === null || v === undefined || v === "" ? "-" : String(v);
}

function moneyLkr(n: any) {
  const x = Number(n || 0);
  return x.toLocaleString("en-LK");
}

export async function buildReceiptPdf(payment: {
  receiptNo: string;
  id: string;
  status: string;
  amountLkr: number;
  method: string;
  gateway: string;
  gatewayRef?: string | null;
  paidAt: Date; // your current entity field
  paidBy: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    nic?: string | null;
  };
  penalty: {
    id: string;
    occurredAt: Date;
    locationText: string;
    notes?: string | null;
    issuedBy: { name: string; email: string };
    violationType: { code: string; title: string };
    vehicle: { plateNo: string; model?: string | null; color?: string | null; year?: number | null };
  };
}) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

  // --- HEADER ---
  doc.fontSize(16).text("Sri Lanka Road E-Penalty & Safety Management System (SLREPSMS)", { align: "center" });
  doc.moveDown(0.2);
  doc.fontSize(12).text("Official Payment Receipt (Prototype)", { align: "center" });
  doc.moveDown(1);

  // --- RECEIPT SUMMARY ---
  doc.fontSize(11);
  doc.text(`Receipt No: ${safe(payment.receiptNo)}`);
  doc.text(`Payment ID: ${safe(payment.id)}`);
  doc.text(`Penalty ID: ${safe(payment.penalty.id)}`);
  doc.text(`Paid At: ${new Date(payment.paidAt).toLocaleString()}`);
  doc.moveDown(0.4);

  doc.fontSize(13).text(`Amount Paid (LKR): ${moneyLkr(payment.amountLkr)}`);
  doc.moveDown(0.5);

  doc.fontSize(11);
  doc.text(`Method: ${safe(payment.method)}`);
  doc.text(`Gateway: ${safe(payment.gateway)}`);
  doc.text(`Gateway Ref: ${safe(payment.gatewayRef)}`);
  doc.moveDown(1);

  // --- DRIVER ---
  doc.fontSize(12).text("Driver (Payer)", { underline: true });
  doc.fontSize(11).text(`Name: ${safe(payment.paidBy.name)}`);
  doc.text(`Email: ${safe(payment.paidBy.email)}`);
  doc.text(`Phone: ${safe(payment.paidBy.phone)}`);
  doc.text(`NIC: ${safe(payment.paidBy.nic)}`);
  doc.moveDown(0.8);

  // --- OFFICER ---
  doc.fontSize(12).text("Issuing Officer", { underline: true });
  doc.fontSize(11).text(`Name: ${safe(payment.penalty.issuedBy?.name)}`);
  doc.text(`Email: ${safe(payment.penalty.issuedBy?.email)}`);
  doc.moveDown(0.8);

  // --- VIOLATION DETAILS ---
  doc.fontSize(12).text("Violation Details", { underline: true });
  doc.fontSize(11).text(`Code: ${safe(payment.penalty.violationType?.code)}`);
  doc.text(`Title: ${safe(payment.penalty.violationType?.title)}`);
  doc.text(`Occurred At: ${new Date(payment.penalty.occurredAt).toLocaleString()}`);
  doc.text(`Location: ${safe(payment.penalty.locationText)}`);
  doc.text(`Notes: ${safe(payment.penalty.notes)}`);
  doc.moveDown(0.8);

  // --- VEHICLE ---
  doc.fontSize(12).text("Vehicle Details", { underline: true });
  doc.fontSize(11).text(`Plate No: ${safe(payment.penalty.vehicle?.plateNo)}`);
  doc.text(`Model: ${safe(payment.penalty.vehicle?.model)}`);
  doc.text(`Color: ${safe(payment.penalty.vehicle?.color)}`);
  doc.text(`Year: ${safe(payment.penalty.vehicle?.year)}`);
  doc.moveDown(1);

  // --- FOOTER ---
  doc.fontSize(9).fillColor("gray").text(
    "Note: This receipt is generated for academic demonstration purposes. Production deployment must comply with Sri Lanka government payment and audit requirements.",
    { align: "left" },
  );

  doc.end();
  return done;
}