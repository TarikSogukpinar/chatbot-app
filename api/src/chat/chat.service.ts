import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from '../models/sessions.schema';
import { Question, QuestionDocument } from '../models/question.schema';
import { StartSessionDto } from './dto/requests/startSession.dto';
@Injectable()
export class ChatService implements OnModuleInit {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
  ) {}

  async onModuleInit() {
    await this.seedQuestions(); //seed questions
  }

  async getSession(sessionId: string): Promise<Session> {
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
      console.log('Questions seeded successfully');
    } else {
      console.log('Questions already exist in the database');
    }
  }

  async startSession(
    startSessionDto: StartSessionDto,
  ): Promise<SessionDocument> {
    try {
      const newSession = new this.sessionModel({
        userId: startSessionDto.userId,
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

  async getQuestion(index: number): Promise<string | null> {
    try {
      console.log('Getting question for index:', index);
      const question = await this.questionModel.findOne({ order: index + 1 });
      if (question) {
        console.log('Returning question:', question.text);
        return question.text;
      }
      console.log('No more questions, chat ended');
      return null;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred, please try again later',
      );
    }
  }

  async addResponse(sessionId: string, questionIndex: number, answer: string) {
    try {
      // Input validation
      if (!sessionId || questionIndex === undefined || answer === undefined) {
        throw new Error('Invalid input parameters');
      }

      // Fetch the session
      const session = await this.sessionModel.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Check if the session has ended
      if (session.endedAt) {
        return {
          message: 'This session has ended, no more responses allowed.',
        };
      }

      // Convert questionIndex to a number and fetch the question
      const index = parseInt(questionIndex.toString(), 10);
      const question = await this.questionModel.findOne({ order: index + 1 });

      // Check if the question exists
      if (!question) {
        throw new Error('Invalid question index');
      }

      // Prepare the new response
      const newResponse = { question: question.text, answer };

      // Update the session with the new response
      const updatedSession = await this.sessionModel.findByIdAndUpdate(
        sessionId,
        {
          $push: { responses: newResponse }, // Use $push to add to the array
        },
        { new: true, runValidators: true },
      );

      console.log('Updated Session:', updatedSession);

      // Fetch the next question
      const nextQuestion = await this.getQuestion(index + 1);

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

  async endSession(sessionId: string): Promise<any> {
    try {
      const session = await this.sessionModel.findById(sessionId);
      if (session.endedAt) {
        return { message: 'This session is already ended.' };
      }

      const endedSession = await this.sessionModel.findByIdAndUpdate(
        sessionId,
        { endedAt: new Date() },
        { new: true },
      );

      return { message: 'Session ended successfully.', session: endedSession };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred, please try again later',
      );
    }
  }
}
