import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  OneToMany,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User.js";
import type { Dispatch } from "./Dispatch.js";

export type RescueTeamStatus = "AVAILABLE" | "BUSY" | "OFFLINE";

@Entity("rescue_teams")
export class RescueTeam {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // ✅ link to login account
  @OneToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Index({ unique: true })
  @Column({ name: "team_code", type: "varchar", length: 30 })
  teamCode!: string;

  @Column({ name: "name", type: "varchar", length: 80 })
  name!: string;

  @Column({ name: "phone", type: "varchar", length: 20, nullable: true })
  phone?: string;

  @Column({ name: "status", type: "varchar", length: 20, default: "AVAILABLE" })
  status!: RescueTeamStatus;

  @Index({ spatial: true })
  @Column({
    name: "base_location",
    type: "geography",
    spatialFeatureType: "Point",
    srid: 4326,
  })
  baseLocation!: string; // POINT(lng lat)

  @Column({ name: "base_location_text", type: "varchar", length: 200, nullable: true })
  baseLocationText?: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  // ✅ ESM-safe: avoid importing Dispatch runtime
  @OneToMany("Dispatch", "rescueTeam")
  dispatches!: Dispatch[];
}