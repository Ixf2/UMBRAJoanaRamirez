const API_URL = import.meta.env.VITE_API_URL;

export async function obtenerPersonajesPublicos() {
    const respuesta = await fetch(`${API_URL}/personajes/publicos`);

    if (!respuesta.ok) {
        throw new Error("Error al obtener los personajes públicos");
    }

    return respuesta.json();
}