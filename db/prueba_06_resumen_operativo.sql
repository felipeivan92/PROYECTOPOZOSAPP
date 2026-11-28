
-- Aqua Trace - Equipo 7
-- Avance 8
-- Verificacion del resumen operativo

-- Esta consulta permite comprobar que la funcion
-- resumen_gestiones existe y tiene los permisos correctos.
-- No modifica la base de datos.

SELECT
    n.nspname AS esquema,
    p.proname AS funcion,
    p.prosecdef AS security_definer,
    p.provolatile = 's' AS stable,
    p.proconfig AS configuracion,
    has_function_privilege(
        'authenticated',
        p.oid,
        'EXECUTE'
    ) AS permiso_autenticados,
    has_function_privilege(
        'anon',
        p.oid,
        'EXECUTE'
    ) AS permiso_anonimos
FROM pg_proc p
JOIN pg_namespace n
    ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
AND p.proname = 'resumen_gestiones'
AND p.pronargs = 0;

-- Resultado esperado:
-- La consulta debe devolver una fila.
-- security_definer = true
-- stable = true
-- search_path vacio
-- permiso_autenticados = true
-- permiso_anonimos = false

-- La ejecucion en Supabase y su evidencia
-- quedan pendientes de Felipe.
