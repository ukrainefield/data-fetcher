const { TwitterApi } = require('twitter-api-v2');
const { TWITTER_PROFILES, ADDITIONAL_CATEGORIES } = require('../consts');
const twitterClient = new TwitterApi(process.env.TWITTER_APP_USER_TOKEN);
const postMessage = require('../MessagePost/postMessage');
const log = require('fancy-log');
const translator = require('../Helpers/translator');

module.exports = {
  execute: async function () {
    const currentEpoch = Math.round(new Date().getTime() / 1000);
    log.info('Fetching Twitter data');

    TWITTER_PROFILES.forEach(async profile => {
      try {
        const timeline = await twitterClient.v1.userTimeline(profile.userID, {
          expansions: ['attachments.media_keys'],
          'media.fields': ['url'],
        });

        for await (const tweet of timeline) {
          if (profile.onlyPostWithMedia && !hasMedia(tweet)) continue;
          //Don't fetch tweets that are older than 5 days
          const tweetEpoch = new Date(tweet.created_at).getTime() / 1000;
          if (currentEpoch - tweetEpoch > 60 * 60 * 24 * 5) continue;

          let messageObject = {
            created_at: tweet.created_at,
            tweetID: tweet.id_str,
            tweetURL: `https://twitter.com/${tweet.user.id_str}/status/${tweet.id_str}`,
            full_text: profile.shouldTranslate ? await translator.translateText(tweet.full_text) : tweet.full_text,
            images: getImageUrls(tweet),
            videos: getVideoUrls(tweet.extended_entities),
            authorID: tweet.user.id_str,
            authorUsername: tweet.user.screen_name,
            authorDisplayName: profile.friendlyName ?? tweet.user.name,
            profileImage: tweet.user.profile_image_url_https,
            categories: profile.categories,
            epochTime: tweetEpoch,
          };
          if (tweet.possibly_sensitive) {
            messageObject.categories.push(ADDITIONAL_CATEGORIES.NSFW);
          }
          postMessage.postTwitterMessage(messageObject);
        }
      } catch (e) {
        console.log(e)
      }
    });
  },
  time: 1000 * 60 * 2,
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
      const videoMp4s = media.video_info.variants.filter(variant => variant.content_type == 'video/mp4').sort(variant => variant.bitrate);
      console.log(videoMp4s);
      if (videoMp4s.length > 0) {
        videoUrls.push(videoMp4s[0].url);
      } else {
        videoUrls.push(media.video_info.variants[0].url);
      }
    }
  });
  return videoUrls;
}
