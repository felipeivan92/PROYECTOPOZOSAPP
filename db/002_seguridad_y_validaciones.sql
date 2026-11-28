
-- Aqua Trace - Equipo 7
-- Avance 8
-- 002: Seguridad y validaciones
-- Responsable: Felipe Hernández
-- Requiere el esquema inicial 001.

BEGIN;

-- 1. Verificación previa.
-- Evitar superponer políticas existentes.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename IN ('perfil', 'evento', 'gestion')
    ) THEN
        RAISE EXCEPTION
            'Existen políticas previas. Revisar antes de continuar.';
    END IF;
END;
$$;

-- 2. Identidad asignada por la base de datos.

ALTER TABLE public.gestion
    ALTER COLUMN id_usuario
    SET DEFAULT auth.uid();

-- 3. Validación del folio UUID v4.

ALTER TABLE public.gestion
    ADD CONSTRAINT gestion_folio_v4_check
    CHECK (
        folio::text ~
        '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    );

-- 4. Mantener RLS habilitado.

ALTER TABLE public.perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestion ENABLE ROW LEVEL SECURITY;

-- 5. Denegación por defecto.

REVOKE ALL ON TABLE
    public.perfil,
    public.evento,
    public.gestion
FROM PUBLIC, anon, authenticated;

-- 6. Permisos mínimos para usuarios autenticados.

GRANT SELECT ON public.perfil TO authenticated;
GRANT SELECT ON public.evento TO authenticated;
GRANT SELECT ON public.gestion TO authenticated;

-- Solo se permite insertar los campos originales.
-- Identidad, estado y fecha se asignan automáticamente.

GRANT INSERT (
    folio,
    id_evento,
    accion,
    resultado,
    comentario
)
ON public.gestion TO authenticated;

-- Solo se permite modificar estado y motivo.

GRANT UPDATE (
    estado,
    motivo_anulacion
)
ON public.gestion TO authenticated;

-- No se concede permiso DELETE.

-- 7. Política de consulta del perfil propio.

CREATE POLICY perfil_consulta_propia
ON public.perfil
FOR SELECT
TO authenticated
USING (
    id_usuario = (SELECT auth.uid())
    AND activo = TRUE
);

-- 8. Consulta de eventos.

CREATE POLICY evento_consulta_operativa
ON public.evento
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.perfil p
        WHERE p.id_usuario = (SELECT auth.uid())
        AND p.activo = TRUE
        AND p.rol IN ('Analista', 'Supervisor')
    )
);

-- 9. Consulta de gestiones según rol.

CREATE POLICY gestion_consulta_por_rol
ON public.gestion
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.perfil p
        WHERE p.id_usuario = (SELECT auth.uid())
        AND p.activo = TRUE
        AND (
            p.rol = 'Supervisor'
            OR (
                p.rol = 'Analista'
                AND gestion.id_usuario = p.id_usuario
            )
        )
    )
);

-- 10. Registro de gestiones por el Analista.

CREATE POLICY gestion_creacion_analista
ON public.gestion
FOR INSERT
TO authenticated
WITH CHECK (
    id_usuario = (SELECT auth.uid())
    AND estado = 'Registrada'
    AND fecha_actualizacion IS NULL
    AND actualizado_por IS NULL
    AND motivo_anulacion IS NULL

    AND EXISTS (
        SELECT 1
        FROM public.perfil p
        WHERE p.id_usuario = (SELECT auth.uid())
        AND p.activo = TRUE
        AND p.rol = 'Analista'
    )

    AND EXISTS (
        SELECT 1
        FROM public.evento e
        WHERE e.id_evento = gestion.id_evento
        AND e.respaldo_suficiente = TRUE
    )
);

-- 11. Actualización exclusiva del Supervisor.

CREATE POLICY gestion_actualizacion_supervisor
ON public.gestion
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.perfil p
        WHERE p.id_usuario = (SELECT auth.uid())
        AND p.activo = TRUE
        AND p.rol = 'Supervisor'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.perfil p
        WHERE p.id_usuario = (SELECT auth.uid())
        AND p.activo = TRUE
        AND p.rol = 'Supervisor'
    )
);

-- 12. Control de transiciones y auditoría.

CREATE FUNCTION public.validar_transicion_gestion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN

    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado.'
            USING ERRCODE = '42501';
    END IF;

    IF (
        (
            OLD.estado = 'Registrada'
            AND NEW.estado IN ('Cerrada', 'Anulada')
        )
        OR (
            OLD.estado = 'Cerrada'
            AND NEW.estado = 'Anulada'
        )
    ) IS NOT TRUE THEN

        RAISE EXCEPTION
            'La transición de estado no está permitida.'
            USING ERRCODE = '23514';

    END IF;

    -- Asignación automática de trazabilidad.

    NEW.fecha_actualizacion := NOW();
    NEW.actualizado_por := auth.uid();

    RETURN NEW;

END;
$$;

CREATE TRIGGER gestion_control_transicion
BEFORE UPDATE ON public.gestion
FOR EACH ROW
EXECUTE FUNCTION public.validar_transicion_gestion();

REVOKE ALL
ON FUNCTION public.validar_transicion_gestion()
FROM PUBLIC, anon, authenticated;

-- 13. Resumen operativo restringido.
-- No devuelve usuarios, comentarios ni folios.

CREATE FUNCTION public.resumen_gestiones()
RETURNS TABLE (
    id_evento INTEGER,
    accion TEXT,
    resultado TEXT,
    estado TEXT,
    cantidad BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$

    SELECT
        g.id_evento,
        g.accion,
        g.resultado,
        g.estado,
        COUNT(*)
    FROM public.gestion g
    WHERE EXISTS (
        SELECT 1
        FROM public.perfil p
        WHERE p.id_usuario = auth.uid()
        AND p.activo = TRUE
        AND p.rol IN ('Analista', 'Supervisor')
    )
    GROUP BY
        g.id_evento,
        g.accion,
        g.resultado,
        g.estado;

$$;

REVOKE ALL
ON FUNCTION public.resumen_gestiones()
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE
ON FUNCTION public.resumen_gestiones()
TO authenticated;

COMMIT;
