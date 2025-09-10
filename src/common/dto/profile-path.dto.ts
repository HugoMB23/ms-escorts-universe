import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';

export class UpdatePhotoHighlightedDto {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsBoolean()
  highlighted: boolean;
}