// GENERADO por src/scripts/sync_idiomas.js — no editar a mano.
//
// Es el unico sitio que enumera los ficheros de idioma. Se regenera con
// `pnpm run idiomas` (o desde el administrador local al anadir un idioma),
// asi que dar de alta un idioma no obliga a tocar codigo escrito a mano.
import contenido_es from "./contenido.es.json" with { type: "json" };
import ui_es from "./ui.es.json" with { type: "json" };
import contenido_en from "./contenido.en.json" with { type: "json" };
import ui_en from "./ui.en.json" with { type: "json" };

/** contenido.<codigo>.json indexado por codigo de idioma. */
export const CONTENIDOS = {
  es: contenido_es,
  en: contenido_en,
};

/** ui.<codigo>.json indexado por codigo de idioma. */
export const TEXTOS = {
  es: ui_es,
  en: ui_en,
};
