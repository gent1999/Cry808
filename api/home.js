// api/home.js
// Serves a lightweight but substantive server-rendered homepage to search
// and ad-review crawlers. Human visitors and unrecognized user agents get
// the normal React SPA (index.html), unchanged.
//
// Same problem as api/article/[slug].js: the homepage previously had zero
// bot handling at all — Googlebot and Mediapartners-Google (AdSense's
// reviewer) got the empty JS-shell, which reads as "insufficient content."

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
    const articles = (data.articles || []).slice(0, 30);

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
      '@type': 'WebSite',
      name: 'Cry808',
      url: 'https://cry808.com',
      description: 'Your source for the latest hip-hop news, exclusive artist interviews, album reviews, and music culture.',
    };

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cry808 - Hip-Hop News, Interviews &amp; Album Reviews</title>
  <meta name="description" content="Your source for the latest hip-hop news, exclusive artist interviews, album reviews, and music culture. Stay updated with daily rap &amp; hip-hop content.">
  <link rel="canonical" href="https://cry808.com/">

  <script type="application/ld+json">
  ${JSON.stringify(structuredData).replace(/</g, '\\u003c')}
  </script>

  <meta property="og:type" content="website">
  <meta property="og:url" content="https://cry808.com/">
  <meta property="og:title" content="Cry808 - Hip-Hop News, Interviews & Album Reviews">
  <meta property="og:description" content="Your source for the latest hip-hop news, exclusive artist interviews, album reviews, and music culture.">
  <meta property="og:image" content="https://cry808.com/cry808_banner.png">
  <meta property="og:site_name" content="Cry808">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Cry808 - Hip-Hop News, Interviews & Album Reviews">
  <meta name="twitter:description" content="Your source for the latest hip-hop news, exclusive artist interviews, album reviews, and music culture.">
  <meta name="twitter:image" content="https://cry808.com/cry808_banner.png">
</head>
<body>
  <h1>Cry808 — Hip-Hop News, Interviews &amp; Album Reviews</h1>
  <p>Your source for the latest hip-hop news, exclusive artist interviews, album reviews, and music culture. Stay updated with daily rap &amp; hip-hop content.</p>
  ${itemsHtml}
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error rendering homepage for crawler:', error.message);
    return serveIndex();
  }
}
