from flask import Flask, request, render_template, redirect, url_for, flash, abort
from werkzeug.utils import secure_filename
from datetime import datetime
from database import db
from utils.validations import validate_voluntario, validate_avistamiento, validate_fecha_hora
import hashlib
import filetype
import os
import uuid

UPLOAD_FOLDER = "static/uploads"
POR_PAGINA = 5

app = Flask(__name__)
app.secret_key = "cambiar_esta_clave_secreta"  # necesaria para usar flash()
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 50 * 1000 * 1000  # 50 MB por envio (hasta 3 videos)


# --- Portada ---

@app.route("/", methods=["GET"])
def index():
    ultimos = db.get_ultimos_avistamientos(2)
    return render_template("index.html", ultimos=ultimos)


# --- Registrar voluntario ---

@app.route("/registro", methods=["GET", "POST"])
def registro():
    if request.method == "POST":
        nombre = request.form.get("nombre", "").strip()
        email = request.form.get("email", "").strip()
        celular = request.form.get("celular", "").strip()
        # type=int: si mandan algo que no es numero, queda None
        comuna_id = request.form.get("comuna", type=int)
        comuna = db.get_comuna_by_id(comuna_id) if comuna_id else None

        errores = validate_voluntario(nombre, email, celular, comuna)
        if not errores:
            nuevo_id = db.create_voluntario(nombre, email, celular, datetime.now(), comuna.id)
            return redirect(url_for("registro_exitoso", id=nuevo_id))

        # Hay errores: se vuelve a mostrar el formulario con los datos ingresados
        return render_template("registro.html", errores=errores, datos=request.form,
                               regiones=db.get_regiones_con_comunas())

    return render_template("registro.html", errores=[], datos={},
                           regiones=db.get_regiones_con_comunas())


@app.route("/registro/<int:id>", methods=["GET"])
def registro_exitoso(id):
    voluntario = db.get_voluntario_by_id(id)
    if voluntario is None:
        abort(404)
    return render_template("registro_exitoso.html", voluntario=voluntario)


# --- Informar avistamiento ---

def guardar_archivo(archivo):
    # Nombre nuevo = hash del nombre original + uuid + extension real.
    # Asi dos archivos con el mismo nombre no se pisan, y un nombre
    # malicioso como "../../app.py" nunca llega al disco.
    nombre_seguro = secure_filename(archivo.filename)
    _hash = hashlib.sha256(nombre_seguro.encode("utf-8")).hexdigest()
    _extension = filetype.guess(archivo).extension
    archivo.seek(0)
    nombre_en_disco = f"{_hash}_{uuid.uuid4()}.{_extension}"

    archivo.save(os.path.join(app.config["UPLOAD_FOLDER"], nombre_en_disco))
    # se guarda la ruta relativa a static/ y el nombre original (para mostrarlo)
    return f"uploads/{nombre_en_disco}", nombre_seguro


@app.route("/avistamiento", methods=["GET", "POST"])
def avistamiento():
    voluntarios = db.get_voluntarios()
    aves = db.get_aves()

    if request.method == "POST":
        voluntario_id = request.form.get("voluntario", type=int)
        ave_id = request.form.get("ave", type=int)
        lugar = request.form.get("lugar", "").strip()
        descripcion = request.form.get("descripcion", "").strip()
        fecha_hora = validate_fecha_hora(request.form.get("fecha"), request.form.get("hora"))
        archivos = request.files.getlist("archivos")

        voluntario = db.get_voluntario_by_id(voluntario_id) if voluntario_id else None
        ave = db.get_ave_by_id(ave_id) if ave_id else None

        errores = validate_avistamiento(voluntario, ave, lugar, fecha_hora, descripcion, archivos)
        if not errores:
            # 1. guardar cada archivo en static/uploads
            guardados = []
            for archivo in archivos:
                if archivo.filename != "":
                    guardados.append(guardar_archivo(archivo))
            # 2. insertar avistamiento + una fila de registro por archivo
            db.create_avistamiento(voluntario.id, ave.id, fecha_hora, lugar,
                                   descripcion or None, guardados)
            flash("Avistamiento informado correctamente. ¡Gracias por tu aporte!")
            return redirect(url_for("index"))

        return render_template("avistamiento.html", errores=errores, datos=request.form,
                               voluntarios=voluntarios, aves=aves)

    # GET: si viene ?voluntario=5 (desde el registro exitoso) se deja preseleccionado
    datos = {"voluntario": request.args.get("voluntario", "")}
    return render_template("avistamiento.html", errores=[], datos=datos,
                           voluntarios=voluntarios, aves=aves)


# --- Listado y detalle ---

@app.route("/listado", methods=["GET"])
def listado():
    total = db.count_avistamientos()
    total_paginas = max(1, (total + POR_PAGINA - 1) // POR_PAGINA)

    # type=int + limites: ?pagina=abc o ?pagina=-3 terminan en una pagina valida
    pagina = request.args.get("pagina", 1, type=int)
    pagina = min(max(pagina, 1), total_paginas)

    avistamientos = db.get_avistamientos(pagina, POR_PAGINA)
    return render_template("listado.html", avistamientos=avistamientos, pagina=pagina,
                           total_paginas=total_paginas, total=total)


@app.route("/avistamiento/<int:id>", methods=["GET"])
def detalle(id):
    # <int:id> hace que /avistamiento/abc responda 404 sin llegar a la base de datos
    av = db.get_avistamiento_by_id(id)
    if av is None:
        abort(404)

    # se marca cada archivo como foto o video para elegir <img> o <video>
    for registro in av["registros"]:
        tipo = filetype.guess(os.path.join("static", registro["ruta"]))
        registro["es_video"] = tipo is not None and tipo.mime.startswith("video")

    return render_template("detalle.html", av=av)


# --- Estadisticas (pendiente para la tarea 3) ---

@app.route("/estadisticas", methods=["GET"])
def estadisticas():
    return render_template("estadisticas.html")


if __name__ == "__main__":
    app.run(debug=True)
