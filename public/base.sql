UPDATE unidad_productiva
SET ubigeo = u.ubigeo
FROM limite_distrital_2023 AS u
WHERE TRIM(UPPER(unidad_productiva.departamento)) = TRIM(UPPER(u.nombdep))
  AND TRIM(UPPER(unidad_productiva.provincia)) = TRIM(UPPER(u.nombprov))
  AND TRIM(UPPER(unidad_productiva.distrito)) = TRIM(UPPER(u.nombdist));

/*

perhusadb=# select count(id) from unidad_productiva where ubigeo is null;
 count 
-------
   485
(1 row)

perhusadb=# select count(id) from unidad_productiva;
 count 
-------
  4383
(1 row)

*/

--30JUN23
update unidad_productiva set parcela_gid = id;

----------------------------------------------------------------------------------------07JUL23
CREATE TABLE historial_indice_parcela_cafe (
  id SERIAL PRIMARY KEY,
  gid INT,
  indice VARCHAR(20),
  fecha_indice DATE,
  fecha_creacion DATE DEFAULT CURRENT_DATE,
  fecha_modificacion DATE,
  geojson JSONB
);

-- Crear índice espacial
CREATE INDEX historial_indice_parcela_cafe_geom_idx ON historial_indice_parcela_cafe USING GIST (geom);

-- Crear función para actualizar la fecha_modificacion
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_modificacion := CURRENT_DATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para llamar a la función actualizar_fecha_modificacion
CREATE TRIGGER trigger_actualizar_fecha_modificacion
BEFORE UPDATE ON historial_indice_parcela_cafe
FOR EACH ROW
EXECUTE FUNCTION actualizar_fecha_modificacion();

--21JUL23
ALTER TABLE unidad_productiva ADD COLUMN codigo_venta VARCHAR(50);

ALTER TABLE unidad_productiva ADD COLUMN ints_anp CHAR(1);
ALTER TABLE unidad_productiva ADD COLUMN area_ints_anp_m2 DECIMAL(10,3);
ALTER TABLE unidad_productiva ADD COLUMN ints_za CHAR(1);
ALTER TABLE unidad_productiva ADD COLUMN area_ints_za_m2 DECIMAL(10,3);
ALTER TABLE unidad_productiva ADD COLUMN ints_deforestacion_2014 CHAR(1);
ALTER TABLE unidad_productiva ADD COLUMN area_ints_deforestacion_2014_m2 DECIMAL(10,3);
ALTER TABLE unidad_productiva ADD COLUMN ints_deforestacion_2020 CHAR(1);
ALTER TABLE unidad_productiva ADD COLUMN area_ints_deforestacion_2020_m2 DECIMAL(10,3);

--Actualizacion de las nuevas columnas de la tabla unidad_productiva
--ANP
UPDATE unidad_productiva
SET ints_anp = CASE
    WHEN EXISTS (
        SELECT 1
        FROM parcelas_cafe pc
        JOIN areas_naturales_protegidas anp ON ST_Intersects(pc.geom, anp.geom)
        WHERE pc.gid = unidad_productiva.parcela_gid
    ) THEN 1
    ELSE 0
END,
area_ints_anp_m2 = (
    SELECT ST_Area(ST_Intersection(ST_Transform(pc.geom, 32718), ST_Transform(anp.geom, 32718)))
    FROM parcelas_cafe pc
    --JOIN areas_naturales_protegidas anp ON ST_Intersects(ST_Transform(pc.geom, 32718), ST_Transform(anp.geom, 32718))
	 JOIN areas_naturales_protegidas anp ON ST_Intersects(pc.geom, anp.geom)
    WHERE pc.gid = unidad_productiva.parcela_gid
);

--ZA
UPDATE unidad_productiva
SET ints_za = CASE
    WHEN EXISTS (
        SELECT 1
        FROM parcelas_cafe pc
        JOIN zonas_amortiguamiento za ON ST_Intersects(pc.geom, za.geom)
        WHERE pc.gid = unidad_productiva.parcela_gid
    ) THEN 1
    ELSE 0
END,
area_ints_za_m2 = (
    SELECT ST_Area(ST_Intersection(ST_Transform(pc.geom, 32718), ST_Transform(za.geom, 32718)))
    FROM parcelas_cafe pc
	 JOIN zonas_amortiguamiento za ON ST_Intersects(pc.geom, za.geom)
    WHERE pc.gid = unidad_productiva.parcela_gid
);

select * from perdida_2014_2020;

--deforestacion 2014
UPDATE unidad_productiva
SET ints_deforestacion_2014 = CASE
    WHEN EXISTS (
        SELECT 1
        FROM parcelas_cafe pc
        JOIN perdida_2014_2020 anp ON ST_Intersects(pc.geom, anp.geom)
        WHERE pc.gid = unidad_productiva.parcela_gid AND anp.año='2014'
		LIMIT 1
    ) THEN 1
    ELSE 0
END,
area_ints_deforestacion_2014_m2 = (
    SELECT ST_Area(ST_Intersection(ST_Transform(pc.geom, 32718), ST_Transform(anp.geom, 32718)))
    FROM parcelas_cafe pc
	JOIN perdida_2014_2020 anp ON ST_Intersects(pc.geom, anp.geom)
    WHERE pc.gid = unidad_productiva.parcela_gid AND anp.año='2014'
	LIMIT 1
);

--deforestacion 2020
UPDATE unidad_productiva
SET ints_deforestacion_2020 = CASE
    WHEN EXISTS (
        SELECT 1
        FROM parcelas_cafe pc
        JOIN perdida_2014_2020 anp ON ST_Intersects(pc.geom, anp.geom)
        WHERE pc.gid = unidad_productiva.parcela_gid AND anp.año='2020'
		LIMIT 1
    ) THEN 1
    ELSE 0
END,
area_ints_deforestacion_2020_m2 = (
    SELECT ST_Area(ST_Intersection(ST_Transform(pc.geom, 32718), ST_Transform(anp.geom, 32718)))
    FROM parcelas_cafe pc
	JOIN perdida_2014_2020 anp ON ST_Intersects(pc.geom, anp.geom)
    WHERE pc.gid = unidad_productiva.parcela_gid AND anp.año='2020'
	LIMIT 1
);

--VISTAS CON INTERSECCION
--ANP
CREATE OR REPLACE VIEW interseccion_cafe_anp AS
SELECT parcelas_cafe.*
FROM parcelas_cafe
JOIN areas_naturales_protegidas
ON ST_Intersects(parcelas_cafe.geom, areas_naturales_protegidas.geom);

CREATE OR REPLACE VIEW bounds_interseccion_cafe_anp AS
SELECT	
    ST_XMin(ST_Envelope(parcelas_cafe.geom)) AS min_lng,
    ST_YMin(ST_Envelope(parcelas_cafe.geom)) AS min_lat,
    ST_XMax(ST_Envelope(parcelas_cafe.geom)) AS max_lng,
    ST_YMax(ST_Envelope(parcelas_cafe.geom)) AS max_lat,
	unidad_productiva.*,
	zona.descripcion
FROM parcelas_cafe
JOIN areas_naturales_protegidas
ON ST_Intersects(parcelas_cafe.geom, areas_naturales_protegidas.geom)
JOIN unidad_productiva
ON parcelas_cafe.gid = unidad_productiva.parcela_gid
JOIN zona
ON unidad_productiva.zona_id = zona.id;

--ZA
CREATE OR REPLACE VIEW interseccion_cafe_za AS
SELECT parcelas_cafe.*
FROM parcelas_cafe
JOIN zonas_amortiguamiento
ON ST_Intersects(parcelas_cafe.geom, zonas_amortiguamiento.geom);

