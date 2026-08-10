"use strict";

const CONFIG_BANCO = {
    nome: "SistemaEventosCulturaisDB",
    versao: 1,

    tabelas: {
        membros: "membros",
        eventos: "eventos",
        presencas: "presencas"
    }
};

function abrirBanco() {
    return new Promise((resolve, reject) => {
        const requisicao = indexedDB.open(
            CONFIG_BANCO.nome,
            CONFIG_BANCO.versao
        );

        requisicao.onupgradeneeded = function (evento) {
            const banco = evento.target.result;

            if (!banco.objectStoreNames.contains(CONFIG_BANCO.tabelas.membros)) {
                banco.createObjectStore(
                    CONFIG_BANCO.tabelas.membros,
                    { keyPath: "id" }
                );
            }

            if (!banco.objectStoreNames.contains(CONFIG_BANCO.tabelas.eventos)) {
                banco.createObjectStore(
                    CONFIG_BANCO.tabelas.eventos,
                    { keyPath: "id" }
                );
            }

            if (!banco.objectStoreNames.contains(CONFIG_BANCO.tabelas.presencas)) {
                banco.createObjectStore(
                    CONFIG_BANCO.tabelas.presencas,
                    { keyPath: "id" }
                );
            }
        };

        requisicao.onsuccess = function (evento) {
            resolve(evento.target.result);
        };

        requisicao.onerror = function () {
            reject(requisicao.error);
        };
    });
}