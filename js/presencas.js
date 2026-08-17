"use strict";


function carregarModuloPresencas() {
    return `
        <section class="modulo">

            <div class="cabecalho-modulo">
                <div>
                    <h2>Presenças</h2>
                    <p>Registro e consulta de presença nos eventos.</p>
                </div>
            </div>

            <section class="painel">
                <h3>Selecionar evento</h3>

                <div id="lista-eventos-presencas">
                    <p>Carregando eventos...</p>
                </div>
            </section>

            <section class="painel">
                <div id="evento-aberto">
                    <p>
                        Selecione um evento para consultar
                        ou registrar as presenças.
                    </p>
                </div>
            </section>

        </section>
    `;
}

async function inicializarModuloPresencas() {
    await carregarListaEventosPresencas();
}


function membroPodeParticiparEvento(membro, evento) {
    if (!membro || !evento) {
        return false;
    }

    const grauMembro = Number(membro.grau);
    const grauEvento = Number(evento.grau);

    if (evento.tipo === "Reunião Administrativa") {
        return grauMembro === 33;
    }

    return grauMembro >= grauEvento;
}

async function listarPresencas() {
    const { data, error } =
        await clienteSupabase
            .from("presencas")
            .select("*");

    if (error) {
        throw new Error(
            `Não foi possível listar as presenças: ${error.message}`
        );
    }

    return (data || []).map(presenca => ({
        id: presenca.id,
        eventoId: presenca.evento_id,
        membroId: presenca.membro_id,
        presente: presenca.presente
    }));
}
async function adicionarPresenca(presenca) {
    const registroSupabase = {
        id: presenca.id,
        evento_id: presenca.eventoId,
        membro_id: presenca.membroId,
        presente: presenca.presente
    };

    const { error } =
        await clienteSupabase
            .from("presencas")
            .insert(registroSupabase);

    if (error) {
        throw new Error(
            `Não foi possível adicionar a presença: ${error.message}`
        );
    }
}
async function atualizarPresenca(presenca) {
    const { error } =
        await clienteSupabase
            .from("presencas")
            .update({
                evento_id: presenca.eventoId,
                membro_id: presenca.membroId,
                presente: presenca.presente
            })
            .eq("id", presenca.id);

    if (error) {
        throw new Error(
            `Não foi possível atualizar a presença: ${error.message}`
        );
    }
}


async function gerarPresencasEvento(evento) {
    const membros = await listarMembros();

    const presencasExistentes =
        await listarPresencas();

    const presencasDoEvento =
        presencasExistentes.filter(
            presenca =>
                presenca.eventoId === evento.id
        );

    const membrosAptos = membros.filter(
        membro =>
            membroPodeParticiparEvento(
                membro,
                evento
            )
    );

    let quantidadeCriada = 0;

    for (const membro of membrosAptos) {
        const jaExiste =
            presencasDoEvento.some(
                presenca =>
                    presenca.membroId === membro.id
            );

        if (jaExiste) {
            continue;
        }

        const novaPresenca = {
            id: crypto.randomUUID(),
            eventoId: evento.id,
            membroId: membro.id,
            presente: false
        };

        await adicionarPresenca(novaPresenca);

        quantidadeCriada++;
    }

    return quantidadeCriada;
}


async function abrirEventoParaPresencas(idEvento) {
    const evento =
        await buscarEventoPorId(idEvento);

    if (!evento) {
        return;
    }

    await gerarPresencasEvento(evento);

    await carregarModulo("presencas");

    await carregarEventoAberto(evento.id);
}


async function carregarEventoAberto(
    idEvento,
    modo = "edicao"
) {
    const evento =
        await buscarEventoPorId(idEvento);

    if (!evento) {
        return;
    }

    const todasPresencas =
        await listarPresencas();

    const presencasEvento =
        todasPresencas.filter(
            presenca =>
                presenca.eventoId === evento.id
        );

    const membros =
        await listarMembros();

    const registros = [];

    for (const presenca of presencasEvento) {
        const membro = membros.find(
            item =>
                item.id === presenca.membroId
        );

        if (!membro) {
            continue;
        }

        registros.push({
            presenca,
            membro
        });
    }

    registros.sort((a, b) =>
        a.membro.nome.localeCompare(
            b.membro.nome,
            "pt-BR",
            { sensitivity: "base" }
        )
    );

   renderizarEventoAberto(
    evento,
    registros,
    modo
);
}


