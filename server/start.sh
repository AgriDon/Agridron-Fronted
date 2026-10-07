#!/bin/sh
# Servidor de datos mock para json-server.
#
# `cd` al directorio del propio script hace que funcione sin importar desde
# dónde se invoque: npm siempre ejecuta los scripts desde la raíz del proyecto.
cd "$(dirname "$0")" || exit 1

# `npx --no-install` usa el binario de node_modules/.bin (json-server está en
# devDependencies) y falla con un mensaje claro si no está instalado, en lugar
# de recurrir al global de la máquina.
exec npx --no-install json-server --watch db.json --routes routes.json