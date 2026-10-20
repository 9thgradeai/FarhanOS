/**
 * Test harness that drives the REAL runtime-agnostic handler
 * (`api/core/request-handler.ts`) through a minimal fake request/response.
 *
 * It deliberately does NOT stub out origin checks, rate limiting or input
 * validation — only the outbound `fetch` to external services (Groq, Resend,
 * GitHub, Medium) is faked, because those are not under test. This lets the
 * authorization/abuse-control tests exercise the middleware exactly as
 * production runs it.
 */
import { createHandler, type ApiRequest, type HandlerDeps } from './request-handler.ts';

export interface CapturedResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: any;
  raw: string;
  ended: boolean;
}

export function makeResponse(): { res: any; captured: CapturedResponse } {
  const captured: CapturedResponse = {
    statusCode: 200,
    headers: {},
    body: undefined,
    raw: '',
    ended: false,
  };
  const res: any = {
    headersSent: false,
    setHeader(name: string, value: string) {
      captured.headers[name.toLowerCase()] = value;
      return res;
    },
    status(code: number) {
      captured.statusCode = code;
      return res;
    },
    json(payload: unknown) {
      captured.body = payload;
      captured.raw = JSON.stringify(payload);
      captured.ended = true;
      return res;
    },
    write(chunk: any) {
      captured.raw += String(chunk);
      return true;
    },
    end(chunk?: any) {
      if (chunk !== undefined) captured.raw += String(chunk);
      captured.ended = true;
      return res;
    },
    flushHeaders() {
      res.headersSent = true;
    },
  };
  return { res, captured };
}

export async function callApi(
  req: ApiRequest,
  deps: HandlerDeps = {}
): Promise<CapturedResponse> {
  const handler = createHandler(deps);
  const { res, captured } = makeResponse();
  await handler(req, res);
  return captured;
}
