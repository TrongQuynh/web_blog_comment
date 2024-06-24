import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity, IHttpResponse, PostEntity, UserCommentReactionEntity } from 'web-blog-shared-resource';
import { NewCommentDTO } from '../dto/new-comment.dto';
import { GrpcService } from '../gRpc/grpc.service';
import { UpdateCommentDTO } from '../dto/update-comment.dto';
import { GetCommentDTO } from '../dto/get-comment.dto';

@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(CommentEntity) private commentRepository: Repository<CommentEntity>,
        @InjectRepository(UserCommentReactionEntity) private userRectionRepository: Repository<UserCommentReactionEntity>,
        @InjectRepository(PostEntity) private postRepository: Repository<PostEntity>,

        private grpcService: GrpcService
    ){}

    public async createNewComment(payload: NewCommentDTO, user_id: number): Promise<CommentEntity> | null {
        try {

            const {content, _media_id, post_id, reply_for} = payload;

            const commentInstance: CommentEntity = this.commentRepository.create({
                content, 
                post: { post_id },
                user: { user_id },
                reply_for: reply_for ? {comment_id: reply_for} : null,
                likes: 0,
                created_at: new Date(),
                updated_at: new Date(),        
            });

            const comment = await this.commentRepository.save(commentInstance);

            const userReactionInstance = this.userRectionRepository.create({
                user_id,
                comment_id: comment.comment_id,
                my_reaction: 0
            })

            const userReaction = await this.userRectionRepository.save(userReactionInstance);

            if(_media_id.length > 0){
                const gRPCResponse = await this.grpcService.updateTargetIdOrMediaRecord({
                    target_id: comment.comment_id,
                    _medias: _media_id,
                    isUpdatePostId: false
                })
    
                if(gRPCResponse.isSuccess == false) {
                    console.log("[ERROR][GRPC-UPLOAD]: ", "UPDATE COMMENT_ID AT MEDIA TABLE FAIL");
                }
            }

            return comment;

        } catch (error) {
            console.log("[ERROR][SERVICE][createNewComment]", error.toString());
            
            return null;
        }
    }

    public async deleteComment(post_id: number, comment_id: number, user_id: number): Promise<IHttpResponse<CommentEntity>> {
        try {
            const commentRecord: CommentEntity | null = await this.commentRepository.findOne({ where: { comment_id, post: { post_id } } });

            console.log("[commentRecord]", commentRecord);
            

            if(commentRecord == null) return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: "Not Found comment", data: null };

            if(commentRecord.user_id != user_id) return { status: HttpStatus.BAD_REQUEST, message: "You don't have permisson to delete this comment", data: null };
            
            // const result : CommentEntity | null = await this.commentRepository.remove(commentRecord);
            commentRecord.deleted_at = new Date();

            const result: CommentEntity | null = await this.commentRepository.save(commentRecord);
    
            return {
                status: HttpStatus.OK,
                message: "Success",
                data: result
            };

        } catch (error) {
            console.log("[ERROR][SERVICE][deleteComment]", error.toString());
            return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: error.toString(), data: null };
        }
        
    }

    public async reactionComment(post_id: number, comment_id: number, user_id: number): Promise<IHttpResponse<any>>{
        try {

            const commentRecord: CommentEntity | null = await this.commentRepository.findOne({ where: { comment_id, post: { post_id } }, relations: ["user"] });

            if(commentRecord == null) return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: "Not Found comment", data: null };

            if(commentRecord.user.user_id != user_id) return { status: HttpStatus.BAD_REQUEST, message: "You don't have permisson to delete this comment", data: null };

            const userReactionRecord: UserCommentReactionEntity | null = await this.userRectionRepository.findOne({ where: { user_id, comment_id } });

            if(userReactionRecord == null) return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: "Not Found user reaction", data: null };

            const isUserReaction: boolean  = userReactionRecord.my_reaction == 1;

            if(isUserReaction){
                userReactionRecord.my_reaction = 0;
                commentRecord.likes = commentRecord.likes == 0 ? 0 : commentRecord.likes - 1;
            }else {
                userReactionRecord.my_reaction = 1;
                commentRecord.likes = commentRecord.likes + 1;
            }

            await this.userRectionRepository.save(userReactionRecord);
            await this.commentRepository.save(commentRecord);

            return {
                status: HttpStatus.OK,
                message: "Success",
                data: null
            };

        }catch(error){
            console.log("[ERROR][SERVICE][reactionComment]", error.toString());
            return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: error.toString(), data: null };
        }
    }

    public async updateComment(payload: UpdateCommentDTO, user_id: number): Promise<IHttpResponse<any>>{
        try {

            const commentRecord: CommentEntity | null = await this.commentRepository.findOne({ where: { comment_id: payload.comment_id }, relations: ["user"] });

            if(commentRecord == null) return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: "Not Found comment", data: null };

            if(commentRecord.user.user_id != user_id) return { status: HttpStatus.BAD_REQUEST, message: "You don't have permisson to delete this comment", data: null };

            commentRecord.content = payload.content;

            await this.grpcService.handleDeleteAllMediaOfCommentNotHaveInListMediaId({_medias: payload._media_id, comment_id: payload.comment_id});

            await this.grpcService.updateTargetIdOrMediaRecord({target_id: payload.comment_id, _medias: payload._media_id, isUpdatePostId: false});

            const  commentUpdated = await this.commentRepository.save(commentRecord);

            return { status: HttpStatus.OK, message: "Success", data: commentUpdated };

        } catch (error) {
            console.log("[ERROR][SERVICE][updateComment]", error.toString());
            return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: error.toString(), data: null };
        }
    }

    public async getComment(payload: GetCommentDTO): Promise<IHttpResponse<any>>{
        try {
            const _comments: CommentEntity[] = await this.commentRepository.find(
                {
                    where: {
                        post: { post_id: payload.post_id },
                        reply_for: payload.reply_for ? { comment_id: payload.reply_for } : undefined,
                    },
                    order: {
                        created_at: "DESC"
                    },
                    skip: payload.skip,
                    take: payload.limit,
                    
                }
            );

            return {
                status: HttpStatus.OK,
                message: "Success",
                data: _comments
            };
        } catch (error) {
            console.log("[ERROR][SERVICE][getComment]", error.toString());
            return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: error.toString(), data: null };
        }
    }

    // ======================================= UPDATE POST =======================================

    public async isPostExsit(post_id: number): Promise<boolean>{
        const postRecord: PostEntity | null = await this.postRepository.findOne({ where: { post_id } });
        return postRecord != null;
    }
}
