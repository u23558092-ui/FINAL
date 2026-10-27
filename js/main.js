// ==========================================
// 1. Initialize Leaflet Map
// ==========================================
const map = L.map('map').setView([-25.7545, 28.2314], 16);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// ==========================================
// 2. Simplified Layer Configuration Array
// ==========================================
const layerConfigs = [
  { id: 'Benches', file: 'Benches.geojson', countId: 'benchCount', color: '#007bff', radius: 5, title: 'Bench', group: L.layerGroup().addTo(map) },
  { id: 'ChairTables', file: 'ChairTables.geojson', countId: 'chairCount', color: '#17a2b8', radius: 5, title: 'Chair & Table', group: L.layerGroup().addTo(map) },
  { id: 'Food', file: 'FoodLocations.geojson', countId: 'foodCount', color: '#dc3545', radius: 7, title: 'Food Location', group: L.layerGroup().addTo(map) },
  { id: 'Grass', file: 'GrassSeating.geojson', countId: 'grassCount', color: '#ffc107', radius: 6, title: 'Grass Seating', group: L.layerGroup().addTo(map) },
  { id: 'Informal', file: 'InformalSeating.geojson', countId: 'informalCount', color: '#6c757d', radius: 6, title: 'Informal Seating', group: L.layerGroup().addTo(map) },
  { id: 'Lectures', file: 'LectureVenues.geojson', countId: 'lectureCount', color: '#28a745', radius: 8, title: 'Lecture Venue', group: L.layerGroup().addTo(map) }
];

const datasetStore = {};

// ==========================================
// 3. Load GeoJSON Datasets Asynchronously
// ==========================================
async function loadCampusData() {
  const fetchLayer = async (file) => {
    try {
      const response = await fetch(`data/${file}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      console.warn(`Skipping ${file} due to error:`, err);
      return { type: "FeatureCollection", features: [] };
    }
  };

  const results = await Promise.all(layerConfigs.map(cfg => fetchLayer(cfg.file)));
  layerConfigs.forEach((cfg, idx) => {
    datasetStore[cfg.id] = results[idx];
  });

  renderMapLayers();
}

// ==========================================
// 4. Render Layers & Update Metrics
// ==========================================
function renderMapLayers() {
  layerConfigs.forEach(cfg => {
    cfg.group.clearLayers();
    let count = 0;

    const geoData = datasetStore[cfg.id];
    if (!geoData) return;

    L.geoJSON(geoData, {
      pointToLayer: (feat, latlng) => L.circleMarker(latlng, {
        radius: cfg.radius,
        fillColor: cfg.color,
        color: '#ffffff',
        weight: 1,
        fillOpacity: 0.8
      }),
      onEachFeature: (feature, layer) => {
        count++;
        const p = feature.properties || {};
        const displayName = p.Name || p.Location || cfg.title;
        
        layer.bindPopup(`<h6>${displayName}</h6>`);
      }
    }).addTo(cfg.group);

    const countElem = document.getElementById(cfg.countId);
    if (countElem) countElem.textContent = count;
  });
}

// Start application
loadCampusData();