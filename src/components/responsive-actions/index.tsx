import React, { useRef, useLayoutEffect, useState } from "react";
import { IconButton, Menu, MenuItem, Box, Typography } from "@mui/material";
import { MoreHorizontal } from "lucide-react";
import { GhostLink } from "@components/ghost-link";

export interface ResponsiveActionsProps {
  actions: React.ReactElement[];
  gap?: number;
}

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timeout: ReturnType<typeof setTimeout>;
  const debounced = (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
  (debounced as any).cancel = () => clearTimeout(timeout);
  return debounced as T;
}

export const ResponsiveActions: React.FC<ResponsiveActionsProps> = ({ actions, gap = 16 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(actions.length);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const measuringRefs = useRef<Array<HTMLDivElement | null>>([]);
  const ellipsisMeasuringRef = useRef<HTMLButtonElement | null>(null);
  const ellipsisRef = useRef<HTMLButtonElement | null>(null);

  useLayoutEffect(() => {
    function measure() {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      let usedWidth = 0;
      let count = actions.length;

      const ellipsisWidth = ellipsisMeasuringRef.current?.offsetWidth ?? 40;

      const buttonWidths: number[] = [];
      measuringRefs.current.forEach((btn, i) => {
        buttonWidths[i] = btn?.offsetWidth ?? 0;
      });

      for (let i = 0; i < actions.length; i++) {
        const btn = measuringRefs.current[i];
        if (!btn) continue;
        usedWidth += btn.offsetWidth + (i > 0 ? gap : 0);
      }

      if (usedWidth <= containerWidth) {
        setVisibleCount(actions.length);
        return;
      }

      usedWidth = 0;
      for (let i = 0; i < actions.length; i++) {
        const btn = measuringRefs.current[i];
        if (!btn) continue;
        const predictedWidth = usedWidth + btn.offsetWidth + (i + 1) * gap + ellipsisWidth + 40;
        if (predictedWidth > containerWidth) {
          count = i;
          break;
        }
        usedWidth += btn.offsetWidth;
      }

      setVisibleCount(count);
    }

    const debouncedMeasure = debounce(measure, 100);
    measure();
    window.addEventListener("resize", debouncedMeasure);
    return () => window.removeEventListener("resize", debouncedMeasure);
  }, [actions.length, gap]);

  const visibleActions = actions.slice(0, visibleCount);
  const overflowActions = actions.slice(visibleCount);

  return (
    <>
      <Box
        id="measuring-container"
        sx={{
          position: "fixed",
          left: -99999,
          top: -99999,
          width: "auto",
          height: "auto",
          overflow: "hidden",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          zIndex: -1,
          visibility: "hidden",
          display: "flex",
          gap,
        }}
      >
        {actions.map((action, idx) => (
          <Box
            ref={(el) => (measuringRefs.current[idx] = el as HTMLDivElement | null)}
            key={idx}
            sx={{ display: "inline-flex" }}
          >
            {action}
          </Box>
        ))}
        <IconButton ref={ellipsisMeasuringRef} size="small">
          <MoreHorizontal size={20} />
        </IconButton>
      </Box>

      <Box
        id="actual toolbar"
        ref={containerRef}
        sx={{
          display: "flex",
          alignItems: "center",
          gap,
          overflow: "hidden",
          width: "100%",
          justifyContent: "flex-end",
        }}
      >
        {visibleActions.map((action, idx) => (
          <Box key={idx} sx={{ display: "inline-flex" }}>
            {action}
          </Box>
        ))}
        {overflowActions.length > 0 && (
          <>
            <IconButton
              ref={ellipsisRef}
              size="small"
              sx={{
                border: "1px solid",
                borderColor: "#E4E4E7",
                p: 2,
                borderRadius: (theme) => theme.spacing(1),
              }}
              onClick={(e) => setMenuAnchor(e.currentTarget)}
            >
              <MoreHorizontal size={18} />
            </IconButton>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
              sx={{
                "& .MuiPaper-root": {
                  backgroundColor: (theme) => theme.palette.background.primary,
                },
              }}
            >
              {overflowActions.map((action, idx) => {
                const { to, component, onClick, startIcon, children, ...rest } = action.props;
                if (to) {
                  return (
                    <MenuItem
                      key={idx}
                      component={component || GhostLink}
                      to={to}
                      onClick={() => setMenuAnchor(null)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: "14px",
                      }}
                      {...rest}
                    >
                      {startIcon && (
                        <span style={{ display: "inline-flex", marginRight: 10 }}>
                          {React.cloneElement(startIcon, { size: 16 })}
                        </span>
                      )}
                      {children}
                    </MenuItem>
                  );
                }
                return (
                  <MenuItem
                    key={idx}
                    onClick={() => {
                      setMenuAnchor(null);
                      if (onClick) onClick();
                    }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "14px",
                      color: (theme) => theme.palette.text.primary,
                      p: 1,
                      backgroundColor: (theme) => `${theme.palette.background.default} !important`,
                    }}
                    {...rest}
                  >
                    {startIcon && (
                      <span style={{ display: "inline-flex", marginRight: 10 }}>
                        {React.cloneElement(startIcon, { size: 16 })}
                      </span>
                    )}
                    <Typography sx={{ fontSize: "14px" }} component="span">
                      {children}
                    </Typography>
                  </MenuItem>
                );
              })}
            </Menu>
          </>
        )}
      </Box>
    </>
  );
};
