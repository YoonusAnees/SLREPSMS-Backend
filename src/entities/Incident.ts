import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
  Index,
} from "typeorm";

import { User } from "./User.js";
import type { Dispatch } from "./Dispatch.js";

export type IncidentStatus =
  | "NEW"
  | "UNDER_REVIEW"
  | "DISPATCHED"
  | "RESOLVED"
  | "CANCELLED";

export type IncidentType =
  | "ACCIDENT"
  | "BREAKDOWN"
  | "MEDICAL"
  | "FIRE"
  | "OTHER";

export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type PenaltySuggestionStatus =
  | "NONE"
  | "SUGGESTED"
  | "AUTO_ISSUED"
  | "APPROVED"
  | "REJECTED";

@Entity("incidents")
export class Incident {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "reported_by_user_id" })
  reportedBy!: User;

  @Column({ name: "type", type: "varchar", length: 20 })
  type!: IncidentType;

  @Column({ name: "severity", type: "varchar", length: 20 })
  severity!: IncidentSeverity;

  @Column({ name: "status", type: "varchar", length: 20, default: "NEW" })
  status!: IncidentStatus;

  @Column({ name: "description", type: "text", nullable: true })
  description?: string | null;

  @Index({ spatial: true })
  @Column({
    name: "location",
    type: "geography",
    spatialFeatureType: "Point",
    srid: 4326,
  })
  baseLocation!: { type: "Point"; coordinates: [number, number] };

  @Column({ name: "location_text", type: "varchar", length: 200, nullable: true })
  locationText?: string | null;

  @Column({ name: "evidence", type: "varchar", length: 500, nullable: true })
  evidence?: string | null;

  @Column({ name: "plate_no", type: "varchar", length: 20, nullable: true })
  plateNo?: string | null;

  @Column({
    name: "suspected_violation_code",
    type: "varchar",
    length: 50,
    nullable: true,
  })
  suspectedViolationCode?: string | null;

  @Column({
    name: "requires_officer_review",
    type: "boolean",
    default: false,
  })
  requiresOfficerReview!: boolean;

  @Column({
    name: "penalty_suggestion_status",
    type: "varchar",
    length: 20,
    default: "NONE",
  })
  penaltySuggestionStatus!: PenaltySuggestionStatus;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "reviewed_by_user_id" })
  reviewedBy?: User | null;

  @Column({ name: "reviewed_at", type: "timestamptz", nullable: true })
  reviewedAt?: Date | null;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "resolved_by_user_id" })
  resolvedBy?: User | null;

  @Column({ name: "resolved_at", type: "timestamptz", nullable: true })
  resolvedAt?: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @OneToMany("Dispatch", "incident")
  dispatches!: Dispatch[];
}