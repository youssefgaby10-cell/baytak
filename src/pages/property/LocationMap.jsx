
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { useLanguage } from "../../context/LanguageContext.jsx";
import "leaflet/dist/leaflet.css";
import "../../styles/LocationMap.css";

const blueMarker = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapClick({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

function MoveMap({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 16, { duration: 0.8 });
    }
  }, [map, position]);

  return null;
}

export default function LocationMap() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const [query, setQuery] = useState("");
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  async function searchPlaces(searchText) {
    const text = searchText.trim();

    if (!text) {
      setResults([]);
      setError(t.enterAreaOrStreet);
      return;
    }

    setLoading(true);
    setError("");
    setShowSuggestions(true);

    try {
      const params = new URLSearchParams({
        q: text,
        format: "jsonv2",
        countrycodes: "eg",
        addressdetails: "1",
        limit: "7",
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
        {
          headers: {
            "Accept-Language": "ar,en",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();

      if (!data.length) {
        setResults([]);
        setError(t.placeNotFoundTryAgain);
        return;
      }

      setResults(data);
    } catch {
      setResults([]);
      setError(t.searchUnavailableTryAgain);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(event) {
    event.preventDefault();
    await searchPlaces(query);
  }

  function selectPlace(result) {
    const coordinates = [
      Number(result.lat),
      Number(result.lon),
    ];

    setPosition(coordinates);
    setAddress(result.display_name || query);
    setQuery(result.display_name || query);
    setResults([]);
    setShowSuggestions(false);
    setError("");
  }

  function selectMapLocation(coordinates) {
    setPosition(coordinates);
    setAddress(
      `إحداثيات الموقع: ${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)}`
    );
    setResults([]);
    setShowSuggestions(false);
    setError("");
  }

  function confirmLocation() {
    if (!position) {
      setError("اختار مكان بالبحث أو اضغط على الخريطة أولًا.");
      return;
    }

    navigate("/add-property", {
      state: {
        selectedLocation: {
          location: address || query,
          latitude: position[0],
          longitude: position[1],
        },
      },
    });
  }

  return (
    <main className="location-map-page" dir="rtl">
      <header className="location-map-header">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="location-back"
        >
          {t.backArrow}
        </button>

        <h1>{t.chooseLocation}</h1>
        <p>{t.locationSearchHint}</p>
      </header>

      <form className="location-search" onSubmit={handleSearch}>
        <input
          ref={searchRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setError("");
            setResults([]);
            setShowSuggestions(false);
          }}
          onFocus={() => {
            if (results.length) setShowSuggestions(true);
          }}
          placeholder="مثال: شارع التسعين، التجمع الخامس، القاهرة"
          aria-label="ابحث عن المكان"
          autoComplete="off"
        />

        <button type="submit" disabled={loading}>
          {loading ? "جاري البحث..." : "بحث"}
        </button>
      </form>

      {loading && (
        <p className="location-map-status">
          جاري البحث عن الأماكن...
        </p>
      )}

      {error && (
        <p className="location-map-error" role="alert">
          {error}
        </p>
      )}

      {showSuggestions && results.length > 0 && (
        <section className="location-search-results">
          <p>اختار المكان الصحيح:</p>

          {results.map((result) => (
            <button
              type="button"
              key={result.place_id}
              className="location-result-item"
              onClick={() => selectPlace(result)}
            >
              <span aria-hidden="true">📍</span>
              <span>{result.display_name}</span>
            </button>
          ))}
        </section>
      )}

      <section className="location-map-frame">
        <MapContainer
          center={[30.0444, 31.2357]}
          zoom={11}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClick onSelect={selectMapLocation} />

          <MoveMap position={position} />

          {position && (
            <Marker position={position} icon={blueMarker} />
          )}
        </MapContainer>
      </section>

      <div className="location-map-hint">
        اضغط على الخريطة لتحديد الموقع بدقة، أو ابحث عن اسم المنطقة أو الشارع.
      </div>

      {position && (
        <div className="location-map-footer">
          <p>{address}</p>

          <button
            type="button"
            onClick={confirmLocation}
            className="location-confirm"
          >
            {t.confirmLocation}
          </button>
        </div>
      )}
    </main>
  );
}
