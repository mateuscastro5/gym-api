import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface TreinoAttributes {
  id: number;
  aluno_id: number;
  instrutor_id: number;
  usuario_criador_id?: number;
  nome: string;
  descricao: string;
  data_inicio: Date;
  data_fim: Date;
  valor: number;
  status: 'AGENDADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
  deleted: boolean;
  deleted_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

interface TreinoCreationAttributes extends Optional<TreinoAttributes, 'id' | 'usuario_criador_id' | 'deleted' | 'deleted_at' | 'created_at' | 'updated_at'> {}

class Treino extends Model<TreinoAttributes, TreinoCreationAttributes> implements TreinoAttributes {
  declare id: number;
  declare aluno_id: number;
  declare instrutor_id: number;
  declare usuario_criador_id?: number;
  declare nome: string;
  declare descricao: string;
  declare data_inicio: Date;
  declare data_fim: Date;
  declare valor: number;
  declare status: 'AGENDADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
  declare deleted: boolean;
  declare deleted_at?: Date;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Treino.init(
  {
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
    },
    instrutor_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'instrutores',
        key: 'id',
      },
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
    tableName: 'treinos',
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

export default Treino;
