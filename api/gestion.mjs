import { crearApiRest } from '../src/gestion-rest.mjs';
import { identificar } from '../src/autorizacion.mjs';
import { origenPermitido } from '../src/sesion.mjs';
import { solicitarSupabase } from '../src/supabase.mjs';

// CRUD de GESTION sobre Supabase. La identidad y el rol salen de la sesión
// (cookie segura) y la base aplica RLS, CHECK y la auditoría.
export default {
  fetch: crearApiRest({ solicitar: solicitarSupabase, identificar, origenPermitido })
};
