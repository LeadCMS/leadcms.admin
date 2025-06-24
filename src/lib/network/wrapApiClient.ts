export interface ApiError {
  status: number;
  title?: string;
  message: string;
  errors?: Record<string, string[]>;
  type?: string;
  traceId?: string;
  raw?: unknown;
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
            if (data?.errors && typeof data.errors === "object") {
              const details = Object.entries(data.errors)
                .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
                .join("; ");
              apiError.message = `${apiError.message}: ${details}`;
            }
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
            // If there are validation errors, append them to the message
            if (result.data.errors && typeof result.data.errors === "object") {
              const details = Object.entries(result.data.errors)
                .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
                .join("; ");
              apiError.message = `${apiError.message}: ${details}`;
            }
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
