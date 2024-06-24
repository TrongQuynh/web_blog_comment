import { IsNotEmpty, IsNumber } from "class-validator";

export class ReactionCommentDTO{
    @IsNotEmpty({message: 'comment_id id is required'})
    @IsNumber({}, {message: 'comment_id must be a number'})
    comment_id: number;

    @IsNotEmpty({message: 'post_id is required'})
    @IsNumber({}, {message: 'post_id must be a number'})
    post_id: number;
}