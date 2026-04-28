export class RepoctxError extends Error {
  readonly code: string;

  constructor(message: string, code = "REPOCTX_ERROR") {
    super(message);
    this.name = "RepoctxError";
    this.code = code;
  }
}
