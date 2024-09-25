import { Session } from 'src/models/sessions.schema';

export class EndSessionResponseDto {
  message: string;
  session: Session;
}
