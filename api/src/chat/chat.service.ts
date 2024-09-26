import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from '../models/sessions.schema';
import { Question, QuestionDocument } from '../models/question.schema';
import { AddResponseResponseDto } from './dto/addResponseResponse.dto';
import { EndSessionResponseDto } from './dto/endSessionResponse.dto';
import {
  InvalidInputParameters,
  InvalidQuestionIndexException,
  SessionAlreadyEndedException,
  SessionHasEndedException,
  SessionNotFoundException,
} from 'src/core/handler/exceptions/custom-exceptions';
@Injectable()
export class ChatService implements OnModuleInit {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
  ) {}

  async onModuleInit() {
    await this.seedQuestions(); //seed questions
  }

  async getChatSession(sessionId: string): Promise<Session> {
    try {
      const result = await this.sessionModel.findById(sessionId);
      return result;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred, please try again later',
      );
    }
  }

  async seedQuestions(): Promise<void> {
    const existingQuestions = await this.questionModel.countDocuments();
    if (existingQuestions === 0) {
      const questions = [
        { text: 'What is your favorite breed of cat, and why?', order: 1 },
        {
          text: 'How do you think cats communicate with their owners?',
          order: 2,
        },
        {
          text: 'Have you ever owned a cat? If so, what was their name and personality like?',
          order: 3,
        },
        {
          text: 'Why do you think cats love to sleep in small, cozy places?',
          order: 4,
        },
        {
          text: 'What’s the funniest or strangest behavior you’ve ever seen a cat do?',
          order: 5,
        },
        {
          text: 'Do you prefer cats or kittens, and what’s the reason for your preference?',
          order: 6,
        },
        {
          text: 'Why do you think cats are known for being independent animals?',
          order: 7,
        },
        {
          text: 'How do you think cats manage to land on their feet when they fall?',
          order: 8,
        },
        { text: 'What’s your favorite fact or myth about cats?', order: 9 },
        {
          text: 'How would you describe the relationship between humans and cats in three words?',
          order: 10,
        },
      ];
      await this.questionModel.insertMany(questions);
    }
  }

  async startChatSession(userId: string): Promise<SessionDocument> {
    try {
      const newSession = new this.sessionModel({
        userId: userId,
        responses: [],
      });
      return await newSession.save();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred, please try again later',
      );
    }
  }

  async getChatQuestion(index: number): Promise<string> {
    try {
      const question = await this.questionModel.findOne({ order: index + 1 });
      if (question) {
        return question.text;
      }

      return null;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred, please try again later',
      );
    }
  }

  async addResponse(
    sessionId: string,
    questionIndex: number,
    answer: string,
  ): Promise<AddResponseResponseDto> {
    try {
      if (!sessionId || questionIndex === undefined || answer === undefined)
        throw new InvalidInputParameters();

      const session = await this.sessionModel.findById(sessionId);

      if (!session) throw new SessionNotFoundException();

      if (session.endedAt) throw new SessionHasEndedException();

      const index = parseInt(questionIndex.toString(), 10);
      const question = await this.questionModel.findOne({ order: index + 1 });

      if (!question) throw new InvalidQuestionIndexException();

      const newResponse = { question: question.text, answer };

      const updatedSession = await this.sessionModel.findByIdAndUpdate(
        sessionId,
        {
          $push: { responses: newResponse },
        },
        { new: true, runValidators: true },
      );

      const nextQuestion = await this.getChatQuestion(index + 1);

      return {
        updatedSession,
        nextQuestion: nextQuestion ? nextQuestion : 'Chat ended',
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred, please try again later',
      );
    }
  }

  async endChatSession(sessionId: string): Promise<EndSessionResponseDto> {
    try {
      const session = await this.sessionModel.findById(sessionId);
      if (session.endedAt) {
        throw new SessionAlreadyEndedException();
      }

      const endedSession = await this.sessionModel.findByIdAndUpdate(
        sessionId,
        { endedAt: new Date() },
        { new: true },
      );

      return {
        sessionId,
        message: 'Session ended successfully.',
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred, please try again later',
      );
    }
  }
}
