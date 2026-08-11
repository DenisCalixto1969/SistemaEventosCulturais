"use strict";


async function exportarBackup() {
    try {
        const membros =
            await listarMembros();

        const eventos =
            await listarEventos();

        const presencas =
            await listarPresencas();


        const backup = {
            sistema: "Sistema Cadastro de Eventos Culturais",
            versaoBackup: 1,
            dataBackup: new Date().toISOString(),

            dados: {
                membros,
                eventos,
                presencas
            }
        };


        const conteudo =
            JSON.stringify(
                backup,
                null,
                2
            );


        const arquivo =
            new Blob(
                [conteudo],
                {
                    type: "application/json"
                }
            );


        const url =
            URL.createObjectURL(arquivo);


        const link =
            document.createElement("a");


        const agora =
            new Date();


        const ano =
            agora.getFullYear();

        const mes =
            String(
                agora.getMonth() + 1
            ).padStart(2, "0");

        const dia =
            String(
                agora.getDate()
            ).padStart(2, "0");


        link.href = url;

        link.download =
            `backup-eventos-culturais-${ano}-${mes}-${dia}.json`;


        document.body.appendChild(link);

        link.click();

        link.remove();


        URL.revokeObjectURL(url);

    } catch (erro) {
        console.error(
            "Erro ao exportar backup:",
            erro
        );

        alert(
            "Não foi possível gerar o backup."
        );
    }
}

function selecionarArquivoBackup() {
    const campoArquivo =
        document.querySelector(
            "#arquivo-backup"
        );

    if (!campoArquivo) {
        return;
    }

    campoArquivo.value = "";

    campoArquivo.click();
}

async function validarArquivoBackup(evento) {
    const arquivo = evento.target.files[0];

    if (!arquivo) {
        return;
    }

    try {
        const texto = await arquivo.text();
        const backup = JSON.parse(texto);

        if (
            !backup.dados ||
            !Array.isArray(backup.dados.membros) ||
            !Array.isArray(backup.dados.eventos) ||
            !Array.isArray(backup.dados.presencas)
        ) {
            throw new Error(
                "O arquivo não possui a estrutura esperada."
            );
        }

        alert(
            "Backup válido!\n\n" +
            `Membros: ${backup.dados.membros.length}\n` +
            `Eventos: ${backup.dados.eventos.length}\n` +
            `Presenças: ${backup.dados.presencas.length}`
        );

        console.log(
            "Backup validado:",
            backup
        );

        await restaurarBackup(backup);

    } catch (erro) {
        console.error(
            "Erro ao validar backup:",
            erro
        );

        alert(
            "Arquivo de backup inválido ou corrompido."
        );
    }
}

async function restaurarBackup(backup) {
    const confirmar = confirm(
        "A restauração substituirá todos os dados atuais.\n\n" +
        `Membros: ${backup.dados.membros.length}\n` +
        `Eventos: ${backup.dados.eventos.length}\n` +
        `Presenças: ${backup.dados.presencas.length}\n\n` +
        "Deseja continuar?"
    );

    if (!confirmar) {
        return;
    }

    try {
        const banco = await abrirBanco();

        await new Promise((resolve, reject) => {
            const transacao = banco.transaction(
                [
                    CONFIG_BANCO.tabelas.membros,
                    CONFIG_BANCO.tabelas.eventos,
                    CONFIG_BANCO.tabelas.presencas
                ],
                "readwrite"
            );

            const tabelaMembros =
                transacao.objectStore(
                    CONFIG_BANCO.tabelas.membros
                );

            const tabelaEventos =
                transacao.objectStore(
                    CONFIG_BANCO.tabelas.eventos
                );

            const tabelaPresencas =
                transacao.objectStore(
                    CONFIG_BANCO.tabelas.presencas
                );

            tabelaMembros.clear();
            tabelaEventos.clear();
            tabelaPresencas.clear();

            for (const membro of backup.dados.membros) {
                tabelaMembros.put(membro);
            }

            for (const evento of backup.dados.eventos) {
                tabelaEventos.put(evento);
            }

            for (const presenca of backup.dados.presencas) {
                tabelaPresencas.put(presenca);
            }

            transacao.oncomplete = function () {
                resolve();
            };

            transacao.onerror = function () {
                reject(transacao.error);
            };

            transacao.onabort = function () {
                reject(transacao.error);
            };
        });

        alert(
            "Backup restaurado com sucesso."
        );

        window.location.reload();

    } catch (erro) {
        console.error(
            "Erro ao restaurar backup:",
            erro
        );

        alert(
            "Não foi possível restaurar o backup."
        );
    }
}