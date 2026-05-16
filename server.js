const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname)));

// ------------------- قاعدة الأسئلة -------------------
const QUESTIONS = [
  { q: "ما نوع الفعل: قَالَ؟", opts: ["صحيح سالم","معتل أجوف","معتل ناقص","صحيح مهموز"], ans: 1 },
  { q: "ما نوع الفعل: رَمَى؟", opts: ["معتل مثال","معتل أجوف","معتل ناقص","صحيح مضعف"], ans: 2 },
  { q: "ما نوع الفعل: وَقَفَ؟", opts: ["معتل مثال","صحيح سالم","معتل أجوف","صحيح مهموز"], ans: 0 },
  { q: "ما نوع الفعل: سَأَلَ؟", opts: ["صحيح سالم","معتل مثال","صحيح مهموز","معتل ناقص"], ans: 2 },
  { q: "ما نوع الفعل: مَدَّ؟", opts: ["صحيح مضعف","معتل أجوف","صحيح سالم","معتل مثال"], ans: 0 },
  { q: "ما نوع الفعل: جَاءَ؟", opts: ["معتل ناقص","صحيح مهموز","معتل أجوف","لفيف مقرون"], ans: 3 },
  { q: "ما نوع الفعل: سَعَى؟", opts: ["معتل أجوف","معتل ناقص","صحيح سالم","معتل مثال"], ans: 1 },
  { q: "ما نوع الفعل: كَتَبَ؟", opts: ["صحيح سالم","معتل مثال","صحيح مضعف","معتل أجوف"], ans: 0 },
  { q: "ما نوع الفعل: بَاعَ؟", opts: ["معتل مثال","معتل أجوف","معتل ناقص","صحيح سالم"], ans: 1 },
  { q: "ما نوع الفعل: يَسَرَ؟", opts: ["معتل مثال","صحيح سالم","معتل أجوف","معتل ناقص"], ans: 0 },
  { q: "ما نوع الاسم: كِتَابٌ؟", opts: ["نكرة","معرفة","مضاف","علم"], ans: 0 },
  { q: "ما إعراب كلمة (محمدٌ) في: جاء محمدٌ؟", opts: ["مفعول به","فاعل","مبتدأ","خبر"], ans: 1 },
  { q: "ما إعراب (الطالبَ) في: رأيتُ الطالبَ؟", opts: ["فاعل","مفعول به","مبتدأ","خبر"], ans: 1 },
  { q: "ما علامة إعراب الاسم المثنى في حالة الرفع؟", opts: ["الواو والنون","الألف والنون","الياء والنون","الضمة"], ans: 1 },
  { q: "ما علامة نصب جمع المذكر السالم؟", opts: ["الفتحة","الكسرة","الياء","الألف"], ans: 2 },
  { q: "ما نوع الفعل: أَخَذَ؟", opts: ["صحيح مهموز","صحيح سالم","معتل مثال","معتل أجوف"], ans: 0 },
  { q: "ما نوع الفعل: فَازَ؟", opts: ["معتل مثال","صحيح سالم","معتل أجوف","معتل ناقص"], ans: 2 },
  { q: "ما نوع الفعل: ظَنَّ؟", opts: ["صحيح سالم","صحيح مضعف","معتل أجوف","معتل ناقص"], ans: 1 },
  { q: "أي الكلمات التالية اسم جنس؟", opts: ["أحمد","كتاب","شجر","مدرسة"], ans: 2 },
  { q: "ما المقصود بالفعل المعتل الأجوف؟", opts: ["وسطه حرف علة","آخره حرف علة","أوله حرف علة","فيه همزة"], ans: 0 },
  { q: "ما المقصود بالفعل المعتل الناقص؟", opts: ["وسطه حرف علة","آخره حرف علة","أوله حرف علة","مضعف"], ans: 1 },
  { q: "ما المقصود بالفعل المعتل المثال؟", opts: ["آخره علة","وسطه علة","أوله علة","فيه همزتان"], ans: 2 },
  { q: "ما نوع الفعل: وَعَدَ؟", opts: ["معتل أجوف","معتل ناقص","معتل مثال","صحيح سالم"], ans: 2 },
  { q: "ما علامة رفع الفعل المضارع؟", opts: ["السكون","الفتحة","الضمة","حذف النون"], ans: 2 },
  { q: "ما الحرف الناصب للفعل المضارع؟", opts: ["لَنْ","قَدْ","لَمْ","لامُ الأمر"], ans: 0 },
  { q: "ما الحرف الجازم للفعل المضارع؟", opts: ["أَنْ","لَنْ","لَمْ","كَيْ"], ans: 2 },
  { q: "ما نوع الكلمة: إنَّ؟", opts: ["فعل ناقص","حرف ناسخ","اسم","حرف جر"], ans: 1 },
  { q: "ما اسم (كانَ) في: كانَ الجوُّ صافياً؟", opts: ["الجوُّ","صافياً","كانَ","لا يوجد"], ans: 0 },
  { q: "ما خبر (إنَّ) في: إنَّ العلمَ نورٌ؟", opts: ["العلمَ","نورٌ","إنَّ","لا يوجد"], ans: 1 },
  { q: "ما نوع الجملة: الكتابُ مفيدٌ؟", opts: ["فعلية","اسمية","شرطية","وصفية"], ans: 1 },
  { q: "ما المبتدأ في: العلمُ نورٌ؟", opts: ["نورٌ","العلمُ","لا يوجد","كلاهما"], ans: 1 },
  { q: "ما علامة جر الاسم المفرد؟", opts: ["الفتحة","الضمة","الكسرة","السكون"], ans: 2 },
  { q: "ما نوع الفعل: قَرَأَ؟", opts: ["صحيح سالم","صحيح مهموز","معتل مثال","معتل ناقص"], ans: 1 },
  { q: "أيٌّ من التالي جمع مؤنث سالم؟", opts: ["مسلمون","معلمات","أقلام","كتب"], ans: 1 },
  { q: "ما إعراب (في) في: جلستُ في البيتِ؟", opts: ["فعل","اسم","حرف جر","أداة نصب"], ans: 2 },
];

