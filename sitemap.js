const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');
const prettifyXml = require('prettify-xml');

const baseUrl = 'https://tech-informal.web.app';
const publicDir = path.join(__dirname, 'public');
const EXCLUDE = ['404', 'admin'];

function getPriority(url) {
  const depth = url.split('/').filter(Boolean).length;
  if (depth === 0) return 1.0;
  if (depth === 1) return 0.8;
  if (depth === 2) return 0.6;
  return 0.5;
}

function getChangeFreq(url) {
  if (url === '/') return 'weekly';
  if (url.startsWith('/blog/')) return 'monthly';
  if (url.startsWith('/article/')) return 'monthly';
  return 'yearly';
}

function isAllowedForImageSitemap(urlPath) {
  return (
    (urlPath.startsWith('/blog/') && urlPath !== '/blog/') ||
    urlPath.startsWith('/article/')
  );
}

function imageExists(imgPath) {
  try {
    // Skip external images
    if (!imgPath.startsWith(baseUrl)) {
      return false;
    }
    
    const parsed = new URL(imgPath);
    let filePath = parsed.pathname;
    
    // Remove leading slash for consistent paths
    if (filePath.startsWith('/')) {
      filePath = filePath.substring(1);
    }
    
    const localPath = path.join(publicDir, decodeURIComponent(filePath));
    return fs.existsSync(localPath);
  } catch (err) {
    console.error(`Error checking image: ${imgPath}`, err);
    return false;
  }
}

function extractFirstImage(fullHtmlPath) {
  try {
    const html = fs.readFileSync(fullHtmlPath, 'utf-8');
    const $ = cheerio.load(html);
    const img = $('img').first();
    const src = img.attr('src');
    if (!src) return null;

    // Handle relative/absolute paths
    let absUrl;
    if (src.startsWith('http')) {
      absUrl = src;
    } else if (src.startsWith('/')) {
      absUrl = baseUrl + src;
    } else {
      absUrl = baseUrl + '/' + src;
    }

    if (!imageExists(absUrl)) return null;

    return {
      url: absUrl,
      title: img.attr('alt') || undefined,
      caption: img.attr('title') || undefined,
    };
  } catch (err) {
    console.error(`Error extracting image from ${fullHtmlPath}:`, err);
    return null;
  }
}

function getAllHtmlPaths(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  let urls = [];

  for (let entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      urls = urls.concat(getAllHtmlPaths(fullPath));
    } else if (entry.isFile() && entry.name === 'index.html') {
      // Get relative path from public directory
      const relativePath = path.relative(publicDir, dirPath);
      
      // Handle root directory case
      let url;
      if (relativePath === '.' || relativePath === '') {
        url = '/';
      } else {
        // Normalize Windows paths
        const normalizedPath = relativePath.replace(/\\/g, '/');
        url = `/${normalizedPath}/`;
      }
      
      // Skip excluded sections
      const segments = url.split('/').filter(Boolean);
      if (segments.length > 0 && EXCLUDE.includes(segments[0])) {
        console.log(`⏭ Excluding: ${url}`);
        continue;
      }

      const lastmod = fs.statSync(fullPath).mtime.toISOString();
      const priority = getPriority(url);

      let img = null;
      if (isAllowedForImageSitemap(url)) {
        img = extractFirstImage(fullPath);
      }

      urls.push({
        url,
        lastmod,
        priority,
        changefreq: getChangeFreq(url),
        ...(img && {
          img: {
            url: img.url,
            caption: img.caption,
            title: img.title,
          }
        })
      });
    }
  }

  return urls;
}

(async () => {
  const pages = getAllHtmlPaths(publicDir);
  
  // Log all URLs for debugging
  console.log('Generated URLs:');
  pages.forEach(page => console.log(`- ${page.url}`));
  
  const stream = new SitemapStream({ 
    hostname: baseUrl,
    xmlns: {
      image: true,
      news: false,
      xhtml: false,
      video: false
    },
    xmlNs: 'http://www.sitemaps.org/schemas/sitemap/0.9'
  });

  // Write pages to sitemap
  for (const page of pages) {
    const entry = {
      url: page.url,
      lastmod: page.lastmod,
      priority: page.priority,
      changefreq: page.changefreq
    };
    
    if (page.img) {
      entry.img = [{
        url: page.img.url,
        caption: page.img.caption,
        title: page.img.title
      }];
    }
    
    stream.write(entry);
  }
  stream.end();

  const rawXml = await streamToPromise(stream).then(data => data.toString());
  const prettyXml = prettifyXml(rawXml, { indent: 2 });

  // Add XML declaration and ensure proper encoding
  const finalXml = `<?xml version="1.0" encoding="UTF-8"?>
${prettyXml.replace('<?xml version="1.0" encoding="UTF-8"?>', '').trim()}`;

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), finalXml);
  console.log(`✅ Sitemap generated with ${pages.length} valid entries`);
  console.log(`🔥 Google-friendly improvements applied:
  - Added changefreq elements for better crawling hints
  - Improved XML schema compliance
  - Enhanced URL encoding
  - Fixed potential Google parsing issues
  - Ensured proper UTF-8 encoding`);
})();