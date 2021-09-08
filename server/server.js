// npm i express
const express = require("express");
const path = require("path");

// npm i mysql
const mysql = require("mysql");

const app = express();

const http = require("http").createServer(app);

// npm i cors
const cors = require("cors");

// npm i ip
const ip = require("ip");

const socketIo = require("socket.io");

http.listen(8090, () => {});

app.use(cors());

const io = socketIo(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const regIp = ip.address();

const db = mysql.createPool({
  host: "localhost",
  user: "dureotkd",
  password: "slsksh33",
  database: "duo",
});

io.on("connection", (socket) => {
  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });

  socket.on(
    "sendChatMsg",
    ({ loginUserSeq, roomSeq, msg, nickname, lastSeq }) => {
      const sql = `INSERT INTO duo.duoChat VALUES('','${loginUserSeq}','${roomSeq}','${msg}','',NOW(),'${regIp}','','','Y')`;
      db.query(sql, (err, data) => {});
      const sendMsgObj = {
        seq: lastSeq + 1,
        userSeq: loginUserSeq,
        roomSeq,
        msg,
        nickname,
      };
      io.emit("sendChatMsg", { sendMsgObj });
    }
  );
  // // User Attend Chat Room
  // socket.on("attendRoom", ({ loginUser, room }) => {
  //   const sql = `INSERT INTO duo.test VALUES('','${room.title}')`;
  //   db.query(sql, (err, data) => {
  //     console.log(data);
  //   });
  // });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.htmll");
});

app.get("/getSummoner", (req, res) => {
  const id = req.query.id;

  const sql = `
  SELECT 
    a.seq , a.nickname , b.tier AS privateTier , c.tier AS teamTier ,
    b.rank AS privateRnk , c.rank AS teamRank , 
    b.win , b.lose , b.point , c.win AS teamWin , c.lose AS teamLose
  FROM 
  duo.user a, duo.summonerprivate b, duo.summonerteam c
  WHERE
  a.seq = b.userSeq
  AND 
  a.seq = c.userSeq
  AND 
  a.loginId = '${id}'`;

  db.query(sql, (err, data) => {
    if (!err) res.send(data[0]);
    else res.send(err);
  });
});

app.get("/saveSummonerLeagueTeam", (req, res) => {
  const tier = req.query?.tier;
  const rank = req.query?.rank;
  const summonerName = req.query.summonerName;
  const leaguePoints = req.query.leaguePoints;
  const wins = req.query.wins;
  const losses = req.query.losses;
  const loginUserSeq = req.query.insertId;
  const regIp = ip.address();

  const sql = `INSERT INTO duo.summonerTeam VALUES('','${summonerName}','${loginUserSeq}','${tier}','${rank}','${leaguePoints}','${wins}','${losses}',NOW(),'${regIp}','','','Y')`;

  db.query(sql, (err, data) => {
    if (!err) res.send(data);
    else res.send(err);
  });
});

app.get("/saveSummonerLeaguePrivate", (req, res) => {
  const tier = req.query?.tier;
  const rank = req.query?.rank;
  const summonerName = req.query.summonerName;
  const leaguePoints = req.query.leaguePoints;
  const wins = req.query.wins;
  const losses = req.query.losses;
  const loginUserSeq = req.query.insertId;
  const sql = `INSERT INTO duo.summonerPrivate VALUES('','${summonerName}','${loginUserSeq}','${tier}','${rank}','${leaguePoints}','${wins}','${losses}',NOW(),'${regIp}','','','Y')`;

  db.query(sql, (err, data) => {
    if (!err) res.send(data);
    else res.send(err);
  });
});

app.get("/getSummonerData", (req, res) => {
  const summonerName = req.query.summonerName;
  const regIp = ip.address();
  const sql = `SELECT * FROM duo.summonerPrivate a WHERE a.name = '${summonerName}' `;

  db.query(sql, (err, data) => {
    if (!err) res.send(data[0]);
    else res.send(err);
  });
});

app.post("/getUserId", (req, res) => {
  const loginId = req.query.loginId;
  const loginPw = req.query.loginPw;
  const sql = `SELECT * FROM user a WHERE a.loginId = '${loginId}' AND a.loginPw = '${loginPw}' LIMIT 1`;

  db.query(sql, (err, data) => {
    if (!err) res.send(data[0]);
    else res.send(err);
  });
});

app.post("/getOnlyUserId", (req, res) => {
  const userId = req.query.id;
  const sql = `SELECT * FROM duo.user a WHERE a.loginId = '${userId}' LIMIT 1`;
  db.query(sql, (err, data) => {
    if (!err) res.send(data[0]);
    else res.send(err);
  });
});

app.get("/getInsertRoom", (req, res) => {
  const insertSeq = req.query.insertSeq;
  const sql = `SELECT * FROM duo.duoRoom a WHERE a.seq = '${insertSeq}' `;

  db.query(sql, (err, data) => {
    if (!err) res.send(data[0]);
    else res.send(err);
  });
});

app.get("/getDuoRoom", (req, res) => {
  const sql = `SELECT * FROM duo.duoRoom ORDER BY regDate DESC`;

  db.query(sql, (err, data) => {
    if (!err) res.send(data);
    else res.send(err);
  });
});

app.post("/getDoJoin", (req, res) => {
  const id = req.query.loginId;
  const pw = req.query.loginPw;
  const regIp = ip.address();
  const sql = `INSERT INTO duo.user VALUES('','${id}','${pw}','','','','','','','','Y',NOW(),'${regIp}','','')`;

  db.query(sql, (err, data) => {
    if (!err) res.send(data);
    else res.send(err);
  });
});

