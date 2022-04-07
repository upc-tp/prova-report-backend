import { EntityRepository, Repository } from "typeorm";
import { TestExecutionStep } from "../models/TestExecutionStep.entity";

@EntityRepository(TestExecutionStep)
export class TestExecutionStepRepository extends Repository<TestExecutionStep> {

}