const canvasBase = document.getElementById("canvas");
const canvas = canvasBase.getContext("2d");
canvas.font = "600 40px Arial";

const startScene = document.getElementById("startScene");
const difficultyText = document.getElementById("difficultyText");
const stageLoaderScene = document.getElementById("stageLoaderScene");
const stageLoaderText = document.getElementById("stageLoaderText");
const gameScene = document.getElementById("gameScene");
const endScene = document.getElementById("endScene");
const endText = document.getElementById("endText");

document.getElementById("startButton").onclick = NextStage;
document.getElementById("restartButton").onclick = ShowStart;

const difficulties = [
    document.getElementById("difficulty-0"),
    document.getElementById("difficulty-1"),
    document.getElementById("difficulty-2")
]

let BULL_COUNT;
let PLAYER_SPEED;
let BULL_SPEED;
let bullImage = new Image();
bullImage.src = "game/bull.png";
let DODGES_TO_WIN;
const WPH = 1.5;

let player;
let bulls;
let keys = {};
let running = false;
let lastTime = 0;
let dodges;
let stage = 0;
let difficulty = 1;

function OnResize() {
    const gameWindow = document.getElementsByClassName("game")[0];
    const width = gameWindow.clientWidth;

    gameWindow.style.height = (width / WPH) + "px";

    canvasBase.width = width;
    canvasBase.height = width / WPH;
}

window.addEventListener('resize', OnResize);

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function ShowStart() {
    startScene.classList.add("active");
    stageLoaderScene.classList.remove("active");
    gameScene.classList.remove("active");
    endScene.classList.remove("active");
    running = false;
    stage = 0;
}
function NextStage() {
    if(stage == 5)
        ShowEnd("Nyertél!");

    startScene.classList.remove("active");
    stageLoaderScene.classList.add("active");
    gameScene.classList.remove("active");
    endScene.classList.remove("active");
    stage += 1;
    stageLoaderText.innerText = `${stage}. Szint`;
    running = false;

    BULL_COUNT = [
        2,
        2,
        3,
        3,
        3
    ][stage - 1] - 1 + difficulty;
    PLAYER_SPEED = [
        0.4,
        0.4,
        0.35,
        0.3,
        0.3
    ][stage - 1];
    BULL_SPEED = [
        0.65,
        0.7,
        0.7,
        0.7,
        0.75
    ][stage - 1];
    DODGES_TO_WIN = [
        10,
        10,
        15,
        20,
        30
    ][stage - 1];
    //DODGES_TO_WIN = 100000;

    setTimeout(StartGame, 1000);
}
function StartGame() {
    startScene.classList.remove("active");
    stageLoaderScene.classList.remove("active");
    gameScene.classList.add("active");
    endScene.classList.remove("active");

    player = {
        x: WPH / 2,
        y: 0.5,
        r: 0.03
    };

    bulls = [];
    for (let i = 0; i < BULL_COUNT; i++) {
        const angle = Math.random() * Math.PI * 2;
        bulls.push({
            x: WPH / 2 + Math.cos(angle) * 0.4,
            y: 0.5 + Math.sin(angle) * 0.4,
            width: 0.2,
            height: 0.1,
            r: 0.07,
            angle: angle + Math.PI,
            timeToMove: 1
        });
    }

    running = true;
    lastTime = performance.now();
    dodges = 0;
    requestAnimationFrame(UpdateLoop);
}
function ShowEnd(text) {
    startScene.classList.remove("active");
    stageLoaderScene.classList.remove("active");
    gameScene.classList.remove("active");
    endScene.classList.add("active");

    endText.innerHTML = text;
    running = false;
}

function UpdateLoop(time) {
    if (!running)
        return;

    const dt = (time - lastTime) / 1000;
    lastTime = time;

    Update(dt);
    Render();

    requestAnimationFrame(UpdateLoop);
}

