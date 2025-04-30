// Serviço para integração com a API Vision do Google Cloud
const vision = require('@google-cloud/vision');
const fs = require('fs');
const path = require('path');

// Lê a chave da API da variável de ambiente
const API_KEY = process.env.GOOGLE_API_KEY;

if (!API_KEY) {
  console.error("ERRO CRÍTICO: A variável de ambiente GOOGLE_API_KEY não está definida!");
  // Em um cenário real, você pode querer lançar um erro ou sair do processo
  // process.exit(1);
}

class OCRService {
  constructor() {
    // Inicializa o cliente da API Vision
    // Verifica se a API_KEY foi carregada antes de criar o cliente
    if (!API_KEY) {
      throw new Error("Não é possível inicializar OCRService: GOOGLE_API_KEY não definida.");
    }
    this.client = new vision.ImageAnnotatorClient({
      apiKey: API_KEY
    });
  }

  /**
   * Extrai texto de uma imagem usando OCR
   * @param {string} imagePath - Caminho para o arquivo de imagem
   * @returns {Promise<string>} - Texto extraído da imagem
   */
  async extractTextFromImage(imagePath) {
    try {
      // Verifica se o arquivo existe
      if (!fs.existsSync(imagePath)) {
        throw new Error(`Arquivo não encontrado: ${imagePath}`);
      }

      // Lê o arquivo de imagem
      const imageFile = fs.readFileSync(imagePath);
      
      // Converte para formato base64 para envio à API
      const encodedImage = imageFile.toString('base64');
      
      // Faz a requisição para a API Vision
      const [result] = await this.client.textDetection({
        image: {
          content: encodedImage
        }
      });

      // Extrai o texto completo detectado
      const detections = result.textAnnotations;
      if (!detections || detections.length === 0) {
        return '';
      }
      
      // O primeiro elemento contém o texto completo
      return detections[0].description;
    } catch (error) {
      console.error('Erro ao extrair texto da imagem:', error);
      // Adiciona mais detalhes ao erro se for relacionado à API Key
      if (error.message && error.message.includes('API key not valid')) {
         throw new Error('Erro na API Vision: A chave da API (GOOGLE_API_KEY) parece ser inválida ou não ter permissões suficientes.');
      }
      throw error;
    }
  }
}

// Exporta a instância apenas se a API_KEY estiver definida
module.exports = API_KEY ? new OCRService() : null;

