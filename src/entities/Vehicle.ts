import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Driver } from "./Driver.js";

@Entity("vehicles")
export class Vehicle {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // store normalized plate (UPPERCASE/TRIM, remove spaces/dashes)
  @Index({ unique: true })
  @Column({ name: "plate_no", type: "varchar", length: 20 })
  plateNo!: string;

  @Column({ type: "varchar", length: 50 })
  type!: string; // Car, Bike, Bus, etc.

  @Column({ type: "varchar", length: 50, nullable: true })
  model?: string | null;

  @Column({ type: "varchar", length: 30, nullable: true })
  color?: string | null;

  @Column({ type: "int", nullable: true })
  year?: number | null;

  @Column({ name: "insurance_expiry", type: "date", nullable: true })
  insuranceExpiry?: string | null; // YYYY-MM-DD

  // ownership verification (simple v1)
  @Column({ name: "ownership_verified", type: "boolean", default: false })
  ownershipVerified!: boolean;

  @ManyToOne(() => Driver, { onDelete: "CASCADE" })
  @JoinColumn({ name: "driver_id" })
  driver!: Driver;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}