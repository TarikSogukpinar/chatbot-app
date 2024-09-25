import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Chat, ChatSchema } from '../models/chat.schema';
import { Session, SessionSchema } from 'src/models/sessions.schema';
import { Question, QuestionSchema } from 'src/models/question.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Session.name, schema: SessionSchema },
      { name: Chat.name, schema: ChatSchema },
      { name: Question.name, schema: QuestionSchema },
    ]),
  ],
  providers: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
