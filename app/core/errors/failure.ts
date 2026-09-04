export class Failure {
  constructor(
    public readonly message: string,
    public readonly statusCode = 500,
    public readonly cause?: unknown,
  ) {}

  static from(error: unknown): Failure {
    if (error instanceof Failure) return error

    if (error && typeof error === 'object') {
      const value = error as {
        message?: string
        statusCode?: number
        status?: number
        data?: { message?: string, statusMessage?: string }
      }

      return new Failure(
        value.data?.message ?? value.data?.statusMessage ?? value.message ?? 'Une erreur est survenue',
        value.statusCode ?? value.status ?? 500,
        error,
      )
    }

    return new Failure('Une erreur est survenue', 500, error)
  }
}
