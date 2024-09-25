import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat, ChatDocument } from "../models/chat.schema";

@Injectable()
export class ChatService {
  constructor(@InjectModel(Chat.name) private chatModel: Model<ChatDocument>) {}

  async create(
    userId: string,
    question: string,
    answer: string,
  ): Promise<Chat> {
    const newChat = new this.chatModel({ userId, question, answer });
    return newChat.save();
  }

  async findAll(): Promise<Chat[]> {
    return this.chatModel.find().exec();
  }
}
