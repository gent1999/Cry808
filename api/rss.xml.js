export default async function handler(req, res) {
  try {
    const apiUrl = process.env.VITE_API_URL;
    if (!apiUrl) throw new Error('VITE_API_URL environment variable is not set');

    console.log('[rss.xml] Proxying request to', `${apiUrl}/rss.xml`);

    const response = await fetch(`${apiUrl}/rss.xml`);

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const xml = await response.text();

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
    res.status(200).send(xml);
  } catch (err) {
    console.error('[rss.xml] Error:', err.message);
    res.status(500).send('Error generating RSS feed');
  }
}
