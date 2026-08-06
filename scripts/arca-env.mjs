#!/usr/bin/env node
// Carga el certificado y la clave de ARCA en .env, ya convertidos a base64.
//
// Uso:
//   node scripts/arca-env.mjs
//   node scripts/arca-env.mjs ~/otra/ruta/mi.crt ~/otra/ruta/mi.key
//
// Evita el paso de copiar/pegar un base64 de 2000 caracteres a mano, que es
// donde se cuelan los errores (saltos de línea, un carácter perdido al final).

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { resolve, join } from "node:path";

const rojo = (s) => `\x1b[31m${s}\x1b[0m`;
const verde = (s) => `\x1b[32m${s}\x1b[0m`;
const gris = (s) => `\x1b[90m${s}\x1b[0m`;

/** Expande "~" porque node no lo hace solo. */
function expandir(p) {
  return resolve(p.startsWith("~") ? join(homedir(), p.slice(1)) : p);
}

const certPath = expandir(process.argv[2] ?? "~/arca-lumar/lumar.crt");
const keyPath = expandir(process.argv[3] ?? "~/arca-lumar/lumar.key");
const envPath = resolve(process.cwd(), ".env");

function leerPem(ruta, queEs) {
  if (!existsSync(ruta)) {
    console.error(rojo(`✗ No encontré ${queEs} en:`), ruta);
    console.error(
      gris("  Pasá la ruta como argumento: node scripts/arca-env.mjs <crt> <key>"),
    );
    process.exit(1);
  }
  const contenido = readFileSync(ruta, "utf8");
  if (!contenido.includes("-----BEGIN")) {
    console.error(rojo(`✗ ${ruta} no parece un PEM.`));
    console.error(
      gris("  Tiene que empezar con -----BEGIN CERTIFICATE----- o similar."),
    );
    process.exit(1);
  }
  if (contenido.includes("CERTIFICATE REQUEST")) {
    console.error(rojo(`✗ ${ruta} es el CSR (el pedido), no el certificado.`));
    console.error(
      gris("  El .crt es el texto que te devuelve ARCA después de pegar el CSR."),
    );
    process.exit(1);
  }
  return Buffer.from(contenido, "utf8").toString("base64");
}

const cert = leerPem(certPath, "el certificado");
const key = leerPem(keyPath, "la clave privada");

if (!existsSync(envPath)) {
  console.error(rojo("✗ No hay .env en"), envPath);
  console.error(gris("  Corré el script desde la raíz del proyecto."));
  process.exit(1);
}

let env = readFileSync(envPath, "utf8");

/** Reemplaza la línea VAR=... o la agrega al final si no existe. */
function setVar(texto, nombre, valor) {
  const linea = `${nombre}=${valor}`;
  const re = new RegExp(`^${nombre}=.*$`, "m");
  return re.test(texto) ? texto.replace(re, linea) : `${texto}\n${linea}`;
}

env = setVar(env, "ARCA_CERT_BASE64", cert);
env = setVar(env, "ARCA_KEY_BASE64", key);
writeFileSync(envPath, env);

console.log(verde("✓ Listo. Cargados en .env:"));
console.log(`  ARCA_CERT_BASE64  ${gris(`(${cert.length} caracteres)`)}`);
console.log(`  ARCA_KEY_BASE64   ${gris(`(${key.length} caracteres)`)}`);
console.log(gris("\n  Reiniciá el dev server y tocá 'Probar conexión con ARCA'."));