CREATE OR REPLACE VIEW bounds_interseccion_cafe_za AS
SELECT	
    ST_XMin(ST_Envelope(parcelas_cafe.geom)) AS min_lng,
    ST_YMin(ST_Envelope(parcelas_cafe.geom)) AS min_lat,
    ST_XMax(ST_Envelope(parcelas_cafe.geom)) AS max_lng,
    ST_YMax(ST_Envelope(parcelas_cafe.geom)) AS max_lat,
	unidad_productiva.*,
	zona.descripcion
FROM parcelas_cafe
JOIN zonas_amortiguamiento
ON ST_Intersects(parcelas_cafe.geom, zonas_amortiguamiento.geom)
JOIN unidad_productiva
ON parcelas_cafe.gid = unidad_productiva.parcela_gid
JOIN zona
ON unidad_productiva.zona_id = zona.id;

--deforestacion 2014
CREATE OR REPLACE VIEW interseccion_cafe_deforestacion_2014 AS
SELECT parcelas_cafe.*
FROM parcelas_cafe
JOIN deforestacion_2014
ON ST_Intersects(parcelas_cafe.geom, deforestacion_2014.geom)
JOIN unidad_productiva
ON parcelas_cafe.gid = unidad_productiva.parcela_gid
WHERE unidad_productiva.activa = '1' AND unidad_productiva.eliminada = '0';

CREATE OR REPLACE VIEW bounds_interseccion_cafe_deforestacion_2014 AS
SELECT	DISTINCT
    ST_XMin(ST_Envelope(parcelas_cafe.geom)) AS min_lng,
    ST_YMin(ST_Envelope(parcelas_cafe.geom)) AS min_lat,
    ST_XMax(ST_Envelope(parcelas_cafe.geom)) AS max_lng,
    ST_YMax(ST_Envelope(parcelas_cafe.geom)) AS max_lat,
	unidad_productiva.*,
	zona.descripcion
FROM parcelas_cafe
JOIN deforestacion_2014
ON ST_Intersects(parcelas_cafe.geom, deforestacion_2014.geom)
JOIN unidad_productiva
ON parcelas_cafe.gid = unidad_productiva.parcela_gid
JOIN zona
ON unidad_productiva.zona_id = zona.id
WHERE unidad_productiva.activa = '1' AND unidad_productiva.eliminada = '0';

--deforestacion 2020
CREATE OR REPLACE VIEW interseccion_cafe_deforestacion_2020 AS
SELECT parcelas_cafe.*
FROM parcelas_cafe
JOIN deforestacion_2020
ON ST_Intersects(parcelas_cafe.geom, deforestacion_2020.geom)
JOIN unidad_productiva
ON parcelas_cafe.gid = unidad_productiva.parcela_gid
WHERE unidad_productiva.activa = '1' AND unidad_productiva.eliminada = '0';

CREATE OR REPLACE VIEW bounds_interseccion_cafe_deforestacion_2020 AS
SELECT DISTINCT
    ST_XMin(ST_Envelope(parcelas_cafe.geom)) AS min_lng,
    ST_YMin(ST_Envelope(parcelas_cafe.geom)) AS min_lat,
    ST_XMax(ST_Envelope(parcelas_cafe.geom)) AS max_lng,
    ST_YMax(ST_Envelope(parcelas_cafe.geom)) AS max_lat,
	unidad_productiva.*,
	zona.descripcion
FROM parcelas_cafe
JOIN deforestacion_2020
ON ST_Intersects(parcelas_cafe.geom, deforestacion_2020.geom)
JOIN unidad_productiva
ON parcelas_cafe.gid = unidad_productiva.parcela_gid
JOIN zona
ON unidad_productiva.zona_id = zona.id
WHERE unidad_productiva.activa = '1' AND unidad_productiva.eliminada = '0';

CREATE VIEW deforestacion_2014
AS
SELECT *
FROM perdida_2014_2020
WHERE año='2014';

CREATE VIEW deforestacion_2020
AS
SELECT *
FROM perdida_2014_2020
WHERE año='2020';

--26jul23
CREATE TABLE rol (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

INSERT INTO rol (id,nombre) VALUES
    (1,'Administrador'),
    (2,'Gestion'),
    (3,'Extensionista');


CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255),
    dni VARCHAR(20),
    zona_id INT,
    email VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL,
    usuario VARCHAR(50) NOT NULL,
    contrasena VARCHAR(255) NOT NULL, -- Modificado a VARCHAR para almacenar la contraseña en texto
    imagen VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuario (nombre, dni, zona_id, email, rol_id, usuario, contrasena, imagen)
