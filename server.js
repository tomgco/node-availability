var net = require('net')
  , EventEmitter = require('events').EventEmitter
  ;

exports.AvailabilityServer = function(config) {
  config = config || {};
  config.port = config.port || false;
  config.host = config.host || false;

  var server = net.createServer(function (socket) {
    socket.pipe(socket);
  });

  server.listen();
  return server;
};

exports.AvailabilityClient = function(port, host, config) {
  config = config || {};
  config.timeout = config.timeout = 1500; // timeout
  config.data = config.data || '.';
  port = port || 1337;
  host = host || '0.0.0.0';

  var self = new EventEmitter()
    , client = net.connect(port, host)
    ;

  client.on('connect', function() {
    client.write(config.data);
    self.emit('connect');
  });

  client.on('data', function(data) {
    if (data.toString() === config.data) {
      self.emit('online');
    } else {
      self.emit('error');
    }
    client.end();
  });

  client.setTimeout(1000, function() {
    self.emit('timeout');
    client.end();
  });

  client.on('error', function() {
    self.emit('offline');
  });

  client.on('end', function() {
    console.log('client disconnected');
  });
};