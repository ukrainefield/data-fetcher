const databasePost = require('./databasePost');
async function postTwitterMessage(message, forceSend = false) {
  databasePost.postTwitterMessageToDatabase(message);
}

module.exports = { postTwitterMessage };
