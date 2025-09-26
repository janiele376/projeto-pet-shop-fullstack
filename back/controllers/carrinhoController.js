import { PrismaClient } from '@prisma/client';
import asyncHandler from 'express-async-handler';

const prisma = new PrismaClient();
const getUserId = (req) => parseInt(req.usuarioId);

// Buscar ou criar carrinho
const buscarOuCriarCarrinho = async (usuarioId) => {
  let carrinho = await prisma.carrinho.findUnique({
    where: { cliente_id: usuarioId },
  });
  if (!carrinho) {
    carrinho = await prisma.carrinho.create({
      data: { cliente_id: usuarioId },
    });
  }
  return carrinho;
};

// 1️⃣ Adicionar ao carrinho
export const adicionarAoCarrinho = asyncHandler(async (req, res) => {
  const produtoId = parseInt(req.body.produtoId);
  const quantidade = parseInt(req.body.quantidade);
  const usuarioId = getUserId(req);

  if (!usuarioId || !produtoId || !quantidade || quantidade <= 0) {
    res.status(400);
    throw new Error('Dados inválidos');
  }

  const produto = await prisma.produto.findUnique({ where: { id: produtoId } });
  if (!produto) {
    res.status(404);
    throw new Error('Produto não encontrado');
  }

  const carrinho = await buscarOuCriarCarrinho(usuarioId);

  const itemExistente = await prisma.itemCarrinho.findUnique({
    where: {
      carrinho_id_produto_id: {
        carrinho_id: carrinho.id,
        produto_id: produtoId,
      },
    },
  });

  if (itemExistente) {
    await prisma.itemCarrinho.update({
      where: { id: itemExistente.id },
      data: { quantidade: itemExistente.quantidade + quantidade },
    });
  } else {
    await prisma.itemCarrinho.create({
      data: { carrinho_id: carrinho.id, produto_id: produtoId, quantidade },
    });
  }

  res.status(201).json({ message: 'Produto adicionado ao carrinho' });
});

// 2️⃣ Ver carrinho
export const verCarrinho = asyncHandler(async (req, res) => {
  const usuarioId = getUserId(req);
  const carrinho = await prisma.carrinho.findUnique({
    where: { cliente_id: usuarioId },
    include: { itens: { include: { produto: true } } },
  });

  if (!carrinho) return res.json({ itens: [], total: 0 });

  const total = carrinho.itens.reduce(
    (acc, item) => acc + parseFloat(item.produto.preco) * item.quantidade,
    0,
  );

  res.json({ itens: carrinho.itens, total: total.toFixed(2) });
});

// 3️⃣ Remover item
export const removerDoCarrinho = asyncHandler(async (req, res) => {
  const usuarioId = getUserId(req);
  const { itemId } = req.params;

  const carrinho = await prisma.carrinho.findUnique({
    where: { cliente_id: usuarioId },
  });
  if (!carrinho) {
    res.status(404);
    throw new Error('Carrinho não encontrado');
  }

  await prisma.itemCarrinho.delete({ where: { id: parseInt(itemId) } });
  res.json({ message: 'Item removido do carrinho' });
});

// 4️⃣ Finalizar compra
export const finalizarCompra = asyncHandler(async (req, res) => {
  const usuarioId = getUserId(req);
  const { formaPagamento, enderecoEntrega } = req.body;

  const carrinho = await prisma.carrinho.findUnique({
    where: { cliente_id: usuarioId },
    include: { itens: { include: { produto: true } } },
  });

  if (!carrinho || carrinho.itens.length === 0) {
    res.status(400);
    throw new Error('Carrinho vazio');
  }

  const valorTotal = carrinho.itens
    .reduce(
      (acc, item) => acc + parseFloat(item.produto.preco) * item.quantidade,
      0,
    )
    .toFixed(2);
  const VENDEDOR_PADRAO_ID = 1;

  const venda = await prisma.$transaction(async (tx) => {
    const novaVenda = await tx.venda.create({
      data: {
        cliente_id: usuarioId,
        vendedor_id: VENDEDOR_PADRAO_ID,
        total: parseFloat(valorTotal),
        data_venda: new Date(),
        status: 'concluida',
        forma_pagamento: formaPagamento || 'Cartão/Pix',
        endereco_entrega: enderecoEntrega || 'Aguardando confirmação',
      },
    });

    await tx.itemVenda.createMany({
      data: carrinho.itens.map((item) => ({
        venda_id: novaVenda.id,
        produto_id: item.produto.id,
        quantidade: item.quantidade,
        preco_unitario: item.produto.preco,
        subtotal: item.produto.preco * item.quantidade,
      })),
    });

    await tx.itemCarrinho.deleteMany({ where: { carrinho_id: carrinho.id } });
    return novaVenda;
  });

  res.json({ message: 'Compra finalizada', vendaId: venda.id });
});
