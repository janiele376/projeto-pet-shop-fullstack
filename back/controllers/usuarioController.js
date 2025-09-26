import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('ERRO FATAL: JWT_SECRET não está configurada no .env!');
}

// =========================================================
// LOGIN DE USUÁRIO
// =========================================================
export const loginUsuario = asyncHandler(async (req, res) => {
  const { email, senha } = req.body;

  const usuario = await prisma.usuario.findUnique({ where: { email } });

  if (usuario && (await bcrypt.compare(senha, usuario.senha))) {
    const userIdInt = parseInt(usuario.id);

    const token = jwt.sign({ id: userIdInt, tipo: usuario.tipo }, JWT_SECRET, {
      expiresIn: '8h',
    });

    res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
      token,
    });
  } else {
    res.status(401);
    throw new Error('Email ou senha inválidos');
  }
});

// =========================================================
// VERIFICAR PERFIL
// =========================================================
export const getUsuarioPerfil = asyncHandler(async (req, res) => {
  const usuarioId = parseInt(req.usuarioId);

  if (isNaN(usuarioId)) {
    res.status(401);
    throw new Error('ID de usuário inválido no token');
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
  });

  if (usuario) {
    res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
    });
  } else {
    res.status(404);
    throw new Error('Usuário não encontrado');
  }
});

// =========================================================
// REGISTRAR NOVO USUÁRIO
// =========================================================
export const registrarUsuario = asyncHandler(async (req, res) => {
  const { nome, email, senha, tipo } = req.body;

  if (!nome || !email || !senha) {
    res.status(400);
    throw new Error('Por favor, preencha todos os campos obrigatórios.');
  }

  const usuarioExiste = await prisma.usuario.findUnique({ where: { email } });

  if (usuarioExiste) {
    res.status(400);
    throw new Error('Usuário já existe com este e-mail');
  }

  const salt = await bcrypt.genSalt(10);
  const senhaCriptografada = await bcrypt.hash(senha, salt);

  const novoUsuario = await prisma.usuario.create({
    data: {
      nome,
      email,
      senha: senhaCriptografada,
      tipo: tipo || 'Cliente',
    },
  });

  if (novoUsuario) {
    const userIdInt = parseInt(novoUsuario.id);

    const token = jwt.sign(
      { id: userIdInt, tipo: novoUsuario.tipo },
      JWT_SECRET,
      { expiresIn: '8h' },
    );

    res.status(201).json({
      id: novoUsuario.id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      tipo: novoUsuario.tipo,
      token,
    });
  } else {
    res.status(400);
    throw new Error('Dados do usuário inválidos');
  }
});

// =========================================================
// LISTAR TODOS OS USUÁRIOS
// =========================================================
export const listarUsuarios = asyncHandler(async (req, res) => {
  const usuarios = await prisma.usuario.findMany({
    select: {
      id: true,
      nome: true,
      email: true,
      tipo: true,
      data_criacao: true, // CORRIGIDO: Usa o nome do campo do seu schema
    },
  });

  res.status(200).json(usuarios);
});

// =========================================================
// DELETAR USUÁRIO
// =========================================================
export const deletarUsuario = asyncHandler(async (req, res) => {
  const usuarioId = parseInt(req.params.id);

  if (isNaN(usuarioId)) {
    res.status(400);
    throw new Error('ID de usuário inválido');
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
  });

  if (!usuario) {
    res.status(404);
    throw new Error('Usuário não encontrado');
  }

  await prisma.usuario.delete({
    where: { id: usuarioId },
  });

  res.json({ mensagem: 'Usuário removido com sucesso' });
});

// =========================================================
// ATUALIZAR USUÁRIO
// =========================================================
export const atualizarUsuario = asyncHandler(async (req, res) => {
  const usuarioId = parseInt(req.params.id);
  const { nome, email, senha, tipo } = req.body;

  if (isNaN(usuarioId)) {
    res.status(400);
    throw new Error('ID de usuário inválido');
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
  });

  if (!usuario) {
    res.status(404);
    throw new Error('Usuário não encontrado');
  }

  let senhaCriptografada = usuario.senha; // mantém a senha atual
  if (senha) {
    const salt = await bcrypt.genSalt(10);
    senhaCriptografada = await bcrypt.hash(senha, salt);
  }

  const usuarioAtualizado = await prisma.usuario.update({
    where: { id: usuarioId },
    data: {
      nome: nome || usuario.nome,
      email: email || usuario.email,
      senha: senhaCriptografada,
      tipo: tipo || usuario.tipo,
    },
  });

  res.json({
    id: usuarioAtualizado.id,
    nome: usuarioAtualizado.nome,
    email: usuarioAtualizado.email,
    tipo: usuarioAtualizado.tipo,
    mensagem: 'Usuário atualizado com sucesso',
  });
});
