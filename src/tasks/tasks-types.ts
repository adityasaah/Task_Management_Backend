import { IsNotEmpty, IsString } from 'class-validator';

export interface Tasks {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
}

export class CreateTasksDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