app.post("/createDuoRoom", (req, res) => {
  const title = req.query.title;
  const rankType = req.query.rankType;
  const roomPerson = req.query.roomPerson;
  const myPosition = req.query.myPosition;
  const gameStyle = req.query.gameStyle;
  const loginUserSeq = req.query.loginUserSeq;
  const wantedPosition = req.query.wantedPosition;
  const sql = `INSERT INTO duo.duoRoom VALUES('','${title}','${loginUserSeq}','','${loginUserSeq}/','${myPosition}/','${wantedPosition}/','${roomPerson}','${gameStyle}','${rankType}',NOW(),'Y')`;

  db.query(sql, (err, data) => {
    if (!err) res.send(data);
    else res.send(err);
  });
});

app.post("/createUserToken", (req, res) => {
  const userSeq = req.query.userSeq;
  const regIp = ip.address();
  const sql = `INSERT INTO duo.userToken VALUES('','${userSeq}','','','','Y',NOW(),'${regIp}','','')`;

  db.query(sql, (err, data) => {
    if (!err) res.send(data);
    else res.send(err);
  });
});

app.get("/getRoomDetail", (req, res) => {
  const roomSeq = req.query.roomSeq;
  const sql = `SELECT * FROM duo.duoRoom a WHERE a.seq= ${roomSeq} AND a.state = 'Y' LIMIT 1`;

  db.query(sql, (err, data) => {
    if (!err) res.send(data[0]);
    else res.send(err);
  });
});

app.get("/getDuoChat", (req, res) => {
  const roomSeq = req.query.roomSeq;
  const sql = `SELECT * FROM duo.duoChat a WHERE a.roomSeq = ${roomSeq} AND a.state = 'Y' LIMIT 1`;

  db.query(sql, (err, data) => {
    if (!err) res.send(data[0]);
    else res.send(err);
  });
});

app.get("/getMyAttendRoom", (req, res) => {
  const loginUserSeq = req.query.loginUserSeq;
  const sql = `SELECT * FROM duo.duoRoom a WHERE a.attendUserSeq LIKE '%${loginUserSeq}/%' `;

  db.query(sql, (err, data) => {
    if (!err) res.send(data);
    else res.send(err);
  });
});

app.get("/getAttendUser", (req, res) => {
  const attendUserSeq = req.query.attendUserSeq;

  const sql = `SELECT * FROM duo.user a WHERE a.seq = '${attendUserSeq}' AND a.state = 'Y'`;

  db.query(sql, (err, data) => {
    if (!err) res.send(data[0]);
    else res.send(err);
  });
});

app.post("/updateAttendUser", (req, res) => {
  const attendUserSeq = req.query.updateSeq;
  const roomSeq = req.query.roomSeq;

  const sql = `UPDATE duo.duoRoom SET attendUserSeq = '${attendUserSeq}' WHERE seq='${roomSeq}' `;

  db.query(sql, (err, data) => {
    if (!err) res.send(data);
    else res.send(err);
  });
});

app.post("/updateAttendPosition", (req, res) => {
  const updatePosition = req.query.updatePosition;
  const roomSeq = req.query.roomSeq;

  const sql = `UPDATE duo.duoRoom SET attendPosition = '${updatePosition}' WHERE seq='${roomSeq}' `;

  db.query(sql, (err, data) => {
    if (!err) res.send(data);
    else res.send(err);
  });
});

app.get("/createUser", (req, res) => {
  const id = req.query.summonerId;
  const level = req.query.summonerLevel;
  const nickname = req.query.nickname;
  const sql = `INSERT INTO duo.user VALUES('','${id}','','${nickname}','','','','','','','${level}','Y',NOW(),'${regIp}','','')`;

  db.query(sql, (err, data) => {
    if (!err) res.send(data);
    else res.send(err);
  });
});

/*
    {
        "leagueId": "2463331a-b1a5-4487-9fbb-c28cd27017df",
        "queueType": "RANKED_FLEX_SR",
        "tier": "SILVER",
        "rank": "II",
        "summonerId": "ApSZ413vUp1Rn4LxnZK677m-11gbASIy5tu2nO5u9Ecb8A",
        "summonerName": "피터파커",
        "leaguePoints": 81,
        "wins": 21,
        "losses": 13,
        "veteran": false,
        "inactive": false,
        "freshBlood": false,
        "hotStreak": false
    },
    {
        "leagueId": "0086ecb5-068b-464f-af58-400c8e5a8599",
        "queueType": "RANKED_SOLO_5x5",
        "tier": "PLATINUM",
        "rank": "IV",
        "summonerId": "ApSZ413vUp1Rn4LxnZK677m-11gbASIy5tu2nO5u9Ecb8A",
        "summonerName": "피터파커",
        "leaguePoints": 0,
        "wins": 405,
        "losses": 381,
        "veteran": false,
        "inactive": false,
        "freshBlood": false,
        "hotStreak": false
    }

*/
app.get("/createSummoner", (req, res) => {
  const rankType = req.query;
});

app.get("/getChatMsgAll", (req, res) => {
  const roomSeq = req.query.roomSeq;
  const sql = `
    SELECT 
      a.seq , a.msg , a.regDate , b.nickname , b.seq as userSeq  , 
      b.loginId
    FROM 
      duo.duoChat a , 
      duo.user b
    WHERE 
      a.userSeq = b.seq
    AND
      a.roomSeq = '${roomSeq}'
     `;

  db.query(sql, (err, data) => {
    if (!err) res.send(data);
    else res.send(err);
  });
});
