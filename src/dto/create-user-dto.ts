import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 32)
  apelido: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  nome: string;

  @IsString()
  @IsNotEmpty()
  @IsDateString()
  nascimento: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  stack: Array<string>;
}
