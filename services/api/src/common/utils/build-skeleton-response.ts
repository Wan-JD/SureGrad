export interface SkeletonResponse<TPayload = unknown> {
  implemented: false;
  domain: string;
  action: string;
  message: string;
  nextSteps: string[];
  payload?: TPayload;
}

export const buildSkeletonResponse = <TPayload = unknown>(params: {
  domain: string;
  action: string;
  message: string;
  nextSteps: string[];
  payload?: TPayload;
}): SkeletonResponse<TPayload> => ({
  implemented: false,
  domain: params.domain,
  action: params.action,
  message: params.message,
  nextSteps: params.nextSteps,
  payload: params.payload,
});
