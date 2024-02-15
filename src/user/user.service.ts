import { Body, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user-dto';
import { randomUUID } from 'crypto';
import poolPostgres from 'src/database/pg';
import { GetTermDto } from 'src/dto/get-term-dto';
import { GetUserDto } from 'src/dto/get-user-dto';

@Injectable()
export class UserService {
  async create(
    @Body()
    { apelido, nascimento, nome, stack }: CreateUserDto,
  ) {
    if (!apelido || !nome || !nascimento) {
      throw new HttpException(
        'Missing parameters required',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(nascimento)) {
      throw new HttpException(
        `${nascimento} is format invalid, only accept AAAA-MM-DD`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const apelidoNormalized = apelido
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    const nomeNormalized = nome
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    const stackNormalized =
      Array.isArray(stack) && stack?.length > 0 && stack
        ? stack.map((item) =>
            item
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .toLowerCase(),
          )
        : [];

    const uniqueId = randomUUID();

    const user = {
      id: uniqueId,
      apelido: apelidoNormalized,
      nome: nomeNormalized,
      nascimento,
      stack: stackNormalized,
    };

    try {
      await poolPostgres.query(
        `INSERT INTO PEOPLE (ID, APELIDO, NOME, NASCIMENTO, STACK) VALUES ('${uniqueId}', '${apelidoNormalized}', '${nomeNormalized}', '${nascimento}', '{${stackNormalized}}')`,
      );
    } catch (error: any) {
      if (error.code === '22008') {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      } else if (error.code === '23505') {
        throw new HttpException(
          `${apelidoNormalized} already exists in database`,
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      throw new HttpException(error.message, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    return user;
  }

  async findUnique({ id }: GetUserDto) {
    const user = await poolPostgres.query(
      `SELECT ID, APELIDO, NOME, NASCIMENTO, STACK FROM PEOPLE WHERE ID = '${id}'`,
    );

    if (user.rows.length <= 0)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    return user.rows[0];
  }

  async findTerm({ t }: GetTermDto) {
    if (!t)
      throw new HttpException('Param t not passed', HttpStatus.BAD_REQUEST);

    const termNormalized = decodeURIComponent(t)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    const result = await poolPostgres.query(
      `SELECT ID, APELIDO, NOME, NASCIMENTO, STACK FROM PEOPLE WHERE SEARCH_TEXT ILIKE '%' || '${termNormalized}' || '%' LIMIT 50`,
    );

    if (!result) return [];

    return result.rows;
  }
}
