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
    }
}


async function adicionarEvento(evento) {
    const banco = await abrirBanco();

    return new Promise((resolve, reject) => {
        const transacao = banco.transaction(
            CONFIG_BANCO.tabelas.eventos,
            "readwrite"
        );

        const tabela = transacao.objectStore(
            CONFIG_BANCO.tabelas.eventos
        );

        const requisicao = tabela.add(evento);

        requisicao.onsuccess = function () {
            resolve();
        };

        requisicao.onerror = function () {
            reject(requisicao.error);
        };
    });
}

async function listarEventos() {
    const banco = await abrirBanco();

    return new Promise((resolve, reject) => {
        const transacao = banco.transaction(
            CONFIG_BANCO.tabelas.eventos,
            "readonly"
        );

        const tabela = transacao.objectStore(
            CONFIG_BANCO.tabelas.eventos
        );

        const requisicao = tabela.getAll();

        requisicao.onsuccess = function () {
            resolve(requisicao.result);
        };

        requisicao.onerror = function () {
            reject(requisicao.error);
        };
    });
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
                    <th>Ações</th>
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
                                data-acao="editar"
                                data-id="${evento.id}"
                            >
                                Editar
                            </button>

                            <button
                                type="button"
                                data-acao="abrir"
                                data-id="${evento.id}"
                            >
                                Abrir
                            </button>

                            <button
                                type="button"
                                data-acao="excluir"
                                data-id="${evento.id}"
                            >
                                Excluir
                            </button>
                        </td>
                    </tr>
                `).join("")}
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

    if (acao === "editar") {
        await editarEvento(id);
        return;
    }

    if (acao === "excluir") {
        await excluirEvento(id);
        return;
    }

    if (acao === "abrir") {
    await abrirEventoParaPresencas(id);
    return;
    }
}

async function buscarEventoPorId(id) {
    const banco = await abrirBanco();

    return new Promise((resolve, reject) => {
        const transacao = banco.transaction(
            CONFIG_BANCO.tabelas.eventos,
            "readonly"
        );

        const tabela = transacao.objectStore(
            CONFIG_BANCO.tabelas.eventos
        );

        const requisicao = tabela.get(id);

        requisicao.onsuccess = function () {
            resolve(requisicao.result);
        };

        requisicao.onerror = function () {
            reject(requisicao.error);
        };
    });
}


async function editarEvento(id) {
    const evento = await buscarEventoPorId(id);

    if (!evento) {
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
    const banco = await abrirBanco();

    return new Promise((resolve, reject) => {
        const transacao = banco.transaction(
            CONFIG_BANCO.tabelas.eventos,
            "readwrite"
        );

        const tabela = transacao.objectStore(
            CONFIG_BANCO.tabelas.eventos
        );

        const requisicao = tabela.put(evento);

        requisicao.onsuccess = function () {
            resolve();
        };

        requisicao.onerror = function () {
            reject(requisicao.error);
        };
    });
}


async function excluirEvento(id) {
    const confirmar = confirm(
        "Deseja realmente excluir este evento?"
    );

    if (!confirmar) {
        return;
    }

    try {
        const banco = await abrirBanco();

        const presencas =
            await listarPresencas();

        const presencasDoEvento =
            presencas.filter(
                presenca =>
                    presenca.eventoId === id
            );

          console.log("ID do evento excluído:", id);
console.log("Total de presenças:", presencas.length);
console.log(
    "Presenças encontradas para este evento:",
    presencasDoEvento.length
);
console.table(presencasDoEvento);  

        await new Promise((resolve, reject) => {
            const transacao = banco.transaction(
                [
                    CONFIG_BANCO.tabelas.eventos,
                    CONFIG_BANCO.tabelas.presencas
                ],
                "readwrite"
            );

            const tabelaEventos =
                transacao.objectStore(
                    CONFIG_BANCO.tabelas.eventos
                );

            const tabelaPresencas =
                transacao.objectStore(
                    CONFIG_BANCO.tabelas.presencas
                );

            tabelaEventos.delete(id);

            for (const presenca of presencasDoEvento) {
                tabelaPresencas.delete(
                    presenca.id
                );
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

        await carregarEventos();

    } catch (erro) {
        console.error(
            "Erro ao excluir evento:",
            erro
        );
    }
}