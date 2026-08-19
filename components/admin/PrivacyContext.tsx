"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CHAVE = "amoras_admin_valores_ocultos";

const PrivacyContext = createContext<{ oculto: boolean; alternar: () => void }>({
  oculto: true,
  alternar: () => {},
});

/** Controla se valores sensíveis (financeiro) aparecem borrados no painel
 * admin — começa oculto por padrão (tela pode estar visível em público) e
 * lembra a escolha entre páginas/recarregamentos via localStorage. */
export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [oculto, setOculto] = useState(true);

  useEffect(() => {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo !== null) setOculto(salvo === "1");
  }, []);

  function alternar() {
    setOculto((prev) => {
      const novo = !prev;
      localStorage.setItem(CHAVE, novo ? "1" : "0");
      return novo;
    });
  }

  return <PrivacyContext.Provider value={{ oculto, alternar }}>{children}</PrivacyContext.Provider>;
}

export function usePrivacy() {
  return useContext(PrivacyContext);
}
