"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import { HiOutlineArrowRightOnRectangle } from "react-icons/hi2";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await signOut(auth).catch(() => {});
    await fetch("/api/familia/session", { method: "DELETE" });
    router.push("/familia/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      aria-label="Sair"
      className="flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:border-white/40 hover:text-white"
    >
      <HiOutlineArrowRightOnRectangle className="h-4 w-4" /> Sair
    </button>
  );
}