VALUES
  ('Tuñoque Baldera Carlos Iván', '47315503', 4, 'data.ceys@perhusa.com.pe', 1, 'administrador', MD5('P3ru5@1964'), 'https://i.postimg.cc/KzqfKXt1/file-3-1.jpg'),
  ('Diaz Astochado Hugo', '27734490', 9, 'hugo.diaz@perhusa.com.pe', 3, 'usersanignacio1', MD5('27734490ph'), 'https://i.postimg.cc/Gmpd66FW/HUGOSI-modified.png'),
  ('Agurto Peña Jose Edelmides', '16709696', 9, 'jose.agurto@perhusa.com.pe', 3, 'usersanignacio2', MD5('16709696ph'), 'https://i.postimg.cc/2ysmv5bh/jagurto-SI-modified.png'),
  ('Pezantes Martinez Edwin Francisco', '27847396', 1, 'edwin.pezantes@perhusa.com.pe', 3, 'userjaen1', MD5('27847396ph'), 'https://i.postimg.cc/3wFSt25H/FPEZANTES-JAEN-modified.png'),
  ('Carrasco Bravo Edwin Yomar', '75871404', 1, 'ceysjaen@perhusa.com.pe', 3, 'userjaen2', MD5('75871404ph'), 'https://i.postimg.cc/hvy3cqMP/ecarrasco-jaen-modified.png'),
  ('Tabaco Tafur Noe', '45045527', 3, 'ceyslonya@perhusa.com.pe', 3, 'userlonya', MD5('45045527ph'), 'https://i.postimg.cc/ZKtL7SSq/LONYA-modified.png'),
  ('Larico Cruz Rene Roger', '44370249', 8, 'ceysquillabamba2@perhusa.com.pe', 3, 'userquillabamba2', MD5('44370249ph'), 'https://i.postimg.cc/ZYF9mtNn/roger-Quillabamba-modified.png'),
  ('Ponce Miranda Edy Anderson', '48461098', 8, 'ceysquillabamba@perhusa.com.pe', 3, 'userquillabamba1', MD5('48461098ph'), 'https://i.postimg.cc/NF2nBGZs/Whats-App-Image-2022-12-15-at-10-05-12-AM-modified-1.png'),
  ('Alvarez Ramos Henry', '73652799', 8, 'ceysquillabamba3@perhusa.com.pe', 3, 'userquillabamba3', MD5('73652799ph'), 'https://i.postimg.cc/MHHBtpQ1/kisspng-user-profile-computer-icons-user-interface-mystique-5aceb02483a7d5-1624122115234949485393-mo.png'),
  ('Diaz Garcia Cesar Miro', '43126586', 12, 'ceys.tocache@perhusa.com.pe', 3, 'usertocache', MD5('43126586ph'), 'https://i.postimg.cc/44zfc64S/CESARDIAZTOCACHE-modified.png'),
  ('Ramirez Marrache Karina', '43555092', 11, 'ceystingomaria2@perhusa.com.pe', 3, 'usertingomaria2', MD5('43555092ph'), 'https://i.postimg.cc/SN7MH1F0/kramirez-new.png'),
  ('Rios Perez Pablo', '46606776', 11, 'ceystingomaria@perhusa.com.pe', 3, 'usertingomaria1', MD5('46606776ph'), 'https://i.postimg.cc/63C8TF1H/PABLOTINGOM-modified.png'),
  ('Poma Ccoicca Erick', '71775919', 11, 'ceystingomaria3@perhusa.com.pe', 3, 'usertingomaria3', MD5('71775919ph'), 'https://i.postimg.cc/MHHBtpQ1/kisspng-user-profile-computer-icons-user-interface-mystique-5aceb02483a7d5-1624122115234949485393-mo.png'),
  ('Acuña Tananta Oscar', '70333281', 21, 'ceystarapoto@perhusa.com.pe', 3, 'usertarapoto', MD5('70333281ph'), 'https://i.postimg.cc/8C9v7RkC/OSCARTARAPOTO-modified.png'),
  ('Arevalo Del Aguila Arturo', '45927142', 2, 'ceysbellavista@perhusa.com.pe', 3, 'userbellavista', MD5('45927142ph'), 'https://i.postimg.cc/ydKZPLy7/Arturo.jpg'),
  ('Bautista Monsalve Juan', '47432917', 4, 'ceysnuevac@perhusa.com.pe', 3, 'usernaranjos', MD5('47432917ph'), 'https://i.postimg.cc/fRHmN46m/Nueva-Cajamarca-modified.png'),
  ('Bautista Monsalve Juan', '47432917', 5, 'ceysnuevac@perhusa.com.pe', 3, 'usernuevacajamarca', MD5('47432917ph'), 'https://i.postimg.cc/fRHmN46m/Nueva-Cajamarca-modified.png'),
  ('Lian Vivar Jhonny Carlos', '44556266', 7, 'ceyscentro@perhusa.com.pe', 3, 'userpichanaki', MD5('44556266ph'), 'https://i.postimg.cc/1tW3qBWC/Whats-App-Image-2022-12-15-at-10-22-58-AM-modified-1.png'),
  ('Tito Huayana David Jonathan', '74856236', 10, 'ceyssatipo@perhusa.com.pe', 3, 'usersatipo', MD5('74856236ph'), 'https://i.postimg.cc/HnBsym0t/satipo-modified.png'),
  ('Medina Montoya Diego Armando', '45239896', 2, 'ceyslamerced@perhusa.com.pe', 3, 'userlamerced', MD5('45239896ph'), 'https://i.postimg.cc/MHHBtpQ1/kisspng-user-profile-computer-icons-user-interface-mystique-5aceb02483a7d5-1624122115234949485393-mo.png'),
  ('Aldava Rimari Christian', '71396773', 6, 'ceyspangoa@perhusa.com.pe', 3, 'userpangoa', MD5('71396773ph'), 'https://i.postimg.cc/MHHBtpQ1/kisspng-user-profile-computer-icons-user-interface-mystique-5aceb02483a7d5-1624122115234949485393-mo.png'),
  ('Muñoz Gatica Linder', '43580439', 14, 'ceysmoyo@perhusa.com.pe', 3, 'usermoyobamba1', MD5('43580439ph'), 'https://i.postimg.cc/MHHBtpQ1/kisspng-user-profile-computer-icons-user-interface-mystique-5aceb02483a7d5-1624122115234949485393-mo.png'),
  ('Calle Garcia Esdras', '71258012', 14, 'ceysmoyo02@perhusa.com.pe', 3, 'usermoyobamba2', MD5('71258012ph'), 'https://i.postimg.cc/MHHBtpQ1/kisspng-user-profile-computer-icons-user-interface-mystique-5aceb02483a7d5-1624122115234949485393-mo.png'),
  ('Diaz Collazos Roberto Carlos', '42304939', 4, 'roberto.diaz@perhusa.com.pe', 2, 'rdiaz', MD5('42304939ph**'), 'https://i.postimg.cc/9MvNJRQd/RDIAZ-JAEN.jpg'),
  ('Pariacuri Coronel Hernan', '41066702', 4, 'hernan.pariacuri@perhusa.com.pe', 2, 'hpariacuri', MD5('41066702ph**'), 'https://i.postimg.cc/8CfRwyJY/file-5.jpg'),
  ('Costilla Mora Carlo', '40609835', 4, 'carlo.costilla@perhusa.com.pe', 2, 'ccostilla', MD5('40609835ph**'), 'https://i.postimg.cc/4xW5d7VJ/carlo-Costilla.jpg'),
  ('Rojas Vallejos Jimmy Jhon', '45056879', 4, 'phorganicos@perhusa.com.pe', 2, 'jrojas', MD5('45056879ph**'), 'https://i.postimg.cc/Znbykjn4/345038829-957445778717681-3377965774185151359-n.jpg');

--31JUL23
ALTER TABLE unidad_productiva ADD COLUMN nueva CHAR(1) DEFAULT '1';
UPDATE unidad_productiva SET nueva = '0';

ALTER TABLE unidad_productiva ADD COLUMN activa CHAR(1) DEFAULT '1';
UPDATE unidad_productiva SET activa = '1';

-- Agregar las columnas fecha_creacion y fecha_modificacion a la tabla unidad_productiva
ALTER TABLE unidad_productiva
ADD COLUMN fecha_creacion TIMESTAMP DEFAULT NOW(),
ADD COLUMN fecha_modificacion TIMESTAMP;

-- Crear la función para actualizar la fecha_modificacion
CREATE FUNCTION public.actualizar_fecha_modificacion() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.fecha_modificacion := CURRENT_DATE;
    RETURN NEW;
END;
$$;

-- Crear el trigger para actualizar fecha_modificacion en cada inserción o actualización
CREATE TRIGGER trig_actualizar_fecha_modificacion
BEFORE INSERT OR UPDATE ON unidad_productiva
FOR EACH ROW
EXECUTE PROCEDURE actualizar_fecha_modificacion();

--AGREGAR 3 COLUMNAS DE OTRAS TABLAS A LA U.P.
ALTER TABLE unidad_productiva ADD COLUMN variedad_id INT;
ALTER TABLE unidad_productiva ADD COLUMN porcentaje_sombra NUMERIC;
ALTER TABLE unidad_productiva ADD COLUMN numero_plantas INT;

--ACTUALIZAR LAS 3 COLUMNAS
UPDATE unidad_productiva
SET variedad_id = (
    SELECT campanha_variedad.variedad_id
    FROM campanha_variedad
    WHERE campanha_id IN (
        SELECT id
        FROM campanha
        WHERE unidad_productiva_id = unidad_productiva.id
    )
    LIMIT 1
);

UPDATE unidad_productiva
SET 
    porcentaje_sombra = (
        SELECT porcentaje_sombra
        FROM campanha
        WHERE unidad_productiva_id = unidad_productiva.id
        LIMIT 1
    ),
    numero_plantas = (
        SELECT numero_plantas
        FROM campanha
        WHERE unidad_productiva_id = unidad_productiva.id
        LIMIT 1
    );

--08AGO23
CREATE TABLE procesos_performance(
	id SERIAL,
	nombre varchar(100),
	tiempo int,
	fecha_creacion timestamp DEFAULT now()
);

--EVALUAR: Corregir la bd
insert into zona (descripcion) values ('TARAPOTO');
insert into zona (descripcion) values ('MOYOBAMBA');
update usuario set zona_id=13 where id=14;
update usuario set zona_id=14 where id in (22,23);

--21AGO23
ALTER TABLE productor ADD COLUMN imagen TEXT;
ALTER TABLE unidad_productiva ADD COLUMN imagen TEXT;

--24AGO23
CREATE OR REPLACE FUNCTION public.generar_unidad_productiva()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$
BEGIN
    INSERT INTO unidad_productiva (parcela_gid)
    VALUES (NEW.gid);

    --ACTUALIZAR AREA
    UPDATE unidad_productiva
    SET area_poly_ha = ST_Area(ST_Transform(q.geom, 32718))/10000
    FROM(
        SELECT gid, geom
        FROM parcelas_cafe          
    ) as q
    WHERE unidad_productiva.parcela_gid = q.gid
    AND unidad_productiva.parcela_gid = NEW.gid;

    RETURN NEW;
