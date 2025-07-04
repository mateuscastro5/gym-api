const { Sequelize, DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    // Criar tabela de usuários (Trabalho #3 - Segurança)
    await queryInterface.createTable('usuarios', {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      nome: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      senha: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      nivel_acesso: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '1=Usuário, 2=Moderador, 3=Admin',
      },
      status: {
        type: DataTypes.ENUM('ATIVO', 'INATIVO', 'BLOQUEADO'),
        allowNull: false,
        defaultValue: 'INATIVO',
      },
      tentativas_login: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      codigo_ativacao: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      codigo_recuperacao: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      data_ultimo_login: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      pergunta_seguranca: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      resposta_seguranca: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Criar tabela de alunos
    await queryInterface.createTable('alunos', {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      nome: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      telefone: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      data_nascimento: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('ATIVO', 'INATIVO'),
        allowNull: false,
        defaultValue: 'ATIVO',
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Criar tabela de instrutores
    await queryInterface.createTable('instrutores', {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      nome: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      telefone: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      especialidade: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      salario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('ATIVO', 'INATIVO'),
        allowNull: false,
        defaultValue: 'ATIVO',
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Criar tabela de treinos
    await queryInterface.createTable('treinos', {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      aluno_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'alunos',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      instrutor_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'instrutores',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      nome: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      descricao: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      data_inicio: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      data_fim: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      valor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('AGENDADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO'),
        allowNull: false,
        defaultValue: 'AGENDADO',
      },
      usuario_criador_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Usuário que criou o treino',
      },
      deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Criar tabela de pagamentos
    await queryInterface.createTable('pagamentos', {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      treino_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'treinos',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      valor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      data_pagamento: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      forma_pagamento: {
        type: DataTypes.ENUM('DINHEIRO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'PIX', 'TRANSFERENCIA'),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('PENDENTE', 'PAGO', 'CANCELADO'),
        allowNull: false,
        defaultValue: 'PENDENTE',
      },
      observacoes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Criar tabela de logs (Trabalho #3 - Segurança)
    await queryInterface.createTable('logs', {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      usuario_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      acao: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'LOGIN, CREATE, UPDATE, DELETE, etc',
      },
      tabela: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      registro_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('SUCESSO', 'ERRO', 'TENTATIVA'),
        allowNull: false,
      },
      ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: 'Suporta IPv4 e IPv6',
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      detalhes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('logs');
    await queryInterface.dropTable('pagamentos');
    await queryInterface.dropTable('treinos');
    await queryInterface.dropTable('instrutores');
    await queryInterface.dropTable('alunos');
    await queryInterface.dropTable('usuarios');
  },
};
