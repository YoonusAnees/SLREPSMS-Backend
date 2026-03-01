import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from "typeorm";
import { User } from "./User.js";
import { ViolationType } from "./ViolationType.js";
import { Vehicle } from "./Vehicle.js";

export type PenaltyStatus = "UNPAID" | "PAID" | "CANCELLED";

@Entity("penalties")
export class Penalty {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Vehicle, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "vehicle_id" })
  vehicle!: Vehicle;

  // keep driverUser for history/audit (optional but recommended)
  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "driver_user_id" })
  driverUser!: User;

  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "issued_by_user_id" })
  issuedBy!: User;

  @ManyToOne(() => ViolationType, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "violation_type_id" })
  violationType!: ViolationType;

  @Index()
  @Column({ name: "status", type: "varchar", length: 20, default: "UNPAID" })
  status!: PenaltyStatus;

  @Column({ name: "fine_lkr", type: "int" })
  fineLkr!: number;

  @Column({ name: "demerit_points", type: "int", default: 0 })
  demeritPoints!: number;

  @Column({ name: "occurred_at", type: "timestamptz" })
  occurredAt!: Date;

  @Column({ name: "location_text", type: "varchar", length: 200 })
  locationText!: string;

  @Column({ type: "text", nullable: true })
  notes?: string | null;
}