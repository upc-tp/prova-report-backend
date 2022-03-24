import { EntityRepository, Repository } from "typeorm";
import { Priority } from "../models/Priority.entity";

@EntityRepository(Priority)
export  class PriorityRepository extends Repository<Priority> {

}