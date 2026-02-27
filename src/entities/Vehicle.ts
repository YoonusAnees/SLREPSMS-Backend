import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index
} from "typeorm";
import { Driver } from "./Driver.js";

@Entity("vehicles")
export class Vehicle {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ name: "plate_no", type: "varchar", length: 20 })
  plateNo!: string;

  @Column({ type: "varchar", length: 50 })
  type!: string; // Car, Bike, Bus, Lorry, etc.

  @ManyToOne(() => Driver, { onDelete: "CASCADE" })
  @JoinColumn({ name: "driver_id" })
  driver!: Driver;
}