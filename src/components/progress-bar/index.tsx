export { ProgressBar } from "./index.styled";
import { LocalContainerProps } from "types";
import { SetComponentStyles } from "@utils/general-helper";
import { useTheme } from "@mui/material";

export const Progress = ({
  rate,
  label,
  value,
  negation,
  className,
  styleObj,
}: LocalContainerProps & {
  rate: number;
  label?: string;
  value: boolean;
  negation?: boolean;
}) => {
  const cmpStyles = SetComponentStyles({ className, styleObj });
  const normalizedValue = Math.max(0, Math.min(100, rate));
  const theme = useTheme();

  let valueString = "Urgent Maintenance Needed!";
  let param = 0;

  if (normalizedValue >= 85) {
    valueString = "Excellent";
    param = 85;
  } else if (normalizedValue >= 65) {
    valueString = "Average";
    param = 65;
  } else if (normalizedValue >= 35) {
    valueString = "Normal";
    param = 35;
  } else if (normalizedValue >= 10) {
    valueString = "Attention Needed !!";
    param = 10;
  } else {
    valueString = "Potential Failure !!!";
  }

  const ratingColor = theme.palette.customSegments.ProgressContainer[param.toString()].ratingClr;
  const negationColor =
    theme.palette.customSegments.ProgressContainer[param.toString()].negatingClr;
  const captionColor = theme.palette.customSegments.ProgressContainer[param.toString()].captionClr;
  const backgroundColor =
    theme.palette.customSegments.ProgressContainer[param.toString()].background;
  const foregroundColor =
    theme.palette.customSegments.ProgressContainer[param.toString()].foreground;

  return (
    <div className={`progress-tile-container ${cmpStyles}`}>
      <div className="progress-container">
        {(value || label) && (
          <p className="progress-label" style={{ color: foregroundColor }}>
            {label && <span className="label">{label}</span>}
            {value && (
              <span className="value" style={{ color: captionColor }}>
                {normalizedValue}%&nbsp;|&nbsp;{valueString}
              </span>
            )}
          </p>
        )}
        <p className="progress-bar" style={{ backgroundColor: backgroundColor }}>
          <span
            className={`percentage-rating ${negation ? "no-right-side-radius" : ""}`}
            style={{
              width: `${normalizedValue}%`,
              minWidth: `${normalizedValue}%`,
              backgroundColor: ratingColor,
            }}
          >
            &nbsp;
          </span>
          {negation && (
            <span
              className="negated-rating"
              style={{
                width: `${100 - normalizedValue}%`,
                minWidth: `calc(${100 - normalizedValue}% + 50px)`,
                backgroundColor: negationColor,
              }}
            >
              &nbsp;
            </span>
          )}
        </p>
      </div>
    </div>
  );
};
