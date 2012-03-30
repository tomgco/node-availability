var net = require('net')
  , EventEmitter = require('events').EventEmitter
  ;

exports.createServer = function(config) {
  config = config || {};
  config.port = config.port || false;
  config.host = config.host || false;
  config.onConnection = config.onConnection || function (socket) {
    socket.pipe(socket);
    server.emit('clientReq');
  };

  var server = net.createServer(config.onConnection);

  server.listen();
  return server;
};

exports.createClient = function(port, host, config) {
  config = config || {};
  config.timeout = config.timeout = 1500; // timeout
  config.data = config.data || '.';
  port = port || 1337;
  host = host || '0.0.0.0';

  var self = new EventEmitter()
    ;

  function check() {
    var client = net.connect(port, host)
      , availabe = false
      , res = null
      ;

    client.on('connect', function() {
      client.write(config.data);
      self.emit('connect');
    });

    client.on('data', function(data) {
      availabe = true;
      res = data.toString();
      self.emit('online', availabe, res);
    });

    client.setTimeout(config.timeout, client.end);

    client.on('error', function() {
      self.emit('online', availabe);
      client.end();
    });

    client.on('end', function() {
      self.emit('end', availabe, res);
    });
  }
  self.clientData = config.data;
  self.check = check;

  return self;
};
