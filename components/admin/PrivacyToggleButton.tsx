"use client";

import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";
import { usePrivacy } from "./PrivacyContext";

export default function PrivacyToggleButton() {
  const { oculto, alternar } = usePrivacy();

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={oculto ? "Mostrar valores" : "Ocultar valores"}
      className="flex items-center gap-1.5 rounded-full border border-amora-900/15 px-3 py-2 text-xs font-semibold text-ink/60 transition-colors hover:border-amora-600 hover:text-amora-700"
    >
      {oculto ? <HiOutlineEyeSlash className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
      {oculto ? "Mostrar valores" : "Ocultar valores"}
    </button>
  );
}
