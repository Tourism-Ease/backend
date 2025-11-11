import {
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class RoomTypeDto {
  @IsString() name: string;
  @IsInt() price: number;
  @IsInt() capacity: number;
  @IsArray() @IsOptional() amenities?: string[];
}

export class CreateHotelDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @IsString() location: string;
  @IsString() city: string;
  @IsString() country: string;
  @IsInt() stars: number;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoomTypeDto)
  roomTypes: RoomTypeDto[];
  @IsArray() @IsOptional() images?: string[];
}
