const bcrypt = require('bcryptjs');

export class PasswordUtils {
  /**
   * Valida se a senha atende aos critérios de segurança
   * - Mínimo 8 caracteres
   * - Pelo menos 1 letra minúscula
   * - Pelo menos 1 letra maiúscula
   * - Pelo menos 1 número
   * - Pelo menos 1 símbolo especial
   */
  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('A senha deve ter pelo menos 8 caracteres');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra minúscula');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra maiúscula');
    }

    if (!/\d/.test(password)) {
      errors.push('A senha deve conter pelo menos um número');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('A senha deve conter pelo menos um símbolo especial');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) {
      return false;
    }
    
    return await bcrypt.compare(password, hash);
  }

  static generateRecoveryCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  static generateActivationCode(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
