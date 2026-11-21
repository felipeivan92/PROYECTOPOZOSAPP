CREATE TABLE IF NOT EXISTS evento (
  id_evento INTEGER PRIMARY KEY,
  codigo_pozo TEXT NOT NULL,
  respaldo_suficiente INTEGER NOT NULL CHECK (respaldo_suficiente IN (0, 1))
);

CREATE TABLE IF NOT EXISTS gestion (
  folio TEXT PRIMARY KEY,
  id_evento INTEGER NOT NULL REFERENCES evento(id_evento),
  accion TEXT NOT NULL,
  resultado TEXT NOT NULL,
  comentario TEXT NOT NULL CHECK (length(trim(comentario)) BETWEEN 1 AND 300),
  fecha_hora TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

INSERT INTO evento (id_evento, codigo_pozo, respaldo_suficiente)
VALUES (7001, 'DEMO-01', 1), (7002, 'DEMO-02', 0)
ON CONFLICT (id_evento) DO NOTHING;
