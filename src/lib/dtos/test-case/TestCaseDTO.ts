import { Priority } from "../../models/Priority.entity";
import { Severity } from "../../models/Severity.entity";
import { TestState } from "../../models/TestState.entity";
import { TestSuite } from "../../models/TestSuite.entity";
import { CollaboratorDTO } from "../CollaboratorDTO";

export class TestCaseDTO {
	createdAt: string;
	createdBy: string;
	modifiedAt: string;
	modifiedBy: string;
  	severity: Severity;
  	priority: Priority;
	userInCharge: CollaboratorDTO;
	deletedAt?: any;
	deletedBy?: any;
    id: number;
    title: string;
    description: string;
	lastExecution: number;
    testState: TestState;
    testSuite: TestSuite;
}