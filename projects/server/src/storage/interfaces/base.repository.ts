export interface IBaseRepository<T> {
  add(entity: T): void;
  remove(id: string): void;
  getAll(): Array<T>;
  get(id: string): T | undefined;
  exists(id: string): boolean;
}