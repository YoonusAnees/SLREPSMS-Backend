import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm";

export type UserRole = "DRIVER" | "OFFICER" | "ADMIN" | "DISPATCHER" | "RESCUE";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 120 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 255 })
  email!: string;

  @Column({ type: "enum", enum: ["DRIVER", "OFFICER", "ADMIN", "DISPATCHER", "RESCUE"] })
  role!: UserRole;

  @Column({ name: "password_hash", type: "text" })
  passwordHash!: string;

  @Column({ type: "varchar", length: 30, nullable: true })
  phone?: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  nic?: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
