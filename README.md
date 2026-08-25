# myvc_dist2 — el artefacto de la aplicación nueva

**Esto no se edita a mano.** Es la salida de `npm run build:2` en
[`myvc_front`](https://github.com/bluesky777/myvc_front), publicada por su flujo
`desplegar-up2`. Cualquier cambio hecho aquí lo borra la siguiente publicación.

Se sirve en `up2/` del subdominio de cada colegio, **al lado** de `up/`, que es la
aplicación vieja y sigue funcionando igual.

## Desplegar

El procedimiento, con el bucle de los dieciséis y la cuenta que el bucle no alcanza,
está en `DESPLIEGUE-UP2.md` de `myvc_front`.

## El logo del colegio

`images/Logo_Colegio_Header.gif` **no está en este repositorio y no debe estarlo**: es
uno por colegio y se deja a mano en su carpeta. `git pull` no toca los ficheros sin
seguir, así que sobrevive a cada despliegue. **No corras `git clean` aquí**: es lo
único que lo borraría, y sin dar error — la pantalla de login volvería al logo de MyVC
y nadie lo notaría.
