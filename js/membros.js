"use strict";

let membroEmEdicaoId = null;

function carregarModuloMembros() {
    return `
        <section class="modulo">
            <div class="cabecalho-modulo">
                <div>
                    <h2>Membros</h2>
                    <p>Cadastro e consulta de membros.</p>
                </div>

                <button
                    type="button"
                    id="botao-novo-membro"
                >
                    + Novo Membro
                </button>
            </div>

            <section class="painel">
                <h3>Membros cadastrados</h3>

                <div id="lista-membros">
                    <p>Nenhum membro cadastrado.</p>
                </div>
            </section>
        </section>

        <div
            id="modal-membro"
            class="modal"
            hidden
        >
            <div class="modal-conteudo">

                <h2>Novo Membro</h2>

                <form id="formulario-membro">

                    <div class="campo-formulario">
                        <label for="membro-nome">
                            Nome
                        </label>

                        <input
                            type="text"
                            id="membro-nome"
                            autocomplete="off"
                            required
                        >
                    </div>

                    <div class="campo-formulario">
                        <label for="membro-grau">
                            Grau
                        </label>

                        <select
                            id="membro-grau"
                            required
                        ></select>
                    </div>

                    <div
                        id="erro-formulario-membro"
                        class="mensagem-erro"
                    ></div>

                    <div class="acoes-formulario">
                        <button
                            type="button"
                            id="botao-cancelar-membro"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            id="botao-salvar-membro"
                        >
                            Salvar
                        </button>
                    </div>

                </form>
            </div>
        </div>
    `;
}


async function inicializarModuloMembros() {
    preencherGrausMembro();

    document
        .querySelector("#botao-novo-membro")
        .addEventListener("click", abrirModalMembro);

    document
        .querySelector("#botao-cancelar-membro")
        .addEventListener("click", fecharModalMembro);

    document
        .querySelector("#formulario-membro")
        .addEventListener("submit", salvarMembro);

    await carregarMembros();
}


