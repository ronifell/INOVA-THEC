export type MilestoneHubView =
  | "hub"
  | "governance"
  | "fuel-map"
  | "fuel-reserve"
  | "fuel-integrity"
  | "assets-map"
  | "assets-report"
  | "assets-timeline";

export interface MotorResult {
  id: number;
  transacaoId: string;
  transacaoTimestamp: string;
  placa: string;
  postoLat: number;
  postoLng: number;
  volumeLitros: number;
  valorTotal: number;
  glosaStatus: string;
  observacao: string;
  integrityHash: string;
}

export interface Supply {
  id: number;
  cod_transaction: string;
  transaction_date: string;
  license_plate: string;
  driver_name: string;
  liters: number;
  emission_value: number;
  cidade: string;
  UF?: string;
  nome_estabelecimento?: string;
  integrityHash: string;
}

export interface PatrimonyAsset {
  id: number;
  tombo: string;
  descricao: string;
  categoria: string;
  inpiRegistro: string;
  lat: number;
  lng: number;
  conservacaoPercent: number;
  responsavel: string;
  situacao: string;
  valorPatrimonial: number;
  dataRegistro: string;
  integrityHash: string;
}

export interface CustodyChainEvent {
  id: number;
  tombo: string;
  etapa: string;
  titulo: string;
  descricao: string;
  data: string;
  responsavel: string;
  integrityHash: string;
  tampered?: boolean;
}

export interface DemoData {
  abastecimentos: Supply[];
  resultados_motor_glosa: MotorResult[];
  resumo_dashboard: {
    economia_gerada: number;
    valor_total_transacoes: number;
    valor_glosado: number;
    total_transacoes: number;
  };
  bens_patrimonio?: PatrimonyAsset[];
  cadeia_custodia_patrimonio?: CustodyChainEvent[];
  resumo_patrimonio?: {
    total_bens_catalogados: number;
    total_vistorias_realizadas: number;
    total_transferencias: number;
    valor_patrimonial_total: number;
    bens_sincronizados: number;
    bens_em_revisao: number;
  };
}

export interface IntegrityRow {
  id: number;
  date: string;
  department: string;
  plate: string;
  liters: number;
  amount: number;
  providedHash: string;
  calculatedHash: string;
  verified: boolean;
}

export type PatrimonyTimelineKind = "tombamento" | "cautela" | "vistoria";

export interface PatrimonyTimelineEvent {
  id: string;
  kind: PatrimonyTimelineKind;
  title: string;
  detail: string;
  at: string;
  integrityHash: string;
  tampered?: boolean;
}

export interface PatrimonyChainRow {
  tombo: string;
  descricao: string;
  inpiRegistro: string;
  integrityHash: string;
  situacao: string;
}
