import * as Sentry from "@sentry/react-native";

type CaptureExceptionOptions = {
  tags?: Record<string, string>;
};

export const captureException = (
  error: unknown,
  options?: CaptureExceptionOptions,
) => {
  if (__DEV__) return;
  Sentry.withScope((scope) => {
    Object.entries(options?.tags ?? {}).forEach(([key, value]) => {
      scope.setTag(key, value);
    });

    Sentry.captureException(error);
  });
};
