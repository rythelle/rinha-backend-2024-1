import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const message = this.getErrorMessage(errors);
      const statusCode = this.getStatusCode(errors);

      throw new HttpException(message, statusCode);
    }

    return value;
  }

  private toValidate(metatype: any): boolean {
    const types: any[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private getErrorMessage(errors: any[]): string {
    const customMessages = {
      apelido: 'Apelido cannot be empty',
      nome: 'Nome cannot be empty',
      nascimento: 'Nascimento cannot be empty',
      stack: 'Stack cannot be empty',
    };

    return errors
      .map((error) => {
        const property = error.property;
        if (property in customMessages) {
          return customMessages[property];
        } else {
          return Object.values(error.constraints).join(', ');
        }
      })
      .join(', ');
  }

  private getStatusCode(errors: any[]): number {
    const shouldReturn422 = ['apelido', 'nome', 'nascimento', 'stack'].some(
      (property) => errors.some((error) => error.property === property),
    );

    return shouldReturn422
      ? HttpStatus.UNPROCESSABLE_ENTITY
      : HttpStatus.BAD_REQUEST;
  }
}
