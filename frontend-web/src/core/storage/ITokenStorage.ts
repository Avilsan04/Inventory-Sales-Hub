export interface ITokenStorage {
    readonly saveToken: (token: string, rememberMe: boolean) => void;
    readonly removeToken: () => void;
    readonly getToken: () => string | null;
}