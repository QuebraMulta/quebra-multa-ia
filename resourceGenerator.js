// Serviço para gerar o texto do recurso com base na análise

class ResourceGenerator {

  /**
   * Gera um texto de recurso mais personalizado com base nos erros encontrados e dados extraídos.
   * @param {object} analysisResult - Objeto retornado pelo AnalysisService.
   * @returns {string} - Texto formatado do recurso.
   */
  generateResourceText(analysisResult) {
    // --- Dados Essenciais (com placeholders e valores extraídos) ---
    const orgaoAutuador = analysisResult.data.orgaoAutuador || "[ÓRGÃO AUTUADOR - Verifique na notificação]";
    const numeroAutoInfracao = analysisResult.data.numeroAutoInfracao || "[NÚMERO DO AUTO DE INFRAÇÃO - Verifique na notificação]";
    const placa = analysisResult.data.placa || "[PLACA NÃO IDENTIFICADA]";
    const dataInfracao = analysisResult.data.data || "[DATA NÃO IDENTIFICADA]";
    const horaInfracao = analysisResult.data.hora || "[HORA NÃO IDENTIFICADA]";
    const codigoInfracao = analysisResult.data.codigoInfracao || "[CÓDIGO NÃO IDENTIFICADO]";
    const localInfracao = analysisResult.data.local || "[LOCAL DA INFRAÇÃO - Verifique na notificação]"; // Local ainda não extraído

    // --- Construção do Texto do Recurso ---
    let resourceText = `ILUSTRÍSSIMO(A) SENHOR(A) PRESIDENTE DA JUNTA ADMINISTRATIVA DE RECURSOS DE INFRAÇÕES (JARI) DO ${orgaoAutuador}\n\n`;

    resourceText += `Eu, [SEU NOME COMPLETO], CPF [SEU CPF], residente e domiciliado(a) em [SEU ENDEREÇO COMPLETO], venho respeitosamente apresentar DEFESA PRÉVIA / RECURSO DE MULTA contra a Notificação de Autuação / Penalidade referente ao Auto de Infração nº ${numeroAutoInfracao}, lavrado contra o veículo de placa ${placa} (OBS: Placa extraída automaticamente, verificar correção), pela suposta infração ocorrida em ${dataInfracao} às ${horaInfracao}, código ${codigoInfracao}, no local ${localInfracao}, pelos fatos e fundamentos que passo a expor:\n\n`;

    resourceText += "DOS FATOS E FUNDAMENTOS:\n\n";

    // Argumentação baseada nos erros encontrados
    if (analysisResult.errors && analysisResult.errors.length > 0) {
      resourceText += "A presente autuação apresenta vícios formais que a tornam irregular e insubsistente, conforme apontado pela análise preliminar e detalhado abaixo:\n\n";
      analysisResult.errors.forEach((error, index) => {
        resourceText += `**${index + 1}. ${error}**\n`;
        // Adicionar fundamentação legal mais específica
        if (error.includes("placa")) {
          resourceText += `   *Fundamento:* A correta e inequívoca identificação do veículo autuado é requisito essencial para a validade do auto de infração, conforme preceitua o Art. 280, inciso II, do Código de Trânsito Brasileiro (CTB). A ausência ou erro na identificação da placa invalida o ato administrativo.\n\n`;
        } else if (error.includes("data") || error.includes("hora")) {
          resourceText += `   *Fundamento:* A precisa identificação da data e hora do cometimento da infração é crucial para a validade do auto, conforme Art. 280, inciso IV, do CTB. A falta ou inconsistência dessa informação compromete a regularidade da autuação.\n\n`;
        } else if (error.includes("código da infração")) {
           resourceText += `   *Fundamento:* A correta tipificação da infração, através de seu código específico e correspondente descrição, é requisito obrigatório estabelecido no Art. 280, inciso I, do CTB. A ausência ou erro na tipificação impede a correta compreensão da conduta imputada e invalida a autuação.\n\n`;
        } else if (error.includes("local")) {
             resourceText += `   *Fundamento:* A identificação precisa do local de cometimento da infração é requisito indispensável, conforme Art. 280, inciso III, do CTB. A falta ou imprecisão desta informação torna a autuação irregular.\n\n`;
        } else if (error.includes("número do Auto de Infração")) {
             resourceText += `   *Fundamento:* A identificação clara e correta do número do Auto de Infração é essencial para a validade do ato administrativo, conforme Art. 280 do CTB. Sua ausência ou erro impede a correta identificação do processo.\n\n`;
        } else {
            resourceText += `   *Fundamento:* [Adicionar fundamentação legal específica para este erro, consultando o CTB e Resoluções CONTRAN pertinentes]\n\n`;
        }
      });
      resourceText += "Diante dos vícios formais apontados, que maculam a validade do Auto de Infração, requer-se o seu arquivamento e o cancelamento da penalidade imposta, nos termos do Art. 281, parágrafo único, inciso I, do CTB.\n\n";
    } else if (analysisResult.rawText && analysisResult.rawText.trim() !== "") {
        resourceText += "Embora a análise automatizada não tenha identificado vícios formais evidentes no Auto de Infração, apresento argumentos quanto ao mérito da questão:\n\n";
        resourceText += "[ADICIONE AQUI SEUS ARGUMENTOS DE DEFESA: Ex: sinalização inadequada, situação de emergência, condutor não era o proprietário (necessário indicar condutor), etc. Seja claro e objetivo, anexando provas se possível.]\n\n";
        resourceText += "Solicito, portanto, a análise dos argumentos de mérito apresentados e o consequente cancelamento da penalidade.\n\n";
    } else {
        resourceText += `Não foi possível realizar a análise automatizada da multa devido a problemas na extração do texto da imagem. Solicito, por cautela, a verificação manual da regularidade formal e material do Auto de Infração nº ${numeroAutoInfracao} antes da imposição de qualquer penalidade.\n\n`;
    }

    // --- Pedido Final ---
    resourceText += "DO PEDIDO:\n\n";
    resourceText += "Diante do exposto, requer:\n";
    resourceText += "a) O acolhimento da presente Defesa/Recurso;\n";
    resourceText += `b) O cancelamento da penalidade referente ao Auto de Infração nº ${numeroAutoInfracao} e o consequente arquivamento do processo administrativo, por ser medida de JUSTIÇA!\n\n`;

    resourceText += "Nestes termos,\nPede deferimento.\n\n";
    resourceText += "[SUA CIDADE], [DATA ATUAL]\n\n";
    resourceText += "________________________________________\n";
    resourceText += "[SEU NOME COMPLETO]\n";
    resourceText += "CPF: [SEU CPF]\n";

    // --- Aviso Importante ---
    resourceText += "\n\n----------------------------------------\n";
    resourceText += "**ATENÇÃO:** Este é um modelo gerado automaticamente.\n";
    resourceText += "1.  **Revise TODO o texto** cuidadosamente.\n";
    resourceText += `2.  **Preencha TODOS os campos entre colchetes []** com suas informações corretas (Nome, CPF, Endereço, Local, Cidade, Data Atual). O Órgão Autuador identificado foi: **${orgaoAutuador}**.\n`; // Updated instruction
    resourceText += `3.  **Verifique os dados extraídos:** Placa (${placa}), Data (${dataInfracao}), Hora (${horaInfracao}), Código (${codigoInfracao}), Nº Auto Infração (${numeroAutoInfracao}). Corrija se necessário.\n`; // Updated instruction
    resourceText += "4.  **Adapte ou adicione argumentos de mérito** na seção correspondente, se aplicável.\n";
    resourceText += "5.  **Anexe cópias dos documentos necessários** (CNH, CRLV, Notificação, comprovante de residência, procuração se houver, e outras provas).\n";
    resourceText += `6.  **Consulte o site oficial do ${orgaoAutuador}** para instruções exatas sobre como protocolar sua defesa (online, correio, etc.) e quais documentos adicionais podem ser exigidos.\n`; // Updated instruction
    resourceText += "7.  **Consulte a legislação** (CTB e Resoluções CONTRAN) para fortalecer seus argumentos.\n";
    resourceText += "\n----------------------------------------\n";

    return resourceText;
  }
}

module.exports = new ResourceGenerator();

