import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface LogAttributes {
  id: number;
  usuario_id?: number;
  acao: string;
  tabela: string;
  registro_id?: number;
  ip_address?: string;
  user_agent?: string;
  status: 'SUCESSO' | 'ERRO' | 'TENTATIVA';
  detalhes?: string;
  created_at?: Date;
}

interface LogCreationAttributes extends Optional<LogAttributes, 'id' | 'usuario_id' | 'registro_id' | 'ip_address' | 'user_agent' | 'detalhes' | 'created_at'> {}

class Log extends Model<LogAttributes, LogCreationAttributes> implements LogAttributes {
  declare id: number;
  declare usuario_id?: number;
  declare acao: string;
  declare tabela: string;
  declare registro_id?: number;
  declare ip_address?: string;
  declare user_agent?: string;
  declare status: 'SUCESSO' | 'ERRO' | 'TENTATIVA';
  declare detalhes?: string;
  declare readonly created_at: Date;
}

Log.init(
  {
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
    },
    acao: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    tabela: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    registro_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('SUCESSO', 'ERRO', 'TENTATIVA'),
      allowNull: false,
    },
    detalhes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'logs',
    updatedAt: false, // Logs não devem ser atualizados
  }
);

export default Log;
