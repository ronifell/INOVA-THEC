"use client";

import { useEffect, useRef } from "react";
import type { DemoData, MotorResult } from "@/lib/milestone1/types";
import { isAutomaticDeduction } from "@/lib/milestone1/data";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type MapMode = "fuel" | "assets";

type Props = {
  mode: MapMode;
  demoData: DemoData;
  selected: MotorResult | undefined;
  onSelect: (r: MotorResult) => void;
  onMarkerClick: (r: MotorResult) => void;
  mapKey: string;
};

function patrimonyRefIcon(index: number): string {
  const icons = ["🏛", "🏛", "📍", "⛪", "🏢"];
  return icons[index % icons.length]!;
}

function assetIconLabel(index: number): string {
  const icons = ["🏛", "🏢", "📍", "⛪", "🗿"];
  return icons[index % icons.length]!;
}

export default function Milestone1Map({
  mode,
  demoData,
  selected,
  onSelect,
  onMarkerClick,
  mapKey,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const assetMode = mode === "assets";
  const paintRef = useRef<() => void>(() => {});

  paintRef.current = () => {
    const map = mapRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (
        layer instanceof L.Marker ||
        layer instanceof L.Polyline ||
        layer instanceof L.Circle
      ) {
        map.removeLayer(layer);
      }
    });

    const bounds = map.getBounds();
    const rows = demoData.resultados_motor_glosa;
    const viewport = rows.filter((record) =>
      bounds.contains(L.latLng(record.postoLat, record.postoLng))
    );
    const dataToRender = viewport.length ? viewport : rows;

    dataToRender.forEach((record, idx) => {
      const vehicleLat = record.postoLat + (record.id % 2 ? 0.0028 : 0.0095);
      const vehicleLng = record.postoLng + (record.id % 2 ? 0.0015 : 0.009);
      const automaticDeduction = isAutomaticDeduction(record);
      const isSel = selected?.id === record.id;
      const color = automaticDeduction ? "#d7263d" : "#1f8b4c";

      const postoGlyph = assetMode ? patrimonyRefIcon(idx) : "⛽";
      const postoIcon = L.divIcon({
        className: "m1-leaflet-marker",
        html: `<span class="map-live-pulse" style="animation-delay:${(idx * 0.11).toFixed(2)}s;font-size:17px">${postoGlyph}</span>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const pulseWarn = automaticDeduction ? " map-live-pulse--warn" : "";
      const dropClass = assetMode ? " asset-drop" : "";
      const assetLabel = assetMode ? assetIconLabel(idx) : "A/E";
      const pinTitle = assetMode ? "Bem patrimonial" : "Ativo / equipamento";
      const fuelGps = !assetMode
        ? `<span class="map-fuel-gps-radar${pulseWarn}" style="animation-delay:${(idx * 0.09).toFixed(2)}s" title="Posição GPS monitorada"></span>`
        : "";
      const assetInner = !assetMode ? fuelGps : assetLabel;
      const assetHtml = isSel
        ? `<span class="asset-pin asset-pin-selected map-live-pulse${pulseWarn}${dropClass}" style="animation-delay:${(idx * 0.09).toFixed(2)}s" title="${pinTitle}">${assetInner}</span>`
        : `<span class="asset-pin map-live-pulse${pulseWarn}${dropClass}" style="animation-delay:${(idx * 0.09).toFixed(2)}s" title="${pinTitle}">${assetInner}</span>`;

      const assetIcon = L.divIcon({
        className: "m1-leaflet-marker",
        html: assetHtml,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      L.marker([record.postoLat, record.postoLng], { icon: postoIcon }).addTo(
        map
      );
      const assetMarker = L.marker([vehicleLat, vehicleLng], {
        icon: assetIcon,
      }).addTo(map);
      assetMarker.on("click", () => {
        onSelect(record);
        onMarkerClick(record);
      });

      L.polyline(
        [
          [record.postoLat, record.postoLng],
          [vehicleLat, vehicleLng],
        ],
        {
          color,
          weight: 3,
          dashArray: automaticDeduction ? "8 6" : undefined,
        }
      ).addTo(map);
    });

    if (!assetMode && selected) {
      L.circle([selected.postoLat, selected.postoLng], {
        radius: 350,
        color: "#11CDEF",
        weight: 2,
        dashArray: "10 14",
        fill: false,
      }).addTo(map);
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !demoData.resultados_motor_glosa.length) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(el, { zoomControl: true }).setView(
      [-15.601411, -56.097892],
      11
    );
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const onMove = () => paintRef.current();
    onMove();
    map.on("moveend", onMove);

    return () => {
      map.off("moveend", onMove);
      map.remove();
      mapRef.current = null;
    };
  }, [demoData, mapKey]);

  useEffect(() => {
    paintRef.current();
  }, [selected, demoData, assetMode]);

  useEffect(() => {
    const m = mapRef.current;
    if (!m || !selected) return;
    const vehicleLat = selected.postoLat + (selected.id % 2 ? 0.0028 : 0.0095);
    const vehicleLng = selected.postoLng + (selected.id % 2 ? 0.0015 : 0.009);
    m.panTo([vehicleLat, vehicleLng], { animate: true });
  }, [selected]);

  return (
    <div
      ref={containerRef}
      className="m1-leaflet-root h-full min-h-0 w-full rounded-xl overflow-hidden border border-white/10"
    />
  );
}
