from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship

# Credenciales pedidas en el enunciado
DB_NAME = "tarea2"
DB_USERNAME = "cc5002"
DB_PASSWORD = "programacionweb"
DB_HOST = "localhost"
DB_PORT = 3306

# charset=utf8mb4 para guardar bien tildes y ñ
DATABASE_URL = f"mysql+pymysql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"

engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()


# --- Modelos (una clase por tabla de tarea2.sql) ---

class Region(Base):
    __tablename__ = "region"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(200), nullable=False)

    comunas = relationship("Comuna", back_populates="region")


class Comuna(Base):
    __tablename__ = "comuna"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(200), nullable=False)
    region_id = Column(Integer, ForeignKey("region.id"), nullable=False)

    region = relationship("Region", back_populates="comunas")


class Voluntario(Base):
    __tablename__ = "voluntario"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(255), nullable=False)
    email = Column(String(80), nullable=False)
    telefono = Column(String(15), nullable=False)
    fecha_registro = Column(DateTime, nullable=False)
    comuna_id = Column(Integer, ForeignKey("comuna.id"), nullable=False)

    comuna = relationship("Comuna")


class Ave(Base):
    __tablename__ = "ave"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(80), nullable=False)


class Avistamiento(Base):
    __tablename__ = "avistamiento"

    id = Column(Integer, primary_key=True, autoincrement=True)
    voluntario_id = Column(Integer, ForeignKey("voluntario.id"), nullable=False)
    ave_id = Column(Integer, ForeignKey("ave.id"), nullable=False)
    fecha_hora = Column(DateTime, nullable=False)
    lugar = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=True)

    voluntario = relationship("Voluntario")
    ave = relationship("Ave")
    registros = relationship("Registro", back_populates="avistamiento")


class Registro(Base):
    __tablename__ = "registro"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ruta_archivo = Column(String(300), nullable=False)
    nombre_archivo = Column(String(300), nullable=False)
    avistamiento_id = Column(Integer, ForeignKey("avistamiento.id"), nullable=False)

    avistamiento = relationship("Avistamiento", back_populates="registros")


# --- Funciones de regiones y comunas ---

def get_regiones_con_comunas():
    # Devuelve una lista de diccionarios para entregarsela al JavaScript:
    # [{"id": 1, "nombre": "...", "comunas": [{"id": 10, "nombre": "..."}, ...]}, ...]
    session = SessionLocal()
    regiones = session.query(Region).order_by(Region.id).all()
    resultado = []
    for region in regiones:
        comunas = []
        for comuna in region.comunas:
            comunas.append({"id": comuna.id, "nombre": comuna.nombre})
        resultado.append({"id": region.id, "nombre": region.nombre.strip(), "comunas": comunas})
    session.close()
    return resultado


def get_comuna_by_id(id):
    session = SessionLocal()
    comuna = session.query(Comuna).filter_by(id=id).first()
    session.close()
    return comuna


# --- Funciones de voluntarios ---

def create_voluntario(nombre, email, telefono, fecha_registro, comuna_id):
    session = SessionLocal()
    nuevo = Voluntario(nombre=nombre, email=email, telefono=telefono,
                       fecha_registro=fecha_registro, comuna_id=comuna_id)
    session.add(nuevo)
    session.commit()
    nuevo_id = nuevo.id  # id asignado por AUTO_INCREMENT
    session.close()
    return nuevo_id


def get_voluntario_by_id(id):
    session = SessionLocal()
    voluntario = session.query(Voluntario).filter_by(id=id).first()
    session.close()
    return voluntario


def get_voluntarios():
    session = SessionLocal()
    voluntarios = session.query(Voluntario).order_by(Voluntario.nombre).all()
    session.close()
    return voluntarios


# --- Funciones de aves ---

def get_aves():
    session = SessionLocal()
    aves = session.query(Ave).order_by(Ave.nombre).all()
    session.close()
    return aves


def get_ave_by_id(id):
    session = SessionLocal()
    ave = session.query(Ave).filter_by(id=id).first()
    session.close()
    return ave


# --- Funciones de avistamientos ---

def create_avistamiento(voluntario_id, ave_id, fecha_hora, lugar, descripcion, archivos):
    # archivos: lista de tuplas (ruta_archivo, nombre_archivo)
    # Se inserta el avistamiento y todos sus registros en una misma transaccion.
    session = SessionLocal()
    avistamiento = Avistamiento(voluntario_id=voluntario_id, ave_id=ave_id,
                                fecha_hora=fecha_hora, lugar=lugar, descripcion=descripcion)
    session.add(avistamiento)
    session.flush()  # flush le pide el id a MySQL sin confirmar todavia

    for ruta, nombre in archivos:
        registro = Registro(ruta_archivo=ruta, nombre_archivo=nombre,
                            avistamiento_id=avistamiento.id)
        session.add(registro)

    session.commit()  # se guardan avistamiento + registros juntos
    session.close()


def avistamiento_a_diccionario(av):
    # Se arma un diccionario mientras la sesion esta abierta,
    # porque despues de session.close() ya no se pueden leer las relaciones.
    return {
        "id": av.id,
        "ave": av.ave.nombre,
        "lugar": av.lugar,
        "fecha_hora": av.fecha_hora,
        "descripcion": av.descripcion,
        "voluntario": av.voluntario.nombre,
        "comuna": av.voluntario.comuna.nombre,
        "registros": [{"ruta": r.ruta_archivo, "nombre": r.nombre_archivo} for r in av.registros],
    }


def get_ultimos_avistamientos(cantidad):
    session = SessionLocal()
    avistamientos = session.query(Avistamiento).order_by(Avistamiento.id.desc()).limit(cantidad).all()
    resultado = [avistamiento_a_diccionario(av) for av in avistamientos]
    session.close()
    return resultado


def count_avistamientos():
    session = SessionLocal()
    total = session.query(Avistamiento).count()
    session.close()
    return total


def get_avistamientos(pagina, por_pagina):
    # OFFSET salta las filas de las paginas anteriores
    session = SessionLocal()
    avistamientos = (session.query(Avistamiento)
                     .order_by(Avistamiento.fecha_hora.desc(), Avistamiento.id.desc())
                     .offset((pagina - 1) * por_pagina)
                     .limit(por_pagina)
                     .all())
    resultado = [avistamiento_a_diccionario(av) for av in avistamientos]
    session.close()
    return resultado


def get_avistamiento_by_id(id):
    session = SessionLocal()
    av = session.query(Avistamiento).filter_by(id=id).first()
    resultado = avistamiento_a_diccionario(av) if av else None
    session.close()
    return resultado