function Update(deltaTime) {
    let moveX = 0, moveY = 0;
    if (keys["w"] || keys["ArrowUp"]) moveY -= 1;
    if (keys["s"] || keys["ArrowDown"]) moveY += 1;
    if (keys["a"] || keys["ArrowLeft"]) moveX -= 1;
    if (keys["d"] || keys["ArrowRight"]) moveX += 1;

    const len = Math.sqrt(moveX * moveX + moveY * moveY);
    if (len > 0) {
        player.x += moveX / len * PLAYER_SPEED * deltaTime;
        player.y += moveY / len * PLAYER_SPEED * deltaTime;
        const r = player.r + 0.04;
        player.x = Math.min(WPH - r, Math.max(r, player.x));
        player.y = Math.min(1 - r, Math.max(r, player.y));
    }

    for (const bull of bulls) {
        if(PlayerCollidingWithBull(bull))
            ShowEnd("Vesztettél!");

        //const prevTimeToMove = bull.timeToMove;
        bull.timeToMove -= deltaTime;
        //if(prevTimeToMove >= 0 && bull.timeToMove < 0)
        //    bull.angle = Math.atan2(player.y - bull.y, player.x - bull.x);
        if(bull.timeToMove > 0) {
            const playerAngle = Math.atan2(player.y - bull.y, player.x - bull.x);
            const deltas = [
                playerAngle - bull.angle,
                (playerAngle + Math.PI * 2) - bull.angle,
                (playerAngle - Math.PI * 2) - bull.angle
            ];
            let smallestDeltaAngle = 99999;
            deltas.forEach(angleDelta => {
                if(Math.abs(angleDelta) < Math.abs(smallestDeltaAngle))
                    smallestDeltaAngle = angleDelta;
            });
            if (Math.abs(smallestDeltaAngle) < 0.0001)
                continue;

            //const maxAngleChange = deltaTime * 3; // 1 is rotation speed
            //const angleChangeMagnitude = Math.min(Math.abs(smallestDeltaAngle * deltaTime), maxAngleChange);
            //bull.angle += (smallestDeltaAngle < 0 ? -1 : 1) * angleChangeMagnitude;
            if(deltaTime * 4.5 < Math.abs(smallestDeltaAngle))
                bull.angle += (smallestDeltaAngle < 0 ? -1 : 1) * deltaTime * 4.5;
            else
                bull.angle = playerAngle;
        }
        else
        {
            const prevX = bull.x;
            const prevY = bull.y;
            bull.x += Math.cos(bull.angle) * deltaTime * BULL_SPEED;
            bull.y += Math.sin(bull.angle) * deltaTime * BULL_SPEED;

            const insideRingX = Math.min(WPH - bull.r, Math.max(bull.r, bull.x));
            const insideRingY = Math.min(1 - bull.r, Math.max(bull.r, bull.y));
            const dx = bull.x - insideRingX;
            const dy = bull.y - insideRingY;
            if (dx * dx + dy * dy > 0.00001) {
                if(bull.timeToMove < -0.05) {
                    bull.timeToMove = 0.5 + 1.0 * Math.random();
                    bull.x = insideRingX;
                    bull.y = insideRingY;
                    dodges += 1;
                    if (dodges >= DODGES_TO_WIN)
                        NextStage();
                        //ShowEnd("Win");
                }
                else {
                    bull.x = prevX;
                    bull.y = prevY;
                }
            }
        }
    }
}

function Render() {
    canvas.clearRect(0, 0, canvasBase.width, canvasBase.height);

    canvas.beginPath();
    canvas.arc(player.x / WPH * canvasBase.width, player.y * canvasBase.height, player.r * canvasBase.width, 0, Math.PI * 2);
    canvas.fillStyle = "#ff2020";
    canvas.fill();

    for (const bull of bulls) {
        canvas.save();
        canvas.translate(bull.x / WPH * canvasBase.width, bull.y * canvasBase.height);
        canvas.rotate(bull.angle);

        if (bullImage.complete && bullImage.src)
            canvas.drawImage(
                bullImage,
                -bull.width / 2 * canvasBase.width,
                -bull.height / 2 * canvasBase.width,
                bull.width * canvasBase.width,
                bull.height * canvasBase.width
            );
        else {
            canvas.fillStyle = "#a35f11";
            canvas.fillRect(
                -bull.width / 2 * canvasBase.width,
                -bull.height / 2 * canvasBase.width,
                bull.width * canvasBase.width,
                bull.height * canvasBase.width
            );
        }

        canvas.restore();
    }

    canvas.fillStyle = "white";
    const text = `${dodges}/${DODGES_TO_WIN}`;
    const m = canvas.measureText(text);
    canvas.fillText(text, canvasBase.width - m.width - 10,(m.fontBoundingBoxAscent + m.fontBoundingBoxDescent) / 2 + 20);
}

function PlayerCollidingWithBull(bull) {
    const forwardX = Math.cos(bull.angle);
    const forwardY = Math.sin(bull.angle);
    const rightX = forwardY;
    const rightY = -forwardX;

    const dx = player.x - bull.x;
    const dy = player.y - bull.y;

    const halfW = bull.width / 2;
    const halfH = bull.height / 2;

    let localX = dx * rightX + dy * rightY;
    let localY = dx * forwardX + dy * forwardY;

    localX = Math.max(-halfW, Math.min(halfW, localX));
    localY = Math.max(-halfH, Math.min(halfH, localY));

    const closestX = bull.x + rightX * localX + forwardX * localY;
    const closestY = bull.y + rightY * localX + forwardY * localY;

    const distX = player.x - closestX;
    const distY = player.y - closestY;

    return distX * distX + distY * distY <= player.r * player.r;
}

function AddDifficulty(modifier) {
    difficulty += modifier;
    if(difficulty < 0)
        difficulty = 0;
    if(difficulty > 2)
        difficulty = 2;

    difficultyText.innerText = [
        "Könnyű",
        "Közepes",
        "Nehéz"
    ][difficulty];
}

OnResize();
AddDifficulty(0);