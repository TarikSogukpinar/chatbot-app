import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidInputParameters extends HttpException {
  constructor() {
    super('Invalid input parameters', HttpStatus.BAD_REQUEST);
  }
}

export class SessionNotFoundException extends HttpException {
  constructor() {
    super('Session not found', HttpStatus.NOT_FOUND);
  }
}

export class SessionHasEndedException extends HttpException {
  constructor() {
    super('Session has ended', HttpStatus.BAD_REQUEST);
  }
}

export class InvalidQuestionIndexException extends HttpException {
  constructor() {
    super('Invalid question index', HttpStatus.BAD_REQUEST);
  }
}

export class SessionAlreadyEndedException extends HttpException {
  constructor() {
    super('Session already ended', HttpStatus.BAD_REQUEST);
  }
}
