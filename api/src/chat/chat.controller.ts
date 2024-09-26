import {
  Controller,
  Post,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller({ path: 'chat', version: '1' })
@ApiTags('Chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('startChatSession')
  @ApiOperation({ summary: 'Start a new chat session' })
  @ApiResponse({ status: 200, description: 'Chat session started' })
  @ApiBody({ schema: { example: { userId: '123' } } })
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  async startChatSession(@Body('userId') userId: string) {
    const result = await this.chatService.startChatSession(userId);

    return {
      sessionId: result._id as unknown,
      question: await this.chatService.getChatQuestion(0),
      message: 'Chat session started',
    };
  }

  @Post(':sessionId/answerChatQuestion/:index')
  @ApiOperation({ summary: 'Answer a question' })
  @ApiResponse({ status: 200, description: 'Next question' })
  @ApiBody({ schema: { example: { answer: 'yes' } } })
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  async answerChatQuestion(
    @Param('sessionId') sessionId: string,
    @Param('index') index: number,
    @Body('answer') answer: string,
  ) {
    const checkSession = await this.chatService.getChatSession(sessionId);
    if (checkSession.endedAt) {
      return {
        message:
          'This session has ended. No more questions or answers allowed.',
      };
    }

    await this.chatService.addResponse(sessionId, index, answer);
    const nextIndex = parseInt(index.toString(), 10) + 1;
    const nextQuestion = await this.chatService.getChatQuestion(nextIndex); // Get next question

    return nextQuestion ? { nextQuestion } : { message: 'Chat ended' };
  }

  @Post('endChatSession/:sessionId')
  @ApiOperation({ summary: 'End a chat session' })
  @ApiResponse({ status: 200, description: 'Chat session ended' })
  @ApiBody({ schema: { example: { sessionId: '12345' } } })
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  async endChatSession(@Param('sessionId') sessionId: string) {
    const result = await this.chatService.endChatSession(sessionId);

    return {
      result,
      message: 'Chat session ended',
    };
  }
}
