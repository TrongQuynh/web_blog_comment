import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class GetCommentDTO{
    @IsNotEmpty()
    @IsNumber()
    post_id: number;

    @IsNumber()
    @IsOptional()
    reply_for: number;

    @IsNumber()
    @IsOptional()
    limit: number;

    @IsNumber()
    @IsOptional()
    skip: number;
}