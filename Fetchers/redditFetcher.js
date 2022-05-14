const snoowrap = require('snoowrap');
const { REDDIT_CHANNELS } = require('../consts');
const redditClient = new snoowrap({
  userAgent:
    'Mozilla/5.0 (Linux; Android 8.0.0; SM-G960F Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.84 Mobile Safari/537.36',
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_SECRET,
  refreshToken: process.env.REDDIT_REFRESH_TOKEN,
});
const postMessage = require('../MessagePost/postMessage');
const log = require('fancy-log');

module.exports = {
  execute: async function () {
    const currentEpoch = Math.round(new Date().getTime() / 1000);
    log.info('Fetching Twitter data');

    REDDIT_CHANNELS.forEach(async subReddit => {
      try {
        const subRedditInfo = await redditClient.getSubreddit(subReddit.username).fetch();
        const hotPosts = await subRedditInfo.getHot({ limit: 50 });

        for await (const post of hotPosts) {
          if (subReddit.onlyPostWithMedia && !hasMedia(post)) continue;
          //Don't fetch tweets that are older than 5 days
          if (currentEpoch - post.created > 60 * 60 * 24 * 5) continue;

          let messageObject = {
            created_at: new Date(post.created).toLocaleString(),
            postId: post.name,
            postUrl: `https://reddit.com${post.permalink}`,
            full_text: post.title,
            images: getImageUrls(post),
            videos: getVideoUrls(post),
            authorUsername: post.author_fullname,
            categories: getFlairs(post).concat(subReddit.categories),
            epochTime: post.created_utc,
            shouldTranslate: profile.shouldTranslate,
          };
          postMessage.postRedditMessage(messageObject);
        }
      } catch (e) {}
    });
  },
  time: 1000 * 60 * 5,
};

function hasMedia(redditPost) {
  return !redditPost.preview?.images && !redditPost.media?.reddit_video_preview?.fallback_url;
}

function getFlairs(redditPost) {
  let flairs = [];
  try {
    if (redditPost.link_flair_text) {
      redditPost.link_flair_text.forEach(flair => {
        flairs.push(flair.t);
      });
    }
  } catch (e) {
    log.error(e);
  }
  return flairs;
}

function getImageUrls(redditPost) {
  let imageUrls = [];
  try {
    if (redditPost.preview && redditPost.preview.images) {
      redditPost.preview.images.forEach(image => {
        imageUrls.push(image.source.url);
      });
    }
  } catch (e) {
    log.error(e);
  }
  return imageUrls;
}

function getVideoUrls(redditPost) {
  let videoUrls = [];
  try {
    if (redditPost.media && redditPost.is_video && redditPost.media.reddit_video) {
      videoUrls.push(redditPost.media.reddit_video.fallback_url);
    }
  } catch (e) {
    log.error(e);
  }
  return videoUrls;
}
