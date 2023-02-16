// this is a temporary solution
export type EnumObject = { [key: string]: number | string };
export function marker<T extends string | string[]>(key: T): T {
  return key;
}

export function enumMarker<T extends EnumObject>(prefix: string, _e: T): string {
  return prefix;
}