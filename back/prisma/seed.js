import { PrismaClient } from '@prisma/client';
// 💡 NOTA: Você precisa garantir que 'produtosData' exporta um array de produtos
// 💡 Se o seu arquivo de produtos não tiver um default export, esta linha pode falhar
import produtosData from '../../front/src/data/produtosData.mjs'; 
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// =======================================================
// DADOS ESTÁTICOS DOS SERVIÇOS (Baseado no Agendamento.jsx)
// =======================================================
const servicosData = [
    // === Banho e Tosa ===
    { nome: 'Banho comum', preco: 70.00, duracao: 60, descricao: 'Limpeza básica do pet.' },
    { nome: 'Banho com hidratação', preco: 90.00, duracao: 75, descricao: 'Banho com tratamento hidratante para os pelos.' },
    { nome: 'Tosa higiênica', preco: 60.00, duracao: 45, descricao: 'Corte e limpeza em áreas sensíveis.' },
    { nome: 'Tosa na tesoura', preco: 120.00, duracao: 120, descricao: 'Tosa feita inteiramente à mão.' },
    { nome: 'Tosa de raça', preco: 130.00, duracao: 120, descricao: 'Corte padrão específico para a raça.' },
    { nome: 'Tosa bebê/filhote', preco: 70.00, duracao: 60, descricao: 'Tosa curta ideal para filhotes.' },
    { nome: 'Escovação de dentes', preco: 25.00, duracao: 15, descricao: 'Higiene bucal complementar.' },
    { nome: 'Limpeza de ouvidos', preco: 20.00, duracao: 10, descricao: 'Limpeza e remoção de excesso de cera.' },
    { nome: 'Corte de unhas', preco: 20.00, duracao: 10, descricao: 'Serviço de corte e lixamento de unhas.' },
    
    // === Serviços Estéticos ===
    { nome: 'Hidratação de pele e pelos', preco: 40.00, duracao: 30, descricao: 'Tratamento intensivo para pele e pelagem.' },
    { nome: 'Escova e finalização', preco: 30.00, duracao: 20, descricao: 'Secagem e estilização final dos pelos.' },
    { nome: 'Coloração temporária (tintas atóxicas)', preco: 35.00, duracao: 45, descricao: 'Coloração segura e temporária.' },
    { nome: 'Aromaterapia para pets', preco: 45.00, duracao: 30, descricao: 'Sessão relaxante com óleos essenciais.' },

    // === Serviços Veterinários ===
    { nome: 'Consulta veterinária', preco: 150.00, duracao: 60, descricao: 'Avaliação clínica geral.' },
    { nome: 'Vacinação', preco: 100.00, duracao: 30, descricao: 'Aplicação de vacinas essenciais.' },
    { nome: 'Exames laboratoriais', preco: 250.00, duracao: 120, descricao: 'Coleta e análise de amostras.' },
    { nome: 'Controle de pulgas e carrapatos', preco: 100.00, duracao: 45, descricao: 'Aplicação de produto preventivo.' },
    { nome: 'Castração (em clínicas especializadas)', preco: 700.00, duracao: 240, descricao: 'Procedimento cirúrgico de castração.' },
    { nome: 'Acompanhamento geriátrico', preco: 120.00, duracao: 60, descricao: 'Cuidados especializados para pets idosos.' },
    { nome: 'Atendimento de emergência', preco: 400.00, duracao: 180, descricao: 'Atendimento fora do horário comercial para urgências.' },

    // === Bem-estar e Comportamento ===
    { nome: 'Adestramento', preco: 100.00, duracao: 60, descricao: 'Sessão de treinamento básico.' },
    { nome: 'Aula individual ou pacotes', preco: 450.00, duracao: 300, descricao: 'Pacote de aulas personalizadas.' },
    { nome: 'Avaliação comportamental', preco: 120.00, duracao: 90, descricao: 'Análise detalhada do comportamento do pet.' },
    { nome: 'Massagem para pets', preco: 60.00, duracao: 45, descricao: 'Terapia relaxante com massagem.' },
    { nome: 'Acupuntura veterinária', preco: 150.00, duracao: 60, descricao: 'Tratamento alternativo com agulhas.' },
    { nome: 'Terapia ocupacional animal', preco: 100.00, duracao: 60, descricao: 'Atividades para estimular o pet mentalmente.' },

    // === Serviços Adicionais ===
    { nome: 'Leva e traz (transporte do pet)', preco: 50.00, duracao: 30, descricao: 'Transporte seguro e confortável.' },
    { nome: 'Hospedagem', preco: 100.00, duracao: 1440, descricao: 'Estadia de 24 horas.' },
    { nome: 'Creche (Daycare)', preco: 80.00, duracao: 480, descricao: 'Cuidado diário supervisionado.' },
    { nome: 'Hotelzinho de fim de semana', preco: 250.00, duracao: 2880, descricao: 'Hospedagem prolongada de fim de semana.' },
    { nome: 'Passeios programados', preco: 25.00, duracao: 30, descricao: 'Passeio recreativo.' },
    { nome: 'Pet sitter (visitas em casa)', preco: 100.00, duracao: 60, descricao: 'Visitas para cuidados em domicílio.' },
];


async function main() {
    console.log('Iniciando o povoamento (seeding) do Banco de Dados...');

    const vendedorIdPadrao = 1; 

    // =======================================================
    // 1. POVOAR SERVIÇOS DE AGENDAMENTO
    // =======================================================
    console.log('--- Povoando Serviços ---');
    for (const servico of servicosData) {
        try {
            // Tenta criar ou atualizar (upsert) o serviço para evitar erro de UNIQUE
            await prisma.servico.upsert({
                where: { nome: servico.nome }, // Chave de busca
                update: {
                    preco: servico.preco,
                    descricao: servico.descricao,
                    duracao: servico.duracao,
                },
                create: {
                    nome: servico.nome,
                    descricao: servico.descricao,
                    preco: servico.preco,
                    duracao: servico.duracao,
                }
            });
            console.log(`✅ Serviço atualizado/criado: ${servico.nome}`);
        } catch (error) {
            console.error(`❌ Erro ao criar/atualizar serviço '${servico.nome}':`, error.message);
        }
    }
    console.log('Povoamento de serviços concluído com sucesso!');


    // =======================================================
    // 2. POVOAR PRODUTOS (Seu código original)
    // =======================================================
    console.log('\n--- Povoando Produtos ---');
    for (const produto of produtosData) {
        try {
            // Verifica se o produto já existe pelo título antes de tentar criar
            const existingProduct = await prisma.produto.findFirst({
                where: { nome: produto.titulo }
            });

            if (existingProduct) {
                console.log(`❕ Produto já existe, pulando: ${produto.titulo}`);
                continue; 
            }
            
            // Conversão de tipos
            const precoDecimal = new Decimal(produto.preco);
            const estoquePadrao = 20;

            await prisma.produto.create({
                data: {
                    nome: produto.titulo, 
                    descricao: produto.descricao || 'Produto de alta qualidade.',
                    preco: precoDecimal,
                    estoque: estoquePadrao,
                    vendedor_id: vendedorIdPadrao,
                    categoria: produto.categoria || 'Outros',
                    imagem_url: produto.imagem || null, 
                    ativo: true,
                },
            });
            console.log(`✅ Produto criado: ${produto.titulo}`);

        } catch (error) {
            console.error(`❌ Erro ao criar produto '${produto.titulo}':`, error.message);
        }
    }
    console.log('Povoamento de produtos concluído com sucesso!');
}

main()
    .catch((e) => {
        console.error('Erro fatal no seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });