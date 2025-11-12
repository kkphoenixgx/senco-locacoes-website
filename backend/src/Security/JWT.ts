import jwt, { SignOptions } from 'jsonwebtoken';
import authConfig from '../api/config/auth';
import ms, { StringValue } from 'ms';

export default class JWT {

  private constructor() {}

  //? ----------- Métodos -----------

  /** * Gera um token JWT. * @param payload O conteúdo a ser incluído no token (ex: { id: 1, email: 'user@email.com' }). * @returns O token JWT gerado como uma string. */
  public static generate(payload: object): string {
    const { secret, expiresIn } = authConfig.jwt;

    //* Converte a string de tempo (ex: '1d') para um número de segundos
    const expiresInSeconds = Math.floor(ms(expiresIn as StringValue) / 1000);

    const signOptions: SignOptions = {
      expiresIn: expiresInSeconds,
    };

    return jwt.sign(payload, secret, signOptions);
  }

  /** * Verifica a validade de um token JWT. * @param token O token JWT a ser verificado. * @returns O payload decodificado se o token for válido. * @throws Lança um erro se o token for inválido ou expirado. */
  public static verify(token: string): string | object {
    const { secret } = authConfig.jwt;

    return jwt.verify(token, secret);
  }
}