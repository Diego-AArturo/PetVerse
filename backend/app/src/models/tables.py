from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    MetaData,
    String,
    Table,
    Text,
)

metadata = MetaData()

# --- Usuarios y perfiles ---
users = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("full_name", String(255)),
    Column("email", String(255), unique=True, nullable=False),
    Column("password_hash", String(255)),
    Column("phone", String(50)),
    Column("profile_photo_url", String(512)),
    Column("user_type", String(50)),
    Column("created_at", DateTime),
    Column("updated_at", DateTime),
)

user_settings = Table(
    "user_settings",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("notifications_enabled", Boolean),
    Column("privacy_level", String(50)),
    Column("language", String(50)),
    Column("timezone", String(100)),
)

user_address = Table(
    "user_address",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("country", String(100)),
    Column("city", String(100)),
    Column("address", String(255)),
    Column("lat", Float),
    Column("lng", Float),
)

# --- Mascotas y salud ---
pets = Table(
    "pets",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("owner_id", Integer, ForeignKey("users.id")),
    Column("name", String(255)),
    Column("species", String(100)),
    Column("breed", String(255)),
    Column("sex", String(10)),
    Column("birthdate", Date),
    Column("weight", Float),
    Column("avatar_url", String(512)),
    Column("created_at", DateTime),
)

pet_vaccines = Table(
    "pet_vaccines",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("pet_id", Integer, ForeignKey("pets.id")),
    Column("vaccine_name", String(255)),
    Column("date", Date),
    Column("next_due", Date),
    Column("vet_clinic", String(255)),
    Column("notes", String(500)),
)

pet_medications = Table(
    "pet_medications",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("pet_id", Integer, ForeignKey("pets.id")),
    Column("medication", String(255)),
    Column("dose", String(100)),
    Column("frequency", String(100)),
    Column("start_date", Date),
    Column("end_date", Date),
    Column("notes", String(500)),
)

pet_weight_history = Table(
    "pet_weight_history",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("pet_id", Integer, ForeignKey("pets.id")),
    Column("date", Date),
    Column("weight", Float),
)

pet_media = Table(
    "pet_media",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("pet_id", Integer, ForeignKey("pets.id")),
    Column("url", String(512)),
    Column("media_type", String(50)),
)

pet_medical_visits = Table(
    "pet_medical_visits",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("pet_id", Integer, ForeignKey("pets.id")),
    Column("vet_id", Integer, ForeignKey("users.id")),
    Column("visit_date", Date),
    Column("diagnosis", String(500)),
    Column("treatment", String(500)),
    Column("notes", String(500)),
)

pet_vaccine_card_scans = Table(
    "pet_vaccine_card_scans",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("pet_id", Integer, ForeignKey("pets.id")),
    Column("file_url", String(512)),
    Column("extracted_text", Text),
    Column("ocr_metadata", Text),
)

# Mantener health_records para compatibilidad aunque no esta en el esquema SQL actual
health_records = Table(
    "health_records",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("pet_id", Integer, ForeignKey("pets.id")),
    Column("record_date", Date),
    Column("description", Text),
    Column("vet_id", Integer, ForeignKey("users.id")),
)

# --- Social / comunidad ---
posts = Table(
    "posts",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("pet_id", Integer, ForeignKey("pets.id")),
    Column("content", Text),
    Column("media_urls", Text),
    Column("visibility", String(50)),
    Column("created_at", DateTime),
)

post_likes = Table(
    "post_likes",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("post_id", Integer, ForeignKey("posts.id")),
    Column("user_id", Integer, ForeignKey("users.id")),
)

post_comments = Table(
    "post_comments",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("post_id", Integer, ForeignKey("posts.id")),
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("comment", Text),
    Column("created_at", DateTime),
)

groups = Table(
    "groups",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("name", String(255)),
    Column("description", String(500)),
    Column("photo_url", String(512)),
    Column("type", String(50)),
)

group_members = Table(
    "group_members",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("group_id", Integer, ForeignKey("groups.id")),
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("role", String(50)),
)

friendships = Table(
    "friendships",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("user_1", Integer, ForeignKey("users.id")),
    Column("user_2", Integer, ForeignKey("users.id")),
    Column("status", String(50)),
)

chats = Table(
    "chats",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("is_group", Boolean),
)

chat_members = Table(
    "chat_members",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("chat_id", Integer, ForeignKey("chats.id")),
    Column("user_id", Integer, ForeignKey("users.id")),
)

messages = Table(
    "messages",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("chat_id", Integer, ForeignKey("chats.id")),
    Column("sender_id", Integer, ForeignKey("users.id")),
    Column("text", Text),
    Column("media_url", String(512)),
    Column("created_at", DateTime),
)

# --- Lugares ---
places = Table(
    "places",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("name", String(255)),
    Column("type", String(100)),
    Column("description", String(500)),
    Column("lat", Float),
    Column("lng", Float),
    Column("phone", String(50)),
    Column("website", String(255)),
    Column("services", Text),
    Column("created_by_user", Integer, ForeignKey("users.id")),
)

place_reviews = Table(
    "place_reviews",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("place_id", Integer, ForeignKey("places.id")),
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("rating", Integer),
    Column("comment", Text),
    Column("created_at", DateTime),
)

place_reports = Table(
    "place_reports",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("place_id", Integer, ForeignKey("places.id")),
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("report_type", String(100)),
    Column("comment", Text),
    Column("created_at", DateTime),
)

# --- Veterinaria ---
vet_clinics = Table(
    "vet_clinics",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("owner_id", Integer, ForeignKey("users.id")),
    Column("name", String(255)),
    Column("description", String(500)),
    Column("address", String(255)),
    Column("lat", Float),
    Column("lng", Float),
    Column("phone", String(50)),
    Column("email", String(255)),
    Column("logo_url", String(512)),
)

vet_services = Table(
    "vet_services",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("clinic_id", Integer, ForeignKey("vet_clinics.id")),
    Column("service_name", String(255)),
    Column("price", Float),
    Column("description", String(500)),
)

appointments = Table(
    "appointments",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("clinic_id", Integer, ForeignKey("vet_clinics.id")),
    Column("pet_id", Integer, ForeignKey("pets.id")),
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("vet_id", Integer, ForeignKey("users.id")),
    Column("date", Date),
    Column("time", String(50)),
    Column("status", String(50)),
)

# --- Tienda ---
shop_products = Table(
    "shop_products",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("shop_id", Integer, ForeignKey("users.id")),
    Column("name", String(255)),
    Column("description", String(500)),
    Column("price", Float),
    Column("stock", Integer),
    Column("image_url", String(512)),
)

orders = Table(
    "orders",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("shop_id", Integer, ForeignKey("users.id")),
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("total", Float),
    Column("status", String(50)),
    Column("created_at", DateTime),
)

order_items = Table(
    "order_items",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("order_id", Integer, ForeignKey("orders.id")),
    Column("product_id", Integer, ForeignKey("shop_products.id")),
    Column("quantity", Integer),
    Column("price", Float),
)

# --- IA ---
ai_recommendations = Table(
    "ai_recommendations",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("pet_id", Integer, ForeignKey("pets.id")),
    Column("recommendation_type", String(100)),
    Column("content", Text),
    Column("metadata", Text),
    Column("created_at", DateTime),
)

ai_chat_history = Table(
    "ai_chat_history",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("pet_id", Integer, ForeignKey("pets.id")),
    Column("prompt", Text),
    Column("response", Text),
    Column("created_at", DateTime),
)

embeddings = Table(
    "embeddings",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("entity_type", String(100)),
    Column("entity_id", Integer),
    Column("vector", Text),
    Column("metadata", Text),
)
