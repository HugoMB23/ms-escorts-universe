declare class HistoryDto {
    url: string;
    dateExpired: string;
}
declare class VideoDto {
    url: string;
}
declare class PhotoDto {
    url: string;
    orden: number;
    highlighted: boolean;
    state: string;
}
export declare class UpdateProfileDto {
    avatar: string;
    cover: string;
    videos: VideoDto[];
    histories: HistoryDto[];
    photos: PhotoDto[];
}
export {};
