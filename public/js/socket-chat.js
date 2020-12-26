// Para probar acceder a http://localhost:3000/
var socket = io();

var params = new URLSearchParams(window.location.search);

if (!params.get('nombre') || !params.get('sala')) {
  window.location = 'index.html';
  throw new Error('El nombre y sala son necesarios');
}

var usuario = {
  nombre: params.get('nombre'),
  sala: params.get('sala'),
};

socket.on('connect', function () {
  console.log('Conectado al servidor');

  // Diciéndole al back-end quien soy yo
  socket.emit('entrarChat', usuario, function (resp) {
    renderizarUsuarios(resp);
  });
});

// escuchar
socket.on('disconnect', function () {
  console.log('Perdimos conexión con el servidor');
});

// Escuchar información
// Escuchando mensajes
socket.on('crearMensaje', function (mensaje) {
  //console.log('Servidor:', mensaje);
  renderizarMensajes(mensaje);
});

// Escuchar cambios de usuarios
// cuando un usuario entra o sale del chat
socket.on('listaPersonas', function (personas) {
  renderizarUsuarios(personas);
});

// Mensajes privados
// Acción de escuchar del cliente
socket.on('mensajePrivado', function (mensaje) {
  console.log('Mensaje Privado:', mensaje);
});