END;
$BODY$;

    '''
    --ACTUALIZAR LOS CAMPOS CALCULADOS POR INTERSECCION
    --ANP
    UPDATE unidad_productiva
    SET ints_anp = CASE
        WHEN EXISTS (
            SELECT 1
            FROM parcelas_cafe pc
            JOIN areas_naturales_protegidas anp ON ST_Intersects(pc.geom, anp.geom)
            WHERE pc.gid = unidad_productiva.parcela_gid
        ) THEN 1
        ELSE 0
    END,
    area_ints_anp_m2 = (
        SELECT ST_Area(ST_Intersection(ST_Transform(pc.geom, 32718), ST_Transform(anp.geom, 32718)))
        FROM parcelas_cafe pc
        --JOIN areas_naturales_protegidas anp ON ST_Intersects(ST_Transform(pc.geom, 32718), ST_Transform(anp.geom, 32718))
        JOIN areas_naturales_protegidas anp ON ST_Intersects(pc.geom, anp.geom)
        WHERE pc.gid = unidad_productiva.parcela_gid
    )
    WHERE ints_anp IS NULL;

    --ZA
    UPDATE unidad_productiva
    SET ints_za = CASE
        WHEN EXISTS (
            SELECT 1
            FROM parcelas_cafe pc
            JOIN zonas_amortiguamiento za ON ST_Intersects(pc.geom, za.geom)
            WHERE pc.gid = unidad_productiva.parcela_gid
        ) THEN 1
        ELSE 0
    END,
    area_ints_za_m2 = (
        SELECT ST_Area(ST_Intersection(ST_Transform(pc.geom, 32718), ST_Transform(za.geom, 32718)))
        FROM parcelas_cafe pc
        JOIN zonas_amortiguamiento za ON ST_Intersects(pc.geom, za.geom)
        WHERE pc.gid = unidad_productiva.parcela_gid
    )
    WHERE ints_za IS NULL;

    --deforestacion 2014
    UPDATE unidad_productiva
    SET ints_deforestacion_2014 = CASE
        WHEN EXISTS (
            SELECT 1
            FROM parcelas_cafe pc
            JOIN perdida_2014_2020 anp ON ST_Intersects(pc.geom, anp.geom)
            WHERE pc.gid = unidad_productiva.parcela_gid AND anp.año='2014'
            LIMIT 1
        ) THEN 1
        ELSE 0
    END,
    area_ints_deforestacion_2014_m2 = (
        SELECT ST_Area(ST_Intersection(ST_Transform(pc.geom, 32718), ST_Transform(anp.geom, 32718)))
        FROM parcelas_cafe pc
        JOIN perdida_2014_2020 anp ON ST_Intersects(pc.geom, anp.geom)
        WHERE pc.gid = unidad_productiva.parcela_gid AND anp.año='2014'
        LIMIT 1
    )
    WHERE ints_deforestacion_2014 IS NULL;

    --deforestacion 2020
    UPDATE unidad_productiva
    SET ints_deforestacion_2020 = CASE
        WHEN EXISTS (
            SELECT 1
            FROM parcelas_cafe pc
            JOIN perdida_2014_2020 anp ON ST_Intersects(pc.geom, anp.geom)
            WHERE pc.gid = unidad_productiva.parcela_gid AND anp.año='2020'
            LIMIT 1
        ) THEN 1
        ELSE 0
    END,
    area_ints_deforestacion_2020_m2 = (
        SELECT ST_Area(ST_Intersection(ST_Transform(pc.geom, 32718), ST_Transform(anp.geom, 32718)))
        FROM parcelas_cafe pc
        JOIN perdida_2014_2020 anp ON ST_Intersects(pc.geom, anp.geom)
        WHERE pc.gid = unidad_productiva.parcela_gid AND anp.año='2020'
        LIMIT 1
    )
    WHERE ints_deforestacion_2020 IS NULL;

    RETURN NEW;
END;
$BODY$;
'''

-- Crear la tabla de tokens de sesión
CREATE TABLE session_tokens (
  id SERIAL PRIMARY KEY,
  token VARCHAR(64) NOT NULL,
  revocado BOOLEAN NOT NULL DEFAULT FALSE,
  usuario_id INTEGER REFERENCES usuario(id),
  fecha_creacion TIMESTAMP DEFAULT NOW()
);

--11set23 (NO CORRER)
UPDATE unidad_productiva
SET area_ha = ST_Area(ST_Transform(q.geom, 32718))/10000
FROM(
    SELECT gid, geom
    FROM parcelas_cafe          
) as q
WHERE unidad_productiva.parcela_gid = q.gid;

--15set23
ALTER TABLE unidad_productiva ADD COLUMN area_poly_ha DECIMAL(10,3);

UPDATE unidad_productiva
SET area_poly_ha = ST_Area(ST_Transform(q.geom, 32718))/10000
FROM(
    SELECT gid, geom
    FROM parcelas_cafe          
) as q
WHERE unidad_productiva.parcela_gid = q.gid;

--27set23
ALTER TABLE usuario ADD COLUMN activo CHAR(1);
UPDATE usuario set activo = '1';

--REVISAR-- Crear función para actualizar el usuario creado
CREATE OR REPLACE FUNCTION actualizar_usuario_activo()
RETURNS TRIGGER AS $$
BEGIN
    NEW.activo := CURRENT_DATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para llamar a la función actualizar_fecha_modificacion
CREATE TRIGGER trigger_actualizar_fecha_modificacion
BEFORE UPDATE ON historial_indice_parcela_cafe
FOR EACH ROW
EXECUTE FUNCTION actualizar_fecha_modificacion();

-- Crear trigger para llamar a la funcion generar_unidad_productiva
CREATE TRIGGER trigger_generar_unidad_productiva
AFTER INSERT ON parcelas_cafe
FOR EACH ROW
EXECUTE FUNCTION generar_unidad_productiva();

update altitud_cat set rango='Mayor a 2,500 msnm' where id=1;
update altitud_cat set rango='1,500 - 2,500 msnm' where id=2;
update altitud_cat set rango='Menor a 1,500 msnm' where id=3;

--03OCT23
CREATE or REPLACE FUNCTION cafe_create_polygon_from_points(tipo_producto INT, nombre TEXT, geojson TEXT, variedad_id INT, zona_id INT)
RETURNS TABLE(
	idgnuevo integer,
	idunidadproductiva integer
)
AS $$
DECLARE idgnuevo integer;
DECLARE idunidadproductiva integer;
DECLARE idplantacion integer;
DECLARE max_gid integer;
BEGIN

	SELECT max(gid) FROM parcelas_cafe into max_gid;

	--tipo producto:
	--1 : papa
	--2 : cafe
	--5 : palta
	INSERT INTO parcelas_cafe (gid,geom) VALUES(max_gid + 1,ST_SetSRID(ST_Multi(ST_GeomFromGeoJSON(geojson)), 4326)) RETURNING gid INTO idgnuevo;

	INSERT INTO unidad_productiva (nombre, parcela_gid, variedad_id, zona_id, nueva) VALUES (nombre, idgNuevo, variedad_id, zona_id, 0) RETURNING id INTO idunidadproductiva;

		--Calculo de area
		--ACTUALIZAR AREA
        UPDATE unidad_productiva
        SET area_poly_ha = ST_Area(ST_Transform(q.geom, 32718))/10000
        FROM(
            SELECT gid, geom
            FROM parcelas_cafe
            WHERE gid = idgnuevo
        ) as q
        WHERE parcela_gid = idgnuevo;

  	RETURN QUERY SELECT idgnuevo, idunidadproductiva;

