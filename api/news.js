// api/news.js
// Same bot-serving treatment as api/home.js, scoped to the News feed.
// /news is in the live sitemap, so Googlebot/Mediapartners-Google crawl it
// directly as its own page — it previously got the empty SPA shell like
// everything else did before the audit fix.

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugify(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function stripMarkdown(text) {
  return (text || '')
    .replace(/[#*_~`>[\]]/g, '')
    .replace(/\n+/g, ' ')
    .trim();
}

export default async function handler(req, res) {
  const userAgent = req.headers['user-agent'] || '';

  const serveIndex = async () => {
    try {
      const indexResponse = await fetch(`https://${req.headers.host}/index.html`);
      const indexHtml = await indexResponse.text();
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(indexHtml);
    } catch (error) {
      console.error('Error fetching index.html:', error);
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send('<html><body><script>window.location.href="/"</script></body></html>');
    }
  };

  const isCrawler = /facebookexternalhit|twitterbot|slackbot|telegrambot|whatsapp|linkedinbot|discordbot|pinterestbot|googlebot|mediapartners-google|adsbot-google|apis-google|storebot-google/i.test(userAgent);

  if (!isCrawler) {
    return serveIndex();
  }

  try {
    const apiUrl = process.env.VITE_API_URL || 'https://server808.vercel.app';
    const response = await fetch(`${apiUrl}/api/articles`);

    if (!response.ok) throw new Error(`Backend returned ${response.status}`);

    const data = await response.json();
    // Same filter as src/pages/News.jsx: hide interviews, guides, evergreen posts
    const articles = (data.articles || [])
      .filter(a => a.category !== 'interview' && a.category !== 'guide' && a.category !== 'guides' && !a.is_evergreen)
      .slice(0, 30);

    const itemsHtml = articles.map(a => {
      const articleUrl = `https://cry808.com/article/${a.id}-${slugify(a.title)}`;
      const excerptRaw = stripMarkdown(a.content).slice(0, 200);
      return `
  <article>
    <h2><a href="${articleUrl}">${escapeHtml(a.title)}</a></h2>
    <p>By ${escapeHtml(a.author)} | ${new Date(a.created_at).toLocaleDateString()}</p>
    <p>${escapeHtml(excerptRaw)}${excerptRaw.length >= 200 ? '...' : ''}</p>
  </article>`;
    }).join('\n');

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Cry808 News',
      url: 'https://cry808.com/news',
      description: 'The latest hip-hop news from Cry808.',
    };

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>News | Cry808 - Hip-Hop News, Interviews &amp; Album Reviews</title>
  <meta name="description" content="The latest hip-hop news from Cry808 — underground releases, artist spotlights, and music culture coverage.">
  <link rel="canonical" href="https://cry808.com/news">

  <script type="application/ld+json">
  ${JSON.stringify(structuredData).replace(/</g, '\\u003c')}
  </script>

  <meta property="og:type" content="website">
  <meta property="og:url" content="https://cry808.com/news">
  <meta property="og:title" content="News | Cry808">
  <meta property="og:description" content="The latest hip-hop news from Cry808.">
  <meta property="og:image" content="https://cry808.com/cry808_banner.png">
  <meta property="og:site_name" content="Cry808">
</head>
<body>
  <h1>Cry808 News</h1>
  <p>The latest hip-hop news from Cry808 — underground releases, artist spotlights, and music culture coverage.</p>
  ${itemsHtml}
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error rendering /news for crawler:', error.message);
    return serveIndex();
  }
}
