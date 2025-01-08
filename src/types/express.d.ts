export * from 'express';

declare module 'express' {
  import type { Request, Response } from 'express';

  export interface TypedRequest<T = any> extends Request {
    data: T;
  }

  export interface TypedResponse extends Response {
    reply: {
      success: (content?: any) => any;
      created: (content?: any) => any;
      badRequest: (content?: any) => any;
      unauthorized: (content?: any) => any;
      forbidden: (content?: any) => any;
      notFound: (content?: any) => any;
      methodNotAllowed: (content?: any) => any;
      notAcceptable: (content: any) => any;
      proxyAuthenticationRequired: (content?: any) => any;
      conflict: (content?: any) => any;
      gone: (content?: any) => any;
      payloadTooLarge: (content?: any) => any;
      rangeNotSatisfiable: (content?: any) => any;
      expectationFailed: (content?: any) => any;
      misredirectedRequest: (content?: any) => any;
      unprocessableContent: (content?: any) => any;
      locked: (content?: any) => any;
      upgradeRequired: (content?: any) => any;
      preconditionRequired: (content?: any) => any;
    };
  }
}