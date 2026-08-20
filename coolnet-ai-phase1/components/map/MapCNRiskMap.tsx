"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type MapLibreMap = maplibregl.Map;
type Popup = maplibregl.Popup;

import type { WardSummary } from "@/lib/types";
import { RISK_COLORS } from "@/lib/utils/risk";
import {
  MapControls,
  MapLegend,
  MapLayerSwitcher,
  MapBreadcrumb,
  TimeControlBar,
  DataStatusBadge,
  MapActiveLayer,
} from "@/components/ui/mapcn";

export interface MapCNRiskMapProps {
  summaries: WardSummary[];
  selectedWardId: string | null;
  onSelectWard: (wardId: string) => void;
  focusCenter?: [number, number] | null;
}

const INDIA_CENTER: [number, number] = [78.9629, 22.5937]; // [lng, lat]
const INDIA_DEFAULT_ZOOM = 4.6;

export function MapCNRiskMap({
  summaries,
  selectedWardId,
  onSelectWard,
  focusCenter,
}: MapCNRiskMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const popupRef = useRef<Popup | null>(null);

  const [activeLayer, setActiveLayer] = useState<MapActiveLayer>("compound");
  const [selectedTime, setSelectedTime] = useState<string>("NOW");
  const [currentZoom, setCurrentZoom] = useState<number>(INDIA_DEFAULT_ZOOM);
  const [breadcrumb, setBreadcrumb] = useState<string[]>(["INDIA"]);

  const [statesGeoJSON, setStatesGeoJSON] = useState<any>(null);
  const [districtsGeoJSON, setDistrictsGeoJSON] = useState<any>(null);
  const [wardsGeoJSON, setWardsGeoJSON] = useState<any>(null);

  // Ward summary lookup map
  const summaryByWard = useMemo(() => {
    const map = new Map<string, WardSummary>();
    summaries.forEach((s) => map.set(s.meta.ward_id, s));
    return map;
  }, [summaries]);

  // Load GeoJSON data files
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetch("/geojson/india-states.geojson").then((r) => r.json()).catch(() => null),
      fetch("/geojson/india-districts.geojson").then((r) => r.json()).catch(() => null),
      fetch("/geojson/delhi-wards.geojson").then((r) => r.json()).catch(() => null),
    ]).then(([states, districts, wards]) => {
      if (!isMounted) return;
      if (states) setStatesGeoJSON(states);
      if (districts) setDistrictsGeoJSON(districts);
      if (wards) setWardsGeoJSON(wards);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute color based on value & layer
  const getColorForMetric = (props: any, layerType: MapActiveLayer) => {
    if (layerType === "compound") {
      const score = props.compound_risk ?? props.compound_score ?? 50;
      if (score >= 80) return RISK_COLORS.CRITICAL;
      if (score >= 60) return RISK_COLORS.HIGH;
      if (score >= 30) return RISK_COLORS.MODERATE;
      return RISK_COLORS.LOW;
    }
    if (layerType === "heat") {
      const hi = props.heat_index ?? 40;
      if (hi >= 48) return "#dc2626"; // Extreme
      if (hi >= 42) return "#f97316"; // High
      if (hi >= 35) return "#eab308"; // Moderate
      return "#10b981"; // Low
    }
    if (layerType === "grid") {
      const grid = props.grid_stress ?? 60;
      if (grid >= 80) return "#9333ea"; // Critical
      if (grid >= 65) return "#f43f5e"; // High
      if (grid >= 40) return "#f59e0b"; // Moderate
      return "#14b8a6"; // Low
    }
    if (layerType === "vulnerability") {
      const vuln = props.vulnerability ?? 50;
      if (vuln >= 80) return "#4f46e5"; // Severe
      if (vuln >= 60) return "#3b82f6"; // High
      if (vuln >= 40) return "#0284c7"; // Moderate
      return "#06b6d4"; // Low
    }
    if (layerType === "temperature") {
      const t = props.temperature ?? 38;
      if (t >= 42) return "#dc2626";
      if (t >= 38) return "#f97316";
      if (t >= 32) return "#eab308";
      return "#10b981";
    }
    return "#3b82f6";
  };

  // Initialize MapLibre GL map instance
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          "carto-dark": {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
              "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
              "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
              "https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
            ],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
          },
        },
        layers: [
          {
            id: "carto-dark-tiles",
            type: "raster",
            source: "carto-dark",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: INDIA_CENTER,
      zoom: INDIA_DEFAULT_ZOOM,
      attributionControl: false,
    });

    mapRef.current = map;

    popupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: "coolnet-mapcn-popup",
    });

    map.on("zoom", () => {
      setCurrentZoom(map.getZoom());
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Add / Update Map Sources and Layers when GeoJSON data or activeLayer changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const setupLayers = () => {
      // 1. STATES LAYER
      if (statesGeoJSON && statesGeoJSON.features) {
        const enrichedStates = {
          ...statesGeoJSON,
          features: statesGeoJSON.features.map((f: any, idx: number) => ({
            ...f,
            id: idx + 1,
            properties: {
              ...f.properties,
              color: getColorForMetric(f.properties, activeLayer),
            },
          })),
        };

        if (map.getSource("india-states-src")) {
          (map.getSource("india-states-src") as maplibregl.GeoJSONSource).setData(enrichedStates);
        } else {
          map.addSource("india-states-src", {
            type: "geojson",
            data: enrichedStates,
            generateId: true,
          });

          // States Fill
          map.addLayer({
            id: "states-fill",
            type: "fill",
            source: "india-states-src",
            maxzoom: 6.5,
            paint: {
              "fill-color": ["get", "color"],
              "fill-opacity": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                0.85,
                0.55,
              ],
            },
          });

          // States Outline
          map.addLayer({
            id: "states-outline",
            type: "line",
            source: "india-states-src",
            maxzoom: 6.5,
            paint: {
              "line-color": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                "#3b82f6",
                "#0f172a",
              ],
              "line-width": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                2.5,
                1.2,
              ],
            },
          });

          let stateHoverId: string | number | null = null;

          map.on("mousemove", "states-fill", (e) => {
            if (e.features && e.features.length > 0) {
              map.getCanvas().style.cursor = "pointer";
              if (stateHoverId !== null) {
                map.setFeatureState({ source: "india-states-src", id: stateHoverId }, { hover: false });
              }
              const feature = e.features[0];
              stateHoverId = feature.id as number;
              map.setFeatureState({ source: "india-states-src", id: stateHoverId }, { hover: true });

              const p = feature.properties;
              const html = `
                <div style="font-family: inherit; padding: 4px; min-width: 170px;">
                  <div style="font-weight: 800; font-size: 14px; color: #38bdf8; text-transform: uppercase; margin-bottom: 4px;">
                    ${p.state_name}
                  </div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px; font-size: 11px;">
                    <div><span style="color: #64748b;">Temp:</span> <strong style="color: #f1f5f9;">${p.temperature}°C</strong></div>
                    <div><span style="color: #64748b;">Heat Index:</span> <strong style="color: #f1f5f9;">${p.heat_index}°C</strong></div>
                    <div><span style="color: #64748b;">Grid Stress:</span> <strong style="color: #f1f5f9;">${p.grid_stress}%</strong></div>
                    <div><span style="color: #64748b;">Compound Risk:</span> <strong style="color: #f1f5f9;">${p.compound_risk}/100</strong></div>
                  </div>
                </div>
              `;
              popupRef.current?.setLngLat(e.lngLat).setHTML(html).addTo(map);
            }
          });

          map.on("mouseleave", "states-fill", () => {
            map.getCanvas().style.cursor = "";
            if (stateHoverId !== null) {
              map.setFeatureState({ source: "india-states-src", id: stateHoverId }, { hover: false });
              stateHoverId = null;
            }
            popupRef.current?.remove();
          });

          // State Click -> Zoom to State & Update Breadcrumb
          map.on("click", "states-fill", (e) => {
            if (e.features && e.features.length > 0) {
              const p = e.features[0].properties;
              const center = JSON.parse(p.centroid || "[78, 20]");
              setBreadcrumb(["INDIA", p.state_name]);
              map.flyTo({
                center: center,
                zoom: 6.8,
                duration: 900,
                essential: true,
              });
            }
          });
        }
      }

      // 2. DISTRICTS LAYER
      if (districtsGeoJSON && districtsGeoJSON.features) {
        const enrichedDistricts = {
          ...districtsGeoJSON,
          features: districtsGeoJSON.features.map((f: any, idx: number) => ({
            ...f,
            id: idx + 100,
            properties: {
              ...f.properties,
              color: getColorForMetric(f.properties, activeLayer),
            },
          })),
        };

        if (map.getSource("india-districts-src")) {
          (map.getSource("india-districts-src") as maplibregl.GeoJSONSource).setData(enrichedDistricts);
        } else {
          map.addSource("india-districts-src", {
            type: "geojson",
            data: enrichedDistricts,
            generateId: true,
          });

          map.addLayer({
            id: "districts-fill",
            type: "fill",
            source: "india-districts-src",
            minzoom: 6.0,
            maxzoom: 9.0,
            paint: {
              "fill-color": ["get", "color"],
              "fill-opacity": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                0.85,
                0.6,
              ],
            },
          });

          map.addLayer({
            id: "districts-outline",
            type: "line",
            source: "india-districts-src",
            minzoom: 6.0,
            maxzoom: 9.0,
            paint: {
              "line-color": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                "#3b82f6",
                "#05070a",
              ],
              "line-width": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                2.5,
                1.0,
              ],
            },
          });

          let districtHoverId: string | number | null = null;

          map.on("mousemove", "districts-fill", (e) => {
            if (e.features && e.features.length > 0) {
              map.getCanvas().style.cursor = "pointer";
              if (districtHoverId !== null) {
                map.setFeatureState({ source: "india-districts-src", id: districtHoverId }, { hover: false });
              }
              const feature = e.features[0];
              districtHoverId = feature.id as number;
              map.setFeatureState({ source: "india-districts-src", id: districtHoverId }, { hover: true });

              const p = feature.properties;
              const html = `
                <div style="font-family: inherit; padding: 4px; min-width: 170px;">
                  <div style="font-weight: 800; font-size: 13px; color: #f8fafc; text-transform: uppercase;">${p.district_name}</div>
                  <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">${p.state_name} District</div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px; font-size: 11px;">
                    <div><span style="color: #64748b;">Temp:</span> <strong style="color: #f1f5f9;">${p.temperature}°C</strong></div>
                    <div><span style="color: #64748b;">Heat Index:</span> <strong style="color: #f1f5f9;">${p.heat_index}°C</strong></div>
                    <div><span style="color: #64748b;">Grid Stress:</span> <strong style="color: #f1f5f9;">${p.grid_stress}%</strong></div>
                    <div><span style="color: #64748b;">Compound Risk:</span> <strong style="color: #f1f5f9;">${p.compound_risk}/100</strong></div>
                  </div>
                </div>
              `;
              popupRef.current?.setLngLat(e.lngLat).setHTML(html).addTo(map);
            }
          });

          map.on("mouseleave", "districts-fill", () => {
            map.getCanvas().style.cursor = "";
            if (districtHoverId !== null) {
              map.setFeatureState({ source: "india-districts-src", id: districtHoverId }, { hover: false });
              districtHoverId = null;
            }
            popupRef.current?.remove();
          });

          // District Click -> Zoom to District Wards & Update Breadcrumb
          map.on("click", "districts-fill", (e) => {
            if (e.features && e.features.length > 0) {
              const p = e.features[0].properties;
              const center = JSON.parse(p.centroid || "[77, 28]");
              setBreadcrumb(["INDIA", p.state_name, p.district_name]);
              map.flyTo({
                center: center,
                zoom: 11.2,
                duration: 900,
                essential: true,
              });
            }
          });
        }
      }

      // 3. WARDS LAYER
      if (wardsGeoJSON && wardsGeoJSON.features) {
        const enrichedWards = {
          ...wardsGeoJSON,
          features: wardsGeoJSON.features.map((f: any, idx: number) => {
            const wardId = f.properties?.ward_id || `W-${String(idx + 1).padStart(2, "0")}`;
            const summary = summaryByWard.get(wardId);
            const score = summary?.compoundRisk.compound_risk_score ?? 50;
            const level = summary?.compoundRisk.risk_level ?? "LOW";
            const color = getColorForMetric(
              {
                compound_risk: score,
                heat_index: summary?.snapshot.heat_index ?? 42,
                grid_stress: summary?.snapshot.grid_stress ?? 60,
                vulnerability: summary?.snapshot.vulnerability_score ?? 50,
                temperature: summary?.snapshot.temperature ?? 38,
              },
              activeLayer
            );

            return {
              ...f,
              id: idx + 500,
              properties: {
                ...f.properties,
                ward_id: wardId,
                name: summary?.meta.name || f.properties?.name || `Ward ${idx + 1}`,
                district: summary?.meta.region || f.properties?.district || "Delhi Metro",
                compound_score: score,
                risk_level: level,
                color: color,
                temperature: summary?.snapshot.temperature ?? 38.5,
                humidity: summary?.snapshot.humidity ?? 45,
                grid_stress: summary?.snapshot.grid_stress ?? 60,
                vulnerability: summary?.snapshot.vulnerability_score ?? 50,
              },
            };
          }),
        };

        if (map.getSource("coolnet-wards-src")) {
          (map.getSource("coolnet-wards-src") as maplibregl.GeoJSONSource).setData(enrichedWards);
        } else {
          map.addSource("coolnet-wards-src", {
            type: "geojson",
            data: enrichedWards,
            generateId: true,
          });

          map.addLayer({
            id: "wards-fill",
            type: "fill",
            source: "coolnet-wards-src",
            minzoom: 8.8,
            paint: {
              "fill-color": ["get", "color"],
              "fill-opacity": [
                "case",
                ["boolean", ["feature-state", "selected"], false],
                0.85,
                ["boolean", ["feature-state", "hover"], false],
                0.8,
                0.6,
              ],
            },
          });

          map.addLayer({
            id: "wards-outline",
            type: "line",
            source: "coolnet-wards-src",
            minzoom: 8.8,
            paint: {
              "line-color": [
                "case",
                ["boolean", ["feature-state", "selected"], false],
                "#f4f6f9",
                ["boolean", ["feature-state", "hover"], false],
                "#3b82f6",
                "#05070a",
              ],
              "line-width": [
                "case",
                ["boolean", ["feature-state", "selected"], false],
                2.5,
                ["boolean", ["feature-state", "hover"], false],
                2.0,
                1.0,
              ],
            },
          });

          let wardHoverId: string | number | null = null;

          map.on("mousemove", "wards-fill", (e) => {
            if (e.features && e.features.length > 0) {
              map.getCanvas().style.cursor = "pointer";
              if (wardHoverId !== null) {
                map.setFeatureState({ source: "coolnet-wards-src", id: wardHoverId }, { hover: false });
              }
              const feature = e.features[0];
              wardHoverId = feature.id as number;
              map.setFeatureState({ source: "coolnet-wards-src", id: wardHoverId }, { hover: true });

              const p = feature.properties;
              const html = `
                <div style="font-family: inherit; padding: 4px; min-width: 170px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
                    <span style="font-weight: 700; font-size: 13px; color: #f8fafc;">${p.name}</span>
                    <span style="background-color: ${p.color}; color: #020617; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
                      ${p.risk_level}
                    </span>
                  </div>
                  <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">${p.district}</div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px; font-size: 11px;">
                    <div><span style="color: #64748b;">Risk:</span> <strong style="color: #f1f5f9;">${p.compound_score}/100</strong></div>
                    <div><span style="color: #64748b;">Temp:</span> <strong style="color: #f1f5f9;">${p.temperature}°C</strong></div>
                    <div><span style="color: #64748b;">Grid Stress:</span> <strong style="color: #f1f5f9;">${p.grid_stress}%</strong></div>
                    <div><span style="color: #64748b;">Vulnerability:</span> <strong style="color: #f1f5f9;">${p.vulnerability}</strong></div>
                  </div>
                </div>
              `;
              popupRef.current?.setLngLat(e.lngLat).setHTML(html).addTo(map);
            }
          });

          map.on("mouseleave", "wards-fill", () => {
            map.getCanvas().style.cursor = "";
            if (wardHoverId !== null) {
              map.setFeatureState({ source: "coolnet-wards-src", id: wardHoverId }, { hover: false });
              wardHoverId = null;
            }
            popupRef.current?.remove();
          });

          // Ward Click -> Updates Dashboard Selected Ward State
          map.on("click", "wards-fill", (e) => {
            if (e.features && e.features.length > 0) {
              const p = e.features[0].properties;
              if (p.ward_id) {
                onSelectWard(p.ward_id);
                setBreadcrumb(["INDIA", "DELHI", p.district || "CENTRAL DELHI", p.name]);
              }
            }
          });
        }
      }
    };

    if (map.isStyleLoaded()) {
      setupLayers();
    } else {
      map.once("load", setupLayers);
    }
  }, [statesGeoJSON, districtsGeoJSON, wardsGeoJSON, activeLayer, summaryByWard, onSelectWard]);

  // Handle selected ward feature state highlight
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !wardsGeoJSON || !wardsGeoJSON.features) return;

    wardsGeoJSON.features.forEach((feature: any, idx: number) => {
      const wardId = feature.properties?.ward_id;
      const isSelected = wardId === selectedWardId;
      try {
        if (map.getLayer("wards-fill")) {
          map.setFeatureState(
            { source: "coolnet-wards-src", id: idx + 500 },
            { selected: isSelected }
          );
        }
      } catch (err) {}
    });
  }, [selectedWardId, wardsGeoJSON]);

  // Handle flyTo when focusCenter changes
  useEffect(() => {
    const map = mapRef.current;
    if (map && focusCenter) {
      map.flyTo({
        center: [focusCenter[1], focusCenter[0]], // [lng, lat]
        zoom: 12.5,
        duration: 900,
        essential: true,
      });
    }
  }, [focusCenter]);

  // Controls Handlers
  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleResetView = () => {
    setBreadcrumb(["INDIA"]);
    mapRef.current?.flyTo({
      center: INDIA_CENTER,
      zoom: INDIA_DEFAULT_ZOOM,
      duration: 900,
    });
  };

  const handleResetToLevel = (levelIndex: number) => {
    const newBreadcrumb = breadcrumb.slice(0, levelIndex + 1);
    setBreadcrumb(newBreadcrumb);

    if (levelIndex === 0) {
      handleResetView();
    } else if (levelIndex === 1) {
      // Zoom back to State level
      const stateName = newBreadcrumb[1];
      const stateFeat = statesGeoJSON?.features?.find((f: any) => f.properties.state_name === stateName);
      if (stateFeat) {
        mapRef.current?.flyTo({
          center: stateFeat.properties.centroid,
          zoom: 6.8,
          duration: 800,
        });
      }
    } else if (levelIndex === 2) {
      // Zoom back to District level
      const districtName = newBreadcrumb[2];
      const districtFeat = districtsGeoJSON?.features?.find((f: any) => f.properties.district_name === districtName);
      if (districtFeat) {
        mapRef.current?.flyTo({
          center: districtFeat.properties.centroid,
          zoom: 11.2,
          duration: 800,
        });
      }
    }
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-base-950">
      {/* MapLibre Container */}
      <div ref={containerRef} className="h-full w-full" />

      {/* Top Left: Breadcrumb & Data Status Badge */}
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col gap-2">
        <MapBreadcrumb
          breadcrumbPath={breadcrumb}
          onResetToLevel={handleResetToLevel}
          className="pointer-events-auto"
        />
        <DataStatusBadge className="pointer-events-auto" />
      </div>

      {/* Top Right: Layer Switcher & Time Control */}
      <div className="pointer-events-none absolute right-3 top-3 z-10 flex flex-col items-end gap-2">
        <MapLayerSwitcher
          activeLayer={activeLayer}
          onChangeLayer={setActiveLayer}
          className="pointer-events-auto"
        />
        <TimeControlBar
          selectedTime={selectedTime}
          onSelectTime={setSelectedTime}
          className="pointer-events-auto"
        />
      </div>

      {/* Bottom Right: Controls & Dynamic Legend */}
      <div className="pointer-events-none absolute bottom-4 right-4 z-10 flex flex-col items-end gap-3">
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetView={handleResetView}
          onToggleFullscreen={handleToggleFullscreen}
          className="pointer-events-auto"
        />
        <MapLegend activeLayer={activeLayer} className="pointer-events-auto" />
      </div>
    </div>
  );
}
