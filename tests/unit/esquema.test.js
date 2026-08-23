import { describe, expect, it } from 'vitest';
import { validar, resumir } from '@cv/validar.js';
import { TIPOS, admiteDestino, tipoDe } from '@cv/tipos.js';
import { IDIOMAS } from '@cv/locales.js';
import { CONTENIDOS, TEXTOS } from '@cv/data/indice.js';
import comun from '@cv/data/comun.json' with { type: 'json' };
import seccionesWeb from '@cv/data/secciones.web.json' with { type: 'json' };
import seccionesCv from '@cv/data/secciones.cv.json' with { type: 'json' };
import disenos from '@cv/data/disenos.json' with { type: 'json' };

// Sin `astro check` (TypeScript 7 no expone API estable para plantillas .astro)
// esta es la red de seguridad principal del repo: valida los JSON de datos y de
// configuración contra el catálogo de tipos.
const estadoActual = () => ({
    locales: IDIOMAS,
    comun,
    contenidos: CONTENIDOS,
    textos: TEXTOS,
    seccionesWeb,
    seccionesCv,
    disenos,
});

describe('esquema de los datos y de las secciones', () => {
    it('el estado actual del repositorio no tiene errores', () => {
        const resultado = validar(estadoActual());
        expect(resultado.errores, `\n${resumir(resultado)}`).toEqual([]);
    });

    it('los avisos se listan pero no rompen el build', () => {
        const { avisos } = validar(estadoActual());
        if (avisos.length) {
            process.stderr.write(`[esquema] ${avisos.length} aviso(s):\n${avisos.map((a) => `  ${a.ruta}: ${a.mensaje}`).join('\n')}\n`);
        }
        expect(avisos).toBeInstanceOf(Array);
    });
});

describe('catálogo de tipos', () => {
    it('todo tipo declara etiqueta, alcance, forma y campos', () => {
        for (const [nombre, tipo] of Object.entries(TIPOS)) {
            expect(tipo.etiqueta, `${nombre}: sin etiqueta`).toBeTruthy();
            expect(Array.isArray(tipo.alcance) && tipo.alcance.length, `${nombre}: sin alcance`).toBeTruthy();
            expect(tipo.forma, `${nombre}: sin forma`).toBeTruthy();
            expect(Array.isArray(tipo.campos), `${nombre}: campos debe ser un array`).toBe(true);
        }
    });

    it('cada tipo tiene etiqueta en el idioma predeterminado', () => {
        // Solo en el predeterminado, y no en todos, a propósito: `etiqueta` vive
        // en tipos.js, que es CÓDIGO. `pnpm run idiomas` siembra los ficheros de
        // datos, pero no puede escribir en el catálogo de tipos, así que exigir
        // una etiqueta por idioma rompería la suite al dar de alta cualquiera.
        // Es un rótulo de la interfaz del administrador y tiene reserva.
        const predeterminado = (IDIOMAS.find((i) => i.predeterminado) ?? IDIOMAS[0]).codigo;
        for (const [nombre, tipo] of Object.entries(TIPOS)) {
            expect(tipo.etiqueta[predeterminado], `${nombre}: falta etiqueta en ${predeterminado}`).toBeTruthy();
        }
    });

    it('avisa de los tipos sin etiqueta en algún idioma, sin romper', () => {
        const faltan = [];
        for (const [nombre, tipo] of Object.entries(TIPOS)) {
            for (const { codigo } of IDIOMAS) {
                if (!tipo.etiqueta[codigo]) faltan.push(`${nombre}.${codigo}`);
            }
        }
        if (faltan.length) {
            process.stderr.write(
                `[esquema] etiquetas de tipo sin traducir (solo afectan a los rótulos del administrador): ${faltan.join(', ')}\n`,
            );
        }
        expect(Array.isArray(faltan)).toBe(true);
    });

    it('los campos declaran clave y tipo de campo conocidos', () => {
        const TIPOS_CAMPO = new Set([
            'texto', 'textoLargo', 'html', 'listaTexto', 'listaHtml',
            'url', 'correo', 'telefono', 'imagen', 'etiquetas', 'booleano',
        ]);
        for (const [nombre, tipo] of Object.entries(TIPOS)) {
            for (const campo of [...tipo.campos, ...(tipo.camposItem ?? [])]) {
                expect(campo.clave, `${nombre}: campo sin clave`).toBeTruthy();
                expect(TIPOS_CAMPO.has(campo.tipo), `${nombre}.${campo.clave}: tipo de campo desconocido "${campo.tipo}"`).toBe(true);
            }
        }
    });

    it('las opciones declaran un valor por defecto booleano', () => {
        for (const [nombre, tipo] of Object.entries(TIPOS)) {
            for (const opcion of tipo.opciones ?? []) {
                expect(opcion.clave, `${nombre}: opción sin clave`).toBeTruthy();
                expect(typeof opcion.defecto, `${nombre}.${opcion.clave}: sin valor por defecto`).not.toBe('undefined');
            }
        }
    });

    it('tipoDe lanza un error legible con un tipo inexistente', () => {
        expect(() => tipoDe('no-existe')).toThrow(/desconocido/);
    });

    it('admiteDestino respeta el alcance declarado', () => {
        expect(admiteDestino('referencias', 'cv')).toBe(true);
        expect(admiteDestino('referencias', 'web')).toBe(false);
        expect(admiteDestino('proyectos', 'web')).toBe(true);
    });
});

