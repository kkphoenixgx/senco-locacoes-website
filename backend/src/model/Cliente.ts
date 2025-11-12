import Encrypt from "../utils/Encrypt";

export default class Cliente {
  
  //? ----------- Constructor -----------

  /** * O construtor é privado para forçar a criação de instâncias através do método `create`, * garantindo que a senha seja sempre encriptada. */
  private constructor(
    public readonly id: number,
    public readonly nome: string,
    public readonly telefone: string,
    public readonly email: string,
    public senha_hash: string,
    public readonly endereco: string
  ) {}

  //? ----------- Methods -----------

  /** Cria uma nova instância de Cliente, encriptando a senha fornecida. * @returns Uma Promise que resolve para uma nova instância de Cliente. */
  public static async create(
    id: number,
    nome: string,
    telefone: string,
    email: string,
    senhaPlana: string,
    endereco: string
  ): Promise<Cliente> {
    const senha_hash = await Encrypt.hash(senhaPlana);
    return new Cliente(id, nome, telefone, email, senha_hash, endereco);
  }


}
