// Core exports
export { createApp } from "./lib";
export { createRouter } from "./lib";

// Service exports
export {
  defineEventHandler,
  getQuery,
  getRouterParam,
  readBody,
  sendRedirect,
  setResponseStatus,
  setResponseHeader,
  setResponseHeaders,
  getRequestInfo,
  isJsonRequest,
  isFormRequest,
  isMultipartRequest,
  getClientIp,
  getUserAgent,
  getContentType,
  getContentLength,
  isSecureRequest,
} from "./services";

// Utility exports
export {
  getCookie,
  setCookie,
  deleteCookie,
  getHeader,
  getHeaders,
  isMethod,
  getMethod,
  getURL,
  getPath,
} from "./utils";

// Type exports
export type {
  H3Event,
  H3App,
  H3Router,
  H3EventHandler,
  H3Response,
  RouteMatch,
  CookieOptions,
} from "./types";

// Error exports
export { HttpifyError, createError, handleError } from "./error";

// Config exports
export type { HttpifyConfig } from "./config";
export { defaultConfig } from "./config";

// Advanced exports
export {
  createMiddleware,
  createPluginManager,
  corsPlugin,
  rateLimitPlugin,
  loggingPlugin,
  validateString,
  validateNumber,
  validateObject,
  createValidator,
} from "./lib";

export type {
  MiddlewareOptions,
  Plugin,
  ValidationRule,
  ValidationResult,
} from "./lib";
