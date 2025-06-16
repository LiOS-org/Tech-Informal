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

function isAllowedForImageSitemap(urlPath) {
  return (
    urlPath.startsWith('/blog/') && urlPath !== '/blog/' ||
    urlPath.startsWith('/article/')
  );
}

function imageExists(imgPath) {
  try {
    const localPath = path.join(publicDir, imgPath.replace(baseUrl, ''));
    return fs.existsSync(localPath);
  } catch (err) {
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

    const absUrl = src.startsWith('http') ? src : baseUrl + src;
    const exists = imageExists(absUrl);
    if (!exists) return null;

    return {
      url: absUrl,
      title: img.attr('alt') || undefined,
      caption: img.attr('title') || undefined,
    };
  } catch {
    return null;
  }
}

function getAllHtmlPaths(dirPath, basePath = '') {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  let urls = [];

  for (let entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relPath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      urls = urls.concat(getAllHtmlPaths(fullPath, relPath));
    } else if (entry.isFile() && entry.name === 'index.html') {
      const urlPath = relPath.replace(/\/index\.html$/, '');
      const segments = urlPath.split(path.sep).filter(Boolean);
      if (!EXCLUDE.includes(segments[0])) {
        const url = '/' + segments.join('/') + '/';
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
  }

  return urls;
}

(async () => {
  const pages = getAllHtmlPaths(publicDir);
  const stream = new SitemapStream({ hostname: baseUrl });

  for (const page of pages) {
    const { img, ...urlEntry } = page;
    if (img) {
      stream.write({
        ...urlEntry,
        img: [img],
      });
    } else {
      stream.write(urlEntry);
    }
  }

  stream.end();

  const rawXml = await streamToPromise(stream).then(data => data.toString());
  const prettyXml = prettifyXml(rawXml, { indent: 2 });

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), prettyXml);
  console.log(`✅ Sitemap generated with ${pages.length} entries (with conditional image tags)`);
})();