END;
$$  LANGUAGE plpgsql;

CREATE or REPLACE FUNCTION cafe_update_polygon_from_points(parcela_gid INT, geojson TEXT)
RETURNS TABLE(
	parcela_gid_modificada integer
)
AS $$
BEGIN

    UPDATE parcelas_cafe
    SET geom = ST_SetSRID(ST_Multi(ST_GeomFromGeoJSON(geojson)), 4326)
    WHERE gid = parcela_gid;

    RETURN QUERY SELECT parcela_gid_modificada;

END;
$$  LANGUAGE plpgsql;

--07OCT23
create table backup_unidad_productiva as select * from unidad_productiva;

ALTER TABLE unidad_productiva ADD COLUMN productor_id INT;

UPDATE unidad_productiva
SET productor_id = q.id
FROM(
	SELECT id, codigo FROM productor
)as q
WHERE unidad_productiva.productor_codigo = q.codigo;

--11OCT23
ALTER TABLE unidad_productiva ADD COLUMN auth_user_id INT;

CREATE TABLE guardar_backup_app(
  id SERIAL PRIMARY KEY, 
  auth_user_id INT,
  json JSONB,
   --fecha_creacion DATE DEFAULT CURRENT_DATE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion DATE
);

ALTER TABLE guardar_backup_app ADD COLUMN estado CHAR(1);
UPDATE guardar_backup_app SET estado = '1';

--02NOV23
CREATE OR REPLACE FUNCTION funcion_calcular_intersecciones()
RETURNS VOID AS $$
BEGIN
  
    BEGIN
        --Actualizacion de las nuevas columnas de la tabla unidad_productiva
        --ANP
        UPDATE unidad_productiva
        SET ints_anp = CASE
            WHEN EXISTS (
                SELECT 1
                FROM parcelas_cafe pc
                JOIN areas_naturales_protegidas anp ON ST_Intersects(pc.geom, anp.geom)
                WHERE pc.gid = unidad_productiva.parcela_gid
            ) THEN 1
            ELSE 0
        END,
        area_ints_anp_m2 = (
            SELECT ST_Area(ST_Intersection(ST_Transform(pc.geom, 32718), ST_Transform(anp.geom, 32718)))
            FROM parcelas_cafe pc
            JOIN areas_naturales_protegidas anp ON ST_Intersects(pc.geom, anp.geom)
            WHERE pc.gid = unidad_productiva.parcela_gid
        )
        WHERE ints_anp IS NULL;

        --ZA
        UPDATE unidad_productiva
        SET ints_za = CASE
            WHEN EXISTS (
                SELECT 1
                FROM parcelas_cafe pc
                JOIN zonas_amortiguamiento za ON ST_Intersects(pc.geom, za.geom)
                WHERE pc.gid = unidad_productiva.parcela_gid
            ) THEN 1
            ELSE 0
        END,
        area_ints_za_m2 = (
            SELECT ST_Area(ST_Intersection(ST_Transform(pc.geom, 32718), ST_Transform(za.geom, 32718)))
            FROM parcelas_cafe pc
            JOIN zonas_amortiguamiento za ON ST_Intersects(pc.geom, za.geom)
            WHERE pc.gid = unidad_productiva.parcela_gid
        )
        WHERE ints_za IS NULL;

        --deforestacion 2014
        UPDATE unidad_productiva
        SET ints_deforestacion_2014 = CASE
            WHEN EXISTS (
                SELECT 1
                FROM parcelas_cafe pc
                JOIN perdida_2014_2020 anp ON ST_Intersects(pc.geom, anp.geom)
                WHERE pc.gid = unidad_productiva.parcela_gid AND anp.año='2014'
                LIMIT 1
            ) THEN 1
            ELSE 0
        END,
        area_ints_deforestacion_2014_m2 = (
            SELECT ST_Area(ST_Intersection(ST_Transform(pc.geom, 32718), ST_Transform(anp.geom, 32718)))
            FROM parcelas_cafe pc
            JOIN perdida_2014_2020 anp ON ST_Intersects(pc.geom, anp.geom)
            WHERE pc.gid = unidad_productiva.parcela_gid AND anp.año='2014'
            LIMIT 1
        )
        WHERE ints_deforestacion_2014 IS NULL;

        --deforestacion 2020
        UPDATE unidad_productiva
        SET ints_deforestacion_2020 = CASE
            WHEN EXISTS (
                SELECT 1
                FROM parcelas_cafe pc
                JOIN perdida_2014_2020 anp ON ST_Intersects(pc.geom, anp.geom)
                WHERE pc.gid = unidad_productiva.parcela_gid AND anp.año='2020'
                LIMIT 1
            ) THEN 1
            ELSE 0
        END,
        area_ints_deforestacion_2020_m2 = (
            SELECT ST_Area(ST_Intersection(ST_Transform(pc.geom, 32718), ST_Transform(anp.geom, 32718)))
            FROM parcelas_cafe pc
            JOIN perdida_2014_2020 anp ON ST_Intersects(pc.geom, anp.geom)
            WHERE pc.gid = unidad_productiva.parcela_gid AND anp.año='2020'
            LIMIT 1
        )
        WHERE ints_deforestacion_2020 IS NULL;

    EXCEPTION
        WHEN others THEN
        -- Manejo de errores
        -- Puedes registrar el error, mostrar un mensaje, etc.
        -- Por ejemplo:
        RAISE NOTICE 'Error en la operación UPDATE: %', SQLERRM;
    END;

END;
$$ LANGUAGE plpgsql;

--11nov23
ALTER TABLE productor ALTER COLUMN dni TYPE VARCHAR(11);

ALTER TABLE unidad_productiva ADD COLUMN eliminada CHAR(1) DEFAULT '0';
UPDATE unidad_productiva SET eliminada = '0';

