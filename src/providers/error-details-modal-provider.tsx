import { ErrorDetailsModal } from "@components/error-details";
import { ErrorDetailsDisplay } from "@components/error-details-display";
import { memo, PropsWithChildren, createContext, useState, useContext } from "react";

interface ErrorDetailsModalContextData {
  Show: (data: React.ReactNode | string[]) => void;
}

const ErrorDetailsModalContext = createContext<ErrorDetailsModalContextData | null>(null);

const constructErrorBody = (error: string | string[]) => {
  if (typeof error === "string") {
    return <ErrorDetailsDisplay message={error} />;
  }

  // If array has only one item, show it as the main message
  if (error.length === 1) {
    return <ErrorDetailsDisplay message={error[0]} />;
  }

  // If multiple items, first is the message, rest are details
  const [message, ...details] = error;
  return <ErrorDetailsDisplay message={message} details={details} />;
};

export const ErrorDetailsModalProvider = memo(function ErrorDetailsModalProvider({
  children,
}: PropsWithChildren) {
  const [currentErrorData, setCurrentErrorData] = useState<React.ReactNode | null>(null);

  const showFunc = (data: React.ReactNode | string[]) => {
    let node: React.ReactNode;
    if (Array.isArray(data)) {
      node = constructErrorBody(data);
    } else {
      node = data;
    }
    setCurrentErrorData(node);
  };
  return (
    <>
      <ErrorDetailsModal
        isOpen={currentErrorData !== null}
        onClose={() => setCurrentErrorData(null)}
        errorDetails={currentErrorData}
      />
      <ErrorDetailsModalContext.Provider value={{ Show: showFunc }}>
        {children}
      </ErrorDetailsModalContext.Provider>
    </>
  );
});

export const useErrorDetailsModal = () => {
  const ctx = useContext(ErrorDetailsModalContext);
  if (ctx) return ctx;

  return {
    Show: () => {
      /* no-op */
    },
  };
};
