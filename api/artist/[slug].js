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
  const { slug } = req.query;

  // Helper to serve the SPA index.html — only used as an error fallback now;
  // middleware.js already routes crawler user agents here specifically, and
  // humans never reach this function at all.
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

  if (!slug) {
    return serveIndex();
  }

  try {
    const apiUrl = process.env.VITE_API_URL || 'https://server808.vercel.app';
    const response = await fetch(`${apiUrl}/api/artists/${slug}`);

    if (!response.ok) {
      res.status(404).send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Artist Not Found | Cry808</title>
  <meta name="robots" content="noindex">
</head>
<body>
  <h1>Artist Not Found</h1>
  <p><a href="/">Return to Cry808 Home</a></p>
</body>
</html>`);
      return;
    }

    const data = await response.json();
    const artist = data.artist;
    const articles = data.articles || [];

    const description = artist.bio
      ? artist.bio.replace(/\s+/g, ' ').trim().substring(0, 160) + '...'
      : `Read all ${artist.name} articles, interviews, and releases on Cry808.`;
    const url = `https://cry808.com/artist/${slug}`;

    // Resize image to 1200x630 for optimal Open Graph display (banner format)
    let ogImage = '';
    if (artist.profile_image_url) {
      ogImage = `https://images.weserv.nl/?url=${encodeURIComponent(artist.profile_image_url)}&w=1200&h=630&fit=cover&output=jpg`;
    }

    const sameAs = [artist.spotify_url, artist.soundcloud_url, artist.youtube_url, artist.genius_url, artist.apple_music_url]
      .filter(Boolean);

    // Generate JSON-LD structured data for rich search results
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "MusicGroup",
      "name": artist.name,
      "description": description,
      "image": ogImage || artist.profile_image_url,
      "url": url,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": url
      }
    };
    if (sameAs.length > 0) structuredData.sameAs = sameAs;

    // Full bio content so crawlers see more than just the 160-char description
    const bioHtml = [artist.bio, artist.bio2]
      .filter(Boolean)
      .map(p => `<p>${escapeHtml(p)}</p>`)
      .join('\n  ');

    const articlesHtml = articles.length > 0
      ? `<ul>\n${articles.map(a => `    <li><a href="/article/${a.id}-${(a.title || '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-{2,}/g, '-')}">${escapeHtml(a.title)}</a></li>`).join('\n')}\n  </ul>`
      : '';

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(artist.name)} | Cry808 - Hip Hop News & Interviews</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${url}">

  <!-- Structured Data for Google Rich Results -->
  <script type="application/ld+json">
  ${JSON.stringify(structuredData).replace(/</g, '\\u003c')}
  </script>

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="profile">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${escapeHtml(artist.name)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  ${ogImage ? `<meta property="og:image" content="${ogImage}">` : ''}
  ${ogImage ? `<meta property="og:image:width" content="1200">` : ''}
  ${ogImage ? `<meta property="og:image:height" content="630">` : ''}
  ${ogImage ? `<meta property="og:image:type" content="image/jpeg">` : ''}
  <meta property="og:site_name" content="Cry808">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${url}">
  <meta name="twitter:title" content="${escapeHtml(artist.name)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  ${ogImage ? `<meta name="twitter:image" content="${ogImage}">` : ''}
</head>
<body>
  <h1>${escapeHtml(artist.name)}</h1>
  ${ogImage ? `<img src="${ogImage}" alt="${escapeHtml(artist.name)}" style="max-width: 100%; height: auto;">` : ''}
  ${bioHtml}
  ${articlesHtml}
  <p><a href="/artist/${slug}">View artist page</a></p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    // Artist profiles change rarely — long ceiling, matches article caching.
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error fetching artist for crawler:', error);
    res.status(500).send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error Loading Artist | Cry808</title>
  <meta name="robots" content="noindex">
</head>
<body>
  <h1>Error Loading Artist</h1>
  <p>Sorry, there was an error loading this artist. Please try again later.</p>
  <p><a href="/">Return to Cry808 Home</a></p>
</body>
</html>`);
  }
}
