import { Observable } from "rxjs"; 

export interface UploadService {
    UpdateUploadRecord(data: {target_id: number, _medias: number[], isUpdatePostId: boolean }): Observable<IGrpcUploadReponse>;
    DeleteAllMediaOfCommentNotHaveInList(data: {comment_id: number, _medias: number[]}): Observable<IGrpcUploadReponse>;
}

export interface IGrpcUploadReponse{
    isSuccess: boolean;
}