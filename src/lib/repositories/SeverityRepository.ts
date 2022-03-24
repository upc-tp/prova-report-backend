import { EntityRepository, Repository } from "typeorm";
import { Severity } from "../models/Severity.entity";

@EntityRepository(Severity)
export  class SeverityRepository extends Repository<Severity> {

}