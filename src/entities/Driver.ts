import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, Index } from "typeorm";
import { User } from "./User.js";

export enum LicenseStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED"
}
@Entity("drivers")
export class Driver {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @OneToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Index({ unique: true })
  @Column({ name: "license_no", length: 30 ,  type: "varchar",
})
  licenseNo!: string;
  @Column({ name: "current_points", type: "int", default: 5 })
  currentPoints!: number;
  @Column({
  type: "enum",
  enum: LicenseStatus,
  default: LicenseStatus.ACTIVE
})
licenseStatus!: LicenseStatus;

  @Column({ name: "suspended_until", type: "timestamptz", nullable: true })
  suspendedUntil?: Date | null;
}