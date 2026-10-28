import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text', unique: true })
  email!: string;

  @Column({
    name: 'password_hash',
    type: 'text',
    select: false,
  })
  passwordHash!: string;

  @Column({
    name: 'google_sub',
    type: 'text',
    select: false,
  })
  googleSub!: string;

  @Column({
    name: 'yandex_id',
    type: 'text',
    nullable: true,
    unique: true,
    select: false,
  })
  yandexId!: string | null;

  @Column({
    name: 'github_token',
    type: 'text',
    nullable: true,
    unique: true,
    select: false,
  })
  githubToken!: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;
}
