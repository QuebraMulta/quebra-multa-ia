// Serviço para análise do texto extraído da multa
const ocrService = require("./ocrService"); // Supondo que ocrService.js está no mesmo diretório

class AnalysisService {

  /**
   * Analisa o texto extraído de uma multa para identificar erros comuns.
   * @param {string} extractedText - Texto extraído da multa pelo OCR.
   * @returns {Promise<object>} - Objeto contendo os erros encontrados e dados relevantes.
   */
  async analyzeMultaText(extractedText) {
    const analysisResult = {
      errors: [],
      data: {},
      rawText: extractedText
    };

    if (!extractedText || extractedText.trim() === "") {
      analysisResult.errors.push("Não foi possível extrair texto da imagem da multa.");
      return analysisResult;
    }

    // --- Implementação básica de análise ---

    // 1. Tenta extrair dados básicos
    try {
      // Placa
      let placaMatch = extractedText.match(/Placa\s*UF\s*([A-Z]{3}[- ]?\d[A-Z0-9]\d{2})/i);
      if (placaMatch && placaMatch[1]) {
        analysisResult.data.placa = placaMatch[1].replace(" ", "");
      } else {
        placaMatch = extractedText.match(/\b([A-Z]{3}[- ]?\d[A-Z0-9]\d{2})\b/i);
         if (placaMatch && placaMatch[1]) {
            analysisResult.data.placa = placaMatch[1].replace(" ", "");
        }
      }

      // Data
      let dataMatch = extractedText.match(/DATA[:\s]*(\d{2}\/\d{2}\/\d{4})/i);
      if (dataMatch && dataMatch[1]) {
        analysisResult.data.data = dataMatch[1];
      } else {
        const altDataMatch = extractedText.match(/\b(\d{2}\/\d{2}\/\d{4})\b/);
        if (altDataMatch && altDataMatch[1]) {
            const prevChar = extractedText[extractedText.indexOf(altDataMatch[0]) - 1];
            if (!prevChar || !prevChar.match(/[a-zA-Z0-9\/]/)) { 
                 analysisResult.data.data = altDataMatch[1];
            }
        }
      }

      // Hora
      let horaMatch = extractedText.match(/HORA[:\s]*(\d{2}:\d{2})/i);
      if (horaMatch && horaMatch[1]) {
        analysisResult.data.hora = horaMatch[1];
      } else {
         const altHoraMatch = extractedText.match(/\b(\d{2}:\d{2})\b/);
        if (altHoraMatch && altHoraMatch[1] && (!analysisResult.data.data || !analysisResult.data.data.includes(altHoraMatch[1]))) {
             const prevChar = extractedText[extractedText.indexOf(altHoraMatch[0]) - 1];
             if (!prevChar || !prevChar.match(/[a-zA-Z0-9\/]/)) {
                analysisResult.data.hora = altHoraMatch[1];
             }
        }
      }
      
      // Código da infração
      let codigoInfracaoMatch = extractedText.match(/C[oó]digo da Infra[cç][aã]o(?:\s*Desdobramento)?\s*(\d{4})/i);
       if (codigoInfracaoMatch && codigoInfracaoMatch[1]) {
        analysisResult.data.codigoInfracao = codigoInfracaoMatch[1];
      } else {
         const lines = extractedText.split("\n");
         for (const line of lines) {
            const lineMatch = line.trim().match(/^(\d{4})\s*(?:[A-Z])?$/);
            if (lineMatch && lineMatch[1]) {
                const codigoIndex = extractedText.toLowerCase().indexOf("código da infração");
                const lineIndex = extractedText.indexOf(line);
                if (codigoIndex > -1 && lineIndex > -1 && Math.abs(lineIndex - codigoIndex) < 200) { 
                     analysisResult.data.codigoInfracao = lineMatch[1];
                     break;
                }
            }
            const enqMatch = line.trim().match(/^(\d{5})\s+/);
            if(enqMatch && enqMatch[1]) {
                 const enqIndex = extractedText.toLowerCase().indexOf("enquadramento");
                 const lineIndex = extractedText.indexOf(line);
                 if (enqIndex > -1 && lineIndex > -1 && Math.abs(lineIndex - enqIndex) < 100) {
                     analysisResult.data.codigoInfracao = enqMatch[1];
                     break;
                 }
            }
         }
      }

      // Órgão Autuador
      let orgaoMatch = extractedText.match(/(POL[ÍI]CIA RODOVI[ÁA]RIA FEDERAL)/i);
      if (orgaoMatch && orgaoMatch[1]) {
        analysisResult.data.orgaoAutuador = "Polícia Rodoviária Federal (PRF)";
      } else {
        orgaoMatch = extractedText.match(/(COMPANHIA DE ENGENHARIA DE TR[ÁA]FEGO|CET-SP)/i);
        if (orgaoMatch && orgaoMatch[1]) {
          analysisResult.data.orgaoAutuador = "Companhia de Engenharia de Tráfego (CET-SP)";
        } else {
          orgaoMatch = extractedText.match(/(DEPARTAMENTO DE ESTRADAS DE RODAGEM|DER-SP)/i);
          if (orgaoMatch && orgaoMatch[1]) {
            analysisResult.data.orgaoAutuador = "Departamento de Estradas de Rodagem (DER-SP)";
          } // Add more authorities here if needed
        }
      }

      // Número do Auto de Infração (AIT)
      // Regex genérico, pode precisar de ajustes para diferentes formatos
      let aitMatch = extractedText.match(/(?:Auto de Infra[cç][aã]o N[oº]?|AIT N[oº]?|NA Expedida em)\s*([A-Z0-9\-]+)/i);
      if (aitMatch && aitMatch[1]) {
          analysisResult.data.numeroAutoInfracao = aitMatch[1];
      } else {
          // Tentativa alternativa (ex: formato PRF RXXXXXXXXX)
          aitMatch = extractedText.match(/\b([A-Z]\d{9})\b/);
          if (aitMatch && aitMatch[1]) {
              analysisResult.data.numeroAutoInfracao = aitMatch[1];
          }
          // Tentativa alternativa (ex: formato CET 2R-A1-XXXXXX-X)
          else {
             aitMatch = extractedText.match(/\b(\d[A-Z]-\d[A-Z]-\d{6}-\d)\b/);
             if (aitMatch && aitMatch[1]) {
                 analysisResult.data.numeroAutoInfracao = aitMatch[1];
             }
             // Tentativa alternativa (ex: formato DER 1U XXXXXX-X)
             else {
                 aitMatch = extractedText.match(/\b(\d[A-Z]\s*\d{6}-\d)\b/);
                 if (aitMatch && aitMatch[1]) {
                     analysisResult.data.numeroAutoInfracao = aitMatch[1].replace(" ", "");
                 }
             }
          }
      }

    } catch (e) {
      console.error("Erro ao extrair dados básicos:", e);
      analysisResult.errors.push("Erro ao processar dados básicos da multa.");
    }

    // 2. Verifica erros comuns (adiciona se não encontrado)
    try {
        if (!analysisResult.data.placa) {
            analysisResult.errors.push("Não foi possível identificar a placa do veículo na multa.");
        }
        if (!analysisResult.data.data) {
            analysisResult.errors.push("Não foi possível identificar a data da infração na multa.");
        }
         if (!analysisResult.data.codigoInfracao) {
            analysisResult.errors.push("Não foi possível identificar o código da infração na multa.");
        }
        if (!analysisResult.data.numeroAutoInfracao) {
            analysisResult.errors.push("Não foi possível identificar o número do Auto de Infração na multa.");
        }
        // Optional: Add error if orgaoAutuador is not found
        // if (!analysisResult.data.orgaoAutuador) {
        //     analysisResult.errors.push("Não foi possível identificar o órgão autuador na multa.");
        // }
        
    } catch (e) {
      console.error("Erro ao verificar regras:", e);
      analysisResult.errors.push("Erro ao aplicar regras de validação na multa.");
    }

    return analysisResult;
  }

  /**
   * Processa uma imagem de multa: extrai texto e analisa.
   * @param {string} imagePath - Caminho para o arquivo de imagem da multa.
   * @returns {Promise<object>} - Resultado da análise.
   */
  async processMultaImage(imagePath) {
    if (!ocrService) {
       console.error("OCR Service não inicializado, verifique a GOOGLE_API_KEY.");
       return {
          errors: ["Erro interno: Serviço de OCR não inicializado. Verifique a configuração da chave de API no servidor."],
          data: {},
          rawText: null
       };
    }
    try {
      const extractedText = await ocrService.extractTextFromImage(imagePath);
      const analysisResult = await this.analyzeMultaText(extractedText);
      return analysisResult;
    } catch (error) {
      console.error("Erro no processamento completo da multa:", error);
      return {
        errors: [`Erro geral no processamento da imagem da multa: ${error.message}`],
        data: {},
        rawText: null
      };
    }
  }
}

module.exports = new AnalysisService();

