const userRoutes = require('./users');
const teamRoutes = require('./teams');
const roleRoutes = require('./roles');
const casesRoutes = require('./cases');
const eventsRoutes = require('./events');

const questionTypeRoutes = require('./question-types');
const questionRoutes = require('./questions');
const optionListsRoutes = require('./option-lists');

const internalMesssageRoutes = require('./internal-messages');


module.exports = (app, dataSource, db) => {
    app.use('/api/users', userRoutes(dataSource, db));

    app.use('/api/roles', roleRoutes(dataSource, db));

    app.use('/api/cases', casesRoutes(dataSource, db));

    app.use('/api/teams', teamRoutes(dataSource, db));

    app.use('/api/events', eventRoutes(dataSource, db));



    app.use('/api/questions', questionRoutes(dataSource, db));

    app.use('/api/question-types', questionTypeRoutes(dataSource, db));

    app.use('/api/option-lists', optionListsRoutes(dataSource, db));



    app.use('/api/internal-messages', internalMesssageRoutes(dataSource, db));



};
