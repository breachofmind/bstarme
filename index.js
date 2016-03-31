var application = require('./app/app');

application.environment(process.argv[2]);

application.bootstrap().start();

module.exports = application;