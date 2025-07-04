import Aluno from './Aluno';
import Instrutor from './Instrutor';
import Treino from './Treino';
import Pagamento from './Pagamento';
import Usuario from './Usuario';
import Log from './Log';

// Associações existentes
// Um aluno pode ter muitos treinos
Aluno.hasMany(Treino, {
  foreignKey: 'aluno_id',
  as: 'treinos',
});

// Um treino pertence a um aluno
Treino.belongsTo(Aluno, {
  foreignKey: 'aluno_id',
  as: 'aluno',
});

// Um instrutor pode ter muitos treinos
Instrutor.hasMany(Treino, {
  foreignKey: 'instrutor_id',
  as: 'treinos',
});

// Um treino pertence a um instrutor
Treino.belongsTo(Instrutor, {
  foreignKey: 'instrutor_id',
  as: 'instrutor',
});

// Um treino pode ter muitos pagamentos
Treino.hasMany(Pagamento, {
  foreignKey: 'treino_id',
  as: 'pagamentos',
});

// Um pagamento pertence a um treino
Pagamento.belongsTo(Treino, {
  foreignKey: 'treino_id',
  as: 'treino',
});

// Novas associações com segurança
// Um usuário pode ter muitos logs
Usuario.hasMany(Log, {
  foreignKey: 'usuario_id',
  as: 'logs',
});

// Um log pertence a um usuário
Log.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario',
});

// Relacionamento entre usuário e treino (usuário que criou o treino)
Usuario.hasMany(Treino, {
  foreignKey: 'usuario_criador_id',
  as: 'treinos_criados',
});

Treino.belongsTo(Usuario, {
  foreignKey: 'usuario_criador_id',
  as: 'usuario_criador',
});

export {
  Aluno,
  Instrutor,
  Treino,
  Pagamento,
  Usuario,
  Log,
};
