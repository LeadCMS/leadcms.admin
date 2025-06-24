import { ErrorDetailsModal } from "@components/error-details";
import Box from "@mui/material/Box";
import { memo, PropsWithChildren, useEffect, createContext, useState, useContext } from "react";

interface ErrorDetailsModalContextData {
  Show: (data: React.ReactNode | string[]) => void;
}

const ErrorDetailsModalContext = createContext<ErrorDetailsModalContextData | null>(null);

const constructErrorBody = (error: string | string[]) => {
  return (
    <Box>
      {typeof error === "string"
        ? error
        : (error as string[]).map((val, idx) => (
            <Box
              key={idx}
              component="span"
              sx={{
                display: "block",
                p: 1,
                m: 1,
                bgcolor: (theme) => (theme.palette.mode === "dark" ? "#101010" : "#fff"),
                color: (theme) => (theme.palette.mode === "dark" ? "grey.300" : "grey.800"),
                border: "1px solid",
                borderColor: (theme) => (theme.palette.mode === "dark" ? "grey.800" : "grey.300"),
                borderRadius: 2,
                whiteSpace: "pre-wrap",
              }}
            >
              {val}
            </Box>
          ))}
    </Box>
  );
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
