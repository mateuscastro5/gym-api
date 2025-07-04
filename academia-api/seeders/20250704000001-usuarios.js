'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Gerar senhas criptografadas (usando mesmo custo do PasswordUtils)
    const senhaAdmin = await bcrypt.hash('Admin@123456', 12);
    const senhaUser = await bcrypt.hash('User@123456', 12);
    const senhaMod = await bcrypt.hash('Mod@123456', 12);

    await queryInterface.bulkInsert('usuarios', [
      {
        id: 1,
        nome: 'Administrador Sistema',
        email: 'admin@academia.com',
        senha: senhaAdmin,
        nivel_acesso: 3,
        status: 'ATIVO', // Já ativar para facilitar testes
        tentativas_login: 0,
        codigo_ativacao: null,
        pergunta_seguranca: 'Qual o nome da sua primeira academia?',
        resposta_seguranca: await bcrypt.hash('fitness center', 10),
        deleted: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        nome: 'Usuário Comum',
        email: 'user@academia.com',
        senha: senhaUser,
        nivel_acesso: 1,
        status: 'ATIVO',
        tentativas_login: 0,
        pergunta_seguranca: 'Qual sua cor favorita?',
        resposta_seguranca: await bcrypt.hash('azul', 10),
        deleted: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        nome: 'Moderador Sistema',
        email: 'mod@academia.com',
        senha: senhaMod,
        nivel_acesso: 2,
        status: 'ATIVO',
        tentativas_login: 0,
        pergunta_seguranca: 'Qual sua comida favorita?',
        resposta_seguranca: await bcrypt.hash('pizza', 10),
        deleted: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('usuarios', null, {});
  }
};
