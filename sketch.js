let sprites = {
  // 第一個角色的精靈圖
  player1: {
    idle: {
      img: null,
      width: 57,
      height: 40,
      frames: 11
    },
    walk: {
      img: null,
      width: 45,
      height: 47,
      frames: 14
    },
    jump: {
      img: null,
      width: 33,
      height: 21,
      frames: 13
    }
  },
  // 第二個角色的精靈圖
  player2: {
    idle: {
      img: null,
      width: 34,
      height: 28,
      frames: 20
    },
    walk: {
      img: null,
      width: 63,
      height: 38,
      frames: 9
    },
    jump: {
      img: null,
      width: 56,
      height: 37,
      frames: 8
    }
  },
  explosion: {  //爆炸圖
    img: null,
    width: 101,
    height: 89,
    frames: 7
  },
  bullet: {  //發射子彈
    img: null,
    width: 110,
    height: 98,
    frames: 6
  }
};

let player1 = {
  x: 100,
  y: 200,
  speedX: 5,
  speedY: 0,
  gravity: 0.8,
  jumpForce: -15,
  isJumping: false,
  groundY: 300,
  currentFrame: 0,
  currentAction: 'idle',
  direction: 1,
  bullets: [],
  health: 5, // 生命值
  maxHealth: 5  // 最大生命值（5顆心）
};

let player2 = {
  x: 800,
  y: 200,
  speedX: 5,
  speedY: 0,
  gravity: 0.8,
  jumpForce: -15,
  isJumping: false,
  groundY: 300,
  currentFrame: 0,
  currentAction: 'idle',
  direction: -1,
  bullets: [],
  health: 5, // 生命值
  maxHealth: 5  // 最大生命值（5顆心）
};

let backgroundImg;
let heartImg;

function preload() {
  // 載入背景圖片
  backgroundImg = loadImage('background.webp');  // 請確保你有 background.png 檔案
  heartImg = loadImage('heart.jpg');  // 請確保你有 heart.png 檔案
  
  // 確保正確載入兩個角色的所有動作圖片
  sprites.player1.idle.img = loadImage('stand_1.png');
  sprites.player1.walk.img = loadImage('run_1.png');
  sprites.player1.jump.img = loadImage('attack_1.png');
  
  // 確保 player2 的圖片路徑正確
  sprites.player2.idle.img = loadImage('stand_2.png');
  sprites.player2.walk.img = loadImage('run_2.png');
  sprites.player2.jump.img = loadImage('attack_2.png');
  
  sprites.explosion.img = loadImage('explosion.png');
  sprites.bullet.img = loadImage('bullet.png');
}

function setup() {
createCanvas(windowWidth, windowHeight);
frameRate(15); // 設定動畫速度
}

function draw() {
  // 繪製背景
  image(backgroundImg, 0, 0, width, height);
  
  // 更新兩個角色的物理
  updatePhysics(player1);
  updatePhysics(player2);
  
  // 更新和繪製子彈
  updateBullets(player1);
  updateBullets(player2);
  
  // 確保兩個角色都被繪製
  drawCharacter(player1, sprites.player1);
  drawCharacter(player2, sprites.player2);
  
  // 繪製生命值
  drawHealth(player1, 10, 10);  // 玩家1的生命值在左上角
  drawHealth(player2, width - 150, 10);  // 玩家2的生命值在右上角
  
  // 移除地面參考線
  // stroke(0);
  // line(0, player1.groundY + sprites.player1[player1.currentAction].height, 
  //      width, player1.groundY + sprites.player1[player1.currentAction].height);
  
  checkKeys();
  
  // 添加 TKUET 文字
  textSize(50);
  textAlign(CENTER);
  fill(255);  // 白色文字
  stroke(0);  // 黑色邊框
  strokeWeight(2);
  text("TKUET", width/2, height - 30);  // 在底部置中顯示
  strokeWeight(1);  // 重設線條寬度
  
  checkGameOver();
}

