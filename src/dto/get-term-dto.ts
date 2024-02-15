import { IsNotEmpty } from 'class-validator';

export class GetTermDto {
  @IsNotEmpty()
  t: string;
}
