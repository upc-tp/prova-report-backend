import { EntityRepository, Repository } from "typeorm";
import { UserStoryCriteria } from "../models/UserStoryCriteria.entity";

@EntityRepository(UserStoryCriteria)
export class UserStoryCriteriaRepository extends Repository<UserStoryCriteria> {
}