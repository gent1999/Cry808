// api/interviews.js
// Same bot-serving treatment as api/home.js, scoped to Interviews.
// /interviews is in the live sitemap, so Googlebot/Mediapartners-Google
// crawl it directly as its own page.

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
    // Same filter as src/pages/Interviews.jsx
    const articles = (data.articles || [])
      .filter(a => a.category === 'interview')
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
      name: 'Cry808 Interviews',
      url: 'https://cry808.com/interviews',
      description: 'Exclusive artist interviews from Cry808.',
    };

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interviews | Cry808 - Hip-Hop News, Interviews &amp; Album Reviews</title>
  <meta name="description" content="Exclusive artist interviews from Cry808 — conversations with the underground hip-hop scene's rising names.">
  <link rel="canonical" href="https://cry808.com/interviews">

  <script type="application/ld+json">
  ${JSON.stringify(structuredData).replace(/</g, '\\u003c')}
  </script>

  <meta property="og:type" content="website">
  <meta property="og:url" content="https://cry808.com/interviews">
  <meta property="og:title" content="Interviews | Cry808">
  <meta property="og:description" content="Exclusive artist interviews from Cry808.">
  <meta property="og:image" content="https://cry808.com/og-image.png">
  <meta property="og:site_name" content="Cry808">
</head>
<body>
  <h1>Cry808 Interviews</h1>
  <p>Exclusive artist interviews from Cry808 — conversations with the underground hip-hop scene's rising names.</p>
  ${itemsHtml}
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error rendering /interviews for crawler:', error.message);
    return serveIndex();
  }
}