function preencherGrausMembro() {
    const campoGrau =
        document.querySelector("#membro-grau");

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


function abrirModalMembro() {
membroEmEdicaoId = null;

document.querySelector(
    "#modal-membro h2"
).textContent = "Novo Membro";

    const modal =
        document.querySelector("#modal-membro");

    const formulario =
        document.querySelector("#formulario-membro");

    formulario.reset();

    document.querySelector(
        "#erro-formulario-membro"
    ).textContent = "";

    modal.hidden = false;

    document.querySelector("#membro-nome").focus();
}


function fecharModalMembro() {
    membroEmEdicaoId = null;

    document.querySelector(
        "#modal-membro"
    ).hidden = true;
}


async function salvarMembro(evento) {
    evento.preventDefault();

    const nome = document
        .querySelector("#membro-nome")
        .value
        .trim();

    const grau = Number(
        document.querySelector("#membro-grau").value
    );

    if (!nome) {
        document.querySelector(
            "#erro-formulario-membro"
        ).textContent = "Informe o nome do membro.";

        return;
    }

    try {
    if (membroEmEdicaoId) {
        const membro = {
            id: membroEmEdicaoId,
            nome: nome,
            grau: grau
        };

        await atualizarMembro(membro);

        membroEmEdicaoId = null;

    } else {
        const membro = {
            id: crypto.randomUUID(),
            nome: nome,
            grau: grau
        };

        await adicionarMembro(membro);
    }

    fecharModalMembro();

    await carregarMembros();

    } catch (erro) {
        console.error(
            "Erro ao salvar membro:",
            erro
        );
    }
}


async function adicionarMembro(membro) {
    const banco = await abrirBanco();

    return new Promise((resolve, reject) => {
        const transacao = banco.transaction(
            CONFIG_BANCO.tabelas.membros,
            "readwrite"
        );

        const tabela = transacao.objectStore(
            CONFIG_BANCO.tabelas.membros
        );

        const requisicao = tabela.add(membro);

        requisicao.onsuccess = function () {
            resolve();
        };

        requisicao.onerror = function () {
            reject(requisicao.error);
        };
    });
}


async function listarMembros() {
    const banco = await abrirBanco();

    return new Promise((resolve, reject) => {
        const transacao = banco.transaction(
            CONFIG_BANCO.tabelas.membros,
            "readonly"
        );

        const tabela = transacao.objectStore(
            CONFIG_BANCO.tabelas.membros
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


async function carregarMembros() {
    const container =
        document.querySelector("#lista-membros");

    const membros = await listarMembros();

    membros.sort((a, b) =>
        a.nome.localeCompare(
            b.nome,
            "pt-BR",
            { sensitivity: "base" }
        )
    );

    if (membros.length === 0) {
        container.innerHTML = `
            <p>Nenhum membro cadastrado.</p>
        `;

        return;
    }

    container.innerHTML = `
    <table>
        <thead>
            <tr>
                <th>Nome</th>
                <th>Grau</th>
                <th>Ações</th>
            </tr>
        </thead>

        <tbody>
            ${membros.map(membro => `
                <tr>
                    <td>${membro.nome}</td>
                    <td>Grau ${membro.grau}</td>
                    <td>
                        <button
                            type="button"
                            data-acao="editar"
                            data-id="${membro.id}"
                        >
                            Editar
                        </button>

                        <button
                            type="button"
                            data-acao="excluir"
                            data-id="${membro.id}"
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
            tratarAcaoMembro
        );
    });
}

async function tratarAcaoMembro(evento) {
    const botao = evento.currentTarget;

    const acao = botao.dataset.acao;
    const id = botao.dataset.id;

    if (acao === "editar") {
        await editarMembro(id);
        return;
    }

    if (acao === "excluir") {
        await excluirMembro(id);
    }
}


async function buscarMembroPorId(id) {
    const banco = await abrirBanco();

    return new Promise((resolve, reject) => {
        const transacao = banco.transaction(
            CONFIG_BANCO.tabelas.membros,
            "readonly"
        );

        const tabela = transacao.objectStore(
            CONFIG_BANCO.tabelas.membros
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


async function editarMembro(id) {
    const membro = await buscarMembroPorId(id);

    if (!membro) {
        return;
    }

    membroEmEdicaoId = membro.id;

    document.querySelector(
        "#membro-nome"
    ).value = membro.nome;

    document.querySelector(
        "#membro-grau"
    ).value = membro.grau;

    document.querySelector(
        "#modal-membro h2"
    ).textContent = "Editar Membro";

    document.querySelector(
        "#modal-membro"
    ).hidden = false;

    document.querySelector(
        "#membro-nome"
    ).focus();
}


async function atualizarMembro(membro) {
    const banco = await abrirBanco();

    return new Promise((resolve, reject) => {
        const transacao = banco.transaction(
            CONFIG_BANCO.tabelas.membros,
            "readwrite"
        );

        const tabela = transacao.objectStore(
            CONFIG_BANCO.tabelas.membros
        );

        const requisicao = tabela.put(membro);

        requisicao.onsuccess = function () {
            resolve();
        };

        requisicao.onerror = function () {
            reject(requisicao.error);
        };
    });
}


async function excluirMembro(id) {
    const confirmar = confirm(
        "Deseja realmente excluir este membro?"
    );

    if (!confirmar) {
        return;
    }

    const banco = await abrirBanco();

    await new Promise((resolve, reject) => {
        const transacao = banco.transaction(
            CONFIG_BANCO.tabelas.membros,
            "readwrite"
        );

        const tabela = transacao.objectStore(
            CONFIG_BANCO.tabelas.membros
        );

        const requisicao = tabela.delete(id);

        requisicao.onsuccess = function () {
            resolve();
        };

        requisicao.onerror = function () {
            reject(requisicao.error);
        };
    });

    await carregarMembros();
}