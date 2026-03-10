import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export interface Tasks {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
}

export class CreateTasksDto {
  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  title: string;

  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  description: string;
}

export class UpdateTasksDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Type(() => String)
  title?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Type(() => String)
  description?: string;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}
