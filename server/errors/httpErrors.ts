export type AppError = Error & {
  currentRevision?: number;
  status?: number;
};

export class HttpStatusError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "HttpStatusError";
    this.status = status;
  }
}

export class BadRequestError extends HttpStatusError {
  constructor(message: string) {
    super(message, 400);
    this.name = "BadRequestError";
  }
}

export class CareerSaveConflictError extends Error {
  status = 409;
  currentRevision: number;

  constructor(currentRevision: number) {
    super("Save revision conflict.");
    this.name = "CareerSaveConflictError";
    this.currentRevision = currentRevision;
  }
}
