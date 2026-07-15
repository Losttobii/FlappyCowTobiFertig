// ===== Flappy Cow - Teil 1 =====

// Canvas
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Menüs
const menu = document.getElementById("menu");
const gameOver = document.getElementById("gameOver");

const playBtn = document.getElementById("playBtn");
const restartBtn = document.getElementById("restartBtn");

// Größe
function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// Spielstatus
let running = false;
let score = 0;

// Kuh
const cow = {
    x:120,
    y:250,
    width:60,
    height:45,
    velocity:0,
    gravity:0.55,
    jump:-10
};

// Hochhäuser
let buildings = [];

// Highscore
let best = Number(localStorage.getItem("flappyCowBest")) || 0;
document.getElementById("best").textContent = best;

// Kuh zeichnen
function drawCow(){

    ctx.fillStyle="white";
    ctx.fillRect(cow.x,cow.y,cow.width,cow.height);

    ctx.fillStyle="black";

    ctx.fillRect(cow.x+8,cow.y+10,8,8);
    ctx.fillRect(cow.x+24,cow.y+28,6,6);
    ctx.fillRect(cow.x+44,cow.y+28,6,6);

    ctx.fillStyle="pink";

    ctx.fillRect(cow.x+18,cow.y+18,24,14);

}

// Springen
function jump(){

    if(!running) return;

    cow.velocity = cow.jump;

}

// Handy
canvas.addEventListener("touchstart",function(e){

    e.preventDefault();
    jump();

});

// PC
window.addEventListener("mousedown",jump);

window.addEventListener("keydown",function(e){

    if(e.code==="Space"){
        jump();
    }

});

// Spiel starten
frames = 0;
createClouds();
playBtn.onclick=function(){

    menu.style.display="none";
    gameOver.style.display="none";

    canvas.style.display="block";

    score=0;

    cow.y=250;
    cow.velocity=0;

    buildings=[];

    running=true;

    requestAnimationFrame(loop);

};

// Spielschleife
function loop() {
    if (!running) return;

    frames++;

    cow.velocity += cow.gravity;
    cow.y += cow.velocity;

    drawBackground();

    updateBuildings();
    drawBuildings();

    updateScore();
    drawCow();
    drawScore();

    collision();

    if (running) {
        requestAnimationFrame(loop);
    }
}
}

// ===== Teil 2 - Hochhäuser =====

// Neues Hochhaus erzeugen
function createBuilding(){

    const gap = Math.max(175, Math.min(240, canvas.height * 0.28));
    const width = 100;

    const topHeight =
        Math.random() * (canvas.height - 450) + 80;

    buildings.push({

        x: canvas.width,

        width: width,

        top: topHeight,

        bottom: topHeight + gap,

        passed: false

    });

}

// Alle Hochhäuser zeichnen
function drawBuildings(){

    ctx.fillStyle = "#777";

    for(let b of buildings){

        // oberes Hochhaus
        ctx.fillRect(
            b.x,
            0,
            b.width,
            b.top
        );

        // unteres Hochhaus
        ctx.fillRect(
            b.x,
            b.bottom,
            b.width,
            canvas.height - b.bottom - 80
        );

        // Fenster
        ctx.fillStyle = "#ffe95b";

        for(let y=20;y<b.top;y+=35){

            for(let x=10;x<b.width-10;x+=22){

                ctx.fillRect(
                    b.x+x,
                    y,
                    10,
                    15
                );

            }

        }

        for(let y=b.bottom+20;y<canvas.height-100;y+=35){

            for(let x=10;x<b.width-10;x+=22){

                ctx.fillRect(
                    b.x+x,
                    y,
                    10,
                    15
                );

            }

        }

        ctx.fillStyle="#777";

    }

}

// Bewegung
function updateBuildings(){

    if(frames % 120 === 0){

        createBuilding();

    }

    for(let i=0;i<buildings.length;i++){

        buildings[i].x -= 4;

    }

    // löschen
    if(buildings.length>0){

        if(buildings[0].x + buildings[0].width < 0){

            buildings.shift();

        }

    }

}

// Kollision
function collision(){

    // Boden
    if(cow.y + cow.height > canvas.height-80){

        endGame();

        return;

    }

    for(let b of buildings){

        if(

            cow.x + cow.width > b.x &&

            cow.x < b.x + b.width &&

            (

                cow.y < b.top ||

                cow.y + cow.height > b.bottom

            )

        ){

            endGame();

        }

    }

}

// Frames zählen
let frames = 0;

// ===== Teil 3 - Score & Highscore =====

// Punkte zählen
function updateScore(){

    for(let b of buildings){

        if(!b.passed && b.x + b.width < cow.x){

            b.passed = true;

            score++;

            // Highscore
            if(score > best){

                best = score;

                localStorage.setItem("flappyCowBest", best);

                document.getElementById("best").textContent = best;

            }

        }

    }

}

// Spiel beenden
function endGame(){

    running = false;

    gameOver.style.display = "block";

    document.getElementById("score").textContent = score;

}

// Neustart
restartBtn.onclick = function(){

    gameOver.style.display = "none";

    canvas.style.display = "block";

    score = 0;

    cow.y = 250;
    cow.velocity = 0;

    buildings = [];

    frames = 0;

    running = true;

    requestAnimationFrame(loop);

};

// Aktuellen Score anzeigen
function drawScore(){

    ctx.fillStyle = "white";
    ctx.font = "bold 50px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        score,
        canvas.width / 2,
        70
    );

}

// ===== Teil 4 – Grafik, Wolken und Sounds =====

