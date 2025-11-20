import Adm from "../model/Adm";
import Cliente from "../model/Cliente";
import AdmRepository from "../repository/AdmRepository";
import ClienteRepository from "../repository/ClienteRepository";
import { IAdmCredentials, IClienteCredentials } from "./auth.types";

export default class Authenticator {
  
  private constructor() {}

  //? ----------- Methods -----------

  /** * Autentica um administrador com base em suas credenciais. * @param credentials As credenciais (email e senha) do administrador. * @returns Uma Promise que resolve para a instância de Adm se a autenticação for bem-sucedida, ou null caso contrário.*/
  public static async authenticateAdm(credentials: IAdmCredentials): Promise<Adm | null> {
    const { email, senha } = credentials;

    const admRepository = new AdmRepository();
    const adm = await admRepository.findByEmail(email);

    if (!adm) return null;
    
    return (await adm.isPasswordCorrect(senha)) ? adm : null;
  }

  /** * Autentica um cliente com base em suas credenciais. * @param credentials As credenciais (email e senha) do cliente. * @returns Uma Promise que resolve para a instância de Cliente se a autenticação for bem-sucedida, ou null caso contrário.*/
  public static async authenticateCliente(credentials: IClienteCredentials): Promise<Cliente | null> {
    const { email, senha } = credentials;

    const clienteRepository = new ClienteRepository();
    const cliente = await clienteRepository.findByEmail(email);

    if (!cliente) return null;

    return (await cliente.isPasswordCorrect(senha)) ? cliente : null;
  }
  
}