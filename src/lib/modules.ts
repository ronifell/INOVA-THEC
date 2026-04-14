export interface Module {
  id: string;
  name: string;
  color: string;
  colorRgb: string;
  description: string;
  voiceText: string;
  icon: string;
  isFullModule: boolean;
}

export const MODULES: Module[] = [
  {
    id: "frota",
    name: "SIG-FROTA",
    color: "#10B981",
    colorRgb: "16, 185, 129",
    description: "Rastreamento Veicular com Geolocalização em Tempo Real",
    voiceText:
      "Iniciando rastreio de frota. Protocolo de geolocalização ativo. Monitoramento de consumo e trajeto em operação.",
    icon: "🛰️",
    isFullModule: true,
  },
  {
    id: "patrimonio",
    name: "SIG-PATRIMÔNIO",
    color: "#3B82F6",
    colorRgb: "59, 130, 246",
    description: "Inspeção e Controle de Bens Patrimoniais com Visão Raio-X",
    voiceText:
      "Módulo de patrimônio ativado. Inspeção pericial de bens em andamento. Verificação de integridade habilitada.",
    icon: "🔍",
    isFullModule: true,
  },
  {
    id: "obras",
    name: "SIG-OBRAS",
    color: "#F59E0B",
    colorRgb: "245, 158, 11",
    description: "Fiscalização Georreferenciada de Obras Públicas",
    voiceText:
      "Módulo de obras em fase de homologação pericial. Fiscalização georreferenciada sendo preparada.",
    icon: "🏗️",
    isFullModule: false,
  },
  {
    id: "medicamentos",
    name: "SIG-MEDICAMENTOS",
    color: "#D946EF",
    colorRgb: "217, 70, 239",
    description: "Controle Farmacêutico com Rastreabilidade Total",
    voiceText:
      "Módulo de medicamentos em homologação. Rastreabilidade farmacêutica de alta precisão.",
    icon: "💊",
    isFullModule: false,
  },
  {
    id: "merenda",
    name: "SIG-MERENDA",
    color: "#FACC15",
    colorRgb: "250, 204, 21",
    description: "Auditoria Nutricional com Cadeia de Custódia",
    voiceText:
      "Módulo de merenda em homologação. Controle nutricional com cadeia de custódia ativa.",
    icon: "🍽️",
    isFullModule: false,
  },
  {
    id: "social",
    name: "SIG-SOCIAL",
    color: "#06B6D4",
    colorRgb: "6, 182, 212",
    description: "Monitoramento de Programas Sociais com Transparência",
    voiceText:
      "Módulo social em homologação. Protocolo de transparência e monitoramento em preparação.",
    icon: "🤝",
    isFullModule: false,
  },
  {
    id: "ambiental",
    name: "SIG-AMBIENTAL",
    color: "#15803D",
    colorRgb: "21, 128, 61",
    description: "Fiscalização Ambiental com Sensoriamento Remoto",
    voiceText:
      "Módulo ambiental em homologação. Sensoriamento remoto e georrastreamento ecológico em preparação.",
    icon: "🌿",
    isFullModule: false,
  },
];

export const BASE_COLOR = "#0F172A";
export const BASE_COLOR_RGB = "15, 23, 42";

export function getModuleById(id: string): Module | undefined {
  return MODULES.find((m) => m.id === id);
}
