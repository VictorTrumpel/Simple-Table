import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm';

type ColumnType = 'text' | 'numeric' | 'enum' | 'timestamp';

@Entity({ name: 'tables' })
export class Table {
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ name: 'database_id', type: 'integer' })
  databaseId!: number;

  @Column({ name: 'columns', type: 'jsonb' })
  columns: { id: string; name: string; type: ColumnType }[] = [];

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
  })
  deletedAt!: Date | null;
}
