"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type MapLibreMap = maplibregl.Map;
type Popup = maplibregl.Popup;



import type { WardSummary } from "@/lib/types";
import { CITY_META, DEMO_WARD_GEOMETRY } from "@/lib/data/mockWards";
import { RISK_COLORS } from "@/lib/utils/risk";
import {
  MapControls,
  MapLegend,
  MapLayerSwitcher,
  HonestDataBadge,
  MapActiveLayer,
} from "@/components/ui/mapcn";

export interface MapCNRiskMapProps {
  summaries: WardSummary[];
  selectedWardId: string | null;
  onSelectWard: (wardId: string) => void;
  focusCenter?: [number, number] | null;
}

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
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  // Quick lookup map of ward_id -> WardSummary
  const summaryByWard = useMemo(() => {
    const map = new Map<string, WardSummary>();
    summaries.forEach((s) => map.set(s.meta.ward_id, s));
    return map;
  }, [summaries]);

  // Load GeoJSON from public/geojson/delhi-wards.geojson or fallback to DEMO_WARD_GEOMETRY
  useEffect(() => {
    let isMounted = true;
    fetch("/geojson/delhi-wards.geojson")
      .then((res) => {
        if (!res.ok) throw new Error("Local GeoJSON not found");
        return res.json();
      })
      .then((data) => {
        if (isMounted) setGeoJsonData(data);
      })
      .catch(() => {
        if (isMounted) {
          // Fallback feature collection from DEMO_WARD_GEOMETRY
          setGeoJsonData({
            type: "FeatureCollection",
            features: DEMO_WARD_GEOMETRY.map((g) => ({
              type: "Feature",
              properties: { ward_id: g.ward_id },
              geometry: g.geojson,
            })),
          });
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Build MapLibre GL style & feature collection
  const featureCollection = useMemo(() => {
    if (!geoJsonData || !geoJsonData.features) return null;

    const featuresWithProps = geoJsonData.features.map((feature: any, idx: number) => {
      const wardId = feature.properties?.ward_id || `W-${String(idx + 1).padStart(2, "0")}`;
      const summary = summaryByWard.get(wardId);
      const score = summary?.compoundRisk.compound_risk_score ?? 20;
      const level = summary?.compoundRisk.risk_level ?? "LOW";
      const color = RISK_COLORS[level] || "#22c55e";

      return {
        ...feature,
        id: idx + 1,
        properties: {
          ...feature.properties,
          ward_id: wardId,
          name: summary?.meta.name || feature.properties?.name || `Ward ${idx + 1}`,
          district: summary?.meta.region || feature.properties?.district || "Delhi Metro",
          compound_score: score,
          risk_level: level,
          risk_color: color,
          temperature: summary?.snapshot.temperature ?? 38.5,
          humidity: summary?.snapshot.humidity ?? 45,
          grid_stress: summary?.snapshot.grid_stress ?? 60,
          vulnerability: summary?.snapshot.vulnerability_score ?? 50,
          cooling_access: summary?.snapshot.cooling_access ?? 40,
        },
      };
    });

    return {
      type: "FeatureCollection" as const,
      features: featuresWithProps,
    };
  }, [geoJsonData, summaryByWard]);

  // Initialize MapLibre GL map instance
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Dark Matter raster/vector style configuration for MapLibre
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
      center: [CITY_META.center[1], CITY_META.center[0]], // [lng, lat] in MapLibre
      zoom: CITY_META.defaultZoom,
      attributionControl: false,
    });

    mapRef.current = map;

    popupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: "coolnet-mapcn-popup",
    });

    map.on("load", () => {
      // Source & Layer setup will be triggered by featureCollection effect
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update GeoJSON source & layers when featureCollection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !featureCollection) return;

    const setupSourceAndLayers = () => {
      if (map.getSource("coolnet-wards")) {
        (map.getSource("coolnet-wards") as maplibregl.GeoJSONSource).setData(featureCollection);
      } else {
        map.addSource("coolnet-wards", {
          type: "geojson",
          data: featureCollection,
          generateId: true,
        });

        // Polygon Fill Layer
        map.addLayer({
          id: "wards-fill",
          type: "fill",
          source: "coolnet-wards",
          paint: {
            "fill-color": ["get", "risk_color"],
            "fill-opacity": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              0.85,
              ["boolean", ["feature-state", "selected"], false],
              0.8,
              0.55,
            ],
          },
        });

        // Polygon Outline Layer
        map.addLayer({
          id: "wards-outline",
          type: "line",
          source: "coolnet-wards",
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

        let hoveredId: string | number | null = null;

        // Mouse Hover interactions
        map.on("mousemove", "wards-fill", (e) => {
          if (e.features && e.features.length > 0) {
            map.getCanvas().style.cursor = "pointer";

            if (hoveredId !== null) {
              map.setFeatureState({ source: "coolnet-wards", id: hoveredId }, { hover: false });
            }

            const feature = e.features[0];
            hoveredId = feature.id as number;
            map.setFeatureState({ source: "coolnet-wards", id: hoveredId }, { hover: true });

            const props = feature.properties;
            const html = `
              <div style="font-family: inherit; padding: 4px; min-width: 170px;">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
                  <span style="font-weight: 700; font-size: 13px; color: #f8fafc;">${props.name}</span>
                  <span style="background-color: ${props.risk_color}; color: #020617; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
                    ${props.risk_level}
                  </span>
                </div>
                <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
                  ${props.district}
                </div>
                <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 4px; border-t: 1px solid rgba(255,255,255,0.1); padding-top: 6px; font-size: 11px;">
                  <div>
                    <span style="color: #64748b;">Risk:</span>
                    <strong style="color: #f1f5f9; margin-left: 3px;">${props.compound_score}/100</strong>
                  </div>
                  <div>
                    <span style="color: #64748b;">Temp:</span>
                    <strong style="color: #f1f5f9; margin-left: 3px;">${props.temperature}°C</strong>
                  </div>
                  <div>
                    <span style="color: #64748b;">Grid Stress:</span>
                    <strong style="color: #f1f5f9; margin-left: 3px;">${props.grid_stress}%</strong>
                  </div>
                  <div>
                    <span style="color: #64748b;">Vulnerability:</span>
                    <strong style="color: #f1f5f9; margin-left: 3px;">${props.vulnerability}</strong>
                  </div>
                </div>
              </div>
            `;

            if (popupRef.current) {
              popupRef.current.setLngLat(e.lngLat).setHTML(html).addTo(map);
            }
          }
        });

        // Mouse Leave interactions
        map.on("mouseleave", "wards-fill", () => {
          map.getCanvas().style.cursor = "";
          if (hoveredId !== null) {
            map.setFeatureState({ source: "coolnet-wards", id: hoveredId }, { hover: false });
            hoveredId = null;
          }
          if (popupRef.current) popupRef.current.remove();
        });

        // Click Interaction -> Updates selected ward in dashboard
        map.on("click", "wards-fill", (e) => {
          if (e.features && e.features.length > 0) {
            const wardId = e.features[0].properties?.ward_id;
            if (wardId) {
              onSelectWard(wardId);
            }
          }
        });
      }
    };

    if (map.isStyleLoaded()) {
      setupSourceAndLayers();
    } else {
      map.once("load", setupSourceAndLayers);
    }
  }, [featureCollection, onSelectWard]);

  // Handle selected Ward state styling in MapLibre
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !featureCollection) return;

    featureCollection.features.forEach((feature: any) => {
      const wardId = feature.properties.ward_id;
      const isSelected = wardId === selectedWardId;
      try {
        if (map.getLayer("wards-fill")) {
          map.setFeatureState(
            { source: "coolnet-wards", id: feature.id },
            { selected: isSelected }
          );
        }
      } catch (err) {
        // Feature state set during initialization gracefully ignored
      }
    });
  }, [selectedWardId, featureCollection]);

  // Handle flyTo when focusCenter changes
  useEffect(() => {
    const map = mapRef.current;
    if (map && focusCenter) {
      map.flyTo({
        center: [focusCenter[1], focusCenter[0]], // [lng, lat]
        zoom: 13,
        duration: 800,
        essential: true,
      });
    }
  }, [focusCenter]);

  // Controls Handlers
  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleResetView = () => {
    mapRef.current?.flyTo({
      center: [CITY_META.center[1], CITY_META.center[0]],
      zoom: CITY_META.defaultZoom,
      duration: 800,
    });
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

      {/* Top Left: Honest Data Badge */}
      <div className="pointer-events-none absolute left-3 top-3 z-10">
        <HonestDataBadge className="pointer-events-auto" />
      </div>

      {/* Top Right: Layer Switcher */}
      <div className="pointer-events-none absolute right-3 top-3 z-10">
        <MapLayerSwitcher
          activeLayer={activeLayer}
          onChangeLayer={setActiveLayer}
          className="pointer-events-auto"
        />
      </div>

      {/* Bottom Right: Legend & Controls */}
      <div className="pointer-events-none absolute bottom-4 right-4 z-10 flex flex-col items-end gap-3">
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetView={handleResetView}
          onToggleFullscreen={handleToggleFullscreen}
          className="pointer-events-auto"
        />
        <MapLegend className="pointer-events-auto" />
      </div>
    </div>
  );
}
