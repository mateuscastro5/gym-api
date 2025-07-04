# Academia API - Sistema de Controle de Treinos

Esta é uma API desenvolvida em TypeScript/Node.js usando Express 5, Sequelize e MySQL para gerenciar um sistema de treinos de academia.

## 🚀 Funcionalidades

- **CRUD completo** para Alunos, Instrutores, Treinos e Pagamentos
- **Transações de banco de dados** para operações críticas
- **Envio de emails** com relatórios de atividades
- **Relacionamentos** entre entidades
- **Validações** de dados
- **API RESTful** com Express 5
- **TypeScript** para tipagem estática

## 🔒 Recursos de Segurança (Trabalho #3)

### ✅ Recursos Básicos Implementados:
- **Sistema de Usuários** com model completa e relacionamentos
- **Autenticação JWT** com geração e verificação de tokens
- **Criptografia de senhas** usando bcryptjs
- **Validação de senhas** (mínimo 8 caracteres, maiúsculas, minúsculas, números e símbolos)
- **Sistema de Logs** com registro de ações do sistema
- **Backup e Restore** de todas as tabelas

### ✅ Recursos Avançados Implementados:
1. **Ativação de Conta**: Usuários iniciam com status INATIVO e recebem email para ativação
2. **Recuperação de Senha**: Sistema de códigos por email para redefinição de senha
3. **Níveis de Acesso**: Controle de privilégios (nível 3 = admin para exclusões)
4. **Controle de Tentativas**: Bloqueio após 3 tentativas de login inválidas
5. **Último Login**: Registro e exibição da data/hora do último acesso
6. **Pergunta de Segurança**: Método alternativo para recuperação de senha
7. **Alteração de Senha**: Validação da senha atual antes de alterar
8. **Soft Delete**: Exclusão lógica em Treinos e Pagamentos com data de exclusão

### 🗃️ Modelos de Segurança:

#### 5. Usuários
- `id` (Primary Key)
- `nome`
- `email` (Unique)
- `senha` (Criptografada)
- `nivel_acesso` (1=Usuário, 2=Moderador, 3=Admin)
- `status` (ATIVO/INATIVO/BLOQUEADO)
- `tentativas_login`
- `codigo_ativacao`
- `codigo_recuperacao`
- `data_ultimo_login`
- `pergunta_secreta`
- `resposta_secreta`
- `deleted/deleted_at` (Soft Delete)

#### 6. Logs
- `id` (Primary Key)
- `usuario_id` (Foreign Key)
- `acao` (LOGIN/CREATE/UPDATE/DELETE/etc)
- `tabela`
- `registro_id`
- `status` (SUCESSO/ERRO/TENTATIVA)
- `ip_address`
- `user_agent`
- `detalhes`
- `created_at`

## 📋 Modelos (Tabelas)

### 1. Alunos
- `id` (Primary Key)
- `nome`
- `email` (Unique)
- `telefone`
- `data_nascimento`
- `status` (ATIVO/INATIVO)

### 2. Instrutores
- `id` (Primary Key)
- `nome`
- `email` (Unique)
- `telefone`
- `especialidade`
- `salario`
- `status` (ATIVO/INATIVO)

### 3. Treinos (Tabela Principal com Transações)
- `id` (Primary Key)
- `aluno_id` (Foreign Key)
- `instrutor_id` (Foreign Key)
- `nome`
- `descricao`
- `data_inicio`
- `data_fim`
- `valor`
- `status` (AGENDADO/EM_ANDAMENTO/CONCLUIDO/CANCELADO)

### 4. Pagamentos
- `id` (Primary Key)
- `treino_id` (Foreign Key)
- `valor`
- `data_pagamento`
- `forma_pagamento` (DINHEIRO/CARTAO_CREDITO/CARTAO_DEBITO/PIX/TRANSFERENCIA)
- `status` (PENDENTE/PAGO/CANCELADO)
- `observacoes`

## 🛠️ Tecnologias Utilizadas

