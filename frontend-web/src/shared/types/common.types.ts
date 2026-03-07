/**
 * Common type definitions used across the application.
 */

/**
 * Represents a callback function that returns void.
 */
export type VoidCallback = () => void;

/**
 * Represents an async callback function that returns a Promise.
 */
export type AsyncCallback = () => Promise<void>;

/**
 * Makes all properties of T optional recursively.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Extracts the element type from an array type.
 */
export type ArrayElement<T extends readonly unknown[]> = T extends readonly (infer U)[] ? U : never;

/**
 * Creates a type that requires at least one of the specified keys.
 */
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];