--15NOV23
CREATE OR REPLACE FUNCTION funcion_calcular_intersecciones()
RETURNS VOID AS $$
BEGIN
  
    BEGIN
        --Actualizacion de las nuevas columnas de la tabla unidad_productiva
        --ANP
        UPDATE unidad_productiva
        SET ints_anp = CASE
            WHEN EXISTS (
                SELECT 1
                FROM parcelas_cafe pc
                JOIN areas_naturales_protegidas anp ON ST_Intersects(pc.geom, anp.geom)
                WHERE pc.gid = unidad_productiva.parcela_gid
            ) THEN 1
            ELSE 0
        END
        WHERE ints_anp IS NULL AND unidad_productiva.activa = '1' AND unidad_productiva.eliminada = '0';

        UPDATE unidad_productiva
        SET area_ints_anp_m2 = (
            SELECT SUM(ST_Area(ST_Intersection(ST_Transform(pc.geom, 32718), ST_Transform(anp.geom, 32718))))
            FROM parcelas_cafe pc
            JOIN areas_naturales_protegidas anp ON ST_Intersects(pc.geom, anp.geom)
            WHERE pc.gid = unidad_productiva.parcela_gid
        )
        WHERE area_ints_anp_m2 IS NULL AND unidad_productiva.activa = '1' AND unidad_productiva.eliminada = '0';

        --ZA
        UPDATE unidad_productiva
        SET ints_za = CASE
            WHEN EXISTS (
                SELECT 1
                FROM parcelas_cafe pc
                JOIN zonas_amortiguamiento za ON ST_Intersects(pc.geom, za.geom)
                WHERE pc.gid = unidad_productiva.parcela_gid
            ) THEN 1
            ELSE 0
        END
        WHERE ints_za IS NULL AND unidad_productiva.activa = '1' AND unidad_productiva.eliminada = '0';

        UPDATE unidad_productiva
        SET area_ints_za_m2 = (
            SELECT SUM(ST_Area(ST_Intersection(ST_Transform(pc.geom, 32718), ST_Transform(za.geom, 32718))))
            FROM parcelas_cafe pc
            JOIN zonas_amortiguamiento za ON ST_Intersects(pc.geom, za.geom)
            WHERE pc.gid = unidad_productiva.parcela_gid
        )
        WHERE area_ints_za_m2 IS NULL AND unidad_productiva.activa = '1' AND unidad_productiva.eliminada = '0';

        --deforestacion 2014
        UPDATE unidad_productiva
        SET ints_deforestacion_2014 = CASE
            WHEN EXISTS (
                SELECT 1
                FROM parcelas_cafe pc
                JOIN perdida_2014_2020 anp ON ST_Intersects(pc.geom, anp.geom)
                WHERE pc.gid = unidad_productiva.parcela_gid AND anp.año='2014'
                LIMIT 1
            ) THEN 1
            ELSE 0
        END
        WHERE ints_deforestacion_2014 IS NULL AND unidad_productiva.activa = '1' AND unidad_productiva.eliminada = '0';

        UPDATE unidad_productiva
        SET area_ints_deforestacion_2014_m2 = (
            SELECT SUM(ST_Area(ST_Intersection(ST_Transform(pc.geom, 32718), ST_Transform(anp.geom, 32718))))
            FROM parcelas_cafe pc
            JOIN perdida_2014_2020 anp ON ST_Intersects(pc.geom, anp.geom)
            WHERE pc.gid = unidad_productiva.parcela_gid AND anp.año='2014'
            LIMIT 1
        )
        WHERE area_ints_deforestacion_2014_m2 IS NULL AND unidad_productiva.activa = '1' AND unidad_productiva.eliminada = '0';

        --deforestacion 2020
        UPDATE unidad_productiva
        SET ints_deforestacion_2020 = CASE
            WHEN EXISTS (
                SELECT 1
                FROM parcelas_cafe pc
                JOIN perdida_2014_2020 anp ON ST_Intersects(pc.geom, anp.geom)
                WHERE pc.gid = unidad_productiva.parcela_gid AND anp.año='2020'
                LIMIT 1
            ) THEN 1
            ELSE 0
        END
        WHERE ints_deforestacion_2020 IS NULL AND unidad_productiva.activa = '1' AND unidad_productiva.eliminada = '0';

        UPDATE unidad_productiva
        SET area_ints_deforestacion_2020_m2 = (
            SELECT SUM(ST_Area(ST_Intersection(ST_Transform(pc.geom, 32718), ST_Transform(anp.geom, 32718))))
            FROM parcelas_cafe pc
            JOIN perdida_2014_2020 anp ON ST_Intersects(pc.geom, anp.geom)
            WHERE pc.gid = unidad_productiva.parcela_gid AND anp.año='2020'
            LIMIT 1
        )
        WHERE area_ints_deforestacion_2020_m2 IS NULL AND unidad_productiva.activa = '1' AND unidad_productiva.eliminada = '0';

    EXCEPTION
        WHEN others THEN
        -- Manejo de errores
        -- Puedes registrar el error, mostrar un mensaje, etc.
        -- Por ejemplo:
        RAISE NOTICE 'Error en la operación UPDATE: %', SQLERRM;
    END;

END;
$$ LANGUAGE plpgsql;

--MODIFICACION UP
DROP VIEW bounds_interseccion_cafe_anp;
DROP VIEW bounds_interseccion_cafe_za;
DROP VIEW bounds_interseccion_cafe_deforestacion_2014;
DROP VIEW bounds_interseccion_cafe_deforestacion_2020;

ALTER TABLE unidad_productiva
ALTER COLUMN area_ints_anp_m2
TYPE numeric(20,3);

ALTER TABLE unidad_productiva
ALTER COLUMN area_ints_za_m2
TYPE numeric(20,3);

ALTER TABLE unidad_productiva
ALTER COLUMN area_ints_deforestacion_2020_m2
TYPE numeric(20,3);

ALTER TABLE unidad_productiva
ALTER COLUMN area_ints_deforestacion_2014_m2
TYPE numeric(20,3);

ALTER TABLE unidad_productiva
ALTER COLUMN area_poly_ha
TYPE numeric(20,3);

--18NOV23
--Calcular el campo area_poly_ha
UPDATE unidad_productiva
SET area_poly_ha = ST_Area(ST_Transform(pc.geom, 32718)) / 10000
FROM parcelas_cafe pc
WHERE unidad_productiva.parcela_gid = pc.gid;

--Funcion
CREATE OR REPLACE FUNCTION recalcula_area_poly_ha()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE unidad_productiva
    SET area_poly_ha = ST_Area(ST_Transform(NEW.geom, 32718)) / 10000
    WHERE parcela_gid = NEW.gid;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--Trigger
CREATE TRIGGER trig_recalcular_area_ha
AFTER UPDATE OF geom
ON parcelas_cafe
FOR EACH ROW
EXECUTE PROCEDURE recalcula_area_poly_ha();


--06ENE24 - CAMBIOS MANUEL
-- Agregar columnas para calcular intersecciones entre parcelas perhusa
alter table unidad_productiva add column ints_parcelas_perhusa char(1), add column area_ints_parcelas_perhusa_m2 numeric(20,3);

