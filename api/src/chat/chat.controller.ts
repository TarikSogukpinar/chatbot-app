import { Controller, Post, Get, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async createChat(@Body('userId') userId: string, @Body('question') question: string, @Body('answer') answer: string) {
    return this.chatService.create(userId, question, answer);
  }

  @Get()
  async getAllChats() {
    return this.chatService.findAll();
  }
}
