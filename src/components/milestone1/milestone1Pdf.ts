import type { IntegrityRow, PatrimonyChainRow } from "@/lib/milestone1/types";

export function openFuelAuditPdf(opts: {
  filteredRows: IntegrityRow[];
  grossSpending: number;
  actualSpending: number;
  savingsPercent: number;
  origin: string;
}): void {
  const { filteredRows, grossSpending, actualSpending, savingsPercent, origin } =
    opts;
  const pctGross = 100;
  const pctActual = grossSpending ? (actualSpending / grossSpending) * 100 : 0;
  const rows = filteredRows
    .map(
      (row) =>
        `<tr><td>${row.date}</td><td>${row.department}</td><td>${row.plate}</td><td>${row.liters}</td><td>R$ ${row.amount.toFixed(
          2
        )}</td><td style="font-family:monospace;font-size:8px;color:#11CDEF;">${row.calculatedHash}</td><td>${row.verified ? "Verificado / imutável" : "Em revisão"}</td></tr>`
    )
    .join("");
  const validationUrl = `${origin}/milestone1?auditoria=SIG-FROTA&relatorio=1`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(validationUrl)}`;
  const footerHash =
    filteredRows[0]?.calculatedHash ||
    "0000000000000000000000000000000000000000000000000000000000000000";
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>SIG-FROTA — Relatório e trilha de auditoria</title>
      <style>
        body { font-family: 'Segoe UI', system-ui, sans-serif; color: #0f172a; padding: 22px; }
        h1 { font-size: 17px; margin: 0 0 6px; }
        h2 { font-size: 13px; color: #475569; margin: 0 0 16px; font-weight: 600; }
        .roi-wrap { margin: 16px 0 20px; padding: 14px; border: 1px solid #cbd5e1; border-radius: 10px; background: #f8fafc; }
        .roi-title { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #64748b; margin-bottom: 10px; }
        .roi-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 11px; }
        .roi-bar { flex: 1; height: 16px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
        .roi-fill-gross { height: 100%; width: ${pctGross}%; background: linear-gradient(90deg, #312e81 0%, #2563eb 40%, #11CDEF 100%); border-radius: 999px; }
        .roi-fill-real { height: 100%; width: ${pctActual}%; background: linear-gradient(90deg, #134e4a 0%, #2DCE89 55%, #86efac 100%); border-radius: 999px; }
        table { width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 8px; }
        th, td { border: 1px solid #cbd5e1; padding: 6px; text-align: left; vertical-align: top; }
        th { background: #f1f5f9; }
        .foot { margin-top: 22px; padding-top: 14px; border-top: 2px solid #11CDEF; display: flex; flex-wrap: wrap; gap: 18px; align-items: flex-start; }
        .sha { font-family: monospace; font-size: 9px; color: #11CDEF; word-break: break-all; max-width: 420px; line-height: 1.35; }
        .tce { font-size: 10px; font-weight: 700; color: #0f172a; width: 100%; margin-top: 8px; }
      </style></head><body>
      <h1>SIG-FROTA — Relatórios e trilha de auditoria</h1>
      <h2>Inteligência fiscal · georreferenciamento · integridade SHA-256</h2>
      <div class="roi-wrap">
        <div class="roi-title">Gráfico de ROI (mesma leitura da Tela 1)</div>
        <div class="roi-row"><span style="width:88px;">Gasto bruto</span><div class="roi-bar"><div class="roi-fill-gross"></div></div><strong>R$ ${grossSpending.toFixed(2)}</strong></div>
        <div class="roi-row"><span style="width:88px;">Gasto real</span><div class="roi-bar"><div class="roi-fill-real"></div></div><strong>R$ ${actualSpending.toFixed(2)}</strong></div>
        <div class="roi-row" style="margin-top:10px;color:#2DCE89;font-weight:700;">Economia: ${savingsPercent.toFixed(1)}% (meta operacional)</div>
      </div>
      <table>
        <thead><tr><th>Data</th><th>Departamento</th><th>Placa</th><th>Litros</th><th>Valor</th><th>SHA-256</th><th>Situação</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="foot">
        <div><strong style="color:#11CDEF;">QR — validação</strong><br/><img src="${qrSrc}" width="120" height="120" alt="QR auditoria" /></div>
        <div><strong style="color:#11CDEF;">SHA-256 (resto / trilha)</strong><br/><span class="sha">${footerHash}</span></div>
      </div>
      <p class="tce">Metodologia apresentada ao TCE-AC</p>
      </body></html>`;
  const popup = window.open("", "_blank");
  if (popup) {
    popup.document.write(html);
    popup.document.close();
    popup.print();
  }
}

export function openPatrimonyPdf(rows: PatrimonyChainRow[]): void {
  const body = rows
    .map(
      (row) =>
        `<tr>
            <td>${row.tombo}</td>
            <td>${row.descricao}</td>
            <td style="font-weight:700;color:#11CDEF;">${row.inpiRegistro}</td>
            <td style="font-family:monospace;font-size:9px;color:#11CDEF;word-break:break-all;">${row.integrityHash}</td>
            <td>${row.situacao}</td>
          </tr>`
    )
    .join("");
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Relatório oficial — SIG-PATRIMÔNIO · Cadeia de integridade</title>
      <style>
        body { font-family: 'Segoe UI', system-ui, sans-serif; color: #0f172a; padding: 24px; }
        h1 { font-size: 18px; margin: 0 0 8px; }
        h2 { font-size: 14px; color: #334155; margin: 0 0 20px; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px; vertical-align: top; }
        th { background: #f1f5f9; text-align: left; }
        .foot { margin-top: 20px; font-size: 10px; color: #64748b; }
        .seal { color: #11CDEF; font-weight: 700; letter-spacing: 0.04em; }
      </style></head><body>
      <h1>SIG-PATRIMÔNIO — Inventário e tombamento (impressão oficial)</h1>
      <h2>Cadeia de integridade SHA-256 · registro INPI exclusivo · gestão AP04 distinta</h2>
      <table>
        <thead>
          <tr>
            <th>Tombamento</th>
            <th>Descrição</th>
            <th>Registro INPI (texto-fonte)</th>
            <th>SHA-256 (integridade)</th>
            <th>Situação</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
      <p class="foot"><span class="seal">SHA-256</span> — cada linha reproduz o selo exibido no painel “Cadeia de integridade”. Documento gerado para auditoria (simulação).</p>
      </body></html>`;
  const popup = window.open("", "_blank");
  if (popup) {
    popup.document.write(html);
    popup.document.close();
    popup.print();
  }
}