- **Node.js** 
- **TypeScript** 
- **Express 5** 
- **Sequelize ORM** 
- **MySQL** 
- **Nodemailer** (para envio de emails)
- **bcryptjs** (para criptografia)
- **jsonwebtoken** (para autenticação)
- **dotenv** (para variáveis de ambiente)

## ⚙️ Configuração do Ambiente

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Banco de Dados
Crie um arquivo `.env` na raiz do projeto:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=academia_db
DB_USER=root
DB_PASSWORD=

# Server Configuration
PORT=3000

# JWT Configuration
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app

# Email sender info
EMAIL_FROM=academia@gmail.com
EMAIL_FROM_NAME=Academia Fitness
```

### 3. Executar Migrations (Opcional)
```bash
npx sequelize-cli db:migrate
```

### 4. Compilar TypeScript
```bash
npm run build
```

### 5. Executar em Desenvolvimento
```bash
npm run dev
```

### 6. Executar em Produção
```bash
npm start
```

## 📚 Endpoints da API

### 🔐 Autenticação e Usuários
**Rotas Públicas:**
- `POST /api/usuarios/register` - Registrar novo usuário
- `POST /api/usuarios/login` - Login e geração de token JWT
- `GET /api/usuarios/ativar/:codigo` - Ativar conta com código
- `POST /api/usuarios/recuperar-senha/solicitar` - Solicitar recuperação de senha
- `POST /api/usuarios/recuperar-senha/confirmar` - Confirmar nova senha com código

**Rotas Protegidas (requer token):**
- `POST /api/usuarios/alterar-senha` - Alterar senha atual
- `GET /api/usuarios` - Listar usuários (requer nível 3)

### 🏃‍♂️ Alunos (🔒 Protegido)
- `GET /api/alunos` - Listar todos os alunos
- `GET /api/alunos/:id` - Buscar aluno por ID
- `POST /api/alunos` - Criar novo aluno
- `PUT /api/alunos/:id` - Atualizar aluno
- `DELETE /api/alunos/:id` - Deletar aluno (🔐 requer nível 3)

### 👨‍🏫 Instrutores (🔒 Protegido)
- `GET /api/instrutores` - Listar todos os instrutores
- `GET /api/instrutores/:id` - Buscar instrutor por ID
- `POST /api/instrutores` - Criar novo instrutor
- `PUT /api/instrutores/:id` - Atualizar instrutor
- `DELETE /api/instrutores/:id` - Deletar instrutor (🔐 requer nível 3)

### 💪 Treinos (🔒 Protegido - com Transações)
- `GET /api/treinos` - Listar todos os treinos
- `GET /api/treinos/:id` - Buscar treino por ID
- `POST /api/treinos` - Criar novo treino (com pagamento - TRANSAÇÃO)
- `PUT /api/treinos/:id` - Atualizar treino
- `DELETE /api/treinos/:id` - Deletar treino (🔐 requer nível 3 - SOFT DELETE)
- `PATCH /api/treinos/:id/finalizar` - Finalizar treino e confirmar pagamento (TRANSAÇÃO)

### 💳 Pagamentos (🔒 Protegido)
- `GET /api/pagamentos` - Listar todos os pagamentos
- `GET /api/pagamentos/:id` - Buscar pagamento por ID
- `POST /api/pagamentos` - Criar novo pagamento
- `PUT /api/pagamentos/:id` - Atualizar pagamento
- `DELETE /api/pagamentos/:id` - Deletar pagamento (🔐 requer nível 3 - SOFT DELETE)
- `PATCH /api/pagamentos/:id/confirmar` - Confirmar pagamento

### 📧 Emails (🔒 Protegido)
- `POST /api/email/aluno/:id/relatorio` - Enviar relatório para aluno
- `POST /api/email/instrutor/:id/relatorio` - Enviar relatório para instrutor

### 💾 Backup/Restore (🔐 Requer nível 3)
- `POST /api/backup/backup` - Realizar backup do sistema
- `POST /api/backup/restore` - Restaurar backup
- `GET /api/backup/list` - Listar backups disponíveis

## 🔄 Transações Implementadas

### 1. Criação de Treino
Quando um treino é criado, automaticamente:
- Cria o registro do treino
- Cria o pagamento associado
- Se alguma operação falhar, todas são revertidas

### 2. Exclusão de Treino
Quando um treino é deletado:
- Remove todos os pagamentos associados
- Remove o treino
- Operação atômica (tudo ou nada)

### 3. Finalização de Treino
Quando um treino é finalizado:
- Atualiza status do treino para CONCLUIDO
- Atualiza todos os pagamentos para PAGO
- Operação em transação única

## 📋 Exemplos de Uso

### 🔐 Registrar Usuário
```json
POST /api/usuarios/register
{
  "nome": "Admin Sistema",
  "email": "admin@academia.com",
  "senha": "MinhaSenh@123",
  "nivel_acesso": 3,
  "pergunta_secreta": "Nome do seu primeiro pet?",
  "resposta_secreta": "Buddy"
}
```

### 🔑 Login
```json
POST /api/usuarios/login
{
  "email": "admin@academia.com",
  "senha": "MinhaSenh@123"
}

