import { EntityRepository, Repository } from "typeorm";
import { Defect } from "../models/Defects.entity";

@EntityRepository(Defect)
export class DefectRepository extends Repository<Defect> {

}