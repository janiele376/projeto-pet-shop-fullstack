import jwt from "jsonwebtoken";
import asyncHandler from 'express-async-handler';

// =======================================================
// MIDDLEWARE DE AUTENTICAÇÃO (verificarToken)
// OBRIGATÓRIO: Verificar se o usuário está logado e obter o ID
// =======================================================
export const verificarToken = (req, res, next) => {
    // Tenta obter o cabeçalho Authorization
    const authHeader = req.headers["authorization"];
    // Extrai o token, pulando a palavra "Bearer "
    const token = authHeader && authHeader.split(" ")[1]; 

    // 🛑 TRATA O ERRO ORIGINAL: "Acesso negado, token não fornecido"
    if (!token) {
        return res.status(401).json({ erro: "Acesso negado, token não fornecido" });
    }

    const segredo = process.env.JWT_SECRET;

    if (!segredo) {
        console.error("ERRO CRÍTICO: JWT_SECRET não carregado no ambiente!");
        return res.status(500).json({ erro: "Erro interno de configuração do servidor." });
    }

    try {
        const payload = jwt.verify(token, segredo);
        
        // 🔑 CORREÇÃO PARA O ERRO DE ID AUSENTE:
        // Anexa o ID e o Tipo à requisição. A rota de agendamento deve usar req.usuarioId
        req.usuarioId = payload.id; 
        req.usuarioTipo = payload.tipo; 
        
        // Se a verificação for bem-sucedida, continua para o próximo middleware/rota
        next();
    } catch (error) {
        // Trata tokens inválidos ou expirados (ex: o token antigo que você me enviou)
        return res.status(403).json({ erro: "Token inválido ou expirado" });
    }
};

// =======================================================
// MIDDLEWARE DE AUTORIZAÇÃO (isVendedor)
// Opcional: Garante que apenas vendedores/admins podem acessar
// =======================================================
export const isVendedor = asyncHandler(async (req, res, next) => {
    // Obtém o tipo ANEXADO pelo middleware 'verificarToken'
    const tipo = req.usuarioTipo; 

    // Garante que o tipo é 'vendedor' ou 'Admin'
    if (tipo === 'vendedor' || tipo === 'Admin') {
        next(); // Permissão concedida
    } else {
        // Define o status de Proibido e lança um erro para o Error Handler
        res.status(403); 
        throw new Error('Acesso negado. Você não tem permissão de Vendedor ou Administrador.');
    }
});