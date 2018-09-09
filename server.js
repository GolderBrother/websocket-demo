var app = require('express')();
//将express实例放到http服务器中
var server = require('http').Server(app);
//将express服务器添加到socket中监听
var io = require('socket.io')(server);

server.listen(8081);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});


// io.on('connection', function (socket) {
//   socket.emit('news', { hello: 'world' });
//   socket.on('my other event', function (data) {
//     console.log(data);
//   });
// });


// 用来存放当前socket 连接数
let aSock = [];
// 每当监听到客户端有新的连接，就增加一个socket
io.on('connection', sock => {
  aSock.push(sock);
  sockIndex = aSock.length;
  //断开连接 删除socket
  sock.on('disconnect', () => {
    let n = aSock.indexOf(sock);
    if (n != -1) {
      aSock.splice(n, 1);
    }
  });
  // 接收信息并返回
  sock.on('msg', str => {
    let sockIndex = 0;
    aSock.forEach((s,i) => {
      let selfSock = false;
      //发送方的sock不需要发给自己,只要发给别人
      if (s != sock) {
        selfSock = false;
      }else{
        sockIndex = i + 1;
        selfSock = true;
      }
      s.emit('msg', {index:sockIndex,content:str,online:aSock.length,selfSock:selfSock});
    });
  });
});

// 计时器获取连接数
setInterval(function () {
  console.log(aSock.length);
  aSock.forEach(s => {
    s.emit('online', {online:aSock.length});
  });
}, 500);