from sqlalchemy import Table, Column, Integer, String, Date, Float, DateTime, Boolean, MetaData, Text, ForeignKey

metadata = MetaData()

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

health_records = Table(
    "health_records",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("pet_id", Integer, ForeignKey("pets.id")),
    Column("record_date", Date),
    Column("description", Text),
    Column("vet_id", Integer, ForeignKey("users.id")),
)
