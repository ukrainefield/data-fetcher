const { TwitterApi } = require('twitter-api-v2');
const { TWITTER_PROFILES } = require('../consts');
const twitterClient = new TwitterApi(process.env.TWITTER_APP_USER_TOKEN);
module.exports = {
  execute: async function () {
    TWITTER_PROFILES.forEach(async profile => {
      const timeline = await twitterClient.v1.userTimeline(profile.userID, {
        expansions: ['attachments.media_keys'],
        'media.fields': ['url'],
      });

      for await (const tweet of timeline) {
        if (profile.onlyPostWithMedia && !hasMedia(tweet)) continue;
      }
    });
  },
  time: 1000 * 60,
};

function hasMedia(tweet) {
  return !!tweet.entities.media;
}
