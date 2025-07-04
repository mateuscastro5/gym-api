'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Inserir alunos
    await queryInterface.bulkInsert('alunos', [
      {
        id: 1,
        nome: 'João Silva',
        email: 'joao.silva@email.com',
        telefone: '(11) 99999-1111',
        data_nascimento: new Date('1990-05-15'),
        status: 'ATIVO',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        nome: 'Maria Santos',
        email: 'maria.santos@email.com',
        telefone: '(11) 99999-2222',
        data_nascimento: new Date('1985-08-22'),
        status: 'ATIVO',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        nome: 'Carlos Oliveira',
        email: 'carlos.oliveira@email.com',
        telefone: '(11) 99999-3333',
        data_nascimento: new Date('1992-12-10'),
        status: 'ATIVO',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // Inserir instrutores
    await queryInterface.bulkInsert('instrutores', [
      {
        id: 1,
        nome: 'Ana Costa',
        email: 'ana.costa@academia.com',
        telefone: '(11) 88888-1111',
        especialidade: 'Musculação',
        salario: 3500.00,
        status: 'ATIVO',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        nome: 'Roberto Lima',
        email: 'roberto.lima@academia.com',
        telefone: '(11) 88888-2222',
        especialidade: 'Pilates',
        salario: 3000.00,
        status: 'ATIVO',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        nome: 'Fernanda Rocha',
        email: 'fernanda.rocha@academia.com',
        telefone: '(11) 88888-3333',
        especialidade: 'Yoga',
        salario: 2800.00,
        status: 'ATIVO',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('instrutores', null, {});
    await queryInterface.bulkDelete('alunos', null, {});
  }
};
