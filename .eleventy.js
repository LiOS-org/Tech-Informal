const { DateTime } = require("luxon");
module.exports = function(eleventyConfig) {

    // Add a passthrough copy for the CSS file
    eleventyConfig.addPassthroughCopy("./src/assests");
    eleventyConfig.addPassthroughCopy("./src/assets/css");
    eleventyConfig.addPassthroughCopy("./src/assets/blog");
    eleventyConfig.addFilter("postDate", (dateObj) => {
        return DateTime.fromJSDate(dateObj).toLocaleString("DateTime.DATE_MED");
    }
    );
    return {
        dir: {
            input: "src",
            output: "public",
        }
    }
}