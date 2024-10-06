import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TradeAddress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;
}