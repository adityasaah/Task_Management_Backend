import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export interface Tasks {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
}

export class GetTasksQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  pageSize: number = 5;

  @IsOptional()
  @IsString()
  title?: string;
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

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  targetProgress: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  currentProgress: number;

  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  metric: string;
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

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  targetProgress?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  currentProgress?: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Type(() => String)
  metric?: string;
}
