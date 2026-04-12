import type { LoggerLike } from "../../src/types.js";

export type MemoryLogger = LoggerLike & {
  infos: string[];
  warns: string[];
  errors: string[];
  clear(): void;
};

export function createMemoryLogger(): MemoryLogger {
  return {
    infos: [],
    warns: [],
    errors: [],
    info(message: string) {
      this.infos.push(message);
    },
    warn(message: string) {
      this.warns.push(message);
    },
    error(message: string) {
      this.errors.push(message);
    },
    clear() {
      this.infos.length = 0;
      this.warns.length = 0;
      this.errors.length = 0;
    },
  };
}
