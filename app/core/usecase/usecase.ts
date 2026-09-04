import { Failure } from '../errors/failure'

export interface UseCase<Type, Params> {
  execute(params: Params): Promise<Type | Failure>
}
