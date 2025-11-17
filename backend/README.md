PetVerse backend - instrucciones locales

1) Variables de entorno
   - Copiar `.env` y ajustar si es necesario.

2) Levantar servicios con Docker Compose
   - docker-compose up --build
   - docker-compose down

Para forzar la ejecución del script SQL de inicialización (solo si quieres recrear la BD):

PowerShell:
```powershell
docker-compose down -v
docker volume rm petverse_backend_pgdata || $null
docker-compose up --build
```

Notas:
- El comando `docker-compose down -v` borra los volúmenes asociados (perderás datos).
- El fichero `./databases/00-schema-tables.sql` se monta en `/docker-entrypoint-initdb.d/` y se ejecutará solo la primera vez al crear la base de datos.

3) Migraciones Alembic (desde la carpeta `backend`)
   - pip install -r requirements.txt
   - alembic revision --autogenerate -m "init"
   - alembic upgrade head

4) Probar endpoint health
   - Abrir http://localhost:8000/health
Proyecto backend para PetVerse

Instrucciones rápidas:

1) Construir y levantar servicios con Docker Compose:

	docker-compose up --build

2) La API estará disponible en http://localhost:8000

Endpoints básicos:

- GET /health -> {"status":"ok"}
