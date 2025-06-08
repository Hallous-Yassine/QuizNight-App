import {
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Unique,
  } from "typeorm";
  import User from "./user";
  import Quiz from "./quiz";
  
  @Entity()
  @Unique(["user", "quiz"])  // One entry per user per quiz
  class UserQuizScore extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user: User;
  
    @Column()
    userId: number;
  
    @ManyToOne(() => Quiz, { onDelete: "CASCADE" })
    @JoinColumn({ name: "quizId" })
    quiz: Quiz;
  
    @Column()
    quizId: number;
  
    @Column({ type: "int", default: 0 })
    bestScore: number;
  }
  
  export default UserQuizScore;
  