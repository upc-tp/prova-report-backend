import { EntityRepository, Repository } from "typeorm";
import { TestSuite } from "../models/TestSuite.entity";

@EntityRepository(TestSuite)
export  class TestSuiteRepository extends Repository<TestSuite> {

}