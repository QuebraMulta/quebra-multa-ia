const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const analysisService = require("./analysisService"); // Ajuste o caminho se necessário
const resourceGenerator = require("./resourceGenerator"); // Ajuste o caminho se necessário

const app = express();
const port = 3000;

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, "uploads");
        if (!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Nome único para o arquivo
    }
});
const upload = multer({ storage: storage });

// Servir arquivos estáticos (HTML, CSS, JS do frontend)
app.use(express.static(__dirname)); 

// Rota para a página de upload
app.get("/upload", (req, res) => {
    res.sendFile(path.join(__dirname, "upload_multa.html"));
});

// Rota para processar o upload e análise da multa
app.post("/api/analyze", upload.single("multa_image"), async (req, res) => {
    if (!req.file) {
        return res.status(400).send("Nenhuma imagem foi enviada.");
    }

    const imagePath = req.file.path;

    try {
        console.log(`Processando imagem: ${imagePath}`);
        // 1. Extrair texto e analisar (usando o AnalysisService que já chama o OCRService)
        const analysisResult = await analysisService.processMultaImage(imagePath);
        console.log("Resultado da análise:", analysisResult);

        // 2. Gerar o recurso
        const resourceText = resourceGenerator.generateResourceText(analysisResult);
        console.log("Recurso gerado.");

        // 3. Preparar dados para o dashboard (simplificado)
        const dashboardData = {
            ...analysisResult,
            resourceText: resourceText
        };

        // Por enquanto, apenas retorna o JSON com os resultados
        // No futuro, poderíamos renderizar o dashboard.html com esses dados
        res.json(dashboardData);

    } catch (error) {
        console.error("Erro no processamento /api/analyze:", error);
        res.status(500).send("Erro ao processar a imagem da multa.");
    } finally {
        // Limpar o arquivo de imagem após o processamento
        fs.unlink(imagePath, (err) => {
            if (err) console.error(`Erro ao deletar ${imagePath}:`, err);
        });
    }
});

// Rota para o dashboard (exemplo)
app.get("/dashboard", (req, res) => {
    // Aqui você buscaria os dados da análise salva e renderizaria o dashboard.html
    // Por enquanto, apenas serve o arquivo estático
    res.sendFile(path.join(__dirname, "dashboard.html"));
});

app.listen(port, () => {
    console.log(`Servidor de teste rodando em http://localhost:${port}`);
    console.log(`Acesse http://localhost:${port}/upload para testar o upload.`);
});