--08ENE24
CREATE OR REPLACE FUNCTION funcion_calcular_intersecciones()
RETURNS VOID AS $$
BEGIN
  
    BEGIN
        --Actualizacion de las nuevas columnas de la tabla unidad_productiva
        --ANP
        UPDATE unidad_productiva
        SET ints_anp = CASE
            WHEN EXISTS (
                SELECT 1
                FROM parcelas_cafe pc
                JOIN areas_naturales_protegidas anp ON ST_Intersects(pc.geom, anp.geom)
                WHERE pc.gid = unidad_productiva.parcela_gid
                AND ST_IsValid(pc.geom)
            ) THEN 1
            ELSE 0
        END
        WHERE ints_anp IS NULL AND unidad_productiva.eliminada = '0' AND id>6200;

        UPDATE unidad_productiva
        SET area_ints_anp_m2 = (
            SELECT SUM(ST_Area(ST_Intersection(ST_Transform(pc.geom, 32718), ST_Transform(anp.geom, 32718))))
            FROM parcelas_cafe pc
            JOIN areas_naturales_protegidas anp ON ST_Intersects(pc.geom, anp.geom)
            WHERE pc.gid = unidad_productiva.parcela_gid
            AND ST_IsValid(pc.geom)
        )
        WHERE area_ints_anp_m2 IS NULL AND unidad_productiva.eliminada = '0' AND id>6200;

        --ZA
        UPDATE unidad_productiva
        SET ints_za = CASE
            WHEN EXISTS (
                SELECT 1
                FROM parcelas_cafe pc
                JOIN zonas_amortiguamiento za ON ST_Intersects(pc.geom, za.geom)
                WHERE pc.gid = unidad_productiva.parcela_gid
                AND ST_IsValid(pc.geom)
            ) THEN 1
            ELSE 0
        END
        WHERE ints_za IS NULL AND unidad_productiva.eliminada = '0' AND id>6200;

        UPDATE unidad_productiva
        SET area_ints_za_m2 = (
            SELECT SUM(ST_Area(ST_Intersection(ST_Transform(pc.geom, 32718), ST_Transform(za.geom, 32718))))
            FROM parcelas_cafe pc
            JOIN zonas_amortiguamiento za ON ST_Intersects(pc.geom, za.geom)
            WHERE pc.gid = unidad_productiva.parcela_gid
            AND ST_IsValid(pc.geom)
        )
        WHERE area_ints_za_m2 IS NULL AND unidad_productiva.eliminada = '0' AND id>6200;

        --deforestacion 2014
        UPDATE unidad_productiva
        SET ints_deforestacion_2014 = CASE
            WHEN EXISTS (
                SELECT 1
                FROM parcelas_cafe pc
                JOIN perdida_2014_2020 anp ON ST_Intersects(pc.geom, anp.geom)
                WHERE pc.gid = unidad_productiva.parcela_gid AND anp.año='2014'
                AND ST_IsValid(pc.geom)
                LIMIT 1
            ) THEN 1
            ELSE 0
        END
        WHERE ints_deforestacion_2014 IS NULL AND unidad_productiva.eliminada = '0' AND id>6200;

        /*
        UPDATE unidad_productiva
        SET area_ints_deforestacion_2014_m2 = (
            SELECT SUM(ST_Area(ST_Intersection(ST_Transform(pc.geom, 32718), ST_Transform(anp.geom, 32718))))
            FROM parcelas_cafe pc
            JOIN perdida_2014_2020 anp ON ST_Intersects(pc.geom, anp.geom)
            WHERE pc.gid = unidad_productiva.parcela_gid AND anp.año='2014'
            LIMIT 1
        )
        WHERE area_ints_deforestacion_2014_m2 IS NULL AND unidad_productiva.eliminada = '0' AND id>6200;
        */

        --DEFORESTACION 2014
        DO $$
        DECLARE
            rec RECORD;
            intersected_area DOUBLE PRECISION;
            utm_zone INTEGER;
        BEGIN
            FOR rec IN
                SELECT id, parcela_gid
                FROM unidad_productiva
                WHERE TRUE
                AND eliminada = '0'
                AND id > 6200
            LOOP
                BEGIN
                    -- Calcular la zona UTM basándose en la longitud del centroide de la parcela
                    SELECT FLOOR((ST_X(ST_Centroid(pc.geom)) + 180) / 6) + 1
                    INTO utm_zone
                    FROM parcelas_cafe pc
                    WHERE pc.gid = rec.parcela_gid;

                    -- Determinar el código EPSG para la zona UTM en el hemisferio sur
                    utm_zone := 32700 + utm_zone;

                    -- Calcular el área de intersección transformando a la zona UTM correspondiente
                    SELECT SUM(ST_Area(ST_Intersection(ST_Transform(pc.geom, utm_zone), ST_Transform(anp.geom, utm_zone))))
                    INTO intersected_area
                    FROM parcelas_cafe pc
                    JOIN perdida_2014_2020 anp ON ST_Intersects(pc.geom, anp.geom)
                    WHERE pc.gid = rec.parcela_gid AND anp.año = '2014';

                    IF intersected_area IS NULL THEN
                        intersected_area := 0;
                    END IF;

                    UPDATE unidad_productiva
                    SET area_ints_deforestacion_2014_m2 = intersected_area
                    WHERE id = rec.id;

                EXCEPTION WHEN OTHERS THEN
                    -- Manejo de errores: insertar en la tabla de errores
                    INSERT INTO update_errors (unidad_productiva_id, error_message)
                    VALUES (rec.id, SQLERRM);
                END;
            END LOOP;
        END $$;

        --deforestacion 2020
        UPDATE unidad_productiva
        SET ints_deforestacion_2020 = CASE
            WHEN EXISTS (
                SELECT 1
                FROM parcelas_cafe pc
                JOIN perdida_2014_2020 anp ON ST_Intersects(pc.geom, anp.geom)
                WHERE pc.gid = unidad_productiva.parcela_gid AND anp.año='2020'
                AND ST_IsValid(pc.geom)
                LIMIT 1
            ) THEN 1
            ELSE 0
        END
        WHERE ints_deforestacion_2020 IS NULL AND unidad_productiva.eliminada = '0' AND id>6200;

        --DEFORESTACION 2020
        DO $$
        DECLARE
            rec RECORD;
            intersected_area DOUBLE PRECISION;
            utm_zone INTEGER;
        BEGIN
            FOR rec IN
                SELECT id, parcela_gid
                FROM unidad_productiva
                WHERE TRUE
                AND eliminada = '0'
                AND id > 6200
            LOOP
                BEGIN
                    -- Calcular la zona UTM basándose en la longitud del centroide de la parcela
                    SELECT FLOOR((ST_X(ST_Centroid(pc.geom)) + 180) / 6) + 1
                    INTO utm_zone
                    FROM parcelas_cafe pc
                    WHERE pc.gid = rec.parcela_gid;

                    -- Determinar el código EPSG para la zona UTM en el hemisferio sur
                    utm_zone := 32700 + utm_zone;

                    -- Calcular el área de intersección transformando a la zona UTM correspondiente
                    SELECT SUM(ST_Area(ST_Intersection(ST_Transform(pc.geom, utm_zone), ST_Transform(anp.geom, utm_zone))))
                    INTO intersected_area
                    FROM parcelas_cafe pc
                    JOIN perdida_2014_2020 anp ON ST_Intersects(pc.geom, anp.geom)
                    WHERE pc.gid = rec.parcela_gid AND anp.año = '2020';

                    IF intersected_area IS NULL THEN
                        intersected_area := 0;
                    END IF;

                    UPDATE unidad_productiva
                    SET area_ints_deforestacion_2020_m2 = intersected_area
                    WHERE id = rec.id;

                EXCEPTION WHEN OTHERS THEN
                    -- Manejo de errores: insertar en la tabla de errores
                    INSERT INTO update_errors (unidad_productiva_id, error_message)
                    VALUES (rec.id, SQLERRM);
                END;
            END LOOP;
        END $$;

        /*
        UPDATE unidad_productiva
        SET area_ints_deforestacion_2020_m2 = (
            SELECT SUM(ST_Area(ST_Intersection(ST_Transform(pc.geom, 32718), ST_Transform(anp.geom, 32718))))
            FROM parcelas_cafe pc
            JOIN perdida_2014_2020 anp ON ST_Intersects(pc.geom, anp.geom)
            WHERE pc.gid = unidad_productiva.parcela_gid AND anp.año='2020'
            AND ST_IsValid(pc.geom)
            LIMIT 1
        )
        WHERE area_ints_deforestacion_2020_m2 IS NULL AND unidad_productiva.eliminada = '0' AND id>6200;
        */


        --INTERSECCION
        UPDATE unidad_productiva AS up
        SET
            ints_parcelas_perhusa = (
                CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM parcelas_cafe AS pc
                    WHERE pc.gid = up.parcela_gid
                    AND EXISTS (
                        SELECT 1
                        FROM parcelas_cafe AS pc2
                        WHERE pc.gid <> pc2.gid
                        AND ST_Intersects(pc.geom, pc2.geom)
                        AND EXISTS (
                            SELECT 1
                            FROM unidad_productiva AS up2
                            WHERE up2.parcela_gid = pc2.gid
                            AND up2.eliminada = '0' -- Considerar solo geometrías no eliminadas
                        )
                        LIMIT 1
                    )
                ) THEN '1'
                ELSE '0'
                END
            ),
            area_ints_parcelas_perhusa_m2 = (
                SELECT COALESCE(SUM(ST_Area(ST_Intersection(ST_Transform(pc.geom,32718), ST_Transform(pc2.geom,32718)))), 0)
                FROM parcelas_cafe AS pc
                JOIN parcelas_cafe AS pc2 ON pc.gid <> pc2.gid
                WHERE up.parcela_gid = pc.gid
                AND ST_Intersects(pc.geom, pc2.geom)
                AND ST_IsValid(pc.geom) -- Agregar condición para geometría válida
                AND ST_IsValid(pc2.geom) -- Agregar condición para geometría válida
                AND EXISTS (
                    SELECT 1
                    FROM unidad_productiva AS up2
                    WHERE up2.parcela_gid = pc2.gid
                    AND up2.eliminada = '0' -- Considerar solo geometrías no eliminadas
                )
            )
        WHERE up.id>6200;
        --up.ints_parcelas_perhusa IS NULL
        --AND up.area_ints_parcelas_perhusa_m2 IS NULL
        --AND up.id>6200;

    EXCEPTION
        WHEN others THEN
        -- Manejo de errores
        -- Puedes registrar el error, mostrar un mensaje, etc.
        -- Por ejemplo:
        RAISE NOTICE 'Error en la operación UPDATE: %', SQLERRM;
    END;

