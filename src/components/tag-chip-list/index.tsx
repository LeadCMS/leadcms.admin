import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Box, Chip, Tooltip, type ChipProps, type SxProps, type Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";

const getTagHash = (tag: string) => {
  let hash = 2166136261;

  for (const character of tag.trim().toLowerCase()) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

const getTagAccentColor = (tag: string, theme: Theme) => {
  const hash = getTagHash(tag);
  const hue = hash % 360;
  const saturation =
    theme.palette.mode === "dark" ? 52 + ((hash >>> 9) % 14) : 48 + ((hash >>> 9) % 16);
  const lightness =
    theme.palette.mode === "dark" ? 42 + ((hash >>> 17) % 10) : 36 + ((hash >>> 17) % 10);

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export const getTagChipSx = (tag: string): SxProps<Theme> => {
  return (theme) => {
    const accentColor = getTagAccentColor(tag, theme);
    const backgroundOpacity = theme.palette.mode === "dark" ? 0.22 : 0.2;
    const borderOpacity = theme.palette.mode === "dark" ? 0.5 : 0.38;
    const backgroundColor = alpha(accentColor, backgroundOpacity);
    const borderColor = alpha(accentColor, borderOpacity);
    const textColor = theme.palette.grey[900];

    return {
      backgroundColor,
      borderColor,
      color: textColor,
      fontWeight: 500,
      "&.MuiChip-outlined": {
        backgroundColor,
        borderColor,
        color: textColor,
      },
      "&.MuiChip-filled": {
        backgroundColor,
        borderColor,
        color: textColor,
      },
      "& .MuiChip-label": {
        px: 1.5,
        py: 0.125,
        fontSize: "0.69rem",
      },
    };
  };
};

type TagChipListProps = {
  tags?: string[] | null;
  size?: ChipProps["size"];
  variant?: ChipProps["variant"];
  containerSx?: SxProps<Theme>;
  truncateToFit?: boolean;
  truncateMaxRows?: number;
};

const baseContainerSx: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  gap: "3px",
  maxWidth: "100%",
};

export const TagChipList = ({
  tags,
  size = "small",
  variant = "outlined",
  containerSx,
  truncateToFit = false,
  truncateMaxRows = 1,
}: TagChipListProps) => {
  if (!tags?.length) {
    return null;
  }

  const containerRef = useRef<HTMLDivElement | null>(null);
  const overflowChipRef = useRef<HTMLDivElement | null>(null);
  const measurementRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [visibleTagCount, setVisibleTagCount] = useState(tags.length);

  const recalculateVisibleTags = useCallback(() => {
    if (!truncateToFit) {
      setVisibleTagCount(tags.length);
      return;
    }

    const containerWidth = containerRef.current?.clientWidth ?? 0;
    const overflowChipWidth = overflowChipRef.current?.offsetWidth ?? 0;

    if (containerWidth <= 0 || overflowChipWidth <= 0) {
      setVisibleTagCount(tags.length);
      return;
    }

    const chipWidths = tags.map((_, index) => measurementRefs.current[index]?.offsetWidth ?? 0);
    if (chipWidths.some((width) => width <= 0)) {
      setVisibleTagCount(tags.length);
      return;
    }

    const gap = 3;
    const fitsWithinRows = (widths: number[]) => {
      let rowCount = 1;
      let rowWidth = 0;

      for (const width of widths) {
        if (width > containerWidth) {
          return false;
        }

        const nextRowWidth = rowWidth === 0 ? width : rowWidth + gap + width;
        if (nextRowWidth <= containerWidth) {
          rowWidth = nextRowWidth;
          continue;
        }

        rowCount += 1;
        if (rowCount > truncateMaxRows) {
          return false;
        }

        rowWidth = width;
      }

      return true;
    };

    let nextVisibleTagCount = 0;

    for (let count = tags.length; count >= 0; count -= 1) {
      const widthsToFit = chipWidths.slice(0, count);
      if (count < tags.length) {
        widthsToFit.push(overflowChipWidth);
      }

      if (fitsWithinRows(widthsToFit)) {
        nextVisibleTagCount = count;
        break;
      }
    }

    setVisibleTagCount(nextVisibleTagCount);
  }, [tags, truncateMaxRows, truncateToFit]);

  useLayoutEffect(() => {
    recalculateVisibleTags();
  }, [recalculateVisibleTags]);

  useLayoutEffect(() => {
    if (!truncateToFit || !containerRef.current) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      recalculateVisibleTags();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [recalculateVisibleTags, truncateToFit]);

  const visibleTags = truncateToFit ? tags.slice(0, visibleTagCount) : tags;
  const hiddenTags = truncateToFit ? tags.slice(visibleTagCount) : [];

  const combinedSx = Array.isArray(containerSx)
    ? [baseContainerSx, ...containerSx]
    : [baseContainerSx, containerSx];

  const truncateContainerSx = useMemo<SxProps<Theme> | undefined>(
    () =>
      truncateToFit
        ? {
            flexWrap: "wrap",
            overflow: "hidden",
            minWidth: 0,
          }
        : undefined,
    [truncateToFit]
  );

  const tooltipTitle = hiddenTags.join(", ");
  const finalContainerSx = truncateContainerSx
    ? Array.isArray(combinedSx)
      ? [...combinedSx, truncateContainerSx]
      : [combinedSx, truncateContainerSx]
    : combinedSx;

  return (
    <>
      <Box ref={containerRef} sx={finalContainerSx}>
        {visibleTags.map((tag, index) => (
          <Chip
            key={`${tag}-${index}`}
            label={tag}
            size={size}
            variant={variant}
            sx={getTagChipSx(tag)}
          />
        ))}
        {hiddenTags.length > 0 && (
          <Tooltip title={tooltipTitle} arrow>
            <Chip
              label="..."
              size={size}
              variant={variant}
              sx={{
                flexShrink: 0,
                borderStyle: "dashed",
                color: "text.secondary",
                backgroundColor: "background.paper",
              }}
            />
          </Tooltip>
        )}
      </Box>
      {truncateToFit && (
        <Box
          sx={{
            position: "absolute",
            visibility: "hidden",
            pointerEvents: "none",
            height: 0,
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          {tags.map((tag, index) => (
            <Chip
              key={`measure-${tag}-${index}`}
              label={tag}
              size={size}
              variant={variant}
              sx={getTagChipSx(tag)}
              ref={(element) => {
                measurementRefs.current[index] = element;
              }}
            />
          ))}
          <Chip
            label="..."
            size={size}
            variant={variant}
            sx={{
              borderStyle: "dashed",
              color: "text.secondary",
              backgroundColor: "background.paper",
            }}
            ref={overflowChipRef}
          />
        </Box>
      )}
    </>
  );
};
