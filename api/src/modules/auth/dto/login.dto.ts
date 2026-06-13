import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
  @IsEmail({}, { message: "Informe um email valido." })
  email!: string;

  @IsString()
  @MinLength(1, { message: "Senha e obrigatoria." })
  password!: string;
}