END;
$$ LANGUAGE plpgsql;

--20ENE24
--Funcion
CREATE OR REPLACE FUNCTION copiar_informacion_up_productor()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE productor
    SET codigo = NEW.productor_codigo
    WHERE id = NEW.productor_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--Trigger
CREATE TRIGGER trigger_copiar_informacion_up_productor
AFTER UPDATE OF productor_codigo ON unidad_productiva
FOR EACH ROW
EXECUTE PROCEDURE copiar_informacion_up_productor();

-- CAMPOS LPA(AÑO CAMPAÑA) EN PRODUCTOR - CAMBIOS MANUEL 28ENE24
ALTER TABLE productor
ADD COLUMN lpa_anho INT;

ALTER TABLE productor
ADD COLUMN lpa_tipo VARCHAR(20);

ALTER TABLE productor
ADD COLUMN lpa_origen VARCHAR(50);

--03ABR24

--12JUN24
CREATE TABLE unidad_productiva_codigo_venta (
    id SERIAL PRIMARY KEY,
    unidad_productiva_id INT,
    codigo_venta VARCHAR(50) NOT NULL
);

insert into unidad_productiva_codigo_venta (unidad_productiva_id, codigo_venta) values (5831, 'BELLA-JUN2024');
insert into unidad_productiva_codigo_venta (unidad_productiva_id, codigo_venta) values (5685, 'BELLA-JUN2024');
insert into unidad_productiva_codigo_venta (unidad_productiva_id, codigo_venta) values (5709, 'BELLA-JUN2024');
insert into unidad_productiva_codigo_venta (unidad_productiva_id, codigo_venta) values (5903, 'BELLA-JUN2024');

insert into unidad_productiva_codigo_venta (unidad_productiva_id, codigo_venta) values (3313, 'TOCACHE-JUN2024');
insert into unidad_productiva_codigo_venta (unidad_productiva_id, codigo_venta) values (3304, 'TOCACHE-JUN2024');
insert into unidad_productiva_codigo_venta (unidad_productiva_id, codigo_venta) values (3295, 'TOCACHE-JUN2024');
insert into unidad_productiva_codigo_venta (unidad_productiva_id, codigo_venta) values (3294, 'TOCACHE-JUN2024');

CREATE TABLE public.externo_historial_indice_parcela_cafe (
    id integer GENERATED ALWAYS AS IDENTITY,
    gid integer,
    indice character varying(20),
    fecha_indice date,
    fecha_creacion date,
    fecha_modificacion date,
    geojson jsonb,
    PRIMARY KEY (id)
);

--ALTER TABLE productor ALTER COLUMN lpa_tipo SET DEFAULT 'CONVENCIONAL';
ALTER TABLE productor ALTER COLUMN lpa_tipo SET DEFAULT NULL;

--05AGO24
--Actualizar el campo lpa_tipo en la tabla productor
UPDATE productor
SET lpa_tipo = 'CONVENCIONAL'
WHERE lpa_tipo IS NULL OR lpa_tipo = '';

--Actualización de ints_parcelas_perhusa considerando lpa_tipo:
UPDATE unidad_productiva up
SET ints_parcelas_perhusa = CASE 
    WHEN EXISTS (
        SELECT 1
        FROM parcelas_cafe pc
        JOIN productor pr ON pr.id = up.productor_id
        WHERE pc.gid = up.parcela_gid
          AND pr.lpa_tipo IN ('ORGANICO', 'CONVENCIONAL')
          AND EXISTS (
            SELECT 1
            FROM parcelas_cafe pc2
            JOIN unidad_productiva up2 ON up2.parcela_gid = pc2.gid
            JOIN productor pr2 ON pr2.id = up2.productor_id
            WHERE pr2.lpa_tipo = pr.lpa_tipo
              AND ST_Intersects(ST_Transform(pc.geom, 32718), ST_Transform(pc2.geom, 32718))
        )
    ) THEN '1'
    ELSE '0'
END
WHERE up.eliminada = '0';


UPDATE unidad_productiva up
SET area_ints_parcelas_perhusa_m2 = (
    SELECT SUM(ST_Area(ST_Intersection(ST_Transform(pc.geom, 32718), ST_Transform(pc2.geom, 32718))))
    FROM parcelas_cafe pc
    JOIN productor pr ON pr.id = up.productor_id
    JOIN parcelas_cafe pc2 ON ST_Intersects(ST_Transform(pc.geom, 32718), ST_Transform(pc2.geom, 32718))
    JOIN unidad_productiva up2 ON up2.parcela_gid = pc2.gid
    JOIN productor pr2 ON pr2.id = up2.productor_id
    WHERE pc.gid = up.parcela_gid
      AND pr.lpa_tipo IN ('ORGANICO', 'CONVENCIONAL')
      AND pr2.lpa_tipo = pr.lpa_tipo
)
WHERE up.eliminada = '0'
AND area_ints_parcelas_perhusa_m2 IS NULL;
/*
Para adaptar tu consulta y manejar la situación de diferentes zonas UTM, puedes seguir un enfoque similar al que se usó en la función anterior: determinar la zona UTM correcta para cada geometría y ajustar las transformaciones de coordenadas en consecuencia.

Aquí tienes una versión adaptada de tu consulta que calcula la zona UTM en función de la longitud del centroide y utiliza esa zona para las transformaciones
*/
WITH parcela_info AS (
    SELECT 
        up.id AS up_id,
        up.parcela_gid,
        FLOOR((ST_X(ST_Centroid(pc.geom)) + 180) / 6) + 1 AS utm_zone
    FROM unidad_productiva up
    JOIN parcelas_cafe pc ON pc.gid = up.parcela_gid
    WHERE up.eliminada = '0'
      AND area_ints_parcelas_perhusa_m2 IS NULL
      AND ints_parcelas_perhusa = '1'
),
updated_areas AS (
    SELECT 
        up_id,
        SUM(
            ST_Area(
                ST_Intersection(
                    ST_Transform(pc.geom, CAST(32700 + utm_zone AS integer)),
                    ST_Transform(pc2.geom, CAST(32700 + utm_zone AS integer))
                )
            )
        ) AS area
    FROM parcela_info pi
    JOIN parcelas_cafe pc ON pc.gid = pi.parcela_gid
    JOIN productor pr ON pr.id = (SELECT productor_id FROM unidad_productiva WHERE parcela_gid = pc.gid)
    JOIN parcelas_cafe pc2 ON ST_Intersects(ST_Transform(pc.geom, CAST(32700 + pi.utm_zone AS integer)), ST_Transform(pc2.geom, CAST(32700 + pi.utm_zone AS integer)))
    JOIN unidad_productiva up2 ON up2.parcela_gid = pc2.gid
    JOIN productor pr2 ON pr2.id = up2.productor_id
    WHERE pr.lpa_tipo IN ('ORGANICO', 'CONVENCIONAL')
      AND pr2.lpa_tipo = pr.lpa_tipo
    GROUP BY up_id
)
UPDATE unidad_productiva up
SET area_ints_parcelas_perhusa_m2 = ua.area
FROM updated_areas ua
WHERE up.id = ua.up_id;
