import assert from 'node:assert/strict';
import { test } from 'node:test';
import api from '../api/gestion.mjs';

// Comprueba el cableado de api/gestion.mjs sin red ni credenciales:
// sin cookie de sesión, ninguna operación llega a Supabase.
const url = 'http://localhost/api/gestion';

test('api/gestion.mjs exige sesión antes de cualquier operación', async () => {
  for (const metodo of ['GET', 'POST', 'PATCH']) {
    const resp = await api.fetch(new Request(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json', Origin: 'http://localhost' },
      body: metodo === 'GET' ? undefined : '{}'
    }));
    assert.equal(resp.status, 401, metodo);
    assert.equal(resp.headers.get('cache-control'), 'no-store');
  }
});

test('api/gestion.mjs no permite eliminar ni otros métodos', async () => {
  const eliminar = await api.fetch(new Request(url, { method: 'DELETE' }));
  assert.equal(eliminar.status, 405);
  assert.equal((await eliminar.json()).mensaje, 'No se permite eliminar gestiones. Usa la anulación.');
  assert.equal((await api.fetch(new Request(url, { method: 'PUT' }))).status, 405);
});
