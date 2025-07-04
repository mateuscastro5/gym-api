import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UsuarioAttributes {
  id: number;
  nome: string;
  email: string;
  senha: string;
  nivel_acesso: 1 | 2 | 3; // 1: Básico, 2: Intermediário, 3: Admin
  status: 'ATIVO' | 'INATIVO' | 'BLOQUEADO';
  codigo_ativacao?: string;
  tentativas_login: number;
  ultimo_login?: Date;
  pergunta_seguranca?: string;
  resposta_seguranca?: string;
  codigo_recuperacao?: string;
  codigo_recuperacao_expira?: Date;
  deleted: boolean;
  deleted_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

interface UsuarioCreationAttributes extends Optional<UsuarioAttributes, 'id' | 'codigo_ativacao' | 'tentativas_login' | 'ultimo_login' | 'pergunta_seguranca' | 'resposta_seguranca' | 'codigo_recuperacao' | 'codigo_recuperacao_expira' | 'deleted' | 'deleted_at' | 'created_at' | 'updated_at'> {}

class Usuario extends Model<UsuarioAttributes, UsuarioCreationAttributes> implements UsuarioAttributes {
  // Remover propriedades públicas para evitar conflito com Sequelize getters/setters
  declare id: number;
  declare nome: string;
  declare email: string;
  declare senha: string;
  declare nivel_acesso: 1 | 2 | 3;
  declare status: 'ATIVO' | 'INATIVO' | 'BLOQUEADO';
  declare codigo_ativacao?: string;
  declare tentativas_login: number;
  declare ultimo_login?: Date;
  declare pergunta_seguranca?: string;
  declare resposta_seguranca?: string;
  declare codigo_recuperacao?: string;
  declare codigo_recuperacao_expira?: Date;
  declare deleted: boolean;
  declare deleted_at?: Date;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Usuario.init(
  {
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
      validate: {
        isEmail: true,
      },
    },
    senha: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    nivel_acesso: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      validate: {
        isIn: [[1, 2, 3]],
      },
    },
    status: {
      type: DataTypes.ENUM('ATIVO', 'INATIVO', 'BLOQUEADO'),
      allowNull: false,
      defaultValue: 'INATIVO',
    },
    codigo_ativacao: {
      type: DataTypes.STRING(32),
      allowNull: true,
    },
    tentativas_login: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    ultimo_login: {
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
    codigo_recuperacao: {
      type: DataTypes.STRING(4),
      allowNull: true,
    },
    codigo_recuperacao_expira: {
      type: DataTypes.DATE,
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
  },
  {
    sequelize,
    tableName: 'usuarios',
    defaultScope: {
      where: {
        deleted: false,
      },
    },
    scopes: {
      withDeleted: {
        where: {},
      },
      onlyDeleted: {
        where: {
          deleted: true,
        },
      },
    },
  }
);

export default Usuario;
