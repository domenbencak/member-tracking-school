export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorMessage(error: unknown) {
  return error instanceof AppError
    ? error.message
    : "Prišlo je do nepričakovane napake. Poskusite znova.";
}
