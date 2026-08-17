"use strict";

const SUPABASE_URL = "https://myhszzpbjczncbgitmva.supabase.co";
const SUPABASE_KEY = "sb_publishable_PXyMFIoqDcc_f8QFaUZStA_2OzChuNX";

const clienteSupabase = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

async function obterSessaoAtual() {
    const {
        data: { session },
        error
    } = await clienteSupabase.auth.getSession();

    if (error) {
        console.error(
            "Erro ao obter sessão do Supabase:",
            error
        );

        return null;
    }

    return session;
}
