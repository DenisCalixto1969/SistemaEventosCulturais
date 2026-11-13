"use strict";

let eventoEmEdicaoId = null;


function carregarModuloEventos() {
    return `
        <section class="modulo">

            <div class="cabecalho-modulo">
                <div>
                    <h2>Eventos</h2>
                    <p>Cadastro e consulta de eventos culturais.</p>
                </div>

                <button
                    type="button"
                    id="botao-novo-evento"
                >
                    + Novo Evento
                </button>
            </div>

            <section class="painel">
                <h3>Eventos cadastrados</h3>

                <div id="lista-eventos">
                    <p>Nenhum evento cadastrado.</p>
                </div>
            </section>

        </section>


        <div
            id="modal-evento"
            class="modal"
            hidden
        >
            <div class="modal-conteudo">

                <h2>Novo Evento</h2>

                <form id="formulario-evento">

                    <div class="campo-formulario">
                        <label for="evento-data">
                            Data
                        </label>

                        <input
                            type="date"
                            id="evento-data"
                            required
                        >
                    </div>


                    <div class="campo-formulario">
                        <label for="evento-tipo">
                            Tipo do Evento
                        </label>

                        <select
                            id="evento-tipo"
                            required
                        ></select>
                    </div>


                    <div
                        id="campo-nome-evento"
                        class="campo-formulario"
                        hidden
                    >
                        <label for="evento-nome">
                            Nome do Evento
                        </label>

                        <input
                            type="text"
                            id="evento-nome"
                            autocomplete="off"
                        >
                    </div>


                    <div
                        id="campo-grau-evento"
                        class="campo-formulario"
                    >
                        <label for="evento-grau">
                            Grau mínimo
                        </label>

                        <select
                            id="evento-grau"
                        ></select>
                    </div>


                    <div
                        id="regra-evento"
                        class="informacao-evento"
                    ></div>


                    <div
                        id="erro-formulario-evento"
                        class="mensagem-erro"
                    ></div>


                    <div class="acoes-formulario">

                        <button
                            type="button"
                            id="botao-cancelar-evento"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            id="botao-salvar-evento"
                        >
                            Salvar
                        </button>

                    </div>

                </form>

            </div>
        </div>
    `;
}


async function inicializarModuloEventos() {
    preencherTiposEventos();
    preencherGrausEvento();
    atualizarCamposEvento();

    document
        .querySelector("#botao-novo-evento")
        .addEventListener("click", abrirModalEvento);

    document
        .querySelector("#botao-cancelar-evento")
        .addEventListener("click", fecharModalEvento);

    document
        .querySelector("#evento-tipo")
        .addEventListener("change", atualizarCamposEvento);

    document
        .querySelector("#formulario-evento")
        .addEventListener("submit", salvarEvento);

    await carregarEventos();
}


function preencherTiposEventos() {
    const campoTipo =
        document.querySelector("#evento-tipo");

    campoTipo.innerHTML = CONFIG.tiposEventos
        .map(tipo => {
            return `
                <option value="${tipo}">
                    ${tipo}
                </option>
            `;
        })
        .join("");
}


function preencherGrausEvento() {
    const campoGrau =
        document.querySelector("#evento-grau");

    campoGrau.innerHTML = CONFIG.graus
        .map(grau => {
            return `
                <option value="${grau}">
                    Grau ${grau}
                </option>
            `;
        })
        .join("");
}


