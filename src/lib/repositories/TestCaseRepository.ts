import { EntityRepository, Repository } from "typeorm";
import { TestCase } from "../models/TestCase.entity";

@EntityRepository(TestCase)
export class TestCaseRepository extends Repository<TestCase> {

}