function updatePhysics(character) {
// 應用重力
if (character.y < character.groundY) {
  character.speedY += character.gravity;
  character.isJumping = true;
}

// 更新垂直位置
character.y += character.speedY;

// 檢查是否著地
if (character.y >= character.groundY) {
  character.y = character.groundY;
  character.speedY = 0;
  character.isJumping = false;
}
}

function drawCharacter(player, spriteSet) {
  // 確保精靈圖存在
  let currentSprite = spriteSet[player.currentAction];
  if (!currentSprite || !currentSprite.img) {
    console.log('Sprite not loaded:', player.currentAction);
    return;
  }
  
  // 更新當前幀
  player.currentFrame = (player.currentFrame + 1) % currentSprite.frames;
  
  // 計算精靈圖的位置
  let sx = player.currentFrame * currentSprite.width;
  
  push();
  if (player.direction === -1) {
    translate(player.x + currentSprite.width, player.y);
    scale(-1, 1);
  } else {
    translate(player.x, player.y);
  }
  
  // 繪製精靈圖
  image(currentSprite.img, 
    0, 0,
    currentSprite.width, currentSprite.height,
    sx, 0,
    currentSprite.width, currentSprite.height
  );
  pop();
}

function checkKeys() {
  // 玩家一的控制 (方向鍵)
  if (keyIsDown(RIGHT_ARROW)) {
    player1.x += player1.speedX;
    player1.currentAction = 'walk';
    player1.direction = 1;
  } else if (keyIsDown(LEFT_ARROW)) {
    player1.x -= player1.speedX;
    player1.currentAction = 'walk';
    player1.direction = -1;
  } else if (!player1.isJumping) {
    player1.currentAction = 'idle';
  }

  // 玩家一跳躍控制 (上下方向鍵或空白鍵)
  if ((keyIsDown(UP_ARROW) || keyIsDown(32)) && !player1.isJumping) {
    player1.speedY = player1.jumpForce;
    player1.currentAction = 'jump';
    player1.isJumping = true;
  } else if (keyIsDown(DOWN_ARROW)) {  // 新增：下方向鍵
    player1.y += player1.speedX;
    if (player1.y > player1.groundY) {
      player1.y = player1.groundY;
    }
  }

  // 玩家二的控制 (WASD)
  if (keyIsDown(68)) { // D鍵
    player2.x += player2.speedX;
    player2.currentAction = 'walk';
    player2.direction = 1;
  } else if (keyIsDown(65)) { // A鍵
    player2.x -= player2.speedX;
    player2.currentAction = 'walk';
    player2.direction = -1;
  } else if (!player2.isJumping) {
    player2.currentAction = 'idle';
  }

  // 玩家二跳躍控制 (W和S鍵)
  if (keyIsDown(87) && !player2.isJumping) { // W鍵
    player2.speedY = player2.jumpForce;
    player2.currentAction = 'jump';
    player2.isJumping = true;
  } else if (keyIsDown(83)) {  // 新增：S鍵
    player2.y += player2.speedX;
    if (player2.y > player2.groundY) {
      player2.y = player2.groundY;
    }
  }

  // 如果正在跳躍中，保持跳躍動作
  if (player1.isJumping) {
    player1.currentAction = 'jump';
  }
  if (player2.isJumping) {
    player2.currentAction = 'jump';
  }

  // 添加發射子彈的控制
  // 玩家一用 ENTER 鍵發射
  if (keyIsDown(ENTER)) {
    shoot(player1);
  }
  
  // 玩家二用 SHIFT 鍵發射
  if (keyIsDown(SHIFT)) {
    shoot(player2);
  }
}

// 添加發射子彈函數
function shoot(player) {
  if (player.bullets.length < 3) {
    let playerWidth = sprites[player === player1 ? 'player1' : 'player2'].idle.width;
    
    let bullet = {
      x: player.x + (player.direction === 1 ? playerWidth : 0),
      y: player.y + playerWidth/2,
      speed: 10 * player.direction,
      isExploding: false,
      currentFrame: 0,
      explosionFrame: 0
    };
    
    player.bullets.push(bullet);
    player.currentAction = 'jump';
    
    setTimeout(() => {
      if (!player.isJumping && player.currentAction === 'jump') {
        player.currentAction = 'idle';
      }
    }, 500);
  }
}

