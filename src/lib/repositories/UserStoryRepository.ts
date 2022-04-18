import { EntityRepository, Repository } from "typeorm";
import { UserStory } from "../models/UserStory.entity";

@EntityRepository(UserStory)
export class UserStoryRepository extends Repository<UserStory> {
}