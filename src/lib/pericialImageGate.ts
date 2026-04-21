/**
 * Validação pericial client-side: nitidez (variância Laplaciana) e luminância média.
 * Mensagem única conforme especificação do protocolo de materialidade.
 */
export const MATERIALIDADE_REJECT_MSG =
  "Imagem sem nitidez. Repita a captura para validar a Materialidade.";

export type PericialGateResult = { ok: true } | { ok: false; message: string };

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("load"));
    img.src = src;
  });
}

function laplacianVariance(imageData: ImageData): number {
  const { width, height, data } = imageData;
  const gray = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const o = i * 4;
    gray[i] = data[o]! * 0.299 + data[o + 1]! * 0.587 + data[o + 2]! * 0.114;
  }
  let sum = 0;
  let sumSq = 0;
  let count = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const lap =
        4 * gray[i]! -
        gray[i - width]! -
        gray[i + width]! -
        gray[i - 1]! -
        gray[i + 1]!;
      sum += lap;
      sumSq += lap * lap;
      count++;
    }
  }
  if (count === 0) return 0;
  const mean = sum / count;
  return sumSq / count - mean * mean;
}

/**
 * Analisa arquivo de imagem. Rejeita escuro extremo ou baixa nitidez.
 */
export async function validatePericialImageFile(
  file: File
): Promise<PericialGateResult> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const maxW = 360;
    const w = Math.min(maxW, img.naturalWidth || img.width);
    const h = Math.max(
      1,
      Math.round(((img.naturalHeight || img.height) * w) / (img.naturalWidth || img.width || 1))
    );
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      return { ok: false, message: MATERIALIDADE_REJECT_MSG };
    }
    ctx.drawImage(img, 0, 0, w, h);
    const imageData = ctx.getImageData(0, 0, w, h);
    const { data } = imageData;
    let lumSum = 0;
    for (let i = 0; i < data.length; i += 4) {
      lumSum += data[i]! * 0.299 + data[i + 1]! * 0.587 + data[i + 2]! * 0.114;
    }
    const n = data.length / 4;
    const meanLum = lumSum / n;
    if (meanLum < 42) {
      return { ok: false, message: MATERIALIDADE_REJECT_MSG };
    }
    const varLap = laplacianVariance(imageData);
    if (varLap < 28) {
      return { ok: false, message: MATERIALIDADE_REJECT_MSG };
    }
    return { ok: true };
  } catch {
    return { ok: false, message: MATERIALIDADE_REJECT_MSG };
  } finally {
    URL.revokeObjectURL(url);
  }
}
