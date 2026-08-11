"use strict";

const CONFIG = {
    sistema: {
        nome: "Sistema de Eventos Culturais",
        versao: "1.0.0"
    },

    graus: [
        4,
        9,
        12,
        13,
        14,
        15,
        17,
        18,
        19,
        22,
        28,
        30,
        31,
        32,
        33
    ],

   tiposEventos: [
    "Fórum de Debates",
    "Cordeiro Pascal",
    "5ª Feira de Endoenças",
    "Reunião Administrativa",
    "Evento Extra"
]
};

async function carregarModulo(modulo) {
    const conteudoPrincipal =
        document.querySelector("#conteudo-principal");

    if (modulo === "membros") {
        conteudoPrincipal.innerHTML =
            carregarModuloMembros();

        await inicializarModuloMembros();

        return;
    }

    if (modulo === "eventos") {
        conteudoPrincipal.innerHTML =
            carregarModuloEventos();

        await inicializarModuloEventos();

        return;
    }

    if (modulo === "presencas") {
        conteudoPrincipal.innerHTML =
            carregarModuloPresencas();

        await inicializarModuloPresencas();

        return;
    }

   if (modulo === "relatorios") {
    conteudoPrincipal.innerHTML =
        carregarModuloRelatorios();

    await inicializarModuloRelatorios();

    return;
}

}

document.addEventListener("DOMContentLoaded", async function () {
    try {
        await abrirBanco();

     const quantidadePresencasOrfas =
    await limparPresencasOrfas();

if (quantidadePresencasOrfas > 0) {
    console.log(
        `${quantidadePresencasOrfas} presença(s) órfã(s) removida(s).`
    );
}   

        document
            .querySelectorAll(".botao-menu")
            .forEach(botao => {
                botao.addEventListener(
                    "click",
                    async function () {
                        const modulo =
                            botao.dataset.modulo;

                        document
                            .querySelectorAll(".botao-menu")
                            .forEach(item => {
                                item.classList.remove("ativo");
                            });

                        botao.classList.add("ativo");

                        await carregarModulo(modulo);
                    }
                );
            });

        await carregarModulo("membros");

        console.log(
            `${CONFIG.sistema.nome} iniciado com sucesso.`
        );

        console.log(
            "Banco de dados conectado com sucesso."
        );

    } catch (erro) {
        console.error(
            "Erro ao iniciar o sistema:",
            erro
        );
    }
});