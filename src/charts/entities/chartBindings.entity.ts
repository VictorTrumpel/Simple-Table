import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ChartEntity } from './chart.entity';
import { Table } from 'src/tables/entities/table.entity';

@Entity({ name: 'chart_bindings' })
export class ChartBindingsEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'bigint', name: 'chart_id' })
  chartId!: number;

  @Column({ type: 'text', name: 'table_id' })
  tableId!: string;

  @Column({ type: 'text', name: 'column_id' })
  columnId!: string;

  @Column({ type: 'text', name: 'binding_key' })
  bindingKey!: string;

  @ManyToOne(() => ChartEntity, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chart_id' })
  chart!: ChartEntity;

  @ManyToOne(() => Table, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'table_id' })
  table!: Table;
}