describe('detección de problemas', () => {
    // Se parte del estado real y se estropea una cosa cada vez: así el test
    // demuestra que el validador serviría de algo, no solo que hoy pasa.
    const estropear = (mutar) => {
        const estado = structuredClone(estadoActual());
        mutar(estado);
        return validar(estado);
    };

    const tieneError = (resultado, codigo) => resultado.errores.some((e) => e.codigo === codigo);
    const tieneAviso = (resultado, codigo) => resultado.avisos.some((a) => a.codigo === codigo);

    it('detecta un tipo de sección inexistente', () => {
        const r = estropear((e) => { e.seccionesWeb.secciones[1].tipo = 'inventado'; });
        expect(tieneError(r, 'TIPO_DESCONOCIDO')).toBe(true);
    });

    it('detecta un tipo usado en una lista que no lo admite', () => {
        const r = estropear((e) => { e.seccionesWeb.secciones[1].tipo = 'referencias'; });
        expect(tieneError(r, 'TIPO_FUERA_DE_ALCANCE')).toBe(true);
    });

    it('detecta una sección que apunta a un bloque inexistente', () => {
        const r = estropear((e) => { e.seccionesWeb.secciones[1].bloque = 'no-existe'; });
        expect(tieneError(r, 'BLOQUE_INEXISTENTE')).toBe(true);
    });

    it('detecta que falta el idioma de una sección', () => {
        const r = estropear((e) => { delete e.seccionesWeb.secciones[1].textos.en; });
        expect(tieneError(r, 'SECCION_SIN_TEXTOS')).toBe(true);
    });

    it('detecta anclas duplicadas dentro de un idioma', () => {
        const r = estropear((e) => {
            e.seccionesWeb.secciones[2].textos.es.ancla = e.seccionesWeb.secciones[1].textos.es.ancla;
        });
        expect(tieneError(r, 'ANCLA_DUPLICADA')).toBe(true);
    });

    it('detecta un id que no es un slug portable', () => {
        const r = estropear((e) => { e.comun.bloques.proyectos.items[0].id = 'Título con Tildes'; });
        expect(tieneError(r, 'ID_NO_PORTABLE')).toBe(true);
    });

    it('detecta ids duplicados en un bloque', () => {
        const r = estropear((e) => {
            e.comun.bloques.proyectos.items[1].id = e.comun.bloques.proyectos.items[0].id;
        });
        expect(tieneError(r, 'ID_DUPLICADO')).toBe(true);
    });

    it('detecta una ruta de activo absoluta', () => {
        const r = estropear((e) => { e.comun.bloques.proyectos.items[0].image = '/img/projects/x.webp'; });
        expect(tieneError(r, 'RUTA_ABSOLUTA')).toBe(true);
    });

    it('detecta un ítem sin traducción en un idioma', () => {
        const r = estropear((e) => {
            const ids = Object.keys(e.contenidos.en.bloques.proyectos.items);
            delete e.contenidos.en.bloques.proyectos.items[ids[0]];
        });
        expect(tieneError(r, 'ITEM_SIN_TRADUCCION')).toBe(true);
    });

    it('detecta un campo común colado en el contenido traducido', () => {
        const r = estropear((e) => {
            const ids = Object.keys(e.contenidos.en.bloques.proyectos.items);
            e.contenidos.en.bloques.proyectos.items[ids[0]].github = 'https://github.com/otro/repo';
        });
        expect(tieneError(r, 'CAMPO_MAL_UBICADO')).toBe(true);
    });

    it('detecta un campo obligatorio vacío', () => {
        const r = estropear((e) => {
            const ids = Object.keys(e.contenidos.en.bloques.proyectos.items);
            e.contenidos.en.bloques.proyectos.items[ids[0]].title = '';
        });
        expect(tieneError(r, 'CAMPO_REQUERIDO')).toBe(true);
    });

    it('detecta dos idiomas con el mismo nombre de PDF', () => {
        const r = estropear((e) => { e.locales[1].pdf = e.locales[0].pdf; });
        expect(tieneError(r, 'PDF_DUPLICADO')).toBe(true);
    });

    it('detecta una clave de ui que sobra en un idioma', () => {
        const r = estropear((e) => { e.textos.en.clave_inventada = 'x'; });
        expect(tieneError(r, 'UI_SOBRANTE')).toBe(true);
    });

    it('avisa (sin romper) de un texto sin traducir', () => {
        const r = estropear((e) => { e.textos.en.perfil_titulos = ''; });
        expect(tieneAviso(r, 'UI_SIN_TRADUCIR')).toBe(true);
        expect(r.errores).toEqual([]);
    });

    it('avisa (sin romper) de un bloque que no muestra ninguna lista', () => {
        const r = estropear((e) => {
            e.seccionesWeb.secciones = e.seccionesWeb.secciones.filter((s) => s.bloque !== 'habilidades');
            e.seccionesCv.secciones = e.seccionesCv.secciones.filter((s) => s.bloque !== 'habilidades');
        });
        expect(tieneAviso(r, 'DATO_HUERFANO')).toBe(true);
        expect(r.errores).toEqual([]);
    });

    it('avisa de deriva cuando un bloque solo está en una de las dos listas', () => {
        const r = estropear((e) => {
            e.seccionesCv.secciones = e.seccionesCv.secciones.filter((s) => s.bloque !== 'proyectos');
        });
        expect(tieneAviso(r, 'DERIVA_ENTRE_LISTAS')).toBe(true);
    });

    // ---- diseños ----------------------------------------------------------
    //
    // Todo lo que el administrador puede escribir en disenos.json tiene que
    // rebotar aquí: un diseño mal formado no revienta en el panel, revienta en
    // el build, que es donde ya no hay nadie mirando.

    it('detecta que falta el catálogo de diseños', () => {
        const r = estropear((e) => { delete e.disenos; });
        expect(tieneError(r, 'DISENOS_INVALIDOS')).toBe(true);
    });

    it('detecta un catálogo de diseños vacío', () => {
        const r = estropear((e) => { e.disenos.disenos = []; });
        expect(tieneError(r, 'SIN_DISENOS')).toBe(true);
    });

    it('detecta que el diseño activo no existe', () => {
        const r = estropear((e) => { e.disenos.activo = 'no-existe'; });
        expect(tieneError(r, 'DISENO_ACTIVO_DESCONOCIDO')).toBe(true);
    });

    it('detecta dos diseños con el mismo id', () => {
        const r = estropear((e) => {
            e.disenos.disenos.push(structuredClone(e.disenos.disenos[0]));
        });
        expect(tieneError(r, 'DISENO_DUPLICADO')).toBe(true);
    });

    it('detecta un token que no está en el catálogo', () => {
        // Misma regla que las opciones de sección: un token que nadie lee sería
        // un campo en el panel que no cambia nada.
        const r = estropear((e) => { e.disenos.disenos[0].tokens.inventado = '#fff'; });
        expect(tieneError(r, 'TOKEN_DESCONOCIDO')).toBe(true);
    });

    it('detecta una variante que no existe para ese tipo', () => {
        const r = estropear((e) => { e.disenos.disenos[0].variantes.proyectos = 'inventada'; });
        expect(tieneError(r, 'VARIANTE_DESCONOCIDA')).toBe(true);
    });

    it('detecta una variante puesta sobre un tipo que no es de la web', () => {
        const r = estropear((e) => { e.disenos.disenos[0].variantes.referencias = 'clasico'; });
        expect(tieneError(r, 'TIPO_FUERA_DE_ALCANCE')).toBe(true);
    });

    it('detecta una variante desconocida fijada en una sección', () => {
        const r = estropear((e) => { e.seccionesWeb.secciones[2].variante = 'inventada'; });
        expect(tieneError(r, 'VARIANTE_DESCONOCIDA')).toBe(true);
    });

    it('detecta una variante fijada en una sección del CV, que no tiene diseños', () => {
        const r = estropear((e) => { e.seccionesCv.secciones[0].variante = 'clasico'; });
        expect(tieneError(r, 'VARIANTE_FUERA_DE_ALCANCE')).toBe(true);
    });

    it('avisa (sin romper) de un preset de clases que nadie lee', () => {
        const r = estropear((e) => { e.disenos.disenos[0].clases.inventada = 'p-4'; });
        expect(tieneAviso(r, 'CLASE_DESCONOCIDA')).toBe(true);
        expect(r.errores).toEqual([]);
    });
});

