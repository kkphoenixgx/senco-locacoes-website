import bcrypt from 'bcrypt';

export default class Encrypt {
  
  private constructor() {}

  /** * Encripta uma senha usando bcrypt. * @param senha A senha em texto plano a ser encriptada. * @returns Uma Promise que resolve para a senha encriptada. */
  public static async hash(senha: string): Promise<string> {
    const saltRounds = 10; // Fator de custo para o hashing. Um valor maior é mais seguro, mas mais lento.
    const senhaHasheada = await bcrypt.hash(senha, saltRounds);
    return senhaHasheada;
  }

  /** * Compara uma senha em texto plano com um hash. * @param senha A senha em texto plano. * @param hash O hash para comparar. * @returns Uma Promise que resolve para 'true' se a senha corresponder ao hash, senão 'false'. */
  public static async compare(senha: string, hash: string): Promise<boolean> {
    const corresponde = await bcrypt.compare(senha, hash);
    return corresponde;
  }

}
