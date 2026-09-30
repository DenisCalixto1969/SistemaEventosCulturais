"use strict";

async function entrarNoSistema(email, senha) {
    const { data, error } =
        await clienteSupabase.auth.signInWithPassword({
            email,
            password: senha
        });

    if (error) {
        console.error(
            "Erro ao realizar login:",
            error
        );

        throw error;
    }

    return data.session;

}

async function verificarAutenticacao() {
    const sessao = await obterSessaoAtual();

    const telaLogin = document.getElementById("tela-login");
    const sistemaPrincipal = document.getElementById("sistema-principal");

    if (sessao) {
        telaLogin.hidden = true;
        sistemaPrincipal.hidden = false;
    } else {
        telaLogin.hidden = false;
        sistemaPrincipal.hidden = true;
    }
}

verificarAutenticacao();

async function sairDoSistema() {
    const { error } =
        await clienteSupabase.auth.signOut();

    if (error) {
        console.error(
            "Erro ao sair do sistema:",
            error
        );

        return;
    }

    window.location.reload();
}

document.addEventListener(
    "DOMContentLoaded",
    configurarLogin
);

function configurarLogin() {
    const formulario =
        document.querySelector("#form-login");

    if (!formulario) {
        return;
    }

    formulario.addEventListener(
        "submit",
        async function (evento) {
            evento.preventDefault();

            const email =
                document
                    .querySelector("#login-email")
                    .value
                    .trim();

            const senha =
                document
                    .querySelector("#login-senha")
                    .value;

            const erroLogin =
                document.querySelector("#erro-login");

            erroLogin.textContent = "";

            try {
                await entrarNoSistema(
        email,
        senha
    );

    window.location.reload();
    
} catch (erro) {
                erroLogin.textContent =
                    "E-mail ou senha inválidos.";
            }
        }
    );
}

document
    .getElementById("botao-sair")
    .addEventListener("click", sairDoSistema);

  // Mostrar / ocultar senha
const botaoMostrarSenha = document.getElementById("mostrar-senha");
const campoSenha = document.getElementById("login-senha");

botaoMostrarSenha.addEventListener("click", function () {

    if (campoSenha.type === "password") {
        campoSenha.type = "text";
        botaoMostrarSenha.textContent = "🙈";
        botaoMostrarSenha.setAttribute("aria-label", "Ocultar senha");
    } else {
        campoSenha.type = "password";
        botaoMostrarSenha.textContent = "👁️";
        botaoMostrarSenha.setAttribute("aria-label", "Mostrar senha");
    }

});  
