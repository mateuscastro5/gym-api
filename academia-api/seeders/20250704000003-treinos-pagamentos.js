'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Inserir treinos
    await queryInterface.bulkInsert('treinos', [
      {
        id: 1,
        aluno_id: 1,
        instrutor_id: 1,
        nome: 'Treino de Musculação - Iniciante',
        descricao: 'Treino focado em adaptação e fortalecimento muscular para iniciantes',
        data_inicio: new Date('2025-07-05 08:00:00'),
        data_fim: new Date('2025-07-05 09:00:00'),
        valor: 60.00,
        status: 'AGENDADO',
        usuario_criador_id: 1,
        deleted: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        aluno_id: 2,
        instrutor_id: 2,
        nome: 'Aula de Pilates',
        descricao: 'Aula de pilates para fortalecimento do core e flexibilidade',
        data_inicio: new Date('2025-07-05 10:00:00'),
        data_fim: new Date('2025-07-05 11:00:00'),
        valor: 80.00,
        status: 'EM_ANDAMENTO',
        usuario_criador_id: 1,
        deleted: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        aluno_id: 3,
        instrutor_id: 3,
        nome: 'Sessão de Yoga',
        descricao: 'Prática de yoga para relaxamento e alongamento',
        data_inicio: new Date('2025-07-04 07:00:00'),
        data_fim: new Date('2025-07-04 08:00:00'),
        valor: 50.00,
        status: 'CONCLUIDO',
        usuario_criador_id: 2,
        deleted: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        aluno_id: 1,
        instrutor_id: 1,
        nome: 'Treino Deletado (Soft Delete)',
        descricao: 'Este treino foi cancelado e deletado logicamente',
        data_inicio: new Date('2025-07-06 08:00:00'),
        data_fim: new Date('2025-07-06 09:00:00'),
        valor: 60.00,
        status: 'CANCELADO',
        usuario_criador_id: 1,
        deleted: true,
        deleted_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // Inserir pagamentos
    await queryInterface.bulkInsert('pagamentos', [
      {
        id: 1,
        treino_id: 1,
        valor: 60.00,
        data_pagamento: new Date('2025-07-05 08:00:00'),
        forma_pagamento: 'PIX',
        status: 'PENDENTE',
        observacoes: 'Pagamento agendado para o início do treino',
        deleted: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        treino_id: 2,
        valor: 80.00,
        data_pagamento: new Date('2025-07-05 10:00:00'),
        forma_pagamento: 'CARTAO_CREDITO',
        status: 'PAGO',
        observacoes: 'Pagamento processado com sucesso',
        deleted: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        treino_id: 3,
        valor: 50.00,
        data_pagamento: new Date('2025-07-04 07:00:00'),
        forma_pagamento: 'DINHEIRO',
        status: 'PAGO',
        observacoes: 'Pagamento em dinheiro na recepção',
        deleted: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        treino_id: 4,
        valor: 60.00,
        data_pagamento: new Date('2025-07-06 08:00:00'),
        forma_pagamento: 'PIX',
        status: 'CANCELADO',
        observacoes: 'Pagamento cancelado devido ao cancelamento do treino',
        deleted: true,
        deleted_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('pagamentos', null, {});
    await queryInterface.bulkDelete('treinos', null, {});
  }
};
