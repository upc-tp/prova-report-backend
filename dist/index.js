"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require('dotenv').config();
//#region Dependencies
const morgan = require("morgan");
const cors = require("cors");
const express = require("express");
//#endregion
const PORT = process.env.PORT || 3000;
const app = express();
//#region Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(morgan('tiny'));
//#endregion
const projectsRouter = require('./routes/ProjectRouter');
const testStatesRouter = require('./routes/TestStateRouter');
const testSuiteRouter = require('./routes/TestSuiteRouter');
app.use('/api/projects', projectsRouter);
app.use('/api/test-states', testStatesRouter);
app.use('/api/test-suites', testSuiteRouter);
app.listen(PORT, () => {
    console.log(`Prove Report backend listening at port: ${PORT}`);
});
//# sourceMappingURL=index.js.map