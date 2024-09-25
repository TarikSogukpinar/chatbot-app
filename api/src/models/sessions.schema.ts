import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema()
export class Session {
  _id: string; // Add this line to declare the _id property

  @Prop({ required: true })
  userId: string;

  @Prop({ default: Date.now })
  startedAt: Date;

  @Prop({ default: null })
  endedAt: Date;

  @Prop({ type: [{ question: String, answer: String }] })
  responses: Array<{ question: string; answer: string }>;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
