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

## Endpoints actuales (FastAPI)

Base local (Docker): `http://localhost:8000`

### Salud
- `GET /health` → `{"status": "ok"}`

### Autenticación
- `POST /auth/register`
  - Body JSON: `{"name": "Juan Pérez", "email": "jp@example.com", "password": "secreta"}`
  - Respuesta 201: `{"access_token":"<jwt>","token_type":"bearer","user":{"id":1,"name":"Juan Pérez","email":"jp@example.com","role":"tutor"}}`
- `POST /auth/login`
  - Body JSON: `{"email": "jp@example.com", "password": "secreta"}`
  - Respuesta 200 con `access_token` como arriba.
- `POST /auth/google/callback`
  - Body JSON: `{"id_token":"<google_id_token>"}`
  - Respuesta 200 con `access_token` y `user`.

### Usuario autenticado
- `GET /users/me`
  - Header: `Authorization: Bearer <token>`
  - Respuesta 200: `{"name":"Juan Pérez","email":"jp@example.com","role":"tutor","pets":[...]}`.

### Mascotas
- `GET /pets`
  - Header: `Authorization: Bearer <token>`
  - Respuesta 200: lista de mascotas del usuario.
- `POST /pets`
  - Header: `Authorization: Bearer <token>`
  - Body JSON: `{"name":"Luna","species":"Perro","breed":"Golden","weight":28.5}`
  - Respuesta 201: mascota creada.
- `PUT /pets/{pet_id}`
  - Header: `Authorization: Bearer <token>`
  - Body JSON parcial con campos a actualizar.
  - Respuesta 200: mascota actualizada.
- `DELETE /pets/{pet_id}`
  - Header: `Authorization: Bearer <token>`
  - Respuesta 204 sin cuerpo.
- `POST /pets/upload-image`
  - Header: `Authorization: Bearer <token>`
  - FormData: `pet_id` (int), `file` (imagen). Devuelve `{"avatar_url": "/media/pets/<nombre>.jpg"}`.
  - Nota: el backend guarda solo la cadena `avatar_url`; si usas almacenamiento local del dispositivo, envía ese path en `avatar_url` a través de `PUT /pets/{pet_id}` en lugar de subir archivo.

## Ejemplos rápidos (curl)

Registro:
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan","email":"jp@example.com","password":"secreta"}'
```

Login y variable de token:
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jp@example.com","password":"secreta"}' | jq -r .access_token)
```

Crear mascota:
```bash
curl -X POST http://localhost:8000/pets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Luna","species":"Perro","weight":28.5}'
```

Actualizar avatar con path local (sin subir archivo):
```bash
curl -X PUT http://localhost:8000/pets/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"avatar_url":"file:///storage/emulated/0/DCIM/IMG_1234.jpg"}'
```
