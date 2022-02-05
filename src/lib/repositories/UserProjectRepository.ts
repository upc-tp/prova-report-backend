import { EntityRepository, Repository } from "typeorm";
import { UserProject } from "../models/UserProject.entity";

@EntityRepository(UserProject)
export  class UserProjectRepository extends Repository<UserProject> {

}