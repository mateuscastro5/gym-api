import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AlunoAttributes {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  data_nascimento: Date;
  status: 'ATIVO' | 'INATIVO';
  created_at?: Date;
  updated_at?: Date;
}

interface AlunoCreationAttributes extends Optional<AlunoAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Aluno extends Model<AlunoAttributes, AlunoCreationAttributes> implements AlunoAttributes {
  declare id: number;
  declare nome: string;
  declare email: string;
  declare telefone: string;
  declare data_nascimento: Date;
  declare status: 'ATIVO' | 'INATIVO';
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Aluno.init(
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
    data_nascimento: {
      type: DataTypes.DATE,
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
    tableName: 'alunos',
  }
);

export default Aluno;
