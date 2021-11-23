import { EntityRepository, Repository } from "typeorm";
import { TestState } from "../models/TestState.entity";

@EntityRepository(TestState)
export  class TestStateRepository extends Repository<TestState> {

}