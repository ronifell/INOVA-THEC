import { getModuleById, type Module } from "@/lib/modules";

export type InteriorTile = {
  title: string;
  description: string;
  icon: string;
  voiceText: string;
};

const FROTA: InteriorTile[] = [
  {
    title: "ROTAS",
    description: "Malha operacional e correlação de trajetos.",
    icon: "🧭",
    voiceText: "Rotas e correlação operacional.",
  },
  {
    title: "GEOFENCE",
    description: "Perímetros ativos e violação de cerca virtual.",
    icon: "📡",
    voiceText: "Geocerca e alertas de perímetro.",
  },
  {
    title: "ALERTAS",
    description: "Eventos críticos e fila de confirmação.",
    icon: "🔔",
    voiceText: "Central de alertas do SIG-FROTA.",
  },
  {
    title: "COMBUSTÍVEL",
    description: "Litros, notas e prova pericial vinculada.",
    icon: "⛽",
    voiceText: "Auditoria de combustível e despesa.",
  },
  {
    title: "MANUTENÇÃO",
    description: "OS, peças e vínculo com frota.",
    icon: "🔧",
    voiceText: "Manutenção e custo operacional.",
  },
  {
    title: "MOTORISTA",
    description: "Identidade, jornada e conformidade.",
    icon: "👤",
    voiceText: "Condutores e conformidade de jornada.",
  },
  {
    title: "INTEGRAÇÃO",
    description: "APIs, selos e trilha documental.",
    icon: "🔗",
    voiceText: "Integração e trilha AP-04.",
  },
];

const PATRIMONIO: InteriorTile[] = [
  {
    title: "INVENTÁRIO",
    description: "Censo, tombo e consolidação patrimonial.",
    icon: "📋",
    voiceText: "Inventário patrimonial auditável.",
  },
  {
    title: "VISTORIA",
    description: "Perícia visual e registro com fé pública.",
    icon: "🔎",
    voiceText: "Vistoria e evidências vinculadas.",
  },
  {
    title: "BAIXA",
    description: "Baixa patrimonial com trilha SHA-256.",
    icon: "📥",
    voiceText: "Processo de baixa e conformidade.",
  },
  {
    title: "TRANSFERÊNCIA",
    description: "Movimentação entre órgãos e responsáveis.",
    icon: "↔️",
    voiceText: "Transferência de bens documentada.",
  },
  {
    title: "QR TRACE",
    description: "Rastreio por QR e validação de campo.",
    icon: "📱",
    voiceText: "Rastreabilidade por QR Code.",
  },
  {
    title: "HASH LOCAL",
    description: "Integridade offline e carimbo verificável.",
    icon: "#️⃣",
    voiceText: "Hash local e integridade do registro.",
  },
  {
    title: "AUDITORIA",
    description: "Painel pericial e exportação oficial.",
    icon: "🛡️",
    voiceText: "Auditoria patrimonial AP-04.",
  },
];

const GENERIC_LABELS = [
  "COMANDO α",
  "COMANDO β",
  "COMANDO γ",
  "COMANDO δ",
  "COMANDO ε",
  "COMANDO ζ",
  "COMANDO η",
];

function genericTiles(mod: Module): InteriorTile[] {
  return GENERIC_LABELS.map((title, i) => ({
    title,
    description: mod.description,
    icon: mod.icon,
    voiceText: `${mod.name} — painel ${i + 1}. ${mod.voiceText}`,
  }));
}

export function getModuleInteriorTiles(moduleId: string): InteriorTile[] {
  if (moduleId === "frota") return FROTA;
  if (moduleId === "patrimonio") return PATRIMONIO;
  const mod = getModuleById(moduleId);
  if (!mod) return FROTA;
  return genericTiles(mod);
}
