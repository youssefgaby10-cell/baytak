
import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { useLanguage } from "../context/LanguageContext.jsx";
import "leaflet/dist/leaflet.css";
import "./LocationSelector.css";

const blueMarker = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapClickHandler({ onPick }) {
  const { t } = useLanguage();

  useMapEvents({
    click(event) {
      onPick(event.latlng);
    },
  });

  return null;
}

function MapMover({ position }) {
  const map = useMap();

  if (position) {
    map.setView(position, 16);
  }

  return null;
}

export default function LocationSelector({ onLocationSelect }) {
  const [mapOpen, setMapOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState("");
  const [pendingLocation, setPendingLocation] = useState(null);
  const [savedLocation, setSavedLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const lookupAddress = async (lat, lon) => {
    try {
      const params = new URLSearchParams({
        format: "jsonv2",
        lat: String(lat),
        lon: String(lon),
        "accept-language": "ar",
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?${params}`
      );

      if (!response.ok) throw new Error();

      const data = await response.json();
      return data.display_name || `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    } catch {
      return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    }
  };

  const pickPosition = async ({ lat, lng }) => {
    setPosition([lat, lng]);
    setError("");
    setAddress("جاري تحديد اسم المكان...");

    const name = await lookupAddress(lat, lng);
    setAddress(name);
  };

  const searchPlace = async (event) => {
    event.preventDefault();

    if (!query.trim()) {
      setError(t.searchLocationRequired);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        format: "jsonv2",
        q: `${query}, Egypt`,
        countrycodes: "eg",
        limit: "1",
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`
      );

      if (!response.ok) throw new Error();

      const results = await response.json();

      if (!results.length) {
        setError(t.locationNotFound);
        return;
      }

      const result = results[0];
      const lat = Number(result.lat);
      const lon = Number(result.lon);

      setPosition([lat, lon]);
      setAddress(result.display_name || query);
    } catch {
      setError(t.locationSearchUnavailable);
    } finally {
      setLoading(false);
    }
  };

  const choosePlace = () => {
    if (!position) {
      setError(t.selectLocationOnMapFirst);
      return;
    }

    setPendingLocation({
      location: address || `${position[0]}, ${position[1]}`,
      latitude: position[0],
      longitude: position[1],
    });

    setMapOpen(false);
    setError("");
  };

  const confirmLocation = () => {
    if (!pendingLocation) return;

    onLocationSelect?.(pendingLocation);
    setSavedLocation(pendingLocation);
    setPendingLocation(null);
  };

  return (
    <div className="location-picker">
      <div className="location-picker-heading">
        <span className="location-picker-icon">📍</span>
        <div>
          <h3>{t.locationSelectorTitle}</h3>
          <p>{t.locationSelectorHint}</p>
        </div>
      </div>

      {savedLocation ? (
        <div className="location-selected-card">
          <span className="location-status-dot" />
          <div className="location-selected-info">
            <strong>{t.locationConfirmed}</strong>
            <p>{savedLocation.location}</p>
          </div>
          <button
            type="button"
            className="location-change-button"
            onClick={() => {
              setPosition([
                savedLocation.latitude,
                savedLocation.longitude,
              ]);
              setAddress(savedLocation.location);
              setSavedLocation(null);
              setMapOpen(true);
            }}
          >
            {t.change}
          </button>
        </div>
      ) : pendingLocation ? (
        <div className="location-selected-card">
          <span className="location-status-dot" />
          <div className="location-selected-info">
            <strong>{t.selectedPlace}</strong>
            <p>{pendingLocation.location}</p>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="location-open-button"
          onClick={() => setMapOpen(true)}
        >
          <span>🗺️</span>
          {t.selectPlaceOnMap}
        </button>
      )}

      {mapOpen && (
        <div className="location-map-panel">
          <form className="location-search-form" onSubmit={searchPlace}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="مثال: مدينة نصر، عباس العقاد"
              aria-label="ابحث عن مكان"
            />
            <button type="submit" disabled={loading}>
              {loading ? "جاري البحث..." : "بحث"}
            </button>
          </form>

          <p className="location-map-tip">
            {t.mapMarkerHint}
          </p>

          <div className="location-map">
            <MapContainer
              center={position || [30.0444, 31.2357]}
              zoom={position ? 16 : 11}
              scrollWheelZoom
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">{t.openStreetMap}</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapClickHandler onPick={pickPosition} />
              <MapMover position={position} />

              {position && (
                <Marker
                  position={position}
                  icon={blueMarker}
                />
              )}
            </MapContainer>
          </div>

          {address && (
            <div className="location-address-preview">
              <strong>{t.selectedLocation}</strong>
              <p>{address}</p>
            </div>
          )}

          {error && <p className="location-error">{error}</p>}

          <div className="location-map-actions">
            <button
              type="button"
              className="location-cancel-button"
              onClick={() => {
                setMapOpen(false);
                setError("");
              }}
            >
              {t.cancel}
            </button>

            <button
              type="button"
              className="location-blue-button"
              onClick={choosePlace}
              disabled={!position}
            >
              {t.confirmPlace}
            </button>
          </div>
        </div>
      )}

      {pendingLocation && !savedLocation && !mapOpen && (
        <button
          type="button"
          className="location-confirm-button"
          onClick={confirmLocation}
        >
          {t.confirmPlace}
        </button>
      )}
    </div>
  );
}