// search-index.json.js
module.exports = function (collectionApi) {
  const posts = collectionApi.getFilteredByGlob("./posts/*.md");

  return posts.map(post => ({
    title: post.data.title,
    url: post.url,
    content: post.templateContent.replace(/<[^>]*>?/gm, "") // remove HTML tags
  }));
};

module.exports.data = {
  permalink: "/search-index.json",
  eleventyExcludeFromCollections: true
};
