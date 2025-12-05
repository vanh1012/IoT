import React from "react";

export function Button({ className = "", disabled, children, ...props }) {
    return (
        <button
            disabled={disabled}
            className={`
        inline-flex items-center justify-center rounded-md
        bg-primary text-primary-foreground
        px-4 py-2 font-medium transition
        hover:bg-primary/90
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
            {...props}
        >
            {children}
        </button>
    );
}
