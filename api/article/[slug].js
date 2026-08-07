import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default async function handler(req, res) {
  const { slug } = req.query; // Now receives "123-drake-new-album"
  const userAgent = req.headers['user-agent'] || '';

  // Extract numeric ID from slug (e.g., "123-drake-new-album" -> "123")
  const articleId = slug ? slug.split('-')[0] : null;

  // Helper to serve the SPA index.html
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

  if (!articleId) {
    return serveIndex();
  }

  // Social media preview bots + search/ad crawlers (Googlebot, and critically
  // Mediapartners-Google — the AdSense review bot — which does not reliably
  // execute client JS and was previously falling through to the empty SPA shell).
  const isCrawler = /facebookexternalhit|twitterbot|slackbot|telegrambot|whatsapp|linkedinbot|discordbot|pinterestbot|googlebot|mediapartners-google|adsbot-google|apis-google|storebot-google/i.test(userAgent);

  // If not a recognized bot, serve the React SPA
  if (!isCrawler) {
    return serveIndex();
  }

  try {
    // Fetch article data from your API
    const apiUrl = process.env.VITE_API_URL || 'https://server808.vercel.app';
    const response = await fetch(`${apiUrl}/api/articles/${articleId}`);

    if (!response.ok) {
      // Article not found - return 404 instead of redirect
      res.status(404).send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Article Not Found | Cry808</title>
  <meta name="robots" content="noindex">
</head>
<body>
  <h1>Article Not Found</h1>
  <p><a href="/">Return to Cry808 Home</a></p>
</body>
</html>`);
      return;
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

    // Full rendered article body — this is the actual fix for "insufficient
    // content" rejections: bots used to get only the 160-char description
    // above. react-markdown escapes text content by default (no raw HTML
    // passthrough), so this is safe against injection via article.content.
    const articleHtml = renderToStaticMarkup(
      React.createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, article.content || '')
    );

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
  <title>${escapeHtml(article.title)} | Cry808 - Hip Hop News & Interviews</title>
  <meta name="description" content="${escapeHtml(description)}">
  ${article.tags && article.tags.length > 0 ? `<meta name="keywords" content="${escapeHtml(article.tags.join(', '))}, hip hop, rap, music news, ${escapeHtml(article.author)}">` : ''}
  <meta name="author" content="${escapeHtml(article.author)}">
  <link rel="canonical" href="${url}">

  <!-- Structured Data for Google Rich Results -->
  <script type="application/ld+json">
  ${JSON.stringify(structuredData).replace(/</g, '\\u003c')}
  </script>

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${escapeHtml(article.title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  ${ogImage ? `<meta property="og:image" content="${ogImage}">` : ''}
  ${ogImage ? `<meta property="og:image:width" content="1200">` : ''}
  ${ogImage ? `<meta property="og:image:height" content="630">` : ''}
  ${ogImage ? `<meta property="og:image:type" content="image/jpeg">` : ''}
  <meta property="og:site_name" content="Cry808">
  <meta property="article:published_time" content="${article.created_at}">
  <meta property="article:author" content="${escapeHtml(article.author)}">
  ${article.tags ? article.tags.map(tag => `<meta property="article:tag" content="${escapeHtml(tag)}">`).join('\n  ') : ''}

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${url}">
  <meta name="twitter:title" content="${escapeHtml(article.title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  ${ogImage ? `<meta name="twitter:image" content="${ogImage}">` : ''}
</head>
<body>
  <h1>${escapeHtml(article.title)}</h1>
  <p>By ${escapeHtml(article.author)} | ${new Date(article.created_at).toLocaleDateString()}</p>
  ${ogImage ? `<img src="${ogImage}" alt="${escapeHtml(article.title)}" style="max-width: 100%; height: auto;">` : ''}
  <div>${articleHtml}</div>
  <p><a href="/article/${slug}">Read full article</a></p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error fetching article for crawler:', error);
    // Return 500 error instead of redirect
    res.status(500).send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error Loading Article | Cry808</title>
  <meta name="robots" content="noindex">
</head>
<body>
  <h1>Error Loading Article</h1>
  <p>Sorry, there was an error loading this article. Please try again later.</p>
  <p><a href="/">Return to Cry808 Home</a></p>
</body>
</html>`);
  }
}
