'use client';

import { useState } from 'react';

const MAP_EMBED_URL = 'https://www.google.com/maps?q=17.2416657,80.1482557&z=18&output=embed';

export function StoreMap() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="store-map" aria-label="Map showing Armosi Books and Stationery location">
      {!loaded && (
        <div className="store-map-loading">
          <span className="store-map-pulse" />
          <span>Loading store map...</span>
        </div>
      )}
      <iframe
        title="Armosi Books and Stationery Google Map"
        src={MAP_EMBED_URL}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%',
          height: '100%',
          border: 0,
          display: 'block',
          opacity: loaded ? 1 : 0,
          transition: 'opacity .35s ease',
        }}
        allowFullScreen
      />
    </div>
  );
}
