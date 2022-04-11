import { EntityRepository, Repository } from "typeorm";
import { DefectState } from "../models/DefectState.entity";

@EntityRepository(DefectState)
export class DefectStateRepository extends Repository<DefectState> {

}