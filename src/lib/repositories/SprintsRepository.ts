import {EntityRepository, Repository} from "typeorm";
import {Sprint} from "../models/Sprint.entity";

@EntityRepository(Sprint)
export class SprintsRepository extends Repository<Sprint> {

}
