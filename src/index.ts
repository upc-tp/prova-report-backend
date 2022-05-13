import "reflect-metadata";
require('dotenv').config();

global.__basedir = __dirname;

//#region Dependencies

import morgan = require('morgan');
import cors = require('cors');
import express = require('express');
import fileUpload = require('express-fileupload');
import { errorHandler } from "./lib/middlewares/error-handler";
import { authenticateJWT } from "./lib/middlewares/authenticate";

//#endregion

const PORT = process.env.PORT || 3000;
const app = express();

//#region Middleware

// enable files upload
app.use(fileUpload({
    createParentPath: true,
    debug: true,
    limits: { 
        fileSize: 3 * 1024 * 1024 * 1024 //3MB max file(s) size
    },
}));

app.use(express.raw({
    type: [
        'application/xml',
        'text/plain'
    ]
}))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(morgan('dev'));

//#endregion

const authRouter = require('./routes/AuthRouter');
const projectsRouter = require('./routes/ProjectRouter');
const testStatesRouter = require('./routes/TestStateRouter');
const testSuiteRouter = require('./routes/TestSuiteRouter');
const testPlanRouter = require('./routes/TestPlanRouter');
const testCaseRouter = require('./routes/TestCaseRouter');
const priorityRouter = require('./routes/PriorityRouter');
const severityRouter = require('./routes/SeverityRouter');
const defectStatesRouter = require('./routes/DefectStateRouter');
const defectRouter = require('./routes/DefectRouter');
const versionRouter = require('./routes/VersionRouter');
const testExecutionRouter = require('./routes/TestExecutionRouter');
const dashboardRouter = require('./routes/DashboardRouter');
const userStoryRouter = require('./routes/UserStoryRouter');

app.use(express.static('uploads'));

app.use('/api', authRouter);

app.use('/api/projects', authenticateJWT, projectsRouter);

app.use('/api/test-states', authenticateJWT, testStatesRouter);

app.use('/api/test-suites', authenticateJWT, testSuiteRouter);

app.use('/api/test-plans', authenticateJWT, testPlanRouter);

app.use('/api/test-cases', authenticateJWT, testCaseRouter);

app.use('/api/test-executions', authenticateJWT, testExecutionRouter);

app.use('/api/priorities', authenticateJWT, priorityRouter);

app.use('/api/severities', authenticateJWT, severityRouter);

app.use('/api/versions', authenticateJWT, versionRouter);

app.use('/api/dashboard', authenticateJWT, dashboardRouter);

app.use('/api/defect-states', authenticateJWT, defectStatesRouter);

app.use('/api/test-executions', authenticateJWT, testExecutionRouter);

app.use('/api/defects', authenticateJWT, defectRouter);

app.use('/api/user-stories', authenticateJWT, userStoryRouter);

app.post('/api/upload', authenticateJWT, async (req, res, next) => {
    try {
        //@ts-ignore
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            console.log("JSON data =>", req.body.data);

            let imagesData = [];

            //@ts-ignore
            Object.keys(req.files.images).forEach(key => {
                //@ts-ignore
                let image = req.files.images[key];
                image.mv('./uploads/' + image.name);
                //push file details
                imagesData.push({
                    name: image.name,
                    mimetype: image.mimetype,
                    size: image.size
                });
            })
        
            res.send({
                status: true,
                message: 'Files are uploaded',
                data: imagesData
            });
        }
    } catch (error) {
        return next(error);
    }
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Prove Report backend listening at port: ${PORT}`);
});
