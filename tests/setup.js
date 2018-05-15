
//Here we are asking to JEST to wait 30 seconds before failing a test. 
//This is because by default JEST runs a test and fails it after 5 seconds if it didnt complete it.
//this nummber can be anything we want.
jest.setTimeout(60000)


require('../models/User');


// inside you package.json we added the "jest":"setupTestFrameworkScriptFile": "./tests/setup.js" 
//this is basically going to run the page and connect mongodb instance so that our test have access to them.
//This step is needed because our test suits do no have access to this mongo instance unless we explicitly give it access.
const mongoose = require('mongoose');
const keys = require('../config/keys');

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, {userMongoClient: true});
