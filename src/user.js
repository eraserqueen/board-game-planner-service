const auth = require("./auth");

module.exports = (db) => ({
    authenticate: (username, password) =>
        db.findUser(username, password)
            .then(user => ({
                user,
                token: auth.getToken()
            }))
            .catch(error => ({
                error
            })),
    register: (username, password) =>
        db.addNewUser(username, password)
            .then(user => ({
                user,
                token: auth.getToken()
            }))
            .catch(error => ({
                error
            }))
});