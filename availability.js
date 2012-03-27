var net = require('net')
  , EventEmitter = require('events').EventEmitter
  ;

exports.createServer = function(config) {
  config = config || {};
  config.port = config.port || false;
  config.host = config.host || false;

  var server = net.createServer(function (socket) {
    socket.pipe(socket);
  });

  server.listen();
  return server;
};

exports.createClient = function(port, host, config) {
  config = config || {};
  config.timeout = config.timeout = 1500; // timeout
  config.data = config.data || '.';
  port = port || 1337;
  host = host || '0.0.0.0';

  var availabe = false
    , self = new EventEmitter()
    ;

  function check() {
    var client = net.connect(port, host);

    client.on('connect', function() {
      client.write(config.data);
      self.emit('connect');
    });

    client.on('data', function(data) {
      if (data.toString() === config.data) {
        availabe = true;
        self.emit('online', availabe);
      } else {
        availabe = false;
        self.emit('error');
      }
      client.end();
    });

    client.setTimeout(1000, function() {
      self.emit('timeout');
      availabe = false;
      client.end();
    });

    client.on('error', function() {
      availabe = false;
      self.emit('online', availabe);
    });

    client.on('end', function() {
      self.emit('end', availabe);
      console.log('client disconnected');
    });
  }

  self.check = check;

  return self;
};
