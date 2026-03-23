"use client";

import { useRef, forwardRef, useImperativeHandle } from "react";
import ReactSignatureCanvas from "react-signature-canvas";

interface Props {
  label: string;
  onEnd?: (dataUrl: string) => void;
}

export interface SignatureCanvasRef {
  clear: () => void;
  toDataURL: () => string;
  isEmpty: () => boolean;
}

const SignatureCanvas = forwardRef<SignatureCanvasRef, Props>(({ label, onEnd }, ref) => {
  const sigRef = useRef<ReactSignatureCanvas>(null);

  useImperativeHandle(ref, () => ({
    clear: () => sigRef.current?.clear(),
    toDataURL: () => sigRef.current?.toDataURL("image/png") || "",
    isEmpty: () => sigRef.current?.isEmpty() ?? true,
  }));

  return (
    <div>
      {label && (
        <label style={{
          fontSize: "0.78rem",
          fontWeight: 600,
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          display: "block",
          marginBottom: "6px",
        }}>
          {label}
        </label>
      )}
      <div style={{
        border: "2px dashed rgba(15,23,42,.12)",
        borderRadius: "var(--radius-sm)",
        background: "#fff",
        marginTop: label ? "0" : "4px",
        transition: "border-color 0.2s",
        overflow: "hidden",
      }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(26,188,156,.3)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(15,23,42,.12)"; }}
      >
        <ReactSignatureCanvas
          ref={sigRef}
          penColor="#0B1C2D"
          canvasProps={{
            className: "w-full",
            style: { width: "100%", height: 150 },
          }}
          onEnd={() => {
            if (onEnd && sigRef.current) {
              onEnd(sigRef.current.toDataURL("image/png"));
            }
          }}
        />
      </div>
      <button
        type="button"
        onClick={() => sigRef.current?.clear()}
        className="text-xs mt-1.5"
        style={{
          color: "var(--muted)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "2px 0",
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#1ABC9C"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted)"; }}
      >
        נקה חתימה
      </button>
    </div>
  );
});

SignatureCanvas.displayName = "SignatureCanvas";
export default SignatureCanvas;
