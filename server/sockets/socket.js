// Para probar la gestión de mensajes en salas de chat
// Conectarse a 3 sesiones de navegador
// http://localhost:3000/chat.html?nombre=Jose%20Manuel&sala=Juegos
// http://localhost:3000/chat.html?nombre=Adriana&sala=Juegos
// http://localhost:3000/chat.html?nombre=Ferney&sala=Amigos
// Entre José Manuel y Adriana deben aparecer mensajes de conexión y desconexión porque
// están en la misma sala.
// Ferney no tiene mensajes de conexión/desconexión de los demás usuarios porque esta
// en una sala distinta.

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

  client.on('crearMensaje', data => {
    const persona = usuarios.getPersona(client.id);

    const mensaje = crearMensaje(persona.nombre, data.mensaje);

    // Mandar mensajes a todos
    client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);
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
