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
      <label>{label}</label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white mt-1">
        <ReactSignatureCanvas
          ref={sigRef}
          penColor="black"
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
        className="text-xs text-gray-500 hover:text-gray-700 mt-1"
      >
        נקה חתימה
      </button>
    </div>
  );
});

SignatureCanvas.displayName = "SignatureCanvas";
export default SignatureCanvas;
