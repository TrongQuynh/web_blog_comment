import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateCommentDTO{

    @IsNotEmpty({message: 'comment_id is required'})
    comment_id: number;

    @IsString({message: "content field can not empty"})
    @IsNotEmpty({message: 'content is required'})
    @MinLength(5)
    content: string;

    @IsNumber({}, {message: 'reply_for must be a number'})
    @IsOptional()
    reply_for: number;

    @IsOptional()
    @IsArray({message: "medias field must be array"})
    _media_id: number[];
}