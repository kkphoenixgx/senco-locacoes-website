import Encrypt from "../utils/Encrypt";

export interface IADMDto {
  email: string; 
  senha_hash: string
}

export default class Adm {
  
  //? ----------- Constructor -----------

  /** * O construtor é privado para forçar a criação de instâncias através do método `create`,* garantindo que a senha seja sempre encriptada. * @param email O email do administrador. * @param senhaHash O hash da senha do administrador. */
  private constructor(
    public email: string,
    public senhaHash: string
  ) {}

  //? ----------- Methods -----------

  /** * Cria uma nova instância de Adm, encriptando a senha fornecida. * @param email O email do administrador. * @param senhaPlana A senha em texto plano. * @returns Uma Promise que resolve para uma nova instância de Adm. */
  public static async create(email: string, senhaPlana: string): Promise<Adm> {
    const password_hash = await Encrypt.hash(senhaPlana);
    return new Adm(email, password_hash);
  }

  /** * Verifica se a senha fornecida corresponde à senha armazenada. * @param senhaPlana A senha em texto plano para ser comparada. * @returns Uma Promise que resolve para 'true' se a senha estiver correta, e 'false' caso contrário. */
  public async isPasswordCorrect(senhaPlana: string): Promise<boolean> {
    return Encrypt.compare(senhaPlana, this.senhaHash);
  }

  /** Recria uma instância de Adm a partir de dados do banco de dados. */
  public static fromDB(data: IADMDto) :Adm {
    return new Adm(data.email, data.senha_hash);
  }

  //? ----------- Getters and Setters -----------

}