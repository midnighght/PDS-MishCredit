#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = process.cwd();

const files = [
  { example: 'backend/.env.example', target: 'backend/.env' },
  { example: 'frontend/.env.example', target: 'frontend/.env' },
];

let createdAny = false;

for (const file of files) {
  const examplePath = path.join(root, file.example);
  const targetPath = path.join(root, file.target);

  if (!fs.existsSync(examplePath)) {
    console.log(`[skip] Ejemplo faltante: ${file.example}`);
    continue;
  }

  if (fs.existsSync(targetPath)) {
    console.log(`[ok] ${file.target} ya existe`);
    continue;
  }

  fs.copyFileSync(examplePath, targetPath);
  console.log(`[creado] ${file.target} copiado desde ${file.example}`);
  createdAny = true;
}

if (!createdAny) {
  console.log('No se necesitaba crear ningun .env, ya estaban listos.');
} else {
  console.log('Listo! Revisa los archivos .env generados y ajusta valores si es necesario.');
}
