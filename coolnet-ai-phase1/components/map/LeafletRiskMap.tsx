"use client";

import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
import type { Layer, LeafletMouseEvent } from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import type { WardSummary } from "@/lib/types";
import { CITY_META, DEMO_WARD_GEOMETRY } from "@/lib/data/mockWards";
import { RISK_COLORS } from "@/lib/utils/risk";

function FlyToWard({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, Math.max(map.getZoom(), 13), { duration: 0.6 });
    }
  }, [center, map]);
  return null;
}

export function LeafletRiskMap({
  summaries,
  selectedWardId,
  onSelectWard,
  focusCenter,
}: {
  summaries: WardSummary[];
  selectedWardId: string | null;
  onSelectWard: (wardId: string) => void;
  focusCenter?: [number, number] | null;
}) {
  const summaryByWard = useMemo(() => {
    const map = new Map<string, WardSummary>();
    summaries.forEach((s) => map.set(s.meta.ward_id, s));
    return map;
  }, [summaries]);

  const featureCollection = useMemo(() => {
    return {
      type: "FeatureCollection" as const,
      features: DEMO_WARD_GEOMETRY.map((g) => ({
        type: "Feature" as const,
        properties: { ward_id: g.ward_id },
        geometry: g.geojson,
      })),
    };
  }, []);

  const geoJsonRef = useRef<any>(null);

  const styleFeature = (feature: any) => {
    const wardId = feature?.properties?.ward_id;
    const summary = summaryByWard.get(wardId);
    const level = summary?.compoundRisk.risk_level ?? "LOW";
    const isSelected = wardId === selectedWardId;
    return {
      color: isSelected ? "#f4f6f9" : "#05070a",
      weight: isSelected ? 2.5 : 1,
      fillColor: RISK_COLORS[level],
      fillOpacity: isSelected ? 0.75 : 0.55,
    };
  };

  const onEachFeature = (feature: any, layer: Layer) => {
    const wardId = feature?.properties?.ward_id;
    const summary = summaryByWard.get(wardId);

    if (summary) {
      layer.bindTooltip(
        `<div style="font-family:inherit">
          <div style="font-weight:600;margin-bottom:2px">${summary.meta.name}</div>
          <div style="font-size:11px;opacity:0.8">Risk ${summary.compoundRisk.compound_risk_score}/100 · ${summary.compoundRisk.risk_level}</div>
        </div>`,
        { sticky: true, className: "coolnet-tooltip" }
      );
    }

    layer.on({
      click: (e: LeafletMouseEvent) => {
        onSelectWard(wardId);
      },
      mouseover: (e: LeafletMouseEvent) => {
        (e.target as any).setStyle({ weight: 2.5, fillOpacity: 0.75 });
      },
      mouseout: (e: LeafletMouseEvent) => {
        if (wardId !== selectedWardId) {
          (e.target as any).setStyle(styleFeature(feature));
        }
      },
    });
  };

  useEffect(() => {
    if (geoJsonRef.current) {
      geoJsonRef.current.setStyle(styleFeature);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWardId, summaryByWard]);

  return (
    <MapContainer
      center={CITY_META.center}
      zoom={CITY_META.defaultZoom}
      zoomControl={true}
      className="h-full w-full"
      preferCanvas
    >
      <TileLayer
        attribution="Demo basemap &copy; OpenStreetMap contributors"
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <GeoJSON
        ref={geoJsonRef}
        data={featureCollection as any}
        style={styleFeature}
        onEachFeature={onEachFeature}
      />
      <FlyToWard center={focusCenter ?? null} />
    </MapContainer>
  );
}