function atualizarCamposEvento() {
    const tipo =
        document.querySelector("#evento-tipo").value;

    const campoNome =
        document.querySelector("#campo-nome-evento");

    const campoGrau =
        document.querySelector("#campo-grau-evento");

    const nome =
        document.querySelector("#evento-nome");

    const grau =
        document.querySelector("#evento-grau");

    const regra =
        document.querySelector("#regra-evento");


    campoNome.hidden = true;
    campoGrau.hidden = true;

    nome.required = false;
    grau.required = false;


    if (tipo === "Fórum de Debates") {
        campoGrau.hidden = false;
        grau.required = true;

        regra.textContent =
            "Participam membros com grau igual ou superior ao grau selecionado.";

        return;
    }


    if (tipo === "Cordeiro Pascal") {
        grau.value = "18";

        regra.textContent =
            "Participam membros de Grau 18 ou superior.";

        return;
    }


    if (tipo === "5ª Feira de Endoenças") {
        grau.value = "18";

        regra.textContent =
            "Participam membros de Grau 18 ou superior.";

        return;
    }


    if (tipo === "Reunião Administrativa") {
        grau.value = "33";

        regra.textContent =
            "Participam somente membros de Grau 33.";

        return;
    }


    if (tipo === "Evento Extra") {
        campoNome.hidden = false;
        campoGrau.hidden = false;

        nome.required = true;
        grau.required = true;

        regra.textContent =
            "Informe o nome do evento e o grau mínimo para participação.";
    }
}


function abrirModalEvento() {
    eventoEmEdicaoId = null;

    const formulario =
        document.querySelector("#formulario-evento");

    formulario.reset();

    document.querySelector(
        "#modal-evento h2"
    ).textContent = "Novo Evento";

    document.querySelector(
        "#erro-formulario-evento"
    ).textContent = "";

    document.querySelector(
        "#evento-tipo"
    ).value = CONFIG.tiposEventos[0];

    document.querySelector(
        "#evento-grau"
    ).value = CONFIG.graus[0];

    atualizarCamposEvento();

    document.querySelector(
        "#modal-evento"
    ).hidden = false;

    document.querySelector(
        "#evento-data"
    ).focus();
}


function fecharModalEvento() {
    eventoEmEdicaoId = null;

    document.querySelector(
        "#modal-evento"
    ).hidden = true;
}


function obterDadosFormularioEvento() {
    const tipo =
        document.querySelector("#evento-tipo").value;

    let nome = "";

    let grau = null;


    if (tipo === "Fórum de Debates") {
        grau = Number(
            document.querySelector("#evento-grau").value
        );
    }


    if (
        tipo === "Cordeiro Pascal" ||
        tipo === "5ª Feira de Endoenças"
    ) {
        grau = 18;
    }


    if (tipo === "Reunião Administrativa") {
        grau = 33;
    }


    if (tipo === "Evento Extra") {
        nome = document
            .querySelector("#evento-nome")
            .value
            .trim();

        grau = Number(
            document.querySelector("#evento-grau").value
        );
    }


    return {
        data: document.querySelector("#evento-data").value,
        tipo,
        nome,
        grau
    };
}


function validarDadosEvento(dados) {
    if (!dados.data) {
        return "Informe a data do evento.";
    }

    if (!dados.tipo) {
        return "Informe o tipo do evento.";
    }

    if (
        dados.tipo === "Evento Extra" &&
        !dados.nome
    ) {
        return "Informe o nome do Evento Extra.";
    }

    if (!dados.grau) {
        return "Informe o grau do evento.";
    }

    return null;
}


async function salvarEvento(evento) {
    evento.preventDefault();

    const dados = obterDadosFormularioEvento();

    const erroValidacao =
        validarDadosEvento(dados);

    if (erroValidacao) {
        document.querySelector(
            "#erro-formulario-evento"
        ).textContent = erroValidacao;

        return;
    }


    try {
        if (eventoEmEdicaoId) {
            // Confere novamente no banco antes de permitir a alteração.
            const eventoExistente =
                await buscarEventoPorId(eventoEmEdicaoId);

            if (!eventoExistente) {
                alert("Evento não encontrado.");
                fecharModalEvento();
                await carregarEventos();
                return;
            }

            if (eventoExistente.evento_encerrado === true) {
                alert(
                    "Este evento está encerrado e não pode mais ser alterado."
                );

                fecharModalEvento();
                await carregarEventos();
                return;
            }

            const eventoAtualizado = {
                id: eventoEmEdicaoId,
                data: dados.data,
                tipo: dados.tipo,
                nome: dados.nome,
                grau: dados.grau
            };

            await atualizarEvento(eventoAtualizado);

            eventoEmEdicaoId = null;

        } else {
            const novoEvento = {
                id: crypto.randomUUID(),
                data: dados.data,
                tipo: dados.tipo,
                nome: dados.nome,
                grau: dados.grau
            };

            await adicionarEvento(novoEvento);
        }

        fecharModalEvento();

        await carregarEventos();


    } catch (erro) {
        console.error(
            "Erro ao salvar evento:",
            erro
        );

        alert(
            `Não foi possível salvar o evento: ${erro.message}`
        );
    }
}


