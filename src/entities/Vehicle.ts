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
import { User } from "./User.js";

@Entity("vehicles")
export class Vehicle {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ name: "plate_no", type: "varchar", length: 20 })
  plateNo!: string;

  @Column({ type: "varchar", length: 50 })
  type!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  model?: string | null;

  @Column({ type: "varchar", length: 30, nullable: true })
  color?: string | null;

  @Column({ type: "int", nullable: true })
  year?: number | null;

  @Column({ name: "insurance_expiry", type: "date", nullable: true })
  insuranceExpiry?: string | null;

  @Column({ name: "ownership_verified", type: "boolean", default: false })
  ownershipVerified!: boolean;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "verified_by_user_id" })
  verifiedBy?: User | null;

  @Column({ name: "verified_at", type: "timestamptz", nullable: true })
  verifiedAt?: Date | null;

  @ManyToOne(() => Driver, { onDelete: "CASCADE" })
  @JoinColumn({ name: "driver_id" })
  driver!: Driver;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}