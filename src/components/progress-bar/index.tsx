export { ProgressBar } from "./index.styled";

export const Progress = ({
  rate,
  color = "#00FA83",
  label,
  value,
  negation,
  negColor = "#3D7A5D",
}: {
  rate: number;
  color?: string;
  label?: string;
  value: boolean;
  negation?: boolean;
  negColor: string;
}) => {
  const normalizedValue = Math.max(0, Math.min(100, rate));
  let valueString = "Urgent Maintenance Needed!";
  let ratingColor = color;
  let negationColor = negColor;

  if (normalizedValue >= 85) {
    valueString = "Excellent";
  } else if (normalizedValue >= 65) {
    valueString = "Normal";
    ratingColor = "#FFCA01";
    negationColor = "#FFCA01";
  } else if (normalizedValue >= 35) {
    valueString = "Attention Needed!";
    ratingColor = "#FFCA01";
    negationColor = "#7A563D";
  } else {
    ratingColor = "#FA2517";
    negationColor = "#7A403D";
  }

  return (
    <div className="progress-container">
      {(value || label) && (
        <p className="progress-label">
          {label && <span className="label">{label}</span>}
          {value && (
            <span className="value" style={{ color: ratingColor }}>
              {valueString}
            </span>
          )}
        </p>
      )}
      <p className="progress-bar">
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
              minWidth: `${100 - normalizedValue}%`,
              backgroundColor: negationColor,
            }}
          >
            &nbsp;
          </span>
        )}
      </p>
    </div>
  );
};
