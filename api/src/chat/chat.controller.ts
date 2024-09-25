import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('start')
  async startSession(@Body('userId') userId: string) {
    const session = await this.chatService.startSession(userId);
    return {
      sessionId: session._id,
      question: await this.chatService.getQuestion(0),
    };
  }

  @Post(':sessionId/question/:index')
  async answerQuestion(
    @Param('sessionId') sessionId: string,
    @Param('index') index: number,
    @Body('answer') answer: string,
  ) {
    console.log('Index:', index); // index'i kontrol edin
    console.log('SessionId:', sessionId); // sessionId'yi kontrol edin

    // Oturumun sona erip ermediğini kontrol edin
    const session = await this.chatService.getSession(sessionId);
    if (session.endedAt) {
      return {
        message:
          'This session has ended. No more questions or answers allowed.',
      };
    }

    // Eğer oturum devam ediyorsa, cevap ekleyin ve bir sonraki soruyu alın
    await this.chatService.addResponse(sessionId, index, answer);
    const nextIndex = parseInt(index.toString(), 10) + 1;
    const nextQuestion = await this.chatService.getQuestion(nextIndex); // Bir sonraki soruyu getir
    console.log('Next Question:', nextQuestion); // Bir sonraki soruyu loglayın

    return nextQuestion ? { nextQuestion } : { message: 'Chat ended' };
  }

  @Post('end/:sessionId')
  async endSession(@Param('sessionId') sessionId: string) {
    return this.chatService.endSession(sessionId);
  }
}
