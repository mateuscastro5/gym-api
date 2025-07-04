import { Usuario } from '../models';
import { PasswordUtils } from '../utils/PasswordUtils';
import { LogUtils } from '../utils/LogUtils';
import { generateToken } from '../middleware/auth';
const nodemailer = require('nodemailer');

export class UsuarioController {
  // Criar novo usuário
  async store(req: any, res: any): Promise<any> {
    try {
      const { 
        nome, 
        email, 
        senha, 
        nivel_acesso, 
        pergunta_seguranca, 
        resposta_seguranca 
      } = req.body;

      // Validações básicas
      if (!nome || !email || !senha) {
        return res.status(400).json({ 
          message: 'Nome, email e senha são obrigatórios' 
        });
      }

      // Validar força da senha
      const passwordValidation = PasswordUtils.validatePassword(senha);
      if (!passwordValidation.valid) {
        await LogUtils.logAction({
          acao: 'REGISTER_FAILED',
          tabela: 'usuarios',
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
          status: 'ERRO',
          detalhes: `Senha inválida para email: ${email}. Erros: ${passwordValidation.errors.join(', ')}`,
        });

        return res.status(400).json({ 
          message: 'Senha não atende aos critérios de segurança',
          errors: passwordValidation.errors,
        });
      }

      // Verificar se email já existe
      const existingUser = await Usuario.findOne({ where: { email } });
      if (existingUser) {
        await LogUtils.logAction({
          acao: 'REGISTER_FAILED',
          tabela: 'usuarios',
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
          status: 'ERRO',
          detalhes: `Tentativa de registro com email já existente: ${email}`,
        });

        return res.status(400).json({ 
          message: 'Email já está em uso' 
        });
      }

      // Criptografar senha
      const hashedPassword = await PasswordUtils.hashPassword(senha);
      
      // Gerar código de ativação
      const codigoAtivacao = PasswordUtils.generateActivationCode();

      // Criptografar resposta de segurança se fornecida
      let respostaSegurancaCriptografada: string | undefined = undefined;
      if (resposta_seguranca) {
        respostaSegurancaCriptografada = await PasswordUtils.hashPassword(resposta_seguranca.toLowerCase());
      }

      // Criar usuário
      const usuario = await Usuario.create({
        nome,
        email,
        senha: hashedPassword,
        nivel_acesso: nivel_acesso || 1,
        status: 'INATIVO',
        codigo_ativacao: codigoAtivacao,
        tentativas_login: 0,
        pergunta_seguranca,
        resposta_seguranca: respostaSegurancaCriptografada,
        deleted: false,
      });

      // Enviar email de ativação
      await this.enviarEmailAtivacao(email, nome, codigoAtivacao);

      // Registrar log
      await LogUtils.logCreate({
        usuario_id: usuario.id,
        tabela: 'usuarios',
        registro_id: usuario.id,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        detalhes: `Usuário registrado: ${email}`,
      });

      return res.status(201).json({
        message: 'Usuário criado com sucesso. Verifique seu email para ativar a conta.',
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          nivel_acesso: usuario.nivel_acesso,
          status: usuario.status,
        },
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      
      await LogUtils.logAction({
        acao: 'REGISTER_ERROR',
        tabela: 'usuarios',
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        status: 'ERRO',
        detalhes: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      });

      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Login do usuário
  async login(req: any, res: any): Promise<any> {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ 
          message: 'Email e senha são obrigatórios' 
        });
      }

      // Buscar usuário (incluir senha para comparação)
      const usuario = await Usuario.unscoped().findOne({ 
        where: { email, deleted: false },
        attributes: { 
          include: ['senha'] // Garantir que senha seja incluída
        }
      });
      
      if (!usuario) {
        await LogUtils.logLoginAttempt({
          email,
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
          status: 'ERRO',
          detalhes: 'Usuário não encontrado',
        });

        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      // Verificar se usuário está bloqueado
      if (usuario.status === 'BLOQUEADO') {
        await LogUtils.logLoginAttempt({
          email,
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
          status: 'ERRO',
          detalhes: 'Usuário bloqueado',
          usuario_id: usuario.id,
        });

        return res.status(401).json({ 
          message: 'Usuário bloqueado. Entre em contato com o administrador.' 
        });
      }

      // Verificar se usuário está inativo
      if (usuario.status === 'INATIVO') {
        await LogUtils.logLoginAttempt({
          email,
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
          status: 'ERRO',
          detalhes: 'Usuário inativo',
          usuario_id: usuario.id,
        });

        return res.status(401).json({ 
          message: 'Conta não ativada. Verifique seu email.' 
        });
      }

      // Verificar senha
      const senhaValida = await PasswordUtils.comparePassword(senha, usuario.senha);
      
      if (!senhaValida) {
        // Incrementar tentativas de login
        const novasTentativas = usuario.tentativas_login + 1;
        await usuario.update({ tentativas_login: novasTentativas });

        // Bloquear usuário após 3 tentativas
        if (novasTentativas >= 3) {
          await usuario.update({ status: 'BLOQUEADO' });
          
          await LogUtils.logLoginAttempt({
            email,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            status: 'ERRO',
            detalhes: `Usuário bloqueado após ${novasTentativas} tentativas`,
            usuario_id: usuario.id,
          });

          return res.status(401).json({ 
            message: 'Usuário bloqueado após múltiplas tentativas inválidas' 
          });
        }

        await LogUtils.logLoginAttempt({
          email,
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
          status: 'ERRO',
          detalhes: `Senha inválida. Tentativa ${novasTentativas}/3`,
          usuario_id: usuario.id,
        });

        return res.status(401).json({ 
          message: 'Credenciais inválidas',
          tentativas_restantes: 3 - novasTentativas,
        });
      }

      // Login bem-sucedido
      const ultimoLogin = usuario.ultimo_login;
      await usuario.update({ 
        ultimo_login: new Date(),
        tentativas_login: 0, // Reset tentativas
      });

      // Gerar token
      const token = generateToken({
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        nivel_acesso: usuario.nivel_acesso,
      });

      await LogUtils.logLoginAttempt({
        email,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        status: 'SUCESSO',
        detalhes: 'Login realizado com sucesso',
        usuario_id: usuario.id,
      });

      // Mensagem de boas-vindas
      let mensagemBoasVindas = `Bem-vindo, ${usuario.nome}!`;
      if (ultimoLogin) {
        mensagemBoasVindas += ` Seu último acesso foi em ${ultimoLogin.toLocaleString('pt-BR')}.`;
      } else {
        mensagemBoasVindas += ' Este é o seu primeiro acesso ao sistema.';
      }

      return res.json({
        message: mensagemBoasVindas,
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          nivel_acesso: usuario.nivel_acesso,
          ultimo_login: ultimoLogin,
        },
      });
    } catch (error) {
      console.error('Erro no login:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Ativar conta do usuário
  async ativarConta(req: any, res: any): Promise<any> {
    try {
      const { codigo } = req.params;

      const usuario = await Usuario.findOne({
        where: { codigo_ativacao: codigo, status: 'INATIVO' }
      });

      if (!usuario) {
        return res.status(404).json({ 
          message: 'Código de ativação inválido ou conta já ativada' 
        });
      }

      await usuario.update({
        status: 'ATIVO',
        codigo_ativacao: undefined,
      });

      await LogUtils.logAction({
        usuario_id: usuario.id,
        acao: 'ACCOUNT_ACTIVATED',
        tabela: 'usuarios',
        registro_id: usuario.id,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        status: 'SUCESSO',
        detalhes: 'Conta ativada via link de email',
      });

      return res.json({ message: 'Conta ativada com sucesso!' });
    } catch (error) {
      console.error('Erro ao ativar conta:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Solicitar recuperação de senha
  async solicitarRecuperacaoSenha(req: any, res: any): Promise<any> {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email é obrigatório' });
      }

      const usuario = await Usuario.findOne({ where: { email } });

      if (!usuario) {
        // Por segurança, não revelar se o email existe
        return res.json({ 
          message: 'Se o email estiver cadastrado, você receberá as instruções de recuperação.' 
        });
      }

      // Gerar código de recuperação
      const codigo = PasswordUtils.generateRecoveryCode();
      const expiracao = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

      await usuario.update({
        codigo_recuperacao: codigo,
        codigo_recuperacao_expira: expiracao,
      });

      // Enviar email com código
      await this.enviarEmailRecuperacao(email, usuario.nome, codigo);

      await LogUtils.logAction({
        usuario_id: usuario.id,
        acao: 'PASSWORD_RECOVERY_REQUESTED',
        tabela: 'usuarios',
        registro_id: usuario.id,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        status: 'SUCESSO',
        detalhes: 'Código de recuperação enviado por email',
      });

      return res.json({ 
        message: 'Se o email estiver cadastrado, você receberá as instruções de recuperação.' 
      });
    } catch (error) {
      console.error('Erro ao solicitar recuperação:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Recuperar senha com código
  async recuperarSenha(req: any, res: any): Promise<any> {
    try {
      const { email, codigo, nova_senha } = req.body;

      if (!email || !codigo || !nova_senha) {
        return res.status(400).json({ 
          message: 'Email, código e nova senha são obrigatórios' 
        });
      }

      // Validar nova senha
      const passwordValidation = PasswordUtils.validatePassword(nova_senha);
      if (!passwordValidation.valid) {
        return res.status(400).json({ 
          message: 'Nova senha não atende aos critérios de segurança',
          errors: passwordValidation.errors,
        });
      }

      const usuario = await Usuario.findOne({
        where: { 
          email,
          codigo_recuperacao: codigo,
        }
      });

      if (!usuario || !usuario.codigo_recuperacao_expira || usuario.codigo_recuperacao_expira < new Date()) {
        await LogUtils.logAction({
          acao: 'PASSWORD_RECOVERY_FAILED',
          tabela: 'usuarios',
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
          status: 'ERRO',
          detalhes: `Código inválido ou expirado para email: ${email}`,
        });

        return res.status(400).json({ 
          message: 'Código inválido ou expirado' 
        });
      }

      // Atualizar senha
      const hashedPassword = await PasswordUtils.hashPassword(nova_senha);
      await usuario.update({
        senha: hashedPassword,
        codigo_recuperacao: undefined,
        codigo_recuperacao_expira: undefined,
      });

      await LogUtils.logPasswordChange({
        usuario_id: usuario.id,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        tipo: 'RECUPERACAO',
      });

      return res.json({ message: 'Senha alterada com sucesso!' });
    } catch (error) {
      console.error('Erro ao recuperar senha:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Alterar senha (usuário logado)
  async alterarSenha(req: any, res: any): Promise<any> {
    try {
      const { senha_atual, nova_senha } = req.body;
      const usuario_id = req.user.id;

      if (!senha_atual || !nova_senha) {
        return res.status(400).json({ 
          message: 'Senha atual e nova senha são obrigatórias' 
        });
      }

      // Validar nova senha
      const passwordValidation = PasswordUtils.validatePassword(nova_senha);
      if (!passwordValidation.valid) {
        return res.status(400).json({ 
          message: 'Nova senha não atende aos critérios de segurança',
          errors: passwordValidation.errors,
        });
      }

      const usuario = await Usuario.findByPk(usuario_id);
      if (!usuario) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Verificar senha atual
      const senhaValida = await PasswordUtils.comparePassword(senha_atual, usuario.senha);
      if (!senhaValida) {
        await LogUtils.logAction({
          usuario_id,
          acao: 'PASSWORD_CHANGE_FAILED',
          tabela: 'usuarios',
          registro_id: usuario_id,
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
          status: 'ERRO',
          detalhes: 'Senha atual incorreta',
        });

        return res.status(400).json({ message: 'Senha atual incorreta' });
      }

      // Atualizar senha
      const hashedPassword = await PasswordUtils.hashPassword(nova_senha);
      await usuario.update({ senha: hashedPassword });

      await LogUtils.logPasswordChange({
        usuario_id,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        tipo: 'ALTERACAO',
      });

      return res.json({ message: 'Senha alterada com sucesso!' });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Listar usuários (apenas admins)
  async index(req: any, res: any): Promise<any> {
    try {
      const usuarios = await Usuario.findAll({
        attributes: ['id', 'nome', 'email', 'nivel_acesso', 'status', 'ultimo_login', 'created_at'],
        order: [['created_at', 'DESC']],
      });

      return res.json(usuarios);
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  private async enviarEmailAtivacao(email: string, nome: string, codigo: string): Promise<void> {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('📧 Email não configurado - pulando envio de email de ativação');
        return;
      }
      
      // Em ambiente de desenvolvimento ou com credenciais de teste, simular envio de email
      if (process.env.EMAIL_USER === 'your_email@gmail.com' || 
          process.env.EMAIL_USER.includes('test') ||
          process.env.EMAIL_PASS === 'your_app_password') {
        console.log(`📧 [SIMULAÇÃO] Email de ativação para ${email}`);
        console.log(`🔗 Código de ativação: ${codigo}`);
        console.log(`🌐 Link de ativação: ${process.env.BASE_URL || 'http://localhost:3000'}/api/usuarios/ativar/${codigo}`);
        return;
      }

      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const linkAtivacao = `${process.env.BASE_URL || 'http://localhost:3000'}/api/usuarios/ativar/${codigo}`;

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Ative sua conta - Academia Fitness',
        html: `
          <h2>Bem-vindo, ${nome}!</h2>
          <p>Para ativar sua conta, clique no link abaixo:</p>
          <a href="${linkAtivacao}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ativar Conta</a>
          <p>Ou acesse: ${linkAtivacao}</p>
          <p>Este link expira em 24 horas.</p>
        `,
      });
    } catch (error: any) {
      console.error('Erro ao enviar email de ativação:', error);
      
      // Se for erro de autenticação, fazer fallback para simulação
      if (error.code === 'EAUTH' || error.responseCode === 535) {
        console.log('🔄 Fallback para simulação devido a erro de autenticação');
        console.log(`📧 [SIMULAÇÃO] Email de ativação para ${email}`);
        console.log(`🔗 Código de ativação: ${codigo}`);
        console.log(`🌐 Link de ativação: ${process.env.BASE_URL || 'http://localhost:3000'}/api/usuarios/ativar/${codigo}`);
      }
    }
  }

  private async enviarEmailRecuperacao(email: string, nome: string, codigo: string): Promise<void> {
    try {
      // Verificar se as credenciais de email estão configuradas
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('📧 Email não configurado - pulando envio de email de recuperação');
        return;
      }
      
      // Em ambiente de desenvolvimento ou com credenciais de teste, simular envio de email
      if (process.env.EMAIL_USER === 'your_email@gmail.com' || 
          process.env.EMAIL_USER.includes('test') ||
          process.env.EMAIL_PASS === 'your_app_password') {
        console.log(`📧 [SIMULAÇÃO] Email de recuperação para ${email}`);
        console.log(`🔑 Código de recuperação: ${codigo}`);
        console.log(`📅 Código expira em 15 minutos`);
        return;
      }

      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Recuperação de Senha - Academia Fitness',
        html: `
          <h2>Olá, ${nome}!</h2>
          <p>Você solicitou a recuperação de sua senha.</p>
          <p>Seu código de recuperação é: <strong>${codigo}</strong></p>
          <p>Este código expira em 15 minutos.</p>
          <p>Se você não solicitou esta recuperação, ignore este email.</p>
        `,
      });
    } catch (error: any) {
      console.error('Erro ao enviar email de recuperação:', error);
      
      // Se for erro de autenticação, fazer fallback para simulação
      if (error.code === 'EAUTH' || error.responseCode === 535) {
        console.log('🔄 Fallback para simulação devido a erro de autenticação');
        console.log(`📧 [SIMULAÇÃO] Email de recuperação para ${email}`);
        console.log(`🔑 Código de recuperação: ${codigo}`);
        console.log(`📅 Código expira em 15 minutos`);
      }
    }
  }
}
