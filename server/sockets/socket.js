const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios');

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

  client.on('disconnect', () => {
    const personaBorrada = usuarios.borrarPersona(client.id);

    // Indicar a todos las personas del chat que el usuario se ha desconectado
    client.broadcast.emit('crearMensaje', {
      usuario: 'Administrador',
      mensaje: `${personaBorrada.nombre} abandonó el chat`,
    });

    client.broadcast.emit('listaPersonas', usuarios.getPersonas());
  });
});
