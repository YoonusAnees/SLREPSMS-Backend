import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from "typeorm";

import type { Incident } from "./Incident.js";
import type { RescueTeam } from "./RescueTeam.js";
import { User } from "./User.js"; // keep real import (no cycle)

export type DispatchStatus =
  | "ASSIGNED"
  | "EN_ROUTE"
  | "ON_SCENE"
  | "COMPLETED"
  | "CANCELLED";

@Entity("dispatches")
@Index(["incident", "rescueTeam"], { unique: true })
export class Dispatch {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // ✅ string target prevents ESM circular TDZ
  @ManyToOne("Incident", { onDelete: "CASCADE" })
  @JoinColumn({ name: "incident_id" })
  incident!: Incident;

  @ManyToOne("RescueTeam", { onDelete: "RESTRICT" })
  @JoinColumn({ name: "rescue_team_id" })
  rescueTeam!: RescueTeam;

  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "dispatched_by_user_id" })
  dispatchedBy!: User;

  @Column({ name: "status", type: "varchar", length: 20, default: "ASSIGNED" })
  status!: DispatchStatus;

  @Column({ name: "notes", type: "text", nullable: true })
  notes?: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}