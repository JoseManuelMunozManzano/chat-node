const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios');
const { crearMensaje } = require('../utilidades/utilidades');

const usuarios = new Usuarios();

io.on('connection', client => {
  client.on('entrarChat', (data, callback) => {
    if (!data.nombre || !data.sala) {
      return callback({
        error: true,
        mensaje: 'El nombre/sala es necesario',
      });
    }

    // Unir a una sala. Te puedes unir a múltiples salas y por defecto se hace usando
    // el id como nombre
    client.join(data.sala);

    usuarios.agregarPersona(client.id, data.nombre, data.sala);

    // Se filtra a las personas de la sala el mensaje de que un usuario se ha conectado
    client.broadcast
      .to(data.sala)
      .emit('listaPersonas', usuarios.getPersonasPorSala(data.sala));

    callback(usuarios.getPersonasPorSala(data.sala));
  });

  client.on('crearMensaje', (data, callback) => {
    const persona = usuarios.getPersona(client.id);

    const mensaje = crearMensaje(persona.nombre, data.mensaje);

    // Mandar mensajes a todos
    client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);

    callback(mensaje);
  });

  client.on('disconnect', () => {
    const personaBorrada = usuarios.borrarPersona(client.id);

    // Indicar a las personas de nuestra sala que el usuario se ha desconectado
    client.broadcast
      .to(personaBorrada.sala)
      .emit(
        'crearMensaje',
        crearMensaje('Administrador', `${personaBorrada.nombre} salió`)
      );

    client.broadcast
      .to(personaBorrada.sala)
      .emit('listaPersonas', usuarios.getPersonasPorSala(personaBorrada.sala));
  });

  // Mensajes privados
  // data debe contener el id de la persona a la que le quiero enviar el mensaje
  client.on('mensajePrivado', data => {
    const persona = usuarios.getPersona(client.id);

    // Habría que validar que data venga bien informada

    // Enviando el mensaje privado al id de usuario deseado
    client.broadcast
      .to(data.para)
      .emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));
  });
});
