import PDFDocument from "pdfkit";
import axios from "axios";
import dayjs from "dayjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOGO_PATH = path.join(__dirname, "../assets/logoconecta.png");

// Canais ThingSpeak – nomes ATUALIZADOS
const channels = [
  { id: 3096316, key: "NUQB46X37DE06NP5", label: "014 (Brasília / Conde da Boa Vista)" },
  { id: 3102167, key: "3EFVUAMPT6UA7AJ3", label: "032 (Setúbal / Conde da Boa Vista)" },
  { id: 3174071, key: "UU92V5ZK4L0YYR12", label: "101 (Circular Conde da Boa Vista / Joana Bezerra)" },
  { id: 3174077, key: "RTH6JYKPEEOEGDQH", label: "061 (Piedade / Conde da Boa Vista)" }
];

function calcularDataInicial(periodo) {
  const agora = dayjs();
  switch (periodo) {
    case "24h": return agora.subtract(24, "hour");
    case "7d": return agora.subtract(7, "day");
    case "1m": return agora.subtract(1, "month");
    case "3m": return agora.subtract(3, "month");
    case "6m": return agora.subtract(6, "month");
    case "1a": return agora.subtract(1, "year");
    default: return agora.subtract(24, "hour");
  }
}

async function buscarDadosDoChannel(channel) {
  try {
    const url = `https://api.thingspeak.com/channels/${channel.id}/feeds.json?api_key=${channel.key}&results=8000`;
    const res = await axios.get(url);
    return res.data.feeds || [];
  } catch {
    return [];
  }
}

export async function gerarRelatorioPDF(periodo) {
  const doc = new PDFDocument({ margin: 50 });

  const dataInicial = calcularDataInicial(periodo);

  let relatorio = [];
  let totalGeral = 0;
  let totalVisual = 0;
  let totalFisico = 0;

  for (let ch of channels) {
    const feeds = await buscarDadosDoChannel(ch);
    const filtrados = feeds.filter(f => f?.created_at && dayjs(f.created_at).isAfter(dataInicial));

    const visual = filtrados.reduce((s, f) => s + (parseInt(f.field1) || 0), 0);
    const fisico = filtrados.reduce((s, f) => s + (parseInt(f.field2) || 0), 0);

    relatorio.push({ parada: ch.label, visual, fisico });

    totalVisual += visual;
    totalFisico += fisico;
    totalGeral += visual + fisico;
  }

  const paradaMaisMovimento = relatorio.reduce((a, b) =>
    (a.visual + a.fisico) > (b.visual + b.fisico) ? a : b
  );

  // LOGO
  try {
    const pageWidth = doc.page.width;
    const logoWidth = 120;
    const x = (pageWidth - logoWidth) / 2;

    doc.image(LOGO_PATH, x, 20, { width: 120 });
  } catch {}

  doc.moveDown(8);

  // TÍTULO
  doc.fontSize(20).font("Helvetica-Bold").text("Relatório de Uso – ConectaBus", { align: "center" });
  doc.fontSize(14).font("Helvetica-Bold").text(
    "Paradas Inteligentes – Monitoramento de Acessibilidade",
    { align: "center" }
  );

  doc.moveDown(2);

  doc.fontSize(12).font("Helvetica").text(`Período analisado: ${periodo}`);
  doc.text(`Data de geração: ${dayjs().format("DD/MM/YYYY HH:mm")}`);
  doc.moveDown(2);

  // 1. VISÃO GERAL
  doc.fontSize(16).font("Helvetica-Bold").text("1. Visão Geral");
  doc.moveDown(1);

  doc.fontSize(12).font("Helvetica").text(
    "Este relatório apresenta o registro de pessoas que utilizaram os recursos de acessibilidade oferecidos pelas Paradas Inteligentes do projeto ConectaBus, desenvolvido para apoiar passageiros com deficiência visual ou física durante o embarque no transporte público."
  );

  doc.moveDown(1.5);

  // 🔥 SUBTÍTULO PEDIDO
  doc.fontSize(12).font("Helvetica-Bold").text("No período analisado, os dados indicam:");
  doc.moveDown(1);

  // BULLETS
  doc.font("Helvetica");
  doc.text(`• Total de pessoas atendidas: ${totalGeral}`);
  doc.text(`• Pessoas com deficiência visual: ${totalVisual}`);
  doc.text(`• Pessoas com deficiência física: ${totalFisico}`);
  doc.moveDown(2);

  // 2. TABELA
  doc.fontSize(16).font("Helvetica-Bold").text("2. Distribuição por Parada");
  doc.moveDown(1);

  const tableTop = doc.y;
  const rowHeight = 40;

  doc.fontSize(12).font("Helvetica-Bold");

  doc.rect(50, tableTop, 500, rowHeight).stroke();
  doc.text("Parada", 55, tableTop + 12);
  doc.text("Visual", 300, tableTop + 12);
  doc.text("Física", 400, tableTop + 12);

  let y = tableTop + rowHeight;

  doc.font("Helvetica");

  relatorio.forEach(r => {
    doc.rect(50, y, 500, rowHeight).stroke();

    doc.text(r.parada, 55, y + 12, { width: 230 });
    doc.text(String(r.visual), 300, y + 12);
    doc.text(String(r.fisico), 400, y + 12);

    y += rowHeight;
  });

  // 🔥 MAIOR ESPAÇAMENTO ANTES DO TÓPICO 3
  doc.moveDown(2.5);

  // 3. ANÁLISE DO PERÍODO
  doc.x = 50;
  doc.fontSize(16).font("Helvetica-Bold").text("3. Análise do Período");

  // 🔥 TEXTO AGORA BEM PRÓXIMO AO TÍTULO
  doc.moveDown(0.3);

  doc.fontSize(12).font("Helvetica").text(
    "A análise dos dados permite identificar padrões de uso e momentos de maior demanda por acessibilidade nas paradas monitoradas."
  );

  doc.moveDown(0.5);

  // 4. OBSERVAÇÕES
  doc.x = 50;
  doc.fontSize(16).font("Helvetica-Bold").text("4. Observações");
  doc.moveDown(0.15);

  doc.fontSize(12).font("Helvetica").text(
    `A ${paradaMaisMovimento.parada} apresentou o maior fluxo de solicitações no período analisado, indicando a necessidade de maior suporte ou priorização de melhorias.`
  );

  // Rodapé
  doc.fontSize(10).font("Helvetica-Bold");
  const footerText = "ConectaBus – Sistema de Paradas Inteligentes";
  const footerY = doc.page.height - 40;
  doc.text(footerText, 0, footerY, { align: "center" });

  return doc;
}
