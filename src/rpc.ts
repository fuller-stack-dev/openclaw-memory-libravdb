import { RpcRequest, RpcResponse } from "@xdarkicex/libravdb-contracts";
import { getRpcMethodCodec } from "./rpc-protobuf-codecs.js";
import type { RpcCallOptions, SidecarSocket } from "./types.js";

interface PendingCall {
  resolve(value: unknown): void;
  reject(error: Error): void;
  timer: ReturnType<typeof setTimeout>;
  decodeResult(bytes: Uint8Array): unknown;
}

export class RpcClient {
  private seq = 0n;
  private readonly pending = new Map<bigint, PendingCall>();
  private rxBuf = Buffer.alloc(0);
  private sentMagic = false;

  constructor(
    private readonly socket: SidecarSocket,
    private readonly options: RpcCallOptions,
  ) {
    // Remove socket.setEncoding("utf8"); completely. The socket must stay binary.
    socket.on("data", (chunk: Buffer) => this.handleData(chunk));
    socket.on("close", () => {
      this.sentMagic = false; // Force magic byte on next reconnect
      this.rejectAll(new Error("Socket closed"));
    });
    socket.on("error", (error) => this.rejectAll(error));
  }

  async call<T>(method: string, params: unknown, callOptions: Partial<RpcCallOptions> = {}): Promise<T> {
    const codec = getRpcMethodCodec(method);
    if (!codec) {
      throw new Error(`Unsupported LibraVDB RPC method for protobuf transport: ${method}`);
    }

    return await new Promise<T>((resolve, reject) => {
      const id = ++this.seq;
      const timeoutMs = callOptions.timeoutMs ?? this.options.timeoutMs;
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`RPC timeout: ${method} (${timeoutMs}ms)`));
      }, timeoutMs);

      this.pending.set(id, { resolve, reject, timer, decodeResult: codec.decodeResult });
      try {
        const envelope = new (RpcRequest as any)({
          id,
          method,
          params: codec.encodeParams(params),
        });
        const payload = Buffer.from(envelope.toBinary());
        const header = Buffer.alloc(4);
        header.writeUInt32BE(payload.byteLength, 0);

        const chunks: Buffer[] = [];
        if (!this.sentMagic) {
          chunks.push(Buffer.from([0x02]));
          this.sentMagic = true;
        }
        chunks.push(header, payload);

        this.socket.write(Buffer.concat(chunks));
      } catch (error) {
        clearTimeout(timer);
        this.pending.delete(id);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  private handleData(chunk: Buffer): void {
    if (chunk.byteLength > 64 << 20) {
      this.socket.destroy();
      return;
    }

    this.rxBuf = Buffer.concat([this.rxBuf, chunk]);

    while (this.rxBuf.byteLength >= 4) {
      const payloadLength = this.rxBuf.readUInt32BE(0);
      if (payloadLength > 64 << 20) {
        this.socket.destroy();
        return;
      }
      const frameSize = 4 + payloadLength;

      // Wait for the full frame to arrive
      if (this.rxBuf.byteLength < frameSize) {
        break;
      }

      const payload = this.rxBuf.subarray(4, frameSize);
      this.rxBuf = this.rxBuf.subarray(frameSize);

      this.dispatchMessage(payload);
    }

    // Compaction guard: release large backing allocations if the remainder is tiny
    if (
      this.rxBuf.buffer.byteLength > 65536 &&
      this.rxBuf.byteLength < this.rxBuf.buffer.byteLength >>> 2
    ) {
      this.rxBuf = Buffer.from(this.rxBuf);
    }
  }

  private dispatchMessage(payload: Buffer): void {
    try {
      const msg = RpcResponse.fromBinary(payload as Uint8Array);

      if (typeof msg.id !== "bigint") {
        this.socket.destroy(new Error("Protocol violation: expected bigint message id"));
        return;
      }

      const pending = this.pending.get(msg.id);
      if (!pending) {
        return;
      }

      clearTimeout(pending.timer);
      this.pending.delete(msg.id);

      if (msg.error) {
        const message = msg.error.message?.trim() || `RPC error ${msg.error.code}`;
        pending.reject(new Error(msg.error.code ? `${message} (${msg.error.code})` : message));
        return;
      }

      try {
        pending.resolve(pending.decodeResult(msg.result));
      } catch (error) {
        pending.reject(error instanceof Error ? error : new Error(String(error)));
      }
    } catch {
      // Ignore malformed frames
    }
  }

  private rejectAll(error: Error): void {
    for (const [id, pending] of this.pending.entries()) {
      clearTimeout(pending.timer);
      this.pending.delete(id);
      pending.reject(error);
    }
  }
}
