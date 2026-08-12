import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'users_databases' })
export class UsersDatabases {
  @PrimaryColumn({ name: 'user_id', type: 'integer' })
  userId!: number;

  @PrimaryColumn({ name: 'database_id', type: 'integer' })
  databaseId!: number;

  @Column({ name: 'role' })
  role!: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
  })
  deletedAt: Date | null = null;
}
