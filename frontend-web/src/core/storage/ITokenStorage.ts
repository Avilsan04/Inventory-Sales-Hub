export interface ITokenStorage {
  readonly saveToken: (token: string) => void;
  readonly removeToken: () => void;
  readonly getToken: () => string | null;
}
