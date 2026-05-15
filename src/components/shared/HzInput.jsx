import { forwardRef } from "react";

// const HzInput = forwardRef(function HzInput(
//   { icon: Icon, error, label, id, type = "text", testid, className = "", suffix, ...rest },
//   ref
// ) {
//   const inputId = id || rest.name;
//   return (
//     <div className="w-full">
//       {label && (
//         <label htmlFor={inputId} className="hz-label block mb-2">
//           {label}
//         </label>
//       )}
//       <div className="hz-input-wrap">
//         {Icon && <Icon className="hz-input-icon size-4" strokeWidth={1.5} />}
//         <input
//           ref={ref}
//           id={inputId}
//           type={type}
//           data-testid={testid}
//           className={`hz-input ${Icon ? "" : "!pl-4"} ${error ? "hz-input--error" : ""} ${className}`}
//           aria-invalid={!!error}
//           {...rest}
//         />
//         {suffix && (
//           <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--hz-text-2)]">{suffix}</div>
//         )}
//       </div>
//       {error && <div className="hz-input-error-msg" data-testid={testid ? `${testid}-error` : undefined}>{error}</div>}
//     </div>
//   );
// });

const HzInput = forwardRef(function HzInput(
  {
    icon: Icon,
    error,
    label,
    id,
    type = "text",
    testid,
    className = "",
    suffix,

    // New Props
    onlyNumber = false,
    maxLength,

    onInput,

    ...rest
  },
  ref
) {
  const inputId = id || rest.name;

  const handleInput = (e) => {
    let value = e.target.value;

    // Allow only numbers
    if (onlyNumber) {
      value = value.replace(/\D/g, "");
    }

    // Restrict length
    if (maxLength) {
      value = value.slice(0, maxLength);
    }

    e.target.value = value;

    // Call parent onInput if exists
    if (onInput) {
      onInput(e);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="hz-label block mb-2">
          {label}
        </label>
      )}

      <div className="hz-input-wrap">
        {Icon && (
          <Icon className="hz-input-icon size-4" strokeWidth={1.5} />
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          data-testid={testid}
          inputMode={onlyNumber ? "numeric" : undefined}
          className={`hz-input ${
            Icon ? "" : "!pl-4"
          } ${error ? "hz-input--error" : ""} ${className}`}
          aria-invalid={!!error}
          onInput={handleInput}
          {...rest}
        />

        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--hz-text-2)]">
            {suffix}
          </div>
        )}
      </div>

      {error && (
        <div
          className="hz-input-error-msg"
          data-testid={testid ? `${testid}-error` : undefined}
        >
          {error}
        </div>
      )}
    </div>
  );
});

export default HzInput;
