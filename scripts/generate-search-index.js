const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const yaml = require("js-yaml");

// Path to your blog posts (adjust as per your structure)
const postsDir = path.join(__dirname, "../src/blog"); // or wherever your Markdown files are
const outputPath = path.join(__dirname, "../public/data/search-index.yaml"); // output path for the YAML file

const searchIndex = [];

fs.readdirSync(postsDir).forEach((file) => {
  if (file.endsWith(".md")) {
    const filePath = path.join(postsDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(content);

    // Skip if no frontmatter or required fields
    if (!data.title || !data.description || !data.date) return;

    searchIndex.push({
      title: data.title,
      url: `/blog/${file.replace(".md", "")}/`, // customize URL format if needed
      tags: data.tags || [],
      excerpt: data.description,
    });
  }
});

fs.writeFileSync(outputPath, yaml.dump(searchIndex), "utf-8");
console.log("✅ YAML search index generated!");
