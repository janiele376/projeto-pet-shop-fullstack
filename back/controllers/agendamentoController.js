import { PrismaClient } from '@prisma/client';
import asyncHandler from 'express-async-handler';

const prisma = new PrismaClient();

// =========================================================
// FUNÇÃO AUXILIAR: Garante que o ID do token é lido e é um número
// =========================================================
const getUserId = (req) => {
    // 🔑 Garante que o ID vem do nome anexado pelo middleware (req.usuarioId)
    // E tenta converter para inteiro, retornando NaN se falhar.
    return parseInt(req.usuarioId);
};

// =========================================================
// 1. CRIAR AGENDAMENTO
// =========================================================
export const createAppointment = asyncHandler(async (req, res) => {
    
    // 1. TRATAMENTO DO ID DO USUÁRIO (Cliente)
    const clienteId = getUserId(req);

    if (isNaN(clienteId) || clienteId <= 0) {
        res.status(401);
        // Agora, este erro só será disparado se o middleware falhar ao anexar o ID.
        throw new Error("Acesso negado. ID do usuário inválido ou ausente.");
    }
    
    // 2. DESESTRUTURAÇÃO DOS DADOS DO FORMULÁRIO ENVIADOS PELO FRONTEND
    const { 
        nomePet, 
        data, 
        hora, 
        servicos, 
        observacoes, 
        // Você optou por não usar nomeDono e telefoneContato no Agendamento do Prisma (correto, pois vem do Cliente_id)
    } = req.body;

    // 3. VALIDAÇÃO ESSENCIAL (Campos mínimos)
    if (!nomePet || !data || !hora || !servicos || servicos.length === 0) {
        res.status(400);
        throw new Error("Dados de agendamento incompletos (Pet, Data, Hora ou Serviços são obrigatórios).");
    }
    
    // 4. TRATAMENTO DE DATA/HORA
    const dataHoraAgendamento = new Date(`${data}T${hora}:00`);
    
    // --- Lógica para o SERVIÇO ---
    const servicoPrincipal = servicos[0];
    const nomeDoServico = servicoPrincipal?.nomeServico;
    
    if (!nomeDoServico) {
        res.status(400);
        throw new Error("Nenhum serviço válido foi selecionado.");
    }

    // 5. BUSCAR OU CRIAR O SERVIÇO
    let servico = await prisma.servico.findFirst({
        where: { nome: nomeDoServico }
    });

    if (!servico) {
        // Se o serviço não existe, cria um com valores padrão
        servico = await prisma.servico.create({
            data: {
                nome: nomeDoServico,
                descricao: "Serviço agendado online.", 
                preco: 0, 
                duracao: 60, 
            }
        });
    }
    
    // 6. CRIAÇÃO DO AGENDAMENTO NO BANCO DE DADOS
    const appointment = await prisma.agendamento.create({
        data: {
            // 🔑 USANDO O ID DO CLIENTE OBTIDO DO TOKEN
            cliente_id: clienteId, 
            servico_id: servico.id,
            nome_pet: nomePet,
            data_hora: dataHoraAgendamento,
            observacoes: observacoes, 
        }
    });
    
    res.status(201).json(appointment);
});

// =========================================================
// 2. LISTAR AGENDAMENTOS (AGORA FILTRA PELO CLIENTE LOGADO)
// =========================================================
export const getAllAppointments = asyncHandler(async (req, res) => {
    const clienteId = getUserId(req);

    // 🛑 REVERTENDO O FILTRO: Se não for um Admin/Vendedor (assumindo que o middleware isVendedor
    // protegeria a rota se a intenção fosse listar TUDO), listamos apenas os agendamentos do cliente.
    const filter = { cliente_id: clienteId }; 

    const appointments = await prisma.agendamento.findMany({
        where: filter, 
        include: {
            cliente: { select: { id: true, nome: true, email: true } },
            servico: true 
        },
        orderBy: {
            data_hora: 'asc', // Ordena por data/hora crescente
        }
    });
    res.status(200).json(appointments);
});

// =========================================================
// 3. BUSCAR AGENDAMENTO POR ID
// =========================================================
export const getAppointmentById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const clienteId = getUserId(req);

    const appointment = await prisma.agendamento.findUnique({
        where: { id: parseInt(id) },
        include: { cliente: true, servico: true }
    });

    if (!appointment) {
        res.status(404);
        throw new Error("Agendamento não encontrado.");
    }
    
    // Regra de Autorização: Só pode ver o próprio agendamento
    // 🛑 Adicionei toString() para garantir a comparação, pois tipos diferentes causam erro.
    if (appointment.cliente_id.toString() !== clienteId.toString()) { 
        res.status(403);
        throw new Error("Acesso negado. Você não tem permissão para visualizar este agendamento.");
    }

    res.status(200).json(appointment);
});

// =========================================================
// 4. ATUALIZAR AGENDAMENTO
// =========================================================
export const updateAppointment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const clienteId = getUserId(req);
    const { data_hora, status, nomePet, servicos } = req.body;
    
    // Primeiro, verifica se o agendamento pertence ao cliente
    const existingAppointment = await prisma.agendamento.findUnique({
        where: { id: parseInt(id) }
    });

    if (!existingAppointment || existingAppointment.cliente_id.toString() !== clienteId.toString()) {
        res.status(403);
        throw new Error("Acesso negado ou Agendamento não encontrado.");
    }

    const updatedData = {
        data_hora: data_hora ? new Date(data_hora) : undefined,
        status,
        nome_pet: nomePet
    };

    // Lógica opcional para atualizar o serviço (se o frontend enviar)
    // if (servicos && servicos.length > 0) {
    //     // Você precisaria de uma lógica mais complexa aqui para buscar/criar o novo servico_id
    // }

    const updatedAppointment = await prisma.agendamento.update({
        where: { id: parseInt(id) },
        data: updatedData
    });
    
    res.status(200).json(updatedAppointment);
});

// =========================================================
// 5. DELETAR AGENDAMENTO
// =========================================================
export const deleteAppointment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const clienteId = getUserId(req);

    // 🛑 CORREÇÃO: Busca e verifica a permissão antes de deletar
    const appointment = await prisma.agendamento.findUnique({
        where: { id: parseInt(id) }
    });

    if (!appointment || appointment.cliente_id.toString() !== clienteId.toString()) {
        res.status(403);
        throw new Error("Acesso negado. Você só pode deletar seus próprios agendamentos.");
    }
    
    // Deleta o agendamento
    await prisma.agendamento.delete({
        where: { id: parseInt(id) }
    });
    
    res.status(204).send(); 
});