export default async function handler(req, res) {
  try {
    // Fetch all articles from your API
    const apiUrl = process.env.VITE_API_URL || 'https://cry808-production.up.railway.app';
    const response = await fetch(`${apiUrl}/api/articles`);

    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }

    const data = await response.json();
    const articles = data.articles;

    // Generate slug for each article
    const slugify = (text) => {
      return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
    };

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <!-- Homepage -->
  <url>
    <loc>https://cry808.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>

  <!-- News Page -->
  <url>
    <loc>https://cry808.com/news</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>

  <!-- Interviews Page -->
  <url>
    <loc>https://cry808.com/interviews</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>

  <!-- About Page -->
  <url>
    <loc>https://cry808.com/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- Contact Page -->
  <url>
    <loc>https://cry808.com/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- Submit Music Page -->
  <url>
    <loc>https://cry808.com/submit-music</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <!-- Articles -->
  ${articles.map(article => {
    const slug = slugify(article.title);
    const articleUrl = `https://cry808.com/article/${article.id}-${slug}`;
    const lastmod = new Date(article.updated_at || article.created_at).toISOString();

    return `
  <url>
    <loc>${articleUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    ${article.image_url ? `
    <image:image>
      <image:loc>${article.image_url}</image:loc>
      <image:title>${article.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</image:title>
    </image:image>` : ''}
  </url>`;
  }).join('')}

</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}
