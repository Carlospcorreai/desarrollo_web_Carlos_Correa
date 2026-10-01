import re
import filetype
from datetime import datetime, timedelta

# Son las mismas reglas que el JavaScript de la tarea 1.
# Se repiten aqui porque el JavaScript se puede desactivar o saltar
# (por ejemplo enviando el formulario con curl), asi que el servidor no confia en el navegador.


# --- Voluntario ---

def validate_nombre(value):
    if not value:
        return False
    value = value.strip()
    # letras (incluye tildes y ñ) y espacios, entre 3 y 255 caracteres
    # (À-ſ es el mismo rango que usa el JavaScript)
    return 3 <= len(value) <= 255 and bool(re.fullmatch(r"[a-zA-ZÀ-ſ ]+", value))


def validate_email(value):
    if not value:
        return False
    return len(value) <= 80 and bool(re.fullmatch(r"[\w.-]+@[\w-]+\.[a-zA-Z]{2,4}", value))


def validate_celular(value):
    if not value:
        return False
    # 9 digitos que parten con 9
    return bool(re.fullmatch(r"9[0-9]{8}", value))


def validate_voluntario(nombre, email, celular, comuna):
    # Devuelve la lista de errores. Si la lista queda vacia, todo esta bien.
    # comuna es el objeto traido de la base de datos (None si el id no existe).
    errores = []
    if not validate_nombre(nombre):
        errores.append("Nombre: debe tener al menos 3 letras y no puede tener números.")
    if not validate_email(email):
        errores.append("Email: el formato no es válido.")
    if not validate_celular(celular):
        errores.append("Celular: deben ser 9 dígitos partiendo con 9.")
    if comuna is None:
        errores.append("Comuna: debe seleccionar una comuna válida.")
    return errores


# --- Avistamiento ---

def validate_texto(value, minimo, maximo):
    if not value:
        return False
    return minimo <= len(value.strip()) <= maximo


def validate_fecha_hora(fecha, hora):
    # Devuelve el datetime si es valido, o None si no lo es.
    try:
        fecha_hora = datetime.strptime(f"{fecha} {hora}", "%Y-%m-%d %H:%M")
    except (ValueError, TypeError):
        return None
    ahora = datetime.now()
    hace_un_ano = ahora - timedelta(days=365)
    if hace_un_ano <= fecha_hora <= ahora:
        return fecha_hora
    return None


def validate_archivo(archivo):
    ALLOWED_MIMETYPES = {"image/jpeg", "image/png", "image/gif", "image/webp",
                         "video/mp4", "video/webm", "video/quicktime"}

    # el navegador manda un archivo vacio si no se eligio nada
    if archivo is None or archivo.filename == "":
        return False

    # filetype mira los primeros bytes del archivo (su contenido real),
    # no la extension, que el usuario puede cambiar
    tipo = filetype.guess(archivo)
    archivo.seek(0)  # se vuelve al inicio para poder guardarlo despues
    if tipo is None or tipo.mime not in ALLOWED_MIMETYPES:
        return False
    return True


def validate_avistamiento(voluntario, ave, lugar, fecha_hora, descripcion, archivos):
    # voluntario y ave son objetos de la base de datos (None si el id no existe).
    # fecha_hora ya viene revisada por validate_fecha_hora (None si es invalida).
    errores = []
    if voluntario is None:
        errores.append("Voluntario: debe seleccionar un voluntario registrado.")
    if ave is None:
        errores.append("Ave: debe seleccionar un ave de la lista.")
    if not validate_texto(lugar, 3, 200):
        errores.append("Lugar: entre 3 y 200 caracteres.")
    if fecha_hora is None:
        errores.append("Fecha y hora: no puede ser futura ni anterior a un año.")
    if descripcion and len(descripcion) > 500:
        errores.append("Descripción: máximo 500 caracteres.")

    # se descartan los campos de archivo que llegaron vacios
    archivos = [a for a in archivos if a.filename != ""]
    if not 1 <= len(archivos) <= 3:
        errores.append("Foto o video: debe adjuntar entre 1 y 3 archivos.")
    else:
        for archivo in archivos:
            if not validate_archivo(archivo):
                errores.append(f"Archivo «{archivo.filename}»: solo se aceptan imágenes (jpg, png, gif, webp) o videos (mp4, webm, mov).")
    return errores
