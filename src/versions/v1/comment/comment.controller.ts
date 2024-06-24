import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CatchException, CommentEntity, ExceptionResponse, HttpExceptionFilter, IHttpResponse } from 'web-blog-shared-resource';
import { NewCommentDTO } from '../dto/new-comment.dto';
import { Response , Request} from 'express';
import { AuthGuard } from '../guards/auth.guard';
import { ReactionCommentDTO } from '../dto/reaction-comment.dto';
import { UpdateCommentDTO } from '../dto/update-comment.dto';
import { GetCommentDTO } from '../dto/get-comment.dto';

@Controller('/v1/comment')
@UseGuards(AuthGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) { }

  private readonly LIMIT = 20;
  private readonly SKIP = 0;

  /**
   * 1. CREATE COMMENT
   * 2. UPDATE COMMENT
   * 3. REACTION COMMENT
   * 4. REPLY COMMENT
   * 5. DELETE COMMENT
   * 6. HANDLE GET LIST COMMENT
   */

  @Post("new-comment")
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseFilters(HttpExceptionFilter)
   async handleCreateComment(@Req() req: Request, @Body() body: NewCommentDTO) {
    try {

      const user_id = +req.headers["user_id"];

      // CHECK IF POST_ID EXSIT OR NOT

      const isPostExsit: boolean = await this.commentService.isPostExsit(body.post_id);

      if(isPostExsit == false) throw new ExceptionResponse(HttpStatus.BAD_REQUEST, ["Post not exsit"], null);
      
      const comment = await this.commentService.createNewComment(body, user_id);
      
      const response: IHttpResponse<CommentEntity> = {
        status: HttpStatus.OK,
        message: "Success",
        data: comment
      };

      return response;

    } catch (error) {
      console.log("[ERROR][NEW-COMMENT]: ", error.toString());
      throw new CatchException(error.response);
    }
  }

  @Post("update-comment")
  async handleUpdateComment(@Req() req: Request, @Body() body: UpdateCommentDTO){
    try {
      const user_id = +req.headers["user_id"];

      const responseService = await this.commentService.updateComment(body, user_id);

      if(responseService.status != HttpStatus.OK) throw new ExceptionResponse(responseService.status, responseService.message, responseService.data);

      return {
        status: HttpStatus.OK,
        message: "Success",
        data: responseService.data
      }

    }catch (error) {
      console.log("[ERROR][UPDATE-COMMENT]: ", error.toString());
      throw new CatchException(error.response);
    }
  }

  @Post("reaction")
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseFilters(HttpExceptionFilter)
  async handleReactionComment(@Req() req: Request, @Body() body: ReactionCommentDTO){
    try {

      const user_id = +req.headers["user_id"];

      const {comment_id, post_id} = body;

      const {message, status} = await this.commentService.reactionComment(post_id, comment_id, user_id);

      if(status != HttpStatus.OK) throw new ExceptionResponse(status, message, null);

      return {
        status: HttpStatus.OK,
        message: "Success",
        data: null
      };

    } catch (error) {
      console.log("[ERROR][REACTION-COMMENT]: ", error.toString());
      
      throw new CatchException(error.response);
    }

  }

  @Get("delete-comment")
  async handleDeleteComment(@Req() req: Request){
    try {
      const {post_id, comment_id} = req.query;

      const user_id = +req.headers["user_id"];
      
      if(isNaN(+post_id) ||isNaN(+comment_id) || post_id == '0' || comment_id == '0') throw new ExceptionResponse(HttpStatus.BAD_REQUEST, "Invalid params", null);

      const result = await this.commentService.deleteComment(+post_id, +comment_id, user_id);

      if(result.status !== HttpStatus.OK) throw new ExceptionResponse(result.status, result.message, null);

      return { status: HttpStatus.OK, message: "Success", data: result };

    } catch (error) {
      throw new CatchException(error.response);
    }
  }

  @Get("get-list")
  async handleGetListComment(@Req() req: Request){
    try {
      const { post_id, reply_for, limit = this.LIMIT, skip = this.SKIP } = req.query;

      const user_id = +req.headers["user_id"];

      if(isNaN(+post_id) || post_id == '0') throw new ExceptionResponse(HttpStatus.BAD_REQUEST, "Invalid params", null);

      const payload: GetCommentDTO = {
        post_id: +post_id,
        reply_for: +reply_for,
        limit: +limit,
        skip: +skip
      };

      const responseService = await this.commentService.getComment(payload);

      if(responseService.status != HttpStatus.OK) throw new ExceptionResponse(responseService.status, responseService.message, responseService.data);

      return {
        status: HttpStatus.OK,
        message: "Success",
        data: responseService.data
      };

    } catch (error) {
      console.log("[ERROR][GET-LIST-COMMENT]: ", error.toString());
      throw new CatchException(error.response);
    }
  }

}
