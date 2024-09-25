import { Session } from 'src/models/sessions.schema';

export type AddResponseResponseDto = {
  updatedSession: Session;
  nextQuestion: string;
};
