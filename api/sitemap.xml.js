// Vercel serverless function to proxy sitemap from backend
export default async function handler(req, res) {
  try {
    // Get the backend API URL from environment variable
    const apiUrl = process.env.VITE_API_URL || 'https://your-backend-url.com';
    
    // Fetch sitemap from backend
    const response = await fetch(`${apiUrl}/sitemap.xml`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch sitemap from backend');
    }
    
    const sitemapXml = await response.text();
    
    // Set proper headers for XML sitemap
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    
    // Return the sitemap
    res.status(200).send(sitemapXml);
  } catch (error) {
    console.error('Error proxying sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}
