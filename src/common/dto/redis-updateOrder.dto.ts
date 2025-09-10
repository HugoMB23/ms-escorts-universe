import { IsString, IsUrl, IsArray, IsBoolean, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';


class HistoryDto {
  @IsString()
  url: string;

  @IsString()
  dateExpired: string;
}
class VideoDto {
  @IsString()
  url: string;
}

class PhotoDto {
  @IsString()
  url: string;

  @IsNumber()
  orden: number;

  @IsBoolean()
  highlighted: boolean;

  @IsString()
  state: string;

}

export class UpdateProfileDto {
  @IsString()
  avatar: string;

  @IsString()
  cover: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VideoDto)
  videos: VideoDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HistoryDto)
  histories: HistoryDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhotoDto)
  photos: PhotoDto[];
}
