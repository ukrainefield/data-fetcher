async function postTwitterMessageToDatabase(message) {
  console.log(`Posting message to database: ${JSON.stringify(message)}`);
}

module.exports = { postTwitterMessageToDatabase };
