import { Entity, BaseEntity, Column, PrimaryGeneratedColumn , OneToMany , } from "typeorm";


//add the rest of the fields to the User entity
@Entity()
class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  full_name: string

  @Column({ unique: true })
  phone: string

  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @Column()
  score: number

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date
}

export default User