import { Session } from "src/models/sessions.schema";


export class AddResponseResponseDto {
  updatedSession: Session;
  nextQuestion: string;
}
