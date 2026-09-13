import json
from datetime import datetime, timezone


ARCHIVO = "datos.json"

MAX_ALQUILER = 1000
MAX_COMPRA = 130000

MIN_HABITACIONES = 2
MIN_METROS = 70

ZONAS_PRIORITARIAS = {
    "patraix",
    "campanar",
    "benimaclet",
    "extramurs",
    "quatre carreres",
    "jesús",
    "la saïdia",
}


PALABRAS_NO_DESEADAS = [
    "estudiantes",
    "solo estudiantes",
    "universitari",
    "universitarios",
    "temporada",
    "alquiler temporal",
    "por meses",
    "vacacional",
]


def normalizar(texto):
    return str(texto or "").strip().lower()


def es_valencia_capital(anuncio):
    texto = normalizar(
        anuncio.get("location", "")
    )

    return (
        "valencia" in texto
        and "provincia" not in texto
    )


def es_no_deseado(anuncio):
    texto = " ".join([
        normalizar(anuncio.get("title", "")),
        normalizar(anuncio.get("description", "")),
    ])

    return any(
        palabra in texto
        for palabra in PALABRAS_NO_DESEADAS
    )


def cumple_filtros(anuncio):
    operacion = normalizar(
        anuncio.get("operation", "")
    )

    precio = float(
        anuncio.get("price", 0) or 0
    )

    habitaciones = int(
        anuncio.get("rooms", 0) or 0
    )

    metros = float(
        anuncio.get("size", 0) or 0
    )

    if operacion == "alquiler":
        if precio > MAX_ALQUILER:
            return False

    elif operacion == "compra":
        if precio > MAX_COMPRA:
            return False

    elif operacion == "opcion":
        precio_compra = float(
            anuncio.get("salePrice", 0) or 0
        )

        if precio_compra > MAX_COMPRA:
            return False

    else:
        return False

    if habitaciones < MIN_HABITACIONES:
        return False

    if metros < MIN_METROS:
        return False

    if not es_valencia_capital(anuncio):
        return False

    if es_no_deseado(anuncio):
        return False

    return True


def calcular_puntuacion(anuncio):
    puntuacion = 50

    precio = float(
        anuncio.get("price", 0) or 0
    )

    habitaciones = int(
        anuncio.get("rooms", 0) or 0
    )

    metros = float(
        anuncio.get("size", 0) or 0
    )

    ubicacion = normalizar(
        anuncio.get("location", "")
    )

    operacion = normalizar(
        anuncio.get("operation", "")
    )

    if habitaciones >= 3:
        puntuacion += 10

    if metros >= 80:
        puntuacion += 10

    if anuncio.get("elevator"):
        puntuacion += 8

    if anuncio.get("parking"):
        puntuacion += 12

    if anuncio.get("condition"):
        puntuacion += 8

    if any(
        zona in ubicacion
        for zona in ZONAS_PRIORITARIAS
    ):
        puntuacion += 10

    if operacion == "alquiler":
        if precio <= 900:
            puntuacion += 5

    elif operacion == "compra":
        if precio <= 120000:
            puntuacion += 5

    elif operacion == "opcion":
        precio_compra = float(
            anuncio.get("salePrice", 0) or 0
        )

        if precio_compra <= 120000:
            puntuacion += 5

    return min(puntuacion, 100)


def main():
    with open(
        ARCHIVO,
        "r",
        encoding="utf-8"
    ) as archivo:
        datos = json.load(archivo)

    anuncios = datos.get(
        "anuncios",
        []
    )

    anuncios_validos = []

    for anuncio in anuncios:
        if cumple_filtros(anuncio):
            anuncio["score"] = calcular_puntuacion(
                anuncio
            )
            anuncios_validos.append(anuncio)

    datos["anuncios"] = anuncios_validos

    datos["actualizado"] = datetime.now(
        timezone.utc
    ).strftime("%Y-%m-%d %H:%M UTC")

    with open(
        ARCHIVO,
        "w",
        encoding="utf-8"
    ) as archivo:
        json.dump(
            datos,
            archivo,
            ensure_ascii=False,
            indent=2
        )

    print(
        f"Anuncios válidos: "
        f"{len(anuncios_validos)}"
    )


if __name__ == "__main__":
    main()
