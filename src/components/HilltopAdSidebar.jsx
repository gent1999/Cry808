import React from 'react';
import { useLocation } from 'react-router-dom';
import HilltopMultiBanner from './HilltopMultiBanner';
import SpotifyEmbed from './SpotifyEmbed';

const HilltopAdSidebar = () => {
  const location = useLocation();

  return (
    <div className="hidden xl:block w-80 flex-shrink-0">
      <div className="sticky top-24 space-y-6">
        {/* Hilltop Multi-Tag Banner - 300x250 */}
        {/* Key forces component to remount on route change */}
        <HilltopMultiBanner key={location.pathname} placement="sidebar" />

        {/* Spotify Embed - Internal Ad */}
        <SpotifyEmbed />
      </div>
    </div>
  );
};

export default HilltopAdSidebar;