// Soundeffekte werden direkt im Browser erzeugt.
// Es werden keine zusätzlichen Sounddateien benötigt.
const audioContext = new (
    window.AudioContext ||
    window.webkitAudioContext
)();

function playSound(frequency, duration, type = "sine") {
    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const volume = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    volume.gain.setValueAtTime(0.15, audioContext.currentTime);
    volume.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + duration
    );

    oscillator.connect(volume);
    volume.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
}

function playJumpSound() {
    playSound(450, 0.12, "square");
}

function playPointSound() {
    playSound(850, 0.18, "sine");
}

function playGameOverSound() {
    playSound(180, 0.5, "sawtooth");
}


// Wolken
const clouds = [];

function createClouds() {
    clouds.length = 0;

    for (let i = 0; i < 7; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: 40 + Math.random() * canvas.height * 0.45,
            size: 30 + Math.random() * 45,
            speed: 0.2 + Math.random() * 0.5
        });
    }
}

createClouds();

function updateClouds() {
    for (const cloud of clouds) {
        cloud.x -= cloud.speed;

        if (cloud.x + cloud.size * 3 < 0) {
            cloud.x = canvas.width + cloud.size;
            cloud.y = 40 + Math.random() * canvas.height * 0.45;
        }
    }
}

function drawClouds() {
    ctx.fillStyle = "rgba(255,255,255,0.85)";

    for (const cloud of clouds) {
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
        ctx.arc(
            cloud.x + cloud.size,
            cloud.y - cloud.size * 0.3,
            cloud.size * 0.8,
            0,
            Math.PI * 2
        );
        ctx.arc(
            cloud.x + cloud.size * 1.8,
            cloud.y,
            cloud.size * 0.9,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}


// Schönere Kuh
function drawCow() {
frames++;

updateBuildings();

drawBuildings();

collision();
updateScore();
drawScore();
    ctx.save();

    const rotation = Math.max(
        -0.35,
        Math.min(0.5, cow.velocity * 0.035)
    );

    ctx.translate(
        cow.x + cow.width / 2,
        cow.y + cow.height / 2
    );

    ctx.rotate(rotation);

    ctx.translate(
        -cow.width / 2,
        -cow.height / 2
    );

    // Körper
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#222222";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.roundRect(4, 7, 48, 33, 12);
    ctx.fill();
    ctx.stroke();

    // Kopf
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(40, 10, 22, 25, 8);
    ctx.fill();
    ctx.stroke();

    // Schwarze Flecken
    ctx.fillStyle = "#202020";

    ctx.beginPath();
    ctx.ellipse(20, 18, 8, 7, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(37, 31, 7, 5, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Schnauze
    ctx.fillStyle = "#ffb6c8";
    ctx.beginPath();
    ctx.roundRect(45, 23, 16, 10, 5);
    ctx.fill();

    // Nase
    ctx.fillStyle = "#333333";
    ctx.beginPath();
    ctx.arc(50, 28, 1.5, 0, Math.PI * 2);
    ctx.arc(56, 28, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Auge
    ctx.fillStyle = "#111111";
    ctx.beginPath();
    ctx.arc(54, 17, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Hörner
    ctx.fillStyle = "#e8c878";

    ctx.beginPath();
    ctx.moveTo(44, 11);
    ctx.lineTo(42, 2);
    ctx.lineTo(49, 10);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(57, 11);
    ctx.lineTo(61, 3);
    ctx.lineTo(61, 13);
    ctx.fill();

    // Beine
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(12, 37, 7, 10);
    ctx.fillRect(38, 37, 7, 10);

    ctx.fillStyle = "#222222";
    ctx.fillRect(12, 44, 7, 4);
    ctx.fillRect(38, 44, 7, 4);

    // Schwanz
    ctx.strokeStyle = "#222222";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(5, 18);
    ctx.quadraticCurveTo(-8, 10, -3, 3);
    ctx.stroke();

    ctx.restore();
}


// Überschreibt die Sprungfunktion aus Teil 1
jump = function () {
    if (!running) return;

    cow.velocity = cow.jump;
    playJumpSound();
};


// Überschreibt Punktefunktion aus Teil 3
updateScore = function () {
    for (const building of buildings) {
        if (
            !building.passed &&
            building.x + building.width < cow.x
        ) {
            building.passed = true;
            score++;

            playPointSound();

            if (score > best) {
                best = score;
                localStorage.setItem("flappyCowBest", best);
                document.getElementById("best").textContent = best;
            }
        }
    }
};


// Überschreibt Game Over aus Teil 3
endGame = function () {
    if (!running) return;

    running = false;
    playGameOverSound();

    document.getElementById("score").textContent = score;
    gameOver.style.display = "block";
};


// Neues vollständiges Spiel-Rendering
function drawBackground() {
    const sky = ctx.createLinearGradient(
        0,
        0,
        0,
        canvas.height
    );

    sky.addColorStop(0, "#61c8ff");
    sky.addColorStop(1, "#d9f5ff");

    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    updateClouds();
    drawClouds();

    // Boden
    ctx.fillStyle = "#60b848";
    ctx.fillRect(
        0,
        canvas.height - 80,
        canvas.width,
        80
    );

    // Straße
    ctx.fillStyle = "#555555";
    ctx.fillRect(
        0,
        canvas.height - 55,
        canvas.width,
        55
    );

    ctx.fillStyle = "#f5e663";

    for (let x = 0; x < canvas.width; x += 90) {
        ctx.fillRect(
            x,
            canvas.height - 31,
            45,
            5
        );
    }
}
requestAnimationFrame(loop)