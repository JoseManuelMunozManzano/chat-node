// El objeto client del socket tiene el id como propiedad, y este es único por cada
// usuario que se conecta a la aplicación
//
// En esta clase, cada usuario será un objeto con id, nombre y la sala de chat donde esté

class Usuarios {
  constructor() {
    this.personas = [];
  }

  agregarPersona(id, nombre, sala) {
    const persona = { id, nombre, sala };

    this.personas.push(persona);

    return this.personas;
  }

  getPersona(id) {
    const persona = this.personas.filter(persona => persona.id === id)[0];

    return persona;
  }

  getPersonas() {
    return this.personas;
  }

  getPersonasPorSala(sala) {
    // .....
  }

  borrarPersona(id) {
    const personaBorrada = this.getPersona(id);

    this.personas = this.personas.filter(persona => persona.id !== id);

    return personaBorrada;
  }
}

module.exports = {
  Usuarios,
};
