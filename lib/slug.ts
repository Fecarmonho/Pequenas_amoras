/** "Luiza Ferreira Rocha" → "luiza.ferreira.rocha" */
export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
}

/** E-mail de acesso da família, gerado a partir do nome do aluno — a
 * escola usa um domínio interno (@amoras.com) só como identificador de
 * login no Firebase Auth, não é uma caixa de e-mail real. */
export function emailAcessoBase(nomeAluno: string): string {
  return `${slugify(nomeAluno)}@amoras.com`;
}
