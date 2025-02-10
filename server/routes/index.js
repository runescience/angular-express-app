const caseRoutes = require("./cases");
const eventRoutes = require("./events");
const internalMesssageRoutes = require("./internal-messages");
const optionListsRoutes = require("./option-lists");
const questionRoutes = require("./questions");
const questionTypeRoutes = require("./question-types");
const roleRoutes = require("./roles");
const teamRoutes = require("./teams");
const userRoutes = require("./users");

module.exports = (app, dataSource, db) => {
    app.use("/api/cases", caseRoutes(dataSource, db));
    app.use("/api/events", eventRoutes(dataSource, db));
    app.use("/api/internal-messages", internalMesssageRoutes(dataSource, db));
    app.use("/api/option-lists", optionListsRoutes(dataSource, db));
    app.use("/api/questions", questionRoutes(dataSource, db));
    app.use("/api/question-types", questionTypeRoutes(dataSource, db));
    app.use("/api/roles", roleRoutes(dataSource, db));
    app.use("/api/teams", teamRoutes(dataSource, db));
    app.use("/api/users", userRoutes(dataSource, db));
};
