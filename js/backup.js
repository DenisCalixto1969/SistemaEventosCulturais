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
        const membros =
            backup.dados.membros || [];

        const eventos =
            backup.dados.eventos || [];

        const idsMembrosValidos =
            new Set(
                membros.map(membro => membro.id)
            );

        const idsEventosValidos =
            new Set(
                eventos.map(evento => evento.id)
            );

        const presencas =
            (backup.dados.presencas || [])
                .filter(
                    presenca =>
                        idsMembrosValidos.has(
                            presenca.membroId
                        ) &&
                        idsEventosValidos.has(
                            presenca.eventoId
                        )
                )
                .map(
                    presenca => ({
                        id: presenca.id,
                        evento_id: presenca.eventoId,
                        membro_id: presenca.membroId,
                        presente: presenca.presente
                    })
                );

        // Limpa os dados atuais.
        const { error: erroExcluirPresencas } =
            await clienteSupabase
                .from("presencas")
                .delete()
                .not("id", "is", null);

        if (erroExcluirPresencas) {
            throw erroExcluirPresencas;
        }

        const { error: erroExcluirEventos } =
            await clienteSupabase
                .from("eventos")
                .delete()
                .not("id", "is", null);

        if (erroExcluirEventos) {
            throw erroExcluirEventos;
        }

        const { error: erroExcluirMembros } =
            await clienteSupabase
                .from("membros")
                .delete()
                .not("id", "is", null);

        if (erroExcluirMembros) {
            throw erroExcluirMembros;
        }

        // Restaura membros.
        if (membros.length > 0) {
            const { error } =
                await clienteSupabase
                    .from("membros")
                    .insert(membros);

            if (error) {
                throw new Error(
                    `Erro ao restaurar membros: ${error.message}`
                );
            }
        }

        // Restaura eventos.
        if (eventos.length > 0) {
            const { error } =
                await clienteSupabase
                    .from("eventos")
                    .insert(eventos);

            if (error) {
                throw new Error(
                    `Erro ao restaurar eventos: ${error.message}`
                );
            }
        }

        // Restaura presenças.
        if (presencas.length > 0) {
            const { error } =
                await clienteSupabase
                    .from("presencas")
                    .insert(presencas);

            if (error) {
                throw new Error(
                    `Erro ao restaurar presenças: ${error.message}`
                );
            }
        }

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