// Resposta:
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nome": "Admin Sistema",
    "email": "admin@academia.com",
    "nivel_acesso": 3
  },
  "ultimo_login": "Bem-vindo! Este é o seu primeiro acesso ao sistema"
}
```

### 🔄 Recuperar Senha
```json
// 1. Solicitar código
POST /api/usuarios/recuperar-senha/solicitar
{
  "email": "admin@academia.com"
}

// 2. Confirmar nova senha
POST /api/usuarios/recuperar-senha/confirmar
{
  "email": "admin@academia.com",
  "codigo": "AB12",
  "nova_senha": "NovaSenha@456"
}
```

### 🔧 Alterar Senha
```json
POST /api/usuarios/alterar-senha
Authorization: Bearer <token>
{
  "senha_atual": "MinhaSenh@123",
  "nova_senha": "NovaSenh@456"
}
```

### Criar Aluno (🔒 Requer autenticação)
```json
POST /api/alunos
Authorization: Bearer <token>
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "(11) 99999-9999",
  "data_nascimento": "1990-05-15"
}
```

### Criar Instrutor (🔒 Requer autenticação)
```json
POST /api/instrutores
Authorization: Bearer <token>
{
  "nome": "Maria Santos",
  "email": "maria@email.com",
  "telefone": "(11) 88888-8888",
  "especialidade": "Musculação",
  "salario": 3000.00
}
```

### Criar Treino (🔒 Requer autenticação)
```json
POST /api/treinos
Authorization: Bearer <token>
{
  "aluno_id": 1,
  "instrutor_id": 1,
  "nome": "Treino de Musculação",
  "descricao": "Treino focado em ganho de massa muscular",
  "data_inicio": "2025-07-05T08:00:00Z",
  "data_fim": "2025-07-05T09:00:00Z",
  "valor": 50.00,
  "forma_pagamento": "PIX"
}
```

### 💾 Realizar Backup (🔐 Requer nível 3)
```json
POST /api/backup/backup
Authorization: Bearer <token_admin>
```

### Enviar Email de Relatório (🔒 Requer autenticação)
```json
POST /api/email/aluno/1/relatorio
Authorization: Bearer <token>
{
  "assunto": "Relatório Mensal de Treinos"
}
```

## 🎯 Requisitos do Trabalho Atendidos

### 📋 Trabalho #2 - APIs com Tabelas Relacionadas e Transações
✅ **3-5 Models relacionadas**: Aluno, Instrutor, Treino, Pagamento, Usuario, Log  
✅ **CRUD completo**: Todas as entidades possuem operações CRUD  
✅ **Transações**: Criação, exclusão e finalização de treinos  
✅ **Schema e Migrations**: Estrutura do banco definida  
✅ **Envio de Email**: Relatórios por email implementados  
✅ **Testes com Insomnia**: Endpoints prontos para teste  

### 🔒 Trabalho #3 - Recursos de Segurança

#### Recursos Básicos Obrigatórios:
✅ **Model Usuario**: Criada com todos os campos necessários  
✅ **Relacionamento**: Usuario relacionado com outras models (Treino, Log)  
✅ **Rotas Usuário**: Inclusão e listagem implementadas  
✅ **Criptografia**: Senhas criptografadas com bcryptjs  
✅ **Validação Senha**: Regras de composição implementadas (8+ chars, maiúscula, minúscula, número, símbolo)  
✅ **Login JWT**: Token gerado e middleware de verificação  
✅ **Model Logs**: Relacionada com usuários, registra ações do sistema  
✅ **Backup/Restore**: Rotas para backup e restore das tabelas  

#### Recursos Avançados Implementados (2 escolhidos + extras):
✅ **1. Recuperação Senha**: 2 rotas (solicitar + confirmar) com código por email  
✅ **2. Ativação Conta**: Status INATIVO inicial + link de ativação por email  
✅ **3. Níveis de Acesso**: 3 níveis implementados com restrições por rota  
✅ **4. Controle Tentativas**: Bloqueio após 3 tentativas inválidas  
✅ **5. Último Login**: Registro e exibição da data/hora  
✅ **6. Pergunta Segurança**: Método alternativo para recuperação  
✅ **7. Alteração Senha**: Validação da senha atual  
✅ **8. Soft Delete**: Implementado em Treinos e Pagamentos  

### 🎖️ Recursos Extras Implementados:
✅ **Logs Avançados**: Registro detalhado de ações em controllers  
✅ **Middleware Completo**: Autenticação e níveis aplicados corretamente  
✅ **Proteção Rotas**: Todas as rotas principais protegidas  
✅ **Validações Robustas**: Verificações de dados em todos os endpoints  
✅ **Documentação Completa**: README detalhado com exemplos  

## 🚀 Como Testar

### Fluxo de Teste Completo:

1. **Configurar Ambiente**:
   ```bash
   npm install
   npm run build
   ```

2. **Configurar .env** com suas credenciais de banco e email

3. **Iniciar Aplicação**:
   ```bash
   npm run dev
   # Acesse: http://localhost:3000
   ```

4. **Testar Fluxo de Segurança**:
   - Registrar usuário: `POST /api/usuarios/register`
   - Ativar conta via email: `GET /api/usuarios/ativar/:codigo`
   - Fazer login: `POST /api/usuarios/login`
   - Usar token nas rotas protegidas

5. **Testar CRUD** com autenticação nos endpoints de:
   - Alunos, Instrutores, Treinos, Pagamentos

6. **Testar Recursos Avançados**:
   - Recuperação de senha
   - Alteração de senha
   - Backup/restore (usuários nível 3)
   - Soft delete em treinos

Use **Insomnia** ou **Postman** para testar todos os endpoints com os exemplos fornecidos.

## 📝 Observações Técnicas

### Trabalho #2:
- Express 5 (versão mais recente)
- TypeScript configurado para máxima compatibilidade
- Transações garantem integridade dos dados
- Relacionamentos configurados corretamente
- Emails HTML formatados para melhor apresentação

### Trabalho #3:
- **Segurança robusta** com JWT e bcryptjs
- **8 recursos avançados** implementados (requisito: 2)
- **Logs detalhados** de todas as ações sensíveis
- **Soft delete** implementado nas tabelas principais
- **Proteção completa** de rotas com níveis de acesso
- **Validações rigorosas** de senhas e dados
- **Sistema de recuperação** múltiplo (email + pergunta secreta)

### 🔧 Tecnologias Utilizadas:
- **Backend**: Node.js + TypeScript + Express 5
- **Banco**: MySQL + Sequelize ORM
- **Segurança**: JWT + bcryptjs + middleware customizado
- **Email**: Nodemailer
- **Validações**: Regex patterns customizados
- **Logs**: Sistema próprio de auditoria

---

**Desenvolvido para os Trabalhos #2 e #3 - APIs com Segurança Avançada**  
**Sistema completo de academia com controle de acesso e auditoria**
