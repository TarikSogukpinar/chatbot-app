import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StartSessionDto } from './dto/requests/startSession.dto';
import { AnswerQuestionDto } from './dto/requests/answerQuestion.dto';
// import { StartSessionDto } from './dto/request/startSession.dto';

@Controller({ path: 'chat', version: '1' })
@ApiTags('Chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a new chat session' })
  @ApiResponse({ status: 200, description: 'Chat session started' })
  @ApiBody({ schema: { example: { userId: '123' } } })
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  async startSession(@Body() startSessionDto: StartSessionDto) {
    const result = await this.chatService.startSession(startSessionDto);
    
    return {
      sessionId: result._id as unknown,
      question: await this.chatService.getQuestion(0),
      message: 'Chat session started',
    };
  }

  @Post(':sessionId/question/:index')
  @ApiOperation({ summary: 'Answer a question' })
  @ApiResponse({ status: 200, description: 'Next question' })
  @ApiBody({ schema: { example: { answer: 'yes' } } })
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  async answerQuestion(
    @Param('sessionId') sessionId: string,
    @Param('index') index: number,
    @Body() answerQuestionDto: AnswerQuestionDto,
  ) {
    const answer = answerQuestionDto.answer;

    const checkSession = await this.chatService.getSession(sessionId);
    if (checkSession.endedAt) {
      return {
        message:
          'This session has ended. No more questions or answers allowed.',
      };
    }

    await this.chatService.addResponse(sessionId, index, answer);
    const nextIndex = parseInt(index.toString(), 10) + 1;
    const nextQuestion = await this.chatService.getQuestion(nextIndex); // Get next question

    return nextQuestion ? { nextQuestion } : { message: 'Chat ended' };
  }

  @Post('end/:sessionId')
  @ApiOperation({ summary: 'End a chat session' })
  @ApiResponse({ status: 200, description: 'Chat session ended' })
  @ApiBody({ schema: { example: { sessionId: '12345' } } })
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  async endSession(@Param('sessionId') sessionId: string) {
    const result = await this.chatService.endSession(sessionId);

    return {
      result,
      message: 'Chat session ended',
    };
  }
}
