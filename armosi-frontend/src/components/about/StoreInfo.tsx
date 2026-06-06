import { Clock, Mail, Map, MapPin, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { StoreMap } from '@/components/about/StoreMap';

const MAP_URL = 'https://www.google.com/maps/place/Armosi+Books+and+stationery/@17.2418164,80.1482113,21z/data=!4m12!1m5!3m4!2zMTfCsDE0JzMwLjIiTiA4MMKwMDgnNTMuNSJF!8m2!3d17.2417078!4d80.1481916!3m5!1s0x3a34594275e53501:0xd55f7025cd3d4142!8m2!3d17.2416657!4d80.1482557!16s%2Fg%2F11wy9lc_3g';
const PHONE = '+91 9346459952';
const EMAIL = 'arifarifsk2001@gmail.com';

function InfoTile({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="store-info-tile">
      <div className="store-info-icon">{icon}</div>
      <div>
        <h3>{label}</h3>
        <div>{children}</div>
      </div>
    </div>
  );
}

export function StoreInfo() {
  return (
    <section className="store-info-section anim-fadeUp" aria-labelledby="store-info-title">
      <div className="store-info-card">
        <div className="store-info-header">
          <div className="store-info-heading">
            <span className="store-info-heading-icon" aria-hidden="true">
              <MapPin size={21} strokeWidth={2.2} />
            </span>
            <div>
              <p className="store-info-eyebrow">Store Information & Location</p>
              <h2 id="store-info-title">Visit Our Store</h2>
            </div>
          </div>

          <a
            className="store-map-button"
            href={MAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Armosi Books and Stationery location in Google Maps"
            title="Open in Google Maps"
          >
            <Map size={20} strokeWidth={2.2} />
          </a>
        </div>

        <div className="store-location-copy">
          <h3>Armosi Books and Stationery</h3>
          <address>
            Exact Google Maps location<br />
            17.2416657 N, 80.1482557 E
          </address>
        </div>

        <StoreMap />

        <div className="store-info-grid">
          <InfoTile icon={<Clock size={19} strokeWidth={2.1} />} label="Store Timings">
            <p>Everyday : 8:00 AM - 9:00 PM</p>
          </InfoTile>

          <InfoTile icon={<Phone size={19} strokeWidth={2.1} />} label="Contact Us">
            <a href="tel:+919346459952">{PHONE}</a>
          </InfoTile>

          <InfoTile icon={<Mail size={19} strokeWidth={2.1} />} label="Email">
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </InfoTile>
        </div>
      </div>
    </section>
  );
}
