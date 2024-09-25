import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

export class AddResponseDto {
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  questionIndex: number;

  @IsNotEmpty()
  @IsString()
  answer: string;
}
