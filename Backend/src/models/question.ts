import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import Quiz from "./quiz";


@Entity()
class Question extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  question_text: string;

  @Column()
  option1: string;

  @Column()
  option2: string;

  @Column()
  option3: string;

  @Column()
  option4: string;

  @Column({ type: "int" })
  correct_option: number;

  @Column({ type: "int" })
  question_number: number;

  @ManyToOne(() => Quiz, (quiz) => quiz.id, { onDelete: "CASCADE" })
  @JoinColumn({ name: "quizId" })
  quiz: Quiz;

  @Column()
  quizId: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt: Date;

}

export default Question;
