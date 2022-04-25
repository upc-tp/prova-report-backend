import { EntityRepository, Repository } from "typeorm";
import { TestPlan } from "../models/TestPlan.entity";

@EntityRepository(TestPlan)
export  class TestPlanRepository extends Repository<TestPlan> {

}