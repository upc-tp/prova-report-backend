import {EntityRepository, Repository} from "typeorm";
import {Version} from "../models/Version.entity";

@EntityRepository(Version)
export class VersionsRepository extends Repository<Version> {

}