function randomId(len = 6) {
  return Math.random().toString(36).substring(2, 2 + len).toUpperCase();
}

function getRandomQuestion() {
  return JSON.parse(JSON.stringify(QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]));
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function checkWin(board) {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const [a,b,c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return { winner: board[a], cells: [a,b,c] };
  }
  return null;
}

function isBoardFull(board) {
  return board.every(cell => cell !== null);
}

function buildRound(players) {
  const matches = [];
  for (let i = 0; i < players.length; i += 2) {
    const p1 = players[i];
    const p2 = players[i+1] || null;
    matches.push({
      id: randomId(8),
      player1: p1,
      player2: p2,
      winner: p2 ? null : p1,
      status: p2 ? 'pending' : 'finished',
      board: Array(9).fill(null),
      currentTurn: p1.id,
      question: getRandomQuestion(),
      p1Question: getRandomQuestion(),
      p2Question: getRandomQuestion(),
      p1HasRight: false,
      p2HasRight: false,
      p1Correct: 0,
      p2Correct: 0,
      drawCount: 0,
      events: [],
      winCells: [],
    });
  }
  return matches;
}

// ------------------- هيكل الغرف -------------------
const rooms = new Map(); // roomId -> { hostId, players, tournament }

function startTournament(roomId) {
  const room = rooms.get(roomId);
  if (!room) return false;
  const players = room.players.filter(p => p.role === 'player');
  if (players.length < 2) return false;
  room.tournament = {
    players: players,
    rounds: [],
    currentRound: 0,
    status: 'active',
    winner: null,
  };
  room.tournament.rounds.push({ matches: buildRound(players), roundNum: 1 });
  return true;
}

function nextRound(roomId) {
  const room = rooms.get(roomId);
  if (!room || !room.tournament || room.tournament.status !== 'active') return false;
  const currentRound = room.tournament.rounds[room.tournament.currentRound];
  if (!currentRound.matches.every(m => m.status === 'finished')) return false;
  const winners = currentRound.matches.map(m => m.winner).filter(w => w);
  if (winners.length === 1) {
    room.tournament.winner = winners[0];
    room.tournament.status = 'finished';
    return true;
  }
  room.tournament.currentRound++;
  room.tournament.rounds.push({ matches: buildRound(winners), roundNum: room.tournament.currentRound + 1 });
  return true;
}

function qualifyPlayer(roomId, matchId, playerId) {
  const room = rooms.get(roomId);
  if (!room || !room.tournament) return false;
  const round = room.tournament.rounds[room.tournament.currentRound];
  const match = round.matches.find(m => m.id === matchId);
  if (!match || match.status === 'finished') return false;
  const player = [match.player1, match.player2].find(p => p && p.id === playerId);
  if (!player) return false;
  match.winner = player;
  match.status = 'finished';
  match.events.push(`⚡ تأهل ${player.name} يدوياً`);
  return true;
}

