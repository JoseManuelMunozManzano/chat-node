const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios');
const { crearMensaje } = require('../utilidades/utilidades');

const usuarios = new Usuarios();

io.on('connection', client => {
  client.on('entrarChat', (data, callback) => {
    if (!data.nombre) {
      return callback({
        error: true,
        mensaje: 'El nombre es necesario',
      });
    }

    const personas = usuarios.agregarPersona(client.id, data.nombre);

    // Indicar a todas las personas que el usuario se ha conectado
    client.broadcast.emit('listaPersonas', usuarios.getPersonas());

    callback(personas);
  });

  client.on('crearMensaje', data => {
    const persona = usuarios.getPersona(client.id);

    const mensaje = crearMensaje(persona.nombre, data.mensaje);

    // Mandar mensajes a todos
    // Para probar esto, abrir tres sesiones de navegador e ir a las direcciones siguientes:
    // http://localhost:3000/chat.html?nombre=Jose%20Manuel
    // http://localhost:3000/chat.html?nombre=Adriana
    // http://localhost:3000/chat.html?nombre=Ferney
    // Abrir las 3 consolas y en una de ellas escribir
    // socket.emit('crearMensaje', {mensaje:'hola a todos'});
    // Deberá verse en las otras 2 consolas
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
    // Para probar esto, abrir tres sesiones de navegador e ir a las direcciones siguientes:
    // http://localhost:3000/chat.html?nombre=Jose%20Manuel
    // http://localhost:3000/chat.html?nombre=Adriana
    // http://localhost:3000/chat.html?nombre=Ferney
    // Abrir las 3 consolas, coger el id de Ferney de la consola de Ferney y en la
    // consola del navegador José Manuel escribir:
    // socket.emit('mensajePrivado', {para: "CSyhw0lzbweJRDiWAAAD", mensaje:'Hola Ferney'});
    // Deberá verse en el navegador donde el usuario es Ferney
    client.broadcast
      .to(data.para)
      .emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));
  });
});
