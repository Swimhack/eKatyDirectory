import Image from 'next/image';

interface GoogleAttributionProps {
  placeId?: string;
  className?: string;
}

export default function GoogleAttribution({ placeId, className = '' }: GoogleAttributionProps) {
  const mapsUrl = placeId 
    ? `https://maps.google.com/maps?q=place_id:${placeId}`
    : 'https://maps.google.com';

  return (
    <div className={`google-attribution flex items-center gap-2 text-xs text-gray-500 ${className}`}>
      <img 
        src="/powered_by_google_on_white.png" 
        alt="Powered by Google" 
        className="h-4"
      />
      <a 
        href={mapsUrl}
        target="_blank" 
        rel="noopener noreferrer"
        className="hover:text-gray-700 underline"
      >
        View on Google Maps
      </a>
    </div>
  );
}