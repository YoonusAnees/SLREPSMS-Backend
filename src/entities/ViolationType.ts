import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany } from "typeorm";
import type { Penalty } from "./Penalty.js";

@Entity("violation_types")
export class ViolationType {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 50 })
  code!: string;

  @Column({ type: "varchar", length: 120 })
  title!: string;

  @Column({ name: "base_fine_lkr", type: "int" })
  baseFineLkr!: number;

  @Column({ name: "demerit_points", type: "int", default: 0 })
  demeritPoints!: number;

  @Column({ type: "text", nullable: true })
  description?: string | null;

  // ✅ Break circular import: use string target + type-only import
  @OneToMany("Penalty", "violationType")
  penalties!: Penalty[];
}