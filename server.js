const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer"); // Importar nodemailer
const analysisService = require("./analysisService");
const resourceGenerator = require("./resourceGenerator");

// Carregar variáveis de ambiente (opcional, mas bom para desenvolvimento local)
// require('dotenv').config(); 

const app = express();
const port = process.env.PORT || 3000; // Usar a porta do Render ou 3000 localmente

// Middleware para parsear dados do formulário (necessário para pegar o e-mail)
app.use(express.urlencoded({ extended: true }));

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
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Servir arquivos estáticos
app.use(express.static(__dirname));

// Rota para a página de upload
app.get("/upload", (req, res) => {
    res.sendFile(path.join(__dirname, "upload_multa.html"));
});

// Configuração do Nodemailer Transporter (usando variáveis de ambiente)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,       // Ex: smtp.gmail.com ou smtp.sendgrid.net
    port: process.env.EMAIL_PORT || 587, // Porta (587 para TLS, 465 para SSL)
    secure: (process.env.EMAIL_PORT == 465), // true para 465, false para outras
    auth: {
        user: process.env.EMAIL_USER, // Seu endereço de e-mail ou usuário do serviço
        pass: process.env.EMAIL_PASS  // Sua senha ou chave de API do serviço
    }
});

// Rota para processar o upload, análise e envio de e-mail
app.post("/api/analyze", upload.single("multa_image"), async (req, res) => {
    if (!req.file) {
        return res.status(400).send("Nenhuma imagem foi enviada.");
    }
    if (!req.body.user_email) {
        // Limpar arquivo se o e-mail não foi enviado
        fs.unlink(req.file.path, (err) => { if (err) console.error(`Erro ao deletar ${req.file.path}:`, err); });
        return res.status(400).send("O endereço de e-mail é obrigatório.");
    }

    const imagePath = req.file.path;
    const userEmail = req.body.user_email;

    try {
        console.log(`Processando imagem: ${imagePath} para ${userEmail}`);
        const analysisResult = await analysisService.processMultaImage(imagePath);
        console.log("Resultado da análise concluído.");

        const resourceText = resourceGenerator.generateResourceText(analysisResult);
        console.log("Recurso gerado.");

        // Enviar e-mail com o resultado
        console.log(`Tentando enviar e-mail para ${userEmail}...`);
        const mailOptions = {
            from: `"Quebra Multa IA" <${process.env.SENDER_EMAIL}>`, // Remetente (USA O E-MAIL VERIFICADO)
            to: userEmail, // Destinatário
            subject: "Análise da sua Multa e Modelo de Recurso - Quebra Multa IA", // Assunto
            text: `Olá,\n\nSegue o resultado da análise da sua multa e o modelo de recurso gerado:\n\n--- ANÁLISE ---\nErros encontrados: ${analysisResult.errors.length > 0 ? analysisResult.errors.join(', ') : 'Nenhum erro formal evidente.'}\nDados extraídos: Placa: ${analysisResult.data.placa || 'N/A'}, Data: ${analysisResult.data.data || 'N/A'}, Hora: ${analysisResult.data.hora || 'N/A'}, Código: ${analysisResult.data.codigoInfracao || 'N/A'}, Órgão: ${analysisResult.data.orgaoAutuador || 'N/A'}\n\n--- MODELO DE RECURSO ---\n${resourceText}\n\nAtenciosamente,\nEquipe Quebra Multa IA`, // Corpo do e-mail em texto puro
            // html: "<b>Versão HTML opcional</b>" // Pode adicionar HTML se preferir
        };

        await transporter.sendMail(mailOptions);
        console.log(`E-mail enviado com sucesso para ${userEmail}`);

        // Responder ao usuário com sucesso (pode ser uma página de sucesso)
        res.send(`Análise concluída! O resultado e o modelo de recurso foram enviados para ${userEmail}.`);

    } catch (error) {
        console.error("Erro no processamento /api/analyze ou envio de e-mail:", error);
        // Tenta enviar uma resposta de erro mais específica se for erro de e-mail
        if (error.code === 'EENVELOPE' || error.command === 'CONN') {
             res.status(500).send("Erro ao processar a imagem da multa: Falha ao conectar ou enviar e-mail. Verifique as configurações de e-mail do servidor.");
        } else {
             res.status(500).send("Erro ao processar a imagem da multa.");
        }
    } finally {
        // Limpar o arquivo de imagem após o processamento
        fs.unlink(imagePath, (err) => {
            if (err) console.error(`Erro ao deletar ${imagePath}:`, err);
        });
    }
});

// Rota para o dashboard (exemplo)
app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "dashboard.html"));
});

app.listen(port, '0.0.0.0', () => { // Escutar em 0.0.0.0 para ser acessível externamente
    console.log(`Servidor rodando na porta ${port}`);
    console.log(`Acesse http://localhost:${port}/upload para testar.`);
});

