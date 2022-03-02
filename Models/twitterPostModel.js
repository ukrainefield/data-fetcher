const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const twitterPostSchema = new Schema(
  {
    commandsRecieved: Number,
    slashCommandsRecieved: Number,
    messagesSent: Number,
  },
  {
    timestamps: {
      currentTime: () => Date.now(),
    },
  }
);

module.exports = mongoose.model('botstat', botstatsSchema);