// 添加子彈更新和繪製函數
function updateBullets(player) {
  let otherPlayer = player === player1 ? player2 : player1;
  
  for (let i = player.bullets.length - 1; i >= 0; i--) {
    let bullet = player.bullets[i];
    
    if (bullet.isExploding) {
      // 繪製爆炸動畫
      image(sprites.explosion.img,
        bullet.x - sprites.explosion.width/2, // 調整爆炸位置置中
        bullet.y - sprites.explosion.height/2,
        sprites.explosion.width,
        sprites.explosion.height,
        bullet.explosionFrame * sprites.explosion.width,
        0,
        sprites.explosion.width,
        sprites.explosion.height
      );
      
      bullet.explosionFrame++;
      if (bullet.explosionFrame >= sprites.explosion.frames) {
        player.bullets.splice(i, 1);
      }
    } else {
      // 更新子彈位置
      bullet.x += bullet.speed;
      
      // 檢查子彈是否擊中對手
      if (checkBulletHit(bullet, otherPlayer)) {
        // 觸發爆炸效果
        bullet.isExploding = true;
        bullet.explosionFrame = 0;
        // 將爆炸位置調整到碰撞點
        bullet.x = otherPlayer.x + sprites[otherPlayer === player1 ? 'player1' : 'player2'][otherPlayer.currentAction].width/2;
        bullet.y = otherPlayer.y + sprites[otherPlayer === player1 ? 'player1' : 'player2'][otherPlayer.currentAction].height/2;
        // 減少一顆心的生命值
        otherPlayer.health = Math.max(0, otherPlayer.health - 1);
        continue;
      }
      
      // 繪製子彈
      image(sprites.bullet.img,
        bullet.x, bullet.y,
        sprites.bullet.width, sprites.bullet.height,
        bullet.currentFrame * sprites.bullet.width, 0,
        sprites.bullet.width, sprites.bullet.height
      );
      
      bullet.currentFrame = (bullet.currentFrame + 1) % sprites.bullet.frames;
      
      // 檢查是否超出畫面
      if (bullet.x < 0 || bullet.x > width) {
        player.bullets.splice(i, 1);
      }
    }
  }
}

// 更新碰撞檢測函數，使其更精確
function checkBulletHit(bullet, player) {
  let playerSprite = sprites[player === player1 ? 'player1' : 'player2'][player.currentAction];
  
  // 縮小碰撞箱以使碰撞更精確
  let bulletBox = {
    x: bullet.x + sprites.bullet.width * 0.25,
    y: bullet.y + sprites.bullet.height * 0.25,
    width: sprites.bullet.width * 0.5,
    height: sprites.bullet.height * 0.5
  };
  
  let playerBox = {
    x: player.x + playerSprite.width * 0.25,
    y: player.y + playerSprite.height * 0.25,
    width: playerSprite.width * 0.5,
    height: playerSprite.height * 0.5
  };
  
  return bulletBox.x < playerBox.x + playerBox.width &&
         bulletBox.x + bulletBox.width > playerBox.x &&
         bulletBox.y < playerBox.y + playerBox.height &&
         bulletBox.y + bulletBox.height > playerBox.y;
} 

// 添加繪製生命值的函數
function drawHealth(player, x, y) {
  for (let i = 0; i < player.maxHealth; i++) {
    if (i < player.health) {
      // 繪製完整的心
      tint(255, 255, 255);
    } else {
      // 繪製空心（灰色）
      tint(128, 128, 128);
    }
    image(heartImg, x + i * 30, y, 25, 25);
  }
  noTint();
}

// 添加遊戲結束檢查
function checkGameOver() {
  if (player1.health <= 0 || player2.health <= 0) {
    textSize(50);
    textAlign(CENTER, CENTER);
    fill(255, 0, 0);
    if (player1.health <= 0) {
      text("Player 2 Wins!", width/2, height/2);
    } else {
      text("Player 1 Wins!", width/2, height/2);
    }
    noLoop(); // 停止遊戲
  }
} 
