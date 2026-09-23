import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { Role } from 'generated/prisma/enums';
import { Roles } from 'src/shared/decorators/role.decorator';
import { User } from 'src/shared/decorators/user.decorator';
import { CommentService } from './comment.service';
import {
  CreateCommentOnPostDTO,
  UpdateCommentOnPostDTO,
} from './dtos/comment-post.dto';
import { CreatePostDTO } from './dtos/create-post.dto';
import { ReviewPostDTO } from './dtos/review-post.dto';
import { UpdatePostDTO } from './dtos/update-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentService: CommentService,
  ) {}

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get('/my')
  findMyPost(@User('id') userId: string) {
    return this.postsService.findMyPost(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Post()
  create(@User('id') userId: string, @Body() createPostDto: CreatePostDTO) {
    return this.postsService.create(userId, createPostDto);
  }

  @Post('/:id/like')
  likePost(@Param('id') id: string, @User('id') userId: string) {
    return this.postsService.likePost(id, userId);
  }

  @Post('/:id/comment')
  createCommentOnPost(
    @Param('id') id: string,
    @User('id') userId: string,
    @Body() createCommentOnPostDTO: CreateCommentOnPostDTO,
  ) {
    return this.commentService.create(id, userId, createCommentOnPostDTO);
  }

  @Patch('/comment/:id')
  updateCommentOnPost(
    @Param('id') id: string,
    @User('id') userId: string,
    @Body() updateCommentDTO: UpdateCommentOnPostDTO,
  ) {
    return this.commentService.update(id, userId, updateCommentDTO);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @User('id') userId: string,
    @Body() updatePostDto: UpdatePostDTO,
  ) {
    return this.postsService.update(id, userId, updatePostDto);
  }

  @Patch('/:id/review')
  @Roles(Role.ADMIN)
  reviewPost(@Param('id') id: string, @Body() reviewDto: ReviewPostDTO) {
    return this.postsService.reviewPost(id, reviewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User('id') userId: string) {
    return this.postsService.remove(id, userId);
  }

  @Delete('/comment/:id')
  deleteComment(@Param('id') id: string, @User('id') userId: string) {
    return this.commentService.delete(id, userId);
  }
}