function handleCellClick(roomId, matchId, cellIndex, playerId) {
  const room = rooms.get(roomId);
  if (!room || !room.tournament) return false;
  const round = room.tournament.rounds[room.tournament.currentRound];
  const match = round.matches.find(m => m.id === matchId);
  if (!match || match.status !== 'pending') return false;
  const isP1 = match.player1?.id === playerId;
  const isP2 = match.player2?.id === playerId;
  if (!isP1 && !isP2) return false;
  const symbol = isP1 ? 'X' : 'O';
  const hasRight = isP1 ? match.p1HasRight : match.p2HasRight;
  if (!hasRight) return false;
  if (match.currentTurn !== playerId) return false;
  if (match.board[cellIndex] !== null) return false;

  match.board[cellIndex] = symbol;
  if (isP1) match.p1HasRight = false;
  else match.p2HasRight = false;

  const win = checkWin(match.board);
  if (win) {
    match.winner = isP1 ? match.player1 : match.player2;
    match.status = 'finished';
    match.winCells = win.cells;
    match.events.push(`🏆 فاز ${match.winner.name}!`);
  } else if (isBoardFull(match.board)) {
    match.drawCount++;
    match.board = Array(9).fill(null);
    match.p1HasRight = false;
    match.p2HasRight = false;
    match.question = getRandomQuestion();
    match.p1Question = getRandomQuestion();
    match.p2Question = getRandomQuestion();
    match.currentTurn = match.player1.id;
    match.events.push('🤝 تعادل! إعادة المباراة');
  } else {
    match.currentTurn = isP1 ? (match.player2?.id || match.player1.id) : match.player1.id;
  }
  return true;
}

function handleAnswer(roomId, matchId, playerId, correct) {
  const room = rooms.get(roomId);
  if (!room || !room.tournament) return false;
  const round = room.tournament.rounds[room.tournament.currentRound];
  const match = round.matches.find(m => m.id === matchId);
  if (!match || match.status !== 'pending') return false;
  const isP1 = match.player1?.id === playerId;
  const isP2 = match.player2?.id === playerId;
  if (!isP1 && !isP2) return false;

  if (correct) {
    if (isP1) { match.p1HasRight = true; match.p1Correct++; match.p1Question = getRandomQuestion(); }
    else { match.p2HasRight = true; match.p2Correct++; match.p2Question = getRandomQuestion(); }
    match.events.push(`✅ ${isP1 ? match.player1.name : match.player2.name} أجاب صحيحاً`);
  } else {
    if (isP1) match.p1HasRight = false;
    else match.p2HasRight = false;
    match.events.push(`❌ ${isP1 ? match.player1.name : match.player2.name} أجاب خطأ`);
    if (isP1) match.p1Question = getRandomQuestion();
    else match.p2Question = getRandomQuestion();
  }
  return true;
}

// ------------------- Socket.IO -------------------
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('create-room', (player, callback) => {
    const roomId = randomId(6);
    rooms.set(roomId, { hostId: socket.id, players: [player], tournament: null });
    socket.join(roomId);
    callback({ roomId, isHost: true });
    io.to(roomId).emit('room-update', { tournament: null, players: [player] });
  });

  socket.on('join-room', ({ roomId, player }, callback) => {
    if (!rooms.has(roomId)) {
      callback({ success: false, error: 'الغرفة غير موجودة' });
      return;
    }
    const room = rooms.get(roomId);
    if (room.players.find(p => p.name === player.name)) player.name += `_${randomId(3)}`;
    room.players.push(player);
    socket.join(roomId);
    callback({ success: true, isHost: false });
    io.to(roomId).emit('player-joined', player);
    io.to(roomId).emit('room-update', { tournament: room.tournament, players: room.players });
  });

  socket.on('start-tournament', (roomId) => {
    const room = rooms.get(roomId);
    if (room && room.hostId === socket.id && startTournament(roomId))
      io.to(roomId).emit('tournament-started', room.tournament);
  });

  socket.on('next-round', (roomId) => {
    const room = rooms.get(roomId);
    if (room && room.hostId === socket.id && nextRound(roomId))
      io.to(roomId).emit('tournament-update', room.tournament);
  });

  socket.on('qualify-player', ({ roomId, matchId, playerId }) => {
    const room = rooms.get(roomId);
    if (room && room.hostId === socket.id && qualifyPlayer(roomId, matchId, playerId))
      io.to(roomId).emit('tournament-update', room.tournament);
  });

  socket.on('cell-click', ({ roomId, matchId, cellIndex }) => {
    if (handleCellClick(roomId, matchId, cellIndex, socket.id))
      io.to(roomId).emit('tournament-update', rooms.get(roomId).tournament);
  });

  socket.on('answer-submit', ({ roomId, matchId, correct }) => {
    if (handleAnswer(roomId, matchId, socket.id, correct))
      io.to(roomId).emit('tournament-update', rooms.get(roomId).tournament);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server ready at http://localhost:${PORT}`));
