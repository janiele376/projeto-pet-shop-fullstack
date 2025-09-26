import express from "express";
import cors from "cors";
import path from 'path'; 
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

import dotenv from 'dotenv';
dotenv.config();

import usuarioRoutes from './routes/usuarioRoutes.js';
import produtoRoutes from './routes/produtoRoutes.js';
import vendaRoutes from './routes/vendaRoutes.js';
import agendamentoRoutes from "./routes/agendamentoRoutes.js";
import carrinhoRoutes from './routes/carrinhoRoutes.js'; 
import servicosRouter from './routes/servicoRoutes.js'; // 🛑 CORRIGIDO: Este é o nome que você importou!

import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();

// Middlewares globais
app.use(express.json());

const frontendOrigin = 'http://localhost:3000'; 
app.use(cors({
  origin: frontendOrigin,
  credentials: true 
}));

// Rotas
app.use("/usuarios", usuarioRoutes); 
app.use("/produtos", produtoRoutes);
app.use("/vendas", vendaRoutes);
app.use('/agendamentos', agendamentoRoutes);
app.use('/carrinho', carrinhoRoutes);
// 🛑 CORREÇÃO AQUI: Usa 'servicosRouter' no lugar de 'servicoRouter'
app.use('/servicos', servicosRouter); 

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", (req, res) => {
  res.send("Backend do PetShop rodando!");
});

// ⚠️ Middleware de tratamento de erros (DEVE FICAR AQUI, DEPOIS DAS ROTAS!)
app.use(errorHandler);

const PORT = 3001;

app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  try {
    await prisma.$connect();
    console.log("✅ Conectado com sucesso ao banco de dados!");
  } catch (error) {
    console.error("❌ Erro ao conectar com o banco de dados:", error);
    process.exit(1); 
  }
});