# Aplicação Quebra Multa IA - Implantação no Render

Este pacote contém a aplicação Node.js para análise de multas com IA, pronta para ser implantada na plataforma Render.

## Arquivos Principais

- `server.js`: O servidor principal da aplicação (usa Express).
- `ocrService.js`: Serviço para extrair texto de imagens usando a API Google Cloud Vision (agora lê a chave da variável de ambiente `GOOGLE_API_KEY`).
- `analysisService.js`: Serviço para analisar o texto extraído e identificar informações/erros.
- `resourceGenerator.js`: Serviço para gerar o texto do recurso com base na análise.
- `upload_multa.html`: Página HTML para o usuário fazer upload da imagem da multa.
- `dashboard.html`: Página HTML (básica) para exibir o resultado da análise e o recurso.
- `package.json`: Define as dependências do projeto e o comando de início.
- `package-lock.json`: Registra as versões exatas das dependências instaladas.

## Requisitos

- Uma conta no [Render](https://dashboard.render.com/register) (o plano gratuito é suficiente para começar).
- Uma chave de API válida do Google Cloud Vision com a API "Cloud Vision API" ativada. [Como obter uma chave de API](https://cloud.google.com/docs/authentication/api-keys).
- O arquivo `.zip` desta aplicação.

## Instruções de Implantação no Render (Passo a Passo Simples)

1.  **Acesse o Render:** Faça login no seu painel do Render: [https://dashboard.render.com/](https://dashboard.render.com/)
2.  **Crie um Novo Serviço Web:**
    *   Clique em "**New +**" e selecione "**Web Service**".
    *   Na seção "Deploy an existing image or Git repository", escolha a opção "**Deploy from a zip file**".
    *   Clique em "**Upload a .zip file**" e selecione o arquivo `quebra_multa_ia_app.zip` que você baixou.
3.  **Configurações do Serviço:**
    *   **Name:** Dê um nome para sua aplicação (ex: `quebra-multa-ia`). Este nome fará parte da URL pública (ex: `quebra-multa-ia.onrender.com`).
    *   **Region:** Escolha a região mais próxima de você ou dos seus usuários (ex: `Frankfurt` ou `Oregon`).
    *   **Branch:** Deixe como está (geralmente `main`).
    *   **Root Directory:** Deixe em branco (o Render detectará automaticamente).
    *   **Runtime:** Selecione **Node**. O Render geralmente detecta isso automaticamente a partir do `package.json`.
    *   **Build Command:** `npm install` (O Render geralmente preenche isso automaticamente).
    *   **Start Command:** `node server.js` (O Render geralmente preenche isso automaticamente).
    *   **Plan:** Selecione o plano **Free**. Leia as limitações (ex: o serviço pode "dormir" após inatividade e demorar um pouco para responder na primeira visita depois disso).
4.  **Adicione a Chave da API (Variável de Ambiente):**
    *   Role para baixo até a seção "**Environment**".
    *   Clique em "**Add Environment Variable**".
    *   No campo "**Key**", digite `GOOGLE_API_KEY`.
    *   No campo "**Value**", cole a sua chave de API do Google Cloud Vision.
5.  **Crie o Serviço Web:**
    *   Clique no botão "**Create Web Service**" no final da página.
6.  **Aguarde a Implantação:**
    *   O Render começará a construir e implantar sua aplicação. Você pode acompanhar o progresso na aba "Events" ou "Logs". Isso pode levar alguns minutos.
    *   Quando a implantação for bem-sucedida, você verá uma mensagem como "Your service is live".
7.  **Acesse sua Aplicação:**
    *   O Render fornecerá uma URL pública para sua aplicação no topo da página do serviço (algo como `https://nome-da-sua-app.onrender.com`).
    *   Para testar, acesse a URL seguida de `/upload` (ex: `https://quebra-multa-ia.onrender.com/upload`).

## Solução de Problemas Comuns

*   **Erro 502 / Aplicação não inicia:** Verifique os "Logs" no Render. Pode ser um erro no código, uma variável de ambiente faltando/incorreta (`GOOGLE_API_KEY`), ou problema na instalação das dependências.
*   **Primeira visita lenta:** Se estiver usando o plano gratuito, o serviço pode "dormir" após 15 minutos de inatividade. A primeira requisição após isso pode demorar um pouco mais (30 segundos ou mais) enquanto o serviço "acorda".
*   **Erro da API Vision:** Verifique se a chave `GOOGLE_API_KEY` está correta no Render e se a API "Cloud Vision API" está ativada no seu projeto Google Cloud.

## Observações

- O `dashboard.html` é muito básico e não está integrado dinamicamente no `server.js` atual. A lógica para exibir os dados da análise no dashboard precisaria ser implementada.
- Para um uso mais sério ou comercial, considere um plano pago no Render para evitar que o serviço durma e ter mais recursos.

