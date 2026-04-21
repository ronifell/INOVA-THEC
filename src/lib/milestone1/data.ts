import { API_URL } from "@/lib/apiPublic";
import type {
  DemoData,
  IntegrityRow,
  MotorResult,
  PatrimonyTimelineEvent,
} from "./types";

/** Fast fallback when API is unreachable (e.g. dev without backend). Override via NEXT_PUBLIC_API_FETCH_TIMEOUT_MS. */
function apiFetchTimeoutMs(): number {
  const raw = Number(
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_API_FETCH_TIMEOUT_MS
      : undefined
  );
  if (Number.isFinite(raw) && raw >= 500 && raw <= 60000) return raw;
  return 2500;
}

/** Fallback quando API e mock falham ou excedem tempo. */
export const EMPTY_DEMO_MOTOR_DATA: DemoData = {
  abastecimentos: [],
  resultados_motor_glosa: [],
  resumo_dashboard: {
    economia_gerada: 0,
    valor_total_transacoes: 0,
    valor_glosado: 0,
    total_transacoes: 0,
  },
};

const EMPTY = EMPTY_DEMO_MOTOR_DATA;

/**
 * Loads demo motor data.
 * Default: mock JSON and API run in parallel — first success wins (mock is usually instant).
 * Set `NEXT_PUBLIC_MOTOR_FETCH_PRIORITY=api` to try API first, then mock (legacy behaviour).
 */
export async function fetchDemoMotor(): Promise<DemoData> {
  const apiFirst =
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_MOTOR_FETCH_PRIORITY === "api";

  const loadMock = async (signal?: AbortSignal): Promise<DemoData> => {
    const res = await fetch("/mock/DB.json", { signal });
    if (!res.ok) throw new Error("mock");
    return (await res.json()) as DemoData;
  };

  const loadApi = async (signal: AbortSignal): Promise<DemoData> => {
    const res = await fetch(`${API_URL}/auditoria/motor`, { signal });
    if (!res.ok) throw new Error("api");
    return (await res.json()) as DemoData;
  };

  if (apiFirst) {
    const ctrl = new AbortController();
    const t = window.setTimeout(() => ctrl.abort(), apiFetchTimeoutMs());
    try {
      return await loadApi(ctrl.signal);
    } catch {
      try {
        return await loadMock();
      } catch {
        return EMPTY;
      }
    } finally {
      window.clearTimeout(t);
    }
  }

  const mockCtrl = new AbortController();
  const apiCtrl = new AbortController();
  const apiTimeout = window.setTimeout(() => apiCtrl.abort(), apiFetchTimeoutMs());
  /** Evita Promise.any pendente para sempre se GET /mock/DB.json nunca resolver (rede). */
  const mockHangGuard = window.setTimeout(() => mockCtrl.abort(), 10000);

  const mockRace = (async () => {
    try {
      const data = await loadMock(mockCtrl.signal);
      apiCtrl.abort();
      return data;
    } finally {
      window.clearTimeout(mockHangGuard);
    }
  })();

  const apiRace = (async () => {
    try {
      const data = await loadApi(apiCtrl.signal);
      mockCtrl.abort();
      return data;
    } finally {
      window.clearTimeout(apiTimeout);
    }
  })();

  try {
    return await Promise.any([mockRace, apiRace]);
  } catch {
    return EMPTY;
  }
}

export async function sha256Hex(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function buildIntegrityRows(data: DemoData): Promise<IntegrityRow[]> {
  const departments = [
    "Operações",
    "Saúde",
    "Educação",
    "Infraestrutura",
    "Administração",
  ];
  return Promise.all(
    data.abastecimentos.map(async (item, index) => {
      const payload = `${item.cod_transaction}|${item.transaction_date}|${item.license_plate}|${item.driver_name}|${item.liters}|${item.emission_value}`;
      const calculatedHash = await sha256Hex(payload);
      const providedHash = item.integrityHash || "";
      return {
        id: item.id,
        date: item.transaction_date.slice(0, 10),
        department: departments[index % departments.length]!,
        plate: item.license_plate,
        liters: item.liters,
        amount: item.emission_value,
        providedHash,
        calculatedHash,
        verified: !!providedHash,
      };
    })
  );
}

export function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getMapDistanceMeters(record: MotorResult): number {
  const vehicleLat = record.postoLat + (record.id % 2 ? 0.0028 : 0.0095);
  const vehicleLng = record.postoLng + (record.id % 2 ? 0.0015 : 0.009);
  return haversineMeters(record.postoLat, record.postoLng, vehicleLat, vehicleLng);
}

export function isAutomaticDeduction(record: MotorResult): boolean {
  return getMapDistanceMeters(record) > 500;
}

export function mockDepartment(index: number): string {
  const departments = [
    "Operações",
    "Saúde",
    "Educação",
    "Infraestrutura",
    "Administração",
  ];
  return departments[index % departments.length]!;
}

export function buildDefaultTimeline(
  base: MotorResult | undefined,
  latestIso: string
): PatrimonyTimelineEvent[] {
  if (!base) return [];
  const tombo = base.placa ?? "TOMBO-DEMO";
  const h = (suffix: string) =>
    base.integrityHash
      ? `${base.integrityHash.slice(0, 24)}${suffix}`
      : `a1f2c9${tombo}${suffix}`.padEnd(64, "0").slice(0, 64);
  return [
    {
      id: "ev-1",
      kind: "tombamento",
      title: "Tombamento inicial",
      detail: `Registro definitivo do bem ${tombo} — livro tombo digital AP04.`,
      at: "2023-08-14T09:22:00-05:00",
      integrityHash: h("01"),
    },
    {
      id: "ev-2",
      kind: "cautela",
      title: "Termo de cautela",
      detail:
        "Responsabilidade formal do gestor e vinculação ao inventário SIG-PATRIMÔNIO.",
      at: "2024-01-20T14:05:00-05:00",
      integrityHash: h("02"),
      tampered: true,
    },
    {
      id: "ev-3",
      kind: "vistoria",
      title: "Vistoria 1 — censo",
      detail: "Georreferenciamento e índice de conservação homologados.",
      at: "2024-06-02T11:40:00-05:00",
      integrityHash: h("03"),
    },
    {
      id: "ev-4",
      kind: "vistoria",
      title: "Vistoria 2 — fé pública (hoje)",
      detail: "Captura AP04 com carimbo dinâmico GPS + timestamp — trilha ativa.",
      at: latestIso,
      integrityHash: h("04"),
    },
  ];
}
