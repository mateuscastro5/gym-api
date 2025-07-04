import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface InstrutorAttributes {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  especialidade: string;
  salario: number;
  status: 'ATIVO' | 'INATIVO';
  created_at?: Date;
  updated_at?: Date;
}

interface InstrutorCreationAttributes extends Optional<InstrutorAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Instrutor extends Model<InstrutorAttributes, InstrutorCreationAttributes> implements InstrutorAttributes {
  declare id: number;
  declare nome: string;
  declare email: string;
  declare telefone: string;
  declare especialidade: string;
  declare salario: number;
  declare status: 'ATIVO' | 'INATIVO';
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Instrutor.init(
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
  },
  {
    sequelize,
    tableName: 'instrutores',
  }
);

export default Instrutor;
