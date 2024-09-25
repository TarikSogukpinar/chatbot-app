import { IsNotEmpty, IsString } from 'class-validator';

export class StartSessionDto {
  @IsNotEmpty()
  @IsString()
  userId: string;
}
