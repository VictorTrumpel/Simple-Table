import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'charts' })
export class ChartEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'jsonb' })
  config!: Record<string, unknown>;
}
