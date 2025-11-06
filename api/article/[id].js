export default async function handler(req, res) {
  let { id } = req.query;
  const userAgent = req.headers['user-agent'] || '';
  const fullPath = id; // This contains the full path like "123/article-slug"

  // Extract just the numeric ID if the id contains a slash (e.g., "123/article-slug")
  let articleId = id;
  if (id && id.includes('/')) {
    articleId = id.split('/')[0];
  }

  // Detect social media crawlers
  const isCrawler = /bot|crawler|spider|crawling|facebook|twitter|slack|telegram|whatsapp|linkedin|facebookexternalhit|twitterbot|slackbot/i.test(userAgent);

  // If not a crawler, fetch and serve the index.html (loads React app)
  if (!isCrawler) {
    try {
      // Fetch the index.html from the root
      const indexResponse = await fetch(`https://${req.headers.host}/index.html`);
      const indexHtml = await indexResponse.text();
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(indexHtml);
    } catch (error) {
      console.error('Error fetching index.html:', error);
      // Fallback: redirect to home
      return res.redirect(307, '/');
    }
  }

  try {
    // Fetch article data from your API
    const apiUrl = process.env.VITE_API_URL || 'https://cry808-production.up.railway.app';
    const response = await fetch(`${apiUrl}/api/articles/${articleId}`);

    if (!response.ok) {
      return res.redirect(307, `/article/${fullPath}`);
    }

    const data = await response.json();
    const article = data.article;

    // Strip markdown from content for description
    const stripMarkdown = (text) => {
      return text
        .replace(/[#*_~`>\[\]]/g, '')
        .replace(/\n+/g, ' ')
        .trim();
    };

    const description = stripMarkdown(article.content).substring(0, 160) + '...';
    const url = `https://cry808.com/article/${fullPath}`;

    // Generate HTML with meta tags
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.title} | Cry808</title>
  <meta name="description" content="${description}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${article.title}">
  <meta property="og:description" content="${description}">
  ${article.image_url ? `<meta property="og:image" content="${article.image_url}">` : ''}
  <meta property="og:site_name" content="Cry808">
  <meta property="article:published_time" content="${article.created_at}">
  <meta property="article:author" content="${article.author}">
  ${article.tags ? article.tags.map(tag => `<meta property="article:tag" content="${tag}">`).join('\n  ') : ''}

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${url}">
  <meta name="twitter:title" content="${article.title}">
  <meta name="twitter:description" content="${description}">
  ${article.image_url ? `<meta name="twitter:image" content="${article.image_url}">` : ''}

  <meta http-equiv="refresh" content="0;url=/article/${fullPath}">
  <script>window.location.href = '/article/${fullPath}';</script>
</head>
<body>
  <h1>${article.title}</h1>
  <p>${description}</p>
  <p><a href="/article/${fullPath}">Click here if you are not redirected</a></p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error fetching article for crawler:', error);
    return res.redirect(307, `/article/${fullPath}`);
  }
}