async function adicionarEvento(evento) {
    const { error } =
        await clienteSupabase
            .from("eventos")
            .insert(evento);

    if (error) {
        throw new Error(
            `Não foi possível adicionar o evento: ${error.message}`
        );
    }
}


async function listarEventos() {
    const { data, error } =
        await clienteSupabase
            .from("eventos")
            .select("*");

    if (error) {
        throw new Error(
            `Não foi possível listar os eventos: ${error.message}`
        );
    }

    return data || [];
}


function formatarDataEvento(data) {
    if (!data) {
        return "";
    }

    const partes = data.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


function obterNomeExibicaoEvento(evento) {
    if (
        evento.tipo === "Evento Extra" &&
        evento.nome
    ) {
        return evento.nome;
    }

    return evento.tipo;
}


function obterRegraExibicaoEvento(evento) {
    if (evento.tipo === "Reunião Administrativa") {
        return "Somente Grau 33";
    }

    return `Grau ${evento.grau} ou superior`;
}


async function carregarEventos() {
    const container =
        document.querySelector("#lista-eventos");

    const eventos = await listarEventos();

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
                    <th>Situação</th>
                    <th>Ações</th>
                </tr>
            </thead>

            <tbody>
                ${eventos.map(evento => {
                    const encerrado =
                        evento.evento_encerrado === true;

                    return `
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
                                ${encerrado ? "Encerrado" : "Em andamento"}
                            </td>

                            <td>
                                ${encerrado ? "" : `
                                    <button
                                        type="button"
                                        data-acao="editar"
                                        data-id="${evento.id}"
                                    >
                                        Editar
                                    </button>
                                `}

                                <button
    type="button"
    data-acao="abrir"
    data-id="${evento.id}"
>
    ${encerrado ? "Abrir Consulta" : "Abrir"}
</button>

                                ${encerrado ? "" : `
                                    <button
                                        type="button"
                                        data-acao="encerrar"
                                        data-id="${evento.id}"
                                    >
                                        Encerrar
                                    </button>

                                    <button
                                        type="button"
                                        data-acao="excluir"
                                        data-id="${evento.id}"
                                    >
                                        Excluir
                                    </button>
                                `}
                            </td>
                        </tr>
                    `;
                }).join("")}
            </tbody>
        </table>
    `;


    container
        .querySelectorAll("button[data-acao]")
        .forEach(botao => {
            botao.addEventListener(
                "click",
                tratarAcaoEvento
            );
        });
}


async function tratarAcaoEvento(evento) {
    const botao = evento.currentTarget;

    const acao = botao.dataset.acao;
    const id = botao.dataset.id;


    try {
        if (acao === "editar") {
            await editarEvento(id);
            return;
        }

        if (acao === "excluir") {
            await excluirEvento(id);
            return;
        }

        if (acao === "encerrar") {
            await encerrarEvento(id);
            return;
        }

        if (acao === "abrir") {
            await abrirEventoParaPresencas(id);
            return;
        }

    } catch (erro) {
        console.error(
            "Erro ao executar ação do evento:",
            erro
        );

        alert(
            `Não foi possível executar a ação: ${erro.message}`
        );
    }
}


async function buscarEventoPorId(id) {
    const { data, error } =
        await clienteSupabase
            .from("eventos")
            .select("*")
            .eq("id", id)
            .maybeSingle();

    if (error) {
        throw new Error(
            `Não foi possível localizar o evento: ${error.message}`
        );
    }

    return data || null;
}


async function editarEvento(id) {
    const evento = await buscarEventoPorId(id);

    if (!evento) {
        alert("Evento não encontrado.");
        return;
    }

    if (evento.evento_encerrado === true) {
        alert(
            "Este evento está encerrado e não pode mais ser alterado."
        );
        return;
    }

    eventoEmEdicaoId = evento.id;

    document.querySelector(
        "#modal-evento h2"
    ).textContent = "Editar Evento";

    document.querySelector(
        "#evento-data"
    ).value = evento.data;

    document.querySelector(
        "#evento-tipo"
    ).value = evento.tipo;

    document.querySelector(
        "#evento-nome"
    ).value = evento.nome || "";

    document.querySelector(
        "#evento-grau"
    ).value = evento.grau;

    document.querySelector(
        "#erro-formulario-evento"
    ).textContent = "";

    atualizarCamposEvento();

    document.querySelector(
        "#modal-evento"
    ).hidden = false;

    document.querySelector(
        "#evento-data"
    ).focus();
}


async function atualizarEvento(evento) {
    // Segunda proteção: não atualizar um evento já encerrado.
    const eventoExistente =
        await buscarEventoPorId(evento.id);

    if (!eventoExistente) {
        throw new Error("Evento não encontrado.");
    }

    if (eventoExistente.evento_encerrado === true) {
        throw new Error(
            "Este evento está encerrado e não pode mais ser alterado."
        );
    }

    const { error } =
        await clienteSupabase
            .from("eventos")
            .update({
                data: evento.data,
                tipo: evento.tipo,
                nome: evento.nome,
                grau: evento.grau
            })
            .eq("id", evento.id)
            .eq("evento_encerrado", false);

    if (error) {
        throw new Error(
            `Não foi possível atualizar o evento: ${error.message}`
        );
    }
}


async function encerrarEvento(id) {
    const evento = await buscarEventoPorId(id);

    if (!evento) {
        alert("Evento não encontrado.");
        return;
    }

    if (evento.evento_encerrado === true) {
        alert("Este evento já está encerrado.");
        await carregarEventos();
        return;
    }

    // A lista de presenças precisa estar encerrada primeiro.
    if (evento.lista_presencas_encerrada !== true) {
        alert(
            "Não é possível encerrar o evento.\n\n" +
            "Primeiro, encerre a lista de presenças deste evento."
        );
        return;
    }

    const confirmar = confirm(
        "Deseja realmente encerrar este evento?\n\n" +
        "Após a confirmação, não será mais possível editar ou excluir o evento."
    );

    if (!confirmar) {
        return;
    }

    const { error } =
        await clienteSupabase
            .from("eventos")
            .update({
                evento_encerrado: true
            })
            .eq("id", id)
            .eq("evento_encerrado", false);

    if (error) {
        throw new Error(
            `Não foi possível encerrar o evento: ${error.message}`
        );
    }

    alert("Evento encerrado com sucesso!");

    await carregarEventos();
}


async function excluirEvento(id) {
    const evento = await buscarEventoPorId(id);

    if (!evento) {
        alert("Evento não encontrado.");
        return;
    }

    if (evento.evento_encerrado === true) {
        alert(
            "Este evento está encerrado e não pode ser excluído."
        );
        return;
    }

    const confirmar = confirm(
        "Deseja realmente excluir este evento?"
    );

    if (!confirmar) {
        return;
    }

    const { error } =
        await clienteSupabase
            .from("eventos")
            .delete()
            .eq("id", id)
            .eq("evento_encerrado", false);

    if (error) {
        throw new Error(
            `Não foi possível excluir o evento: ${error.message}`
        );
    }

    await carregarEventos();
}