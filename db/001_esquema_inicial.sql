
-- Aqua Trace - Equipo 7
-- Avance 8
-- 001: Esquema inicial de Supabase
-- Responsable: Felipe Hernández
--
-- Esquema base anterior a la implementación
-- de las políticas RLS definitivas.
--
-- Ejecutar únicamente sobre una base nueva.
-- No ejecutar nuevamente sobre las tablas existentes.

BEGIN;

-- 1. Perfiles de usuarios

CREATE TABLE public.perfil (
    id_usuario UUID PRIMARY KEY
        REFERENCES auth.users(id),

    nombre TEXT NOT NULL,

    rol TEXT NOT NULL CHECK (
        rol IN (
            'Analista',
            'Supervisor',
            'Administrador'
        )
    ),

    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- 2. Eventos de monitoreo

CREATE TABLE public.evento (
    id_evento INTEGER PRIMARY KEY
        CHECK (id_evento > 0),

    codigo_pozo TEXT NOT NULL,

    tipo_anomalia TEXT NOT NULL,

    evidencia TEXT NOT NULL,

    respaldo_suficiente BOOLEAN NOT NULL
);

-- 3. Gestiones

CREATE TABLE public.gestion (
    folio UUID PRIMARY KEY,

    id_evento INTEGER NOT NULL
        REFERENCES public.evento(id_evento),

    id_usuario UUID NOT NULL
        REFERENCES public.perfil(id_usuario),

    accion TEXT NOT NULL,

    resultado TEXT NOT NULL,

    comentario TEXT NOT NULL CHECK (
        char_length(comentario) BETWEEN 1 AND 300
        AND comentario ~ '[^[:space:]]'
    ),

    estado TEXT NOT NULL DEFAULT 'Registrada'
        CHECK (
            estado IN (
                'Registrada',
                'Cerrada',
                'Anulada'
            )
        ),

    fecha_hora TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    fecha_actualizacion TIMESTAMPTZ,

    actualizado_por UUID
        REFERENCES public.perfil(id_usuario),

    motivo_anulacion TEXT,

    CONSTRAINT accion_resultado_valido CHECK (
        (
            accion = 'Validar evento'
            AND resultado IN (
                'Ticket requerido',
                'Sin ticket'
            )
        )
        OR (
            accion = 'Descartar evento'
            AND resultado = 'Evento descartado'
        )
        OR (
            accion = 'Registrar observación'
            AND resultado = 'Sin ticket'
        )
    ),

    CONSTRAINT anulacion_valida CHECK (
        (
            estado = 'Anulada'
            AND motivo_anulacion IS NOT NULL
            AND char_length(motivo_anulacion)
                BETWEEN 1 AND 300
            AND motivo_anulacion ~ '[^[:space:]]'
        )
        OR (
            estado <> 'Anulada'
            AND motivo_anulacion IS NULL
        )
    )
);

-- 4. Datos ficticios de prueba

INSERT INTO public.evento (
    id_evento,
    codigo_pozo,
    tipo_anomalia,
    evidencia,
    respaldo_suficiente
)
VALUES
(
    7001,
    'DEMO-01',
    'Sobreflujo de caudal',
    'DGA: 0,72 L/s. LI-COR: 0,73 L/s. Límite: 0,60 L/s.',
    TRUE
),
(
    7002,
    'DEMO-02',
    'Dato faltante',
    'Falta la lectura del intervalo y el respaldo es insuficiente.',
    FALSE
);

-- 5. Activación de seguridad a nivel de fila

ALTER TABLE public.perfil
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.evento
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.gestion
    ENABLE ROW LEVEL SECURITY;

-- 6. Denegación inicial de permisos

REVOKE ALL ON TABLE
    public.perfil,
    public.evento,
    public.gestion
FROM PUBLIC, anon, authenticated;

COMMIT;