function renderizarEventoAberto(
    evento,
    registros,
    modo = "edicao"
) {                 
    const container =
        document.querySelector("#evento-aberto");

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="cabecalho-evento-aberto">
            <h3>
                ${obterNomeExibicaoEvento(evento)}
            </h3>

            <p>
                Data:
                ${formatarDataEvento(evento.data)}
            </p>

            <p>
                Participação:
                ${obterRegraExibicaoEvento(evento)}
            </p>
        </div>

        <hr>

        <h3>Participantes aptos</h3>

        ${
            registros.length === 0
                ? `
                    <p>
                        Nenhum membro apto para este evento.
                    </p>
                `
                : `
                    <table>
                        <thead>
                            <tr>
                                <th>Presente</th>
                                <th>Nome</th>
                                <th>Grau</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${registros.map(item => `
                                <tr>
                                    <td>
                                        <input
                        type="checkbox"
                        class="controle-presenca"
                     data-id="${item.presenca.id}"
                        ${
                            item.presenca.presente
                                ? "checked"
                                : ""
                     }
                        ${
                         modo === "consulta"
                                ? "disabled"
                             : ""
                      }
                    >
                                    </td>

                                    <td>
                                        ${item.membro.nome}
                                    </td>

                                    <td>
                                        Grau ${item.membro.grau}
                                    </td>

                                    <td
                                        id="status-${item.presenca.id}"
                                    >
                                        ${
                                            item.presenca.presente
                                                ? "Presente"
                                                : "Ausente"
                                        }
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                `
        }

        ${
    modo === "consulta"
        ? `
            <p class="modo-consulta">
                Modo consulta — alterações de presença estão bloqueadas.
            </p>
        `
        : ""
}

<div id="resumo-presencas"></div>
    `;

    container
        .querySelectorAll(".controle-presenca")
        .forEach(controle => {
            controle.addEventListener(
                "change",
                alterarPresencaEvento
            );
        });

    atualizarResumoEvento(registros);
}


async function alterarPresencaEvento(evento) {
    const controle =
        evento.currentTarget;

    const id = controle.dataset.id;

    const todasPresencas =
        await listarPresencas();

    const presenca =
        todasPresencas.find(
            item =>
                item.id === id
        );

    if (!presenca) {
        return;
    }

    presenca.presente =
        controle.checked;

    await atualizarPresenca(presenca);

    const status =
        document.querySelector(
            `#status-${presenca.id}`
        );

    if (status) {
        status.textContent =
            presenca.presente
                ? "Presente"
                : "Ausente";
    }

    const eventoAtual =
        await buscarEventoPorId(
            presenca.eventoId
        );

    if (eventoAtual) {
        await carregarEventoAberto(
            eventoAtual.id
        );
    }
}


function atualizarResumoEvento(registros) {
    const resumo =
        document.querySelector(
            "#resumo-presencas"
        );

    if (!resumo) {
        return;
    }

    const total =
        registros.length;

    const presentes =
        registros.filter(
            item =>
                item.presenca.presente
        ).length;

    const ausentes =
        total - presentes;

    resumo.innerHTML = `
        <p>
            <strong>Total:</strong>
            ${total}
            |
            <strong>Presentes:</strong>
            ${presentes}
            |
            <strong>Ausentes:</strong>
            ${ausentes}
        </p>
    `;
}

async function limparPresencasOrfas() {
    const eventos = await listarEventos();
    const presencas = await listarPresencas();

    const idsEventosValidos =
        new Set(
            eventos.map(evento => evento.id)
        );

    const presencasOrfas =
        presencas.filter(
            presenca =>
                !idsEventosValidos.has(
                    presenca.eventoId
                )
        );

    if (presencasOrfas.length === 0) {
        return 0;
    }

    const idsPresencasOrfas =
        presencasOrfas.map(
            presenca => presenca.id
        );

    const { error } =
        await clienteSupabase
            .from("presencas")
            .delete()
            .in("id", idsPresencasOrfas);

    if (error) {
        throw new Error(
            `Não foi possível limpar presenças órfãs: ${error.message}`
        );
    }

    return presencasOrfas.length;
}

async function carregarListaEventosPresencas() {
    const container =
        document.querySelector(
            "#lista-eventos-presencas"
        );

    if (!container) {
        return;
    }

    const eventos =
        await listarEventos();

    eventos.sort((a, b) =>
        b.data.localeCompare(a.data)
    );

    if (eventos.length === 0) {
        container.innerHTML = `
            <p>Nenhum evento cadastrado.</p>
        `;

        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Evento</th>
                    <th>Participação</th>
                    <th>Ação</th>
                </tr>
            </thead>

            <tbody>
                ${eventos.map(evento => `
                    <tr>
                        <td>
                            ${formatarDataEvento(evento.data)}
                        </td>

                        <td>
                            ${obterNomeExibicaoEvento(evento)}
                        </td>

                        <td>
                            ${obterRegraExibicaoEvento(evento)}
                        </td>

                        <td>
                            <button
                                type="button"
                                class="botao-abrir-presencas"
                                data-id="${evento.id}"
                            >
                                Abrir
                            </button>
                        </td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;

    container
        .querySelectorAll(
            ".botao-abrir-presencas"
        )
        .forEach(botao => {
            botao.addEventListener(
                "click",
                async function () {
                    const idEvento =
                        botao.dataset.id;

                    const evento =
                        await buscarEventoPorId(
                            idEvento
                        );

                    if (!evento) {
                        return;
                    }

                    await gerarPresencasEvento(
                        evento
                    );

                   await carregarEventoAberto(
    evento.id,
    "consulta"
);
                }
            );
        });
}