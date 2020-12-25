const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios');
const { crearMensaje } = require('../utilidades/utilidades');

const usuarios = new Usuarios();

io.on('connection', client => {
  client.on('entrarChat', (data, callback) => {
    console.log(data);

    if (!data.nombre || !data.sala) {
      return callback({
        error: true,
        mensaje: 'El nombre/sala es necesario',
      });
    }

    // Unir a una sala. Te puedes unir a múltiples salas y por defecto se hace usando
    // el id como nombre
    client.join(data.sala);

    const personas = usuarios.agregarPersona(client.id, data.nombre, data.sala);

    // Indicar a todas las personas que el usuario se ha conectado
    client.broadcast.emit('listaPersonas', usuarios.getPersonas());

    callback(personas);
  });

  client.on('crearMensaje', data => {
    const persona = usuarios.getPersona(client.id);

    const mensaje = crearMensaje(persona.nombre, data.mensaje);

    // Mandar mensajes a todos
    client.broadcast.emit('crearMensaje', mensaje);
  });

  client.on('disconnect', () => {
    const personaBorrada = usuarios.borrarPersona(client.id);

    // Indicar a todos las personas del chat que el usuario se ha desconectado
    client.broadcast.emit(
      'crearMensaje',
      crearMensaje('Administrador', `${personaBorrada.nombre} salió`)
    );

    client.broadcast.emit('listaPersonas', usuarios.getPersonas());
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
