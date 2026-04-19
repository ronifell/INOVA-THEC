import { getModuleById, type Module } from "@/lib/modules";

export type InteriorTile = {
  title: string;
  description: string;
  icon: string;
  voiceText: string;
};

/** Nível 2 — SIG-FROTA (Combustível): sete frentes de auditoria (organograma cliente). */
const FROTA: InteriorTile[] = [
  {
    title: "TANQUE",
    description: "Volume, litragem e lacre — prova pericial do reservatório.",
    icon: "🛢️",
    voiceText: "Auditoria de tanque e volume de combustível.",
  },
  {
    title: "PLACA",
    description: "Identificação do veículo e correlação com frota cadastrada.",
    icon: "🔖",
    voiceText: "Verificação de placa e vínculo com o ativo.",
  },
  {
    title: "HODÔMETRO",
    description: "Quilometragem, desgaste e consistência com rotas.",
    icon: "📟",
    voiceText: "Leitura de hodômetro e coerência operacional.",
  },
  {
    title: "ABASTECIMENTO",
    description: "Litros, data e posto — registro com GPS e fé pública.",
    icon: "⛽",
    voiceText: "Captura de abastecimento com georreferenciamento.",
  },
  {
    title: "NOTA FISCAL",
    description: "Cupom, NF-e e vínculo com transação auditada.",
    icon: "🧾",
    voiceText: "Conferência documental e trilha fiscal.",
  },
  {
    title: "GPS · ROTA",
    description: "Trajeto, perímetro e validação veículo–posto.",
    icon: "🛰️",
    voiceText: "Georreferenciamento e malha operacional.",
  },
  {
    title: "TRILHA · SELO",
    description: "SHA-256, exportação oficial e selo AP-04.",
    icon: "🔗",
    voiceText: "Trilha de integridade e selo de auditoria.",
  },
];

/** Nível 2 — SIG-PATRIMÔNIO: sete frentes (organograma cliente). */
const PATRIMONIO: InteriorTile[] = [
  {
    title: "PLAQUETA",
    description: "Identificação física do bem e registro tombado.",
    icon: "🏷️",
    voiceText: "Auditoria de plaqueta e identificação patrimonial.",
  },
  {
    title: "ESTADO DE CONSERVAÇÃO",
    description: "Classificação pericial e histórico de conservação.",
    icon: "🏛️",
    voiceText: "Estado de conservação e perícia visual.",
  },
  {
    title: "LOCALIZAÇÃO",
    description: "Georreferenciamento e perímetro do bem.",
    icon: "📍",
    voiceText: "Localização geográfica e área de custódia.",
  },
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
    title: "QR · RASTREIO",
    description: "Leitura de QR e validação de campo.",
    icon: "📱",
    voiceText: "Rastreabilidade por QR Code.",
  },
  {
    title: "AUDITORIA · HASH",
    description: "Integridade SHA-256 e exportação pericial.",
    icon: "🛡️",
    voiceText: "Auditoria patrimonial e hash verificável.",
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
