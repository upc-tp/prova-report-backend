import { EntityRepository, Repository } from "typeorm";
import { TestExecution } from "../models/TestExecution.entity";

@EntityRepository(TestExecution)
export class TestExecutionRepository extends Repository<TestExecution> {

}