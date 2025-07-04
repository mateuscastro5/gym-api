import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PagamentoAttributes {
  id: number;
  treino_id: number;
  valor: number;
  data_pagamento: Date;
  forma_pagamento: 'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX' | 'TRANSFERENCIA';
  status: 'PENDENTE' | 'PAGO' | 'CANCELADO';
  observacoes?: string;
  deleted?: boolean;
  deleted_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

interface PagamentoCreationAttributes extends Optional<PagamentoAttributes, 'id' | 'observacoes' | 'deleted' | 'deleted_at' | 'created_at' | 'updated_at'> {}

class Pagamento extends Model<PagamentoAttributes, PagamentoCreationAttributes> implements PagamentoAttributes {
  declare id: number;
  declare treino_id: number;
  declare valor: number;
  declare data_pagamento: Date;
  declare forma_pagamento: 'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX' | 'TRANSFERENCIA';
  declare status: 'PENDENTE' | 'PAGO' | 'CANCELADO';
  declare observacoes?: string;
  declare deleted?: boolean;
  declare deleted_at?: Date;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Pagamento.init(
  {
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
  },
  {
    sequelize,
    tableName: 'pagamentos',
    scopes: {
      active: {
        where: {
          deleted: false,
        },
      },
      deleted: {
        where: {
          deleted: true,
        },
      },
    },
    defaultScope: {
      where: {
        deleted: false,
      },
    },
  }
);

export default Pagamento;
