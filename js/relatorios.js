"use strict";


function carregarModuloRelatorios() {
    return `
        <section class="modulo">

            <div class="cabecalho-modulo">
                <div>
                    <h2>Relatórios</h2>

                    <p>
                        Consulte a frequência dos membros por período.
                    </p>
                </div>
            </div>


            <section class="painel">

                <h3>Período</h3>

                <form id="formulario-relatorio">

                    <div class="campo-formulario">
                        <label for="relatorio-data-inicial">
                            Data inicial
                        </label>

                        <input
                            type="date"
                            id="relatorio-data-inicial"
                            required
                        >
                    </div>


                    <div class="campo-formulario">
                        <label for="relatorio-data-final">
                            Data final
                        </label>

                        <input
                            type="date"
                            id="relatorio-data-final"
                            required
                        >
                    </div>


                    <div class="campo-formulario">
                        <label for="relatorio-membro">
                            Membro
                        </label>

                        <select id="relatorio-membro">
                            <option value="">
                                Todos os membros
                            </option>
                        </select>
                    </div>


                    <div
                        id="erro-relatorio"
                        class="mensagem-erro"
                    ></div>


                    <button type="submit">
                        Gerar Relatório
                    </button>

                </form>

            </section>


            <section class="painel">

                <div id="resultado-relatorio">
                    <p>
                        Informe o período e clique em
                        Gerar Relatório.
                    </p>
                </div>

            </section>

        </section>
    `;
}


async function inicializarModuloRelatorios() {
    await preencherMembrosRelatorio();

    document
        .querySelector("#formulario-relatorio")
        .addEventListener(
            "submit",
            gerarRelatorio
        );
}


async function preencherMembrosRelatorio() {
    const campo =
        document.querySelector(
            "#relatorio-membro"
        );

    const membros =
        await listarMembros();

    membros.sort((a, b) =>
        a.nome.localeCompare(
            b.nome,
            "pt-BR",
            { sensitivity: "base" }
        )
    );

    campo.innerHTML = `
        <option value="">
            Todos os membros
        </option>

        ${membros.map(membro => `
            <option value="${membro.id}">
                ${membro.nome} - Grau ${membro.grau}
            </option>
        `).join("")}
    `;
}


async function gerarRelatorio(evento) {
    evento.preventDefault();

    const dataInicial =
        document.querySelector(
            "#relatorio-data-inicial"
        ).value;

    const dataFinal =
        document.querySelector(
            "#relatorio-data-final"
        ).value;

    const membroId =
        document.querySelector(
            "#relatorio-membro"
        ).value;

    const erro =
        document.querySelector(
            "#erro-relatorio"
        );

    erro.textContent = "";


    if (!dataInicial || !dataFinal) {
        erro.textContent =
            "Informe a data inicial e a data final.";

        return;
    }


    if (dataInicial > dataFinal) {
        erro.textContent =
            "A data inicial não pode ser maior que a data final.";

        return;
    }


    const membros =
        await listarMembros();

    const eventos =
        await listarEventos();

    const presencas =
        await listarPresencas();


    const eventosPeriodo =
        eventos.filter(evento =>
            evento.data >= dataInicial &&
            evento.data <= dataFinal
        );


    let membrosSelecionados = membros;


    if (membroId) {
        membrosSelecionados =
            membros.filter(
                membro =>
                    membro.id === membroId
            );
    }


    membrosSelecionados.sort((a, b) =>
        a.nome.localeCompare(
            b.nome,
            "pt-BR",
            { sensitivity: "base" }
        )
    );


    const resultados =
        membrosSelecionados.map(membro => {

            const presencasMembro =
                presencas.filter(
                    presenca =>
                        presenca.membroId === membro.id
                );


            const registrosPeriodo =
                presencasMembro.filter(
                    presenca => {

                        const evento =
                            eventosPeriodo.find(
                                item =>
                                    item.id ===
                                    presenca.eventoId
                            );

                        return Boolean(evento);
                    }
                );


            const totalEventos =
                registrosPeriodo.length;


            const totalPresencas =
                registrosPeriodo.filter(
                    presenca =>
                        presenca.presente === true
                ).length;


            const totalAusencias =
                totalEventos - totalPresencas;


            const percentual =
                totalEventos > 0
                    ? (
                        totalPresencas /
                        totalEventos *
                        100
                    )
                    : 0;


            return {
                membro,
                totalEventos,
                totalPresencas,
                totalAusencias,
                percentual
            };
        });


    renderizarRelatorio(
        resultados,
        dataInicial,
        dataFinal
    );
}


function renderizarRelatorio(
    resultados,
    dataInicial,
    dataFinal
) {
    const container =
        document.querySelector(
            "#resultado-relatorio"
        );


    if (resultados.length === 0) {
        container.innerHTML = `
            <p>
                Nenhum membro encontrado.
            </p>
        `;

        return;
    }


    container.innerHTML = `
        <h3>Resultado</h3>

        <p>
            Período:
            <strong>
                ${formatarDataEvento(dataInicial)}
            </strong>
            até
            <strong>
                ${formatarDataEvento(dataFinal)}
            </strong>
        </p>


        <table>
            <thead>
                <tr>
                    <th>Membro</th>
                    <th>Grau</th>
                    <th>Eventos</th>
                    <th>Presenças</th>
                    <th>Ausências</th>
                    <th>Frequência</th>
                </tr>
            </thead>

            <tbody>

                ${resultados.map(resultado => `
                    <tr>

                        <td>
                            ${resultado.membro.nome}
                        </td>

                        <td>
                            Grau ${resultado.membro.grau}
                        </td>

                        <td>
                            ${resultado.totalEventos}
                        </td>

                        <td>
                            ${resultado.totalPresencas}
                        </td>

                        <td>
                            ${resultado.totalAusencias}
                        </td>

                        <td>
                            ${resultado.percentual.toFixed(1)}%
                        </td>

                    </tr>
                `).join("")}

            </tbody>
        </table>
    `;
}