import "reflect-metadata";
require('dotenv').config();

//#region Dependencies

import morgan = require('morgan');
import cors = require('cors');
import express = require('express');
import { errorHandler } from "./lib/middlewares/error-handler";
import { authenticateJWT } from "./lib/middlewares/authenticate";

//#endregion

const PORT = process.env.PORT || 3000;
const app = express();

//#region Middleware

app.use(express.raw({
    type: [
        'application/xml',
        'text/plain'
    ]
}))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(morgan('tiny'));
//#endregion

const authRouter = require('./routes/AuthRouter');
const projectsRouter = require('./routes/ProjectRouter');
const testStatesRouter = require('./routes/TestStateRouter');
const testSuiteRouter = require('./routes/TestSuiteRouter');
const testCaseRouter = require('./routes/TestCaseRouter');
const priorityRouter = require('./routes/PriorityRouter');
const severityRouter = require('./routes/SeverityRouter');
const sprintRouter = require('./routes/SprintRouter');
const testExecutionRouter = require('./routes/TestExecutionRouter');
const dashboardRouter = require('./routes/DashboardRouter');

app.use('/api', authRouter);

app.use('/api/projects', authenticateJWT, projectsRouter);

app.use('/api/test-states', authenticateJWT, testStatesRouter);

app.use('/api/test-suites', authenticateJWT, testSuiteRouter);

app.use('/api/test-cases', authenticateJWT, testCaseRouter);

app.use('/api/test-executions', authenticateJWT, testExecutionRouter);

app.use('/api/priorities', authenticateJWT, priorityRouter);

app.use('/api/severities', authenticateJWT, severityRouter);

app.use('/api/sprints', authenticateJWT, sprintRouter);

app.use('/api/dashboard', authenticateJWT, dashboardRouter);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Prove Report backend listening at port: ${PORT}`);
});