// ---------------------------------------------------------------------------

describe('campos que no viven en un bloque de ítems', () => {
    // Estos se quedaban COMPLETAMENTE fuera de la validación: el bucle de campos
    // obligatorios solo recorría los bloques con `items`, así que el perfil, la
    // cita, el "sobre mí" y la cabecera de los certificados no se miraban. Se
    // notó al poder editarlos por fin desde el administrador: con el guardado en
    // vivo, vaciar el nombre del titular se escribía en disco sin una queja.
    const estropear = (romper) => {
        const estado = structuredClone(estadoActual());
        romper(estado);
        return validar(estado);
    };
    // Una misma ruta puede acumular varios códigos (vaciar el enlace de los
    // certificados es a la vez un obligatorio sin rellenar y un QR sin origen)
    const codigosEn = (resultado, ruta) =>
        resultado.errores.filter((e) => e.ruta === ruta).map((e) => e.codigo);

    it.each([
        ['comun.json > identidad.nombre', (e) => { e.comun.identidad.nombre = ''; }],
        ['comun.json > identidad.foto', (e) => { e.comun.identidad.foto = ''; }],
        ['comun.json > identidad.gitUser', (e) => { e.comun.identidad.gitUser = ''; }],
        ['contenido.es.json > meta.nombreTitulo', (e) => { e.contenidos.es.meta.nombreTitulo = ''; }],
        ['contenido.en.json > meta.tituloUniversidad', (e) => { e.contenidos.en.meta.tituloUniversidad = ''; }],
        ['contenido.es.json > meta.titleWeb', (e) => { e.contenidos.es.meta.titleWeb = ''; }],
    ])('exige %s', (ruta, romper) => {
        const codigos = codigosEn(estropear(romper), ruta);
        expect(codigos, `no se detectó el hueco en ${ruta}`).toContain('CAMPO_REQUERIDO');
    });

    it.each([
        ['comun.json > certificados.link', (e) => { e.comun.bloques.certificados.link = ''; }],
        ['contenido.es.json > certificados.titleLink', (e) => { e.contenidos.es.bloques.certificados.titleLink = ''; }],
        ['contenido.en.json > previewFooter.frase', (e) => { e.contenidos.en.bloques.previewFooter.frase = ''; }],
        ['comun.json > previewFooter.logo', (e) => { e.comun.bloques.previewFooter.logo = ''; }],
        ['contenido.es.json > sobremi.parrafos', (e) => { e.contenidos.es.bloques.sobremi.parrafos = []; }],
    ])('exige %s', (ruta, romper) => {
        const codigos = codigosEn(estropear(romper), ruta);
        expect(codigos, `no se detectó el hueco en ${ruta}`).toContain('CAMPO_REQUERIDO');
    });

    it('un campo común colado en una traducción del perfil se detecta', () => {
        const r = estropear((e) => { e.contenidos.es.meta.gitUser = 'colado'; });
        expect(r.errores.some((x) => x.codigo === 'CAMPO_MAL_UBICADO')).toBe(true);
    });

    it('los campos del perfil usan la clave con la que se guardan, no la de la plantilla', () => {
        // tipos.js los llama git_user/linkedin_user/mi_web y el JSON los guarda
        // como gitUser/linkedinUser/web. Sin `enJson` el administrador escribía
        // en una clave que no leía nadie.
        const conEnJson = TIPOS.perfil.campos.filter((campo) => campo.enJson);
        expect(conEnJson.map((campo) => [campo.clave, campo.enJson])).toEqual([
            ['git_user', 'gitUser'],
            ['linkedin_user', 'linkedinUser'],
            ['mi_web', 'web'],
        ]);
        for (const campo of conEnJson) {
            expect(comun.identidad, `identidad no tiene ${campo.enJson}`).toHaveProperty(campo.enJson);
        }
    });
});
