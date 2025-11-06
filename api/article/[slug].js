export default async function handler(req, res) {
  const { slug } = req.query; // Now receives "123-drake-new-album"
  const userAgent = req.headers['user-agent'] || '';

  // Extract numeric ID from slug (e.g., "123-drake-new-album" -> "123")
  const articleId = slug ? slug.split('-')[0] : null;

  if (!articleId) {
    return res.redirect(307, '/');
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
      return res.redirect(307, `/article/${slug}`);
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
    const url = `https://cry808.com/article/${slug}`;

    // Resize image to 1200x630 for optimal Open Graph display (banner format)
    let ogImage = '';
    if (article.image_url) {
      // Use images.weserv.nl to resize image to 1200x630
      ogImage = `https://images.weserv.nl/?url=${encodeURIComponent(article.image_url)}&w=1200&h=630&fit=cover&output=jpg`;
    }

    // Generate JSON-LD structured data for rich search results
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": article.title,
      "description": description,
      "image": ogImage || article.image_url,
      "datePublished": article.created_at,
      "dateModified": article.updated_at || article.created_at,
      "author": {
        "@type": "Person",
        "name": article.author
      },
      "publisher": {
        "@type": "Organization",
        "name": "Cry808",
        "logo": {
          "@type": "ImageObject",
          "url": "https://cry808.com/logo.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": url
      }
    };

    // Add keywords if tags exist
    if (article.tags && article.tags.length > 0) {
      structuredData.keywords = article.tags.join(', ');
    }

    // Generate HTML with meta tags
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.title} | Cry808 - Hip Hop News & Interviews</title>
  <meta name="description" content="${description}">
  ${article.tags && article.tags.length > 0 ? `<meta name="keywords" content="${article.tags.join(', ')}, hip hop, rap, music news, ${article.author}">` : ''}
  <meta name="author" content="${article.author}">
  <link rel="canonical" href="${url}">

  <!-- Structured Data for Google Rich Results -->
  <script type="application/ld+json">
  ${JSON.stringify(structuredData)}
  </script>

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${article.title}">
  <meta property="og:description" content="${description}">
  ${ogImage ? `<meta property="og:image" content="${ogImage}">` : ''}
  ${ogImage ? `<meta property="og:image:width" content="1200">` : ''}
  ${ogImage ? `<meta property="og:image:height" content="630">` : ''}
  ${ogImage ? `<meta property="og:image:type" content="image/jpeg">` : ''}
  <meta property="og:site_name" content="Cry808">
  <meta property="article:published_time" content="${article.created_at}">
  <meta property="article:author" content="${article.author}">
  ${article.tags ? article.tags.map(tag => `<meta property="article:tag" content="${tag}">`).join('\n  ') : ''}

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${url}">
  <meta name="twitter:title" content="${article.title}">
  <meta name="twitter:description" content="${description}">
  ${ogImage ? `<meta name="twitter:image" content="${ogImage}">` : ''}

  <meta http-equiv="refresh" content="0;url=/article/${slug}">
  <script>window.location.href = '/article/${slug}';</script>
</head>
<body>
  <h1>${article.title}</h1>
  <p>${description}</p>
  <p><a href="/article/${slug}">Click here if you are not redirected</a></p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error fetching article for crawler:', error);
    return res.redirect(307, `/article/${slug}`);
  }
}
