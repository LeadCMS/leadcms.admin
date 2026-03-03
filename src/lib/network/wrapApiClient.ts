export interface ApiError {
  status: number;
  title?: string;
  message: string;
  errors?: Record<string, string[]>;
  type?: string;
  traceId?: string;
  raw?: unknown;
}

function isApiErrorLike(obj: unknown): obj is Partial<ApiError> {
  return !!obj && typeof obj === "object" && "status" in obj && "message" in obj;
}

function appendValidationDetails(baseMessage: string, errors?: Record<string, string[]>): string {
  if (!errors || typeof errors !== "object") {
    return baseMessage;
  }

  const details = Object.entries(errors)
    .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
    .join("; ");

  if (!details) {
    return baseMessage;
  }

  return `${baseMessage}: ${details}`;
}

export function isFetchResponse(obj: any): obj is Response {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.status === "number" &&
    typeof obj.json === "function"
  );
}

export function wrapApiClient<T extends object>(client: T): T {
  return new Proxy(client, {
    get(target, prop, receiver) {
      const origMethod = Reflect.get(target, prop, receiver);
      if (typeof origMethod !== "function") return origMethod;

      return async (...args: unknown[]) => {
        let result;
        try {
          result = await origMethod.apply(target, args);
        } catch (networkError) {
          if (isApiErrorLike(networkError)) {
            const existing = networkError as ApiError;
            throw {
              ...existing,
              message: appendValidationDetails(existing.message || "API Error", existing.errors),
              raw: existing.raw ?? networkError,
            } as ApiError;
          }

          // If error is a fetch Response (non-2xx), parse and throw as API error
          if (isFetchResponse(networkError)) {
            let data: any = null;
            try {
              data = await networkError.clone().json();
            } catch {
              try {
                data = await networkError.clone().text();
              } catch {
                data = null;
              }
            }
            const apiError: ApiError = {
              status: networkError.status,
              title: data?.title || networkError.statusText || "API Error",
              message:
                (data && (data.title || data.message)) ||
                (typeof data === "string" ? data : "API Error"),
              errors: data?.errors,
              type: data?.type,
              traceId: data?.traceId,
              raw: data,
            };
            apiError.message = appendValidationDetails(apiError.message, apiError.errors);
            console.error("[wrapApiClient] API error (from fetch Response):", apiError);
            throw apiError;
          }
          // Network or proxy error (not a valid JSON response)
          console.error("[wrapApiClient] Network/proxy error:", networkError);
          const apiError: ApiError = {
            status: 0,
            message: networkError instanceof Error ? networkError.message : "Network error",
            title: "Network Error",
            raw: networkError,
          };
          throw apiError;
        }

        console.log("[wrapApiClient] Raw result:", result);

        if (
          result &&
          typeof result === "object" &&
          "status" in result &&
          typeof result.status === "number" &&
          result.status >= 400
        ) {
          // Try to parse standard API error format
          let apiError: ApiError = {
            status: result.status,
            message: "API Error",
            raw: result,
          };
          if (result.data && typeof result.data === "object") {
            // ISO error format
            apiError = {
              status: result.data.status || result.status,
              title: result.data.title,
              message: result.data.title || "API Error",
              errors: result.data.errors,
              type: result.data.type,
              traceId: result.data.traceId,
              raw: result.data,
            };
            apiError.message = appendValidationDetails(apiError.message, apiError.errors);
          } else if (typeof result.data === "string") {
            apiError.message = result.data;
          } else if (result.statusText) {
            apiError.message = result.statusText;
          }
          console.error("[wrapApiClient] API error thrown:", apiError);
          throw apiError;
        }

        return result;
      };
    },
  });
}
