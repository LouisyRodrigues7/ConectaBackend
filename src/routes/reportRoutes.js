import express from "express";
import { gerarRelatorioPDF } from "../utils/reportService.js";

const router = express.Router();

/**
 * GET /api/relatorio/gerar-relatorio?periodo=24h
 * Gera e baixa um PDF com os acionamentos do período selecionado
 */
router.get("/gerar-relatorio", async (req, res) => {
  try {
    const { periodo } = req.query;

    // Validação de parâmetro
    if (!periodo) {
      return res.status(400).json({
        error: "O parâmetro 'periodo' é obrigatório. Ex: ?periodo=24h"
      });
    }

    // Geração do PDF
    const pdfStream = await gerarRelatorioPDF(periodo);

    // Headers de download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=relatorio_${periodo}.pdf`
    );

    // Envio do PDF
    pdfStream.pipe(res);
    pdfStream.end();

  } catch (err) {
    console.error("❌ Erro ao gerar relatório:", err);
    return res.status(500).json({
      error: "Erro interno ao gerar relatório."
    });
  }
});

export default router;
