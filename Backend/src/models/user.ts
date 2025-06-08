import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import Quiz from "./quiz";
import UserQuizScore from "./UserQuizScore";

@Entity()
class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number; 

  @Column()
  full_name: string;

  @Column({ unique: true })
  phone: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  score: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // DELETE EN CASCADE
  @OneToMany(() => Quiz, (quiz) => quiz.createdBy, { onDelete: "CASCADE" })
  quizzes: Quiz[];

  @OneToMany(() => UserQuizScore, (score) => score.user, { onDelete: "CASCADE" })
  userQuizScores: UserQuizScore[];
}

export default User;
