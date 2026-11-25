import type { ApiError } from '@/types';

/** Error type thrown by the mock API layer, shaped like a real HTTP failure. */
export class ApiRequestError extends Error implements ApiError {
  readonly status: number;
  readonly code?: string;
  readonly details?: Record<string, string>;

  constructor(
    message: string,
    status = 500,
    code?: string,
    details?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    if (code !== undefined) this.code = code;
    if (details !== undefined) this.details = details;
  }
}

export function isApiRequestError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError;
}

/** Centralised, human readable message extraction for toasts & error states. */
export function getErrorMessage(error: unknown): string {
  if (isApiRequestError(error)) return error.message;
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Something went wrong. Please try again.';
}

export function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new ApiRequestError('Request cancelled', 499, 'ABORTED'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new ApiRequestError('Request cancelled', 499, 'ABORTED'));
      },
      { once: true },
    );
  });
}

export interface SimulationOptions {
  minDelay?: number;
  maxDelay?: number;
  /** 0 = never fail. Values > 0 randomly reject to exercise error states. */
  failureRate?: number;
  signal?: AbortSignal;
}

const ENV_FAILURE_RATE = Number(import.meta.env.VITE_MOCK_FAILURE_RATE ?? '0');

/**
 * Wraps a synchronous/async resolver to behave like a network call:
 * variable latency, optional failure injection and abort support.
 */
export async function simulateRequest<T>(
  resolver: () => T | Promise<T>,
  options: SimulationOptions = {},
): Promise<T> {
  const { minDelay = 220, maxDelay = 620, failureRate = ENV_FAILURE_RATE, signal } = options;
  const latency = minDelay + Math.random() * Math.max(0, maxDelay - minDelay);

  await delay(latency, signal);

  if (failureRate > 0 && Math.random() < failureRate) {
    throw new ApiRequestError(
      'The listing service is temporarily unavailable. Please retry.',
      503,
      'SERVICE_UNAVAILABLE',
    );
  }

  return resolver();
}
