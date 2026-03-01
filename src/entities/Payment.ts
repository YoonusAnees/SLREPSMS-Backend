import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
} from "typeorm";
import { Penalty } from "./Penalty.js";
import { User } from "./User.js";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // one penalty -> max one successful payment
  @OneToOne(() => Penalty, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "penalty_id" })
  penalty!: Penalty;

  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "paid_by_user_id" })
  paidBy!: User;

  @Index({ unique: true })
  @Column({ name: "receipt_no", type: "varchar", length: 40 })
  receiptNo!: string;

  @Column({ name: "amount_lkr", type: "int" })
  amountLkr!: number;

  @Column({ name: "method", type: "varchar", length: 30 })
  method!: string; // CARD, CASH, LANKAQR, STRIPE_TEST, etc.

  @Column({ name: "gateway", type: "varchar", length: 30, default: "SIMULATED" })
  gateway!: string;

  @Column({ name: "gateway_ref", type: "varchar", length: 80, nullable: true })
  gatewayRef?: string | null;

  @Column({ name: "status", type: "varchar", length: 20, default: "PENDING" })
  status!: PaymentStatus;

  // prevents double charge retries
  @Index({ unique: true })
  @Column({ name: "idempotency_key", type: "varchar", length: 80 })
  idempotencyKey!: string;

  @CreateDateColumn({ name: "paid_at", type: "timestamptz" })
  paidAt!: Date;
}