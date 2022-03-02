const { TwitterApi } = require('twitter-api-v2');
const { TWITTER_PROFILES } = require('../consts');
const twitterClient = new TwitterApi(process.env.TWITTER_APP_USER_TOKEN);
const postMessage = require('../MessagePost/postMessage');
const log = require('fancy-log');

module.exports = {
  execute: async function () {
    log.info('Fetching Twitter data');
    TWITTER_PROFILES.forEach(async profile => {
      const timeline = await twitterClient.v1.userTimeline(profile.userID, {
        expansions: ['attachments.media_keys'],
        'media.fields': ['url'],
      });

      for await (const tweet of timeline) {
        if (profile.onlyPostWithMedia && !hasMedia(tweet)) continue;

        const messageObject = {
          created_at: tweet.created_at,
          tweetID: tweet.id_str,
          full_text: tweet.full_text,
          images: getImageUrls(tweet),
          videos: getVideoUrls(tweet.extended_entities),
          authorID: tweet.user.id_str,
          authorUsername: tweet.user.screen_name,
          authorDisplayName: tweet.user.name,
          profileImage: tweet.user.profile_image_url_https,
        };
        postMessage.postTwitterMessage(messageObject);
      }
    });
  },
  time: 1000 * 60,
};

function hasMedia(tweet) {
  return !!tweet.entities.media;
}

function getImageUrls(tweet) {
  let imageUrls = [];
  if (tweet.extended_entities && tweet.extended_entities.media) {
    tweet.extended_entities.media.forEach(media => {
      if (media.type == 'photo') {
        imageUrls.push(media.media_url_https);
      }
    });
  }
  if (imageUrls.length == 0 && tweet.entities.media) {
    imageUrls = tweet.entities.media.map(media => media.media_url_https);
  }
  return imageUrls;
}

function getVideoUrls(extended_entities) {
  if (!extended_entities || !extended_entities.media) return [];
  let videoUrls = [];
  extended_entities.media.forEach(media => {
    if (media.type == 'video') {
      videoUrls.push(media.video_info.variants[0].url);
    }
  });
  return videoUrls;
}
