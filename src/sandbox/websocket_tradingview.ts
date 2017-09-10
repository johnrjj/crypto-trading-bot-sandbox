// var util=require('util')
var WebSocketClient = require('websocket').client;
var client = new WebSocketClient();
var conn = null;

var received = false;
client.on('connectFailed', function(error) {
  console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
  //console.log('WebSocket Client Connected');
  conn = connection;
  connection.on('error', function(error) {
    console.log('Connection Error: ' + error.toString());
  });
  connection.on('close', function() {
    //  console.log('echo-protocol Connection Closed');
  });
  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      if (message.utf8Data.indexOf('session_id') != -1) {
        requestData();
      }
      if (message.utf8Data.indexOf('m~~h~') != -1) {
        connection.sendUTF(message.utf8Data);
        /* if (received){
        var m7 = '~m~59~m~{"m":"request_more_data","p":["cs_A81hNsYTGtqz","s1",1000]}'
        connection.sendUTF(m7)
        received = false
      }
     */
      }
      try {
        var m = JSON.parse(message.utf8Data.split('~')[4]);
        ParsePayload(m);
        //console.log("Received: '" + util.inspect(m, showHidden=false, depth=8, colorize=true) + "'");
      } catch (err) {
        //console.log(message.utf8Data)
      }
    }
  });

  /*  setInterval(function(){ 
    console.log("request update")
    var m7 = '~m~59~m~{"m":"request_more_data","p":["cs_A81hNsYTGtqz","s1",1000]}'
    connection.sendUTF(m7)
  }, 10000)
*/
});

function ParsePayload(m) {
  /*{ m: 'timescale_update',
    p: 
      [ 'cs_A81hNsYTGtqz',
        { s1: 
          { node: 'wdc-charts-3-study-engine-12@wdc-compute-3',
            s: 
  */

  if (m.m == 'timescale_update') {
    received = true;
    console.log(JSON.stringify(m.p[1]));
    //console.log(util.inspect(conn))
    conn.close();
    //console.log(util.inspect(m.p[1], showHidden=false, depth=8, colorize=true))
    /* setTimeout(function(){ 
    console.log("request update")
      var m7 = '~m~59~m~{"m":"request_more_data","p":["cs_A81hNsYTGtqz","s1",1000]}'
      conn.sendUTF(m7)
    }, 3000)*/
  }
}
function requestData() {
  var connection = conn;
  if (connection.connected) {
    var m1 = '~m~55~m~{"m":"chart_create_session","p":["cs_A81hNsYTGtqz",""]}';
    var m2 =
      '~m~75~m~{"m":"resolve_symbol","p":["cs_A81hNsYTGtqz","symbol_1","BITSTAMP:BTCUSD"]}';
    // var m2 = '~m~75~m~{"m":"resolve_symbol","p":["cs_A81hNsYTGtqz","symbol_1","'+process.argv[2]+'"]}'
    var m3 =
      '~m~76~m~{"m":"create_series","p":["cs_A81hNsYTGtqz","s1","s1","symbol_1","5",10000]}';

    connection.sendUTF(m1);
    connection.sendUTF(m2);
    connection.sendUTF(m3);
    //connection.sendUTF(m4);
    //connection.sendUTF(m5);
    //connection.sendUTF(m6);
  }
}

client.onclose = function() {
  //console.log('echo-protocol Client Closed');
};

client.onmessage = function(e) {
  if (typeof e.data === 'string') {
    //console.log("boom")
    //console.log("Received: '" + e.data + "'");
  }
};

var headers = {
  'Sec-WebSocket-Key': 'lCZfvtZuZC3ASlLX7t+7yQ==',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36',
  Cookie:
    'km_lv=x; _ga=GA1.2.856664358.1459091561; sessionid=gccyu4w5jy1hs0980zioxu0vuah8l5pd; csrftoken=UURNqb9AHYXAVDNQ3DwV8t4k8U25kzIX; __utmt=1; kvcd=1472412832000; km_ai=pg.bareges%40gmail.com; km_ni=pg.bareges%40gmail.com; km_vs=1; km_uq=; tv_ecuid=30a52e60-1668-4130-b916-1afa19c6ff22; __utma=226258911.856664358.1459091561.1472400254.1472400254.37; __utmb=226258911.73.9.1472413248909; __utmc=226258911; __utmz=226258911.1467137410.2.2.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); __utmv=226258911.|4=design=old=1',
};
client.connect(
  'wss://data.tradingview.com/socket.io/websocket',
  null,
  'https://www.tradingview.com',
  headers
);
