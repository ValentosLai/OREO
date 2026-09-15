const menuScreen = document.getElementById("menuScreen");
const instructionsScreen = document.getElementById("instructionsScreen");
const gameScreen = document.getElementById("gameScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startBtn = document.getElementById("startBtn");
const newGameBtn = document.getElementById("newGameBtn");
const instructionsBtn = document.getElementById("instructionsBtn");

const backFromInstructions =
    document.getElementById("backFromInstructions");

const playFromInstructions =
    document.getElementById("playFromInstructions");

const playAgainBtn =
    document.getElementById("playAgainBtn");

const gameOverMenuBtn =
    document.getElementById("gameOverMenuBtn");

const pauseBtn =
    document.getElementById("pauseBtn");

const resumeBtn =
    document.getElementById("resumeBtn");

const pauseMenuBtn =
    document.getElementById("pauseMenuBtn");

const pauseOverlay =
    document.getElementById("pauseOverlay");

const playField =
    document.getElementById("playField");

const oreo =
    document.getElementById("oreo");

const scoreText =
    document.getElementById("score");

const timerText =
    document.getElementById("timer");

const livesText =
    document.getElementById("lives");

const finalScore =
    document.getElementById("finalScore");

const finalBest =
    document.getElementById("finalBest");

const menuHighScore =
    document.getElementById("menuHighScore");

const pointsPopup =
    document.getElementById("pointsPopup");

const bones =
    [...document.querySelectorAll(".bone")];

const obstacles =
    [...document.querySelectorAll(".obstacle")];


// ===============================
// GAME VARIABLES
// ===============================

let score = 0;
let lives = 3;
let timeLeft = 90;

let gameRunning = false;
let paused = false;

let timerInterval = null;
let animationFrame = null;

let highScore =
    Number(localStorage.getItem("oreoHighScore")) || 0;

menuHighScore.textContent = highScore;


// Oreo position
let x = 50;
let y = 70;

const speed = 0.55;

const keys = {
    up: false,
    down: false,
    left: false,
    right: false
};


// ===============================
// SCREEN MANAGEMENT
// ===============================

function showScreen(screen) {

    document.querySelectorAll(".screen")
        .forEach(s => s.classList.remove("active"));

    screen.classList.add("active");
}


// ===============================
// MENU
// ===============================

startBtn.addEventListener("click", () => {
    startGame(false);
});

newGameBtn.addEventListener("click", () => {
    highScore = 0;

    localStorage.setItem("oreoHighScore", "0");

    menuHighScore.textContent = "0";

    startGame(true);
});

instructionsBtn.addEventListener("click", () => {
    showScreen(instructionsScreen);
});

backFromInstructions.addEventListener("click", () => {
    showScreen(menuScreen);
});

playFromInstructions.addEventListener("click", () => {
    startGame(false);
});


// ===============================
// START GAME
// ===============================

function startGame(resetHighScore = false) {

    if (resetHighScore) {
        highScore = 0;
        localStorage.setItem("oreoHighScore", "0");
    }

    score = 0;
    lives = 3;
    timeLeft = 90;

    x = 50;
    y = 70;

    gameRunning = true;
    paused = false;

    scoreText.textContent = score;
    timerText.textContent = timeLeft;

    updateLives();

    pauseOverlay.classList.remove("show");

    resetBones();

    resetObstacles();

    positionOreo();

    showScreen(gameScreen);

    clearInterval(timerInterval);

    timerInterval = setInterval(() => {

        if (!gameRunning || paused) return;

        timeLeft--;

        timerText.textContent = timeLeft;

        if (timeLeft <= 0) {
            endGame();
        }

    }, 1000);

    cancelAnimationFrame(animationFrame);

    gameLoop();
}


// ===============================
// GAME LOOP
// ===============================

function gameLoop() {

    if (!gameRunning) return;

    if (!paused) {

        moveOreo();

        checkBoneCollisions();

        checkObstacleCollisions();
    }

    animationFrame =
        requestAnimationFrame(gameLoop);
}


// ===============================
// MOVEMENT
// ===============================

function moveOreo() {

    let moving = false;

    if (keys.left) {
        x -= speed;
        moving = true;
    }

    if (keys.right) {
        x += speed;
        moving = true;
    }

    if (keys.up) {
        y -= speed;
        moving = true;
    }

    if (keys.down) {
        y += speed;
        moving = true;
    }

    // boundaries

    x = Math.max(4, Math.min(96, x));

    // Oreo stays mainly on grass

    y = Math.max(48, Math.min(88, y));

    positionOreo();

    if (moving) {
        oreo.classList.add("moving");
    } else {
        oreo.classList.remove("moving");
    }
}


function positionOreo() {

    oreo.style.left = `${x}%`;
    oreo.style.top = `${y}%`;
}


// ===============================
// KEYBOARD
// ===============================

document.addEventListener("keydown", event => {

    if (!gameRunning) return;

    const key = event.key.toLowerCase();

    if (
        key === "arrowup" ||
        key === "w"
    ) {
        keys.up = true;
        event.preventDefault();
    }

    if (
        key === "arrowdown" ||
        key === "s"
    ) {
        keys.down = true;
        event.preventDefault();
    }

    if (
        key === "arrowleft" ||
        key === "a"
    ) {
        keys.left = true;
        event.preventDefault();
    }

    if (
        key === "arrowright" ||
        key === "d"
    ) {
        keys.right = true;
        event.preventDefault();
    }

    if (key === "escape") {
        togglePause();
    }
});


document.addEventListener("keyup", event => {

    const key = event.key.toLowerCase();

    if (
        key === "arrowup" ||
        key === "w"
    ) {
        keys.up = false;
    }

    if (
        key === "arrowdown" ||
        key === "s"
    ) {
        keys.down = false;
    }

    if (
        key === "arrowleft" ||
        key === "a"
    ) {
        keys.left = false;
    }

    if (
        key === "arrowright" ||
        key === "d"
    ) {
        keys.right = false;
    }
});


// ===============================
// MOBILE CONTROLS
// ===============================

document.querySelectorAll(".control")
.forEach(button => {

    const direction =
        button.dataset.key;

    const press = event => {

        event.preventDefault();

        keys[direction] = true;
    };

    const release = event => {

        event.preventDefault();

        keys[direction] = false;
    };

    button.addEventListener("touchstart", press, {
        passive: false
    });

    button.addEventListener("touchend", release, {
        passive: false
    });

    button.addEventListener("touchcancel", release, {
        passive: false
    });

    button.addEventListener("mousedown", press);

    button.addEventListener("mouseup", release);

    button.addEventListener("mouseleave", release);
});


// ===============================
// BONES
// ===============================

function resetBones() {

    bones.forEach((bone, index) => {

        bone.classList.remove("collected");

        bone.style.display = "block";

        const positions = [
            [20, 58],
            [72, 58],
            [35, 78],
            [82, 80],
            [58, 55]
        ];

        bone.style.left =
            positions[index][0] + "%";

        bone.style.top =
            positions[index][1] + "%";
    });
}


function checkBoneCollisions() {

    const dogRect =
        oreo.getBoundingClientRect();

    bones.forEach(bone => {

        if (
            bone.style.display === "none"
        ) return;

        const boneRect =
            bone.getBoundingClientRect();

        if (isColliding(dogRect, boneRect)) {

            collectBone(bone);
        }
    });
}


function collectBone(bone) {

    score += 10;

    scoreText.textContent = score;

    showPoints(bone);

    bone.classList.add("collected");

    setTimeout(() => {

        bone.style.display = "none";

    }, 300);

    // Respawn another bone

    setTimeout(() => {

        if (!gameRunning) return;

        bone.classList.remove("collected");

        bone.style.left =
            randomNumber(10, 90) + "%";

        bone.style.top =
            randomNumber(52, 87) + "%";

        bone.style.display = "block";

    }, 900);
}


// ===============================
// OBSTACLES
// ===============================

function resetObstacles() {

    // Removed the obstacle that was spawning
    // too close to Oreo's starting position.

    const positions = [
        [28, 84],
        [76, 70],
        [62, 84]
    ];

    obstacles.forEach((obstacle, index) => {

        if (index >= positions.length) {

            obstacle.style.display = "none";

            return;
        }

        obstacle.style.display = "block";

        obstacle.style.left =
            positions[index][0] + "%";

        obstacle.style.top =
            positions[index][1] + "%";
    });
}


function checkObstacleCollisions() {

    const dogRect =
        oreo.getBoundingClientRect();

    obstacles.forEach(obstacle => {

        if (obstacle.style.display === "none") return;

        const obstacleRect =
            obstacle.getBoundingClientRect();

        if (
            isColliding(dogRect, obstacleRect)
        ) {

            loseLife();

            // Push Oreo away

            x += randomNumber(-5, 5);
            y += randomNumber(-3, 3);

            x = Math.max(5, Math.min(95, x));
            y = Math.max(50, Math.min(88, y));

            positionOreo();
        }
    });
}


// ===============================
// LIFE SYSTEM
// ===============================

let lastHit = 0;

function loseLife() {

    const now = Date.now();

    // Prevent repeated collision damage

    if (now - lastHit < 1000) return;

    lastHit = now;

    lives--;

    updateLives();

    oreo.style.filter =
        "brightness(2)";

    setTimeout(() => {
        oreo.style.filter = "";
    }, 250);

    if (lives <= 0) {
        endGame();
    }
}


function updateLives() {

    let hearts = "";

    for (let i = 0; i < lives; i++) {
        hearts += "❤️ ";
    }

    for (let i = lives; i < 3; i++) {
        hearts += "🖤 ";
    }

    livesText.textContent = hearts;
}


// ===============================
// POINTS POPUP
// ===============================

function showPoints(element) {

    const rect =
        element.getBoundingClientRect();

    const fieldRect =
        playField.getBoundingClientRect();

    pointsPopup.style.left =
        `${rect.left - fieldRect.left}px`;

    pointsPopup.style.top =
        `${rect.top - fieldRect.top - 20}px`;

    pointsPopup.textContent = "+10";

    pointsPopup.style.display = "block";

    setTimeout(() => {

        pointsPopup.style.display = "none";

    }, 500);
}


// ===============================
// PAUSE
// ===============================

pauseBtn.addEventListener("click", togglePause);

resumeBtn.addEventListener("click", () => {

    paused = false;

    pauseOverlay.classList.remove("show");
});

pauseMenuBtn.addEventListener("click", () => {

    paused = false;

    gameRunning = false;

    clearInterval(timerInterval);

    pauseOverlay.classList.remove("show");

    showScreen(menuScreen);

    menuHighScore.textContent = highScore;
});


function togglePause() {

    if (!gameRunning) return;

    paused = !paused;

    if (paused) {
        pauseOverlay.classList.add("show");
    } else {
        pauseOverlay.classList.remove("show");
    }
}


// ===============================
// GAME OVER
// ===============================

function endGame() {

    if (!gameRunning) return;

    gameRunning = false;

    clearInterval(timerInterval);

    if (score > highScore) {

        highScore = score;

        localStorage.setItem(
            "oreoHighScore",
            highScore
        );
    }

    finalScore.textContent = score;

    finalBest.textContent = highScore;

    menuHighScore.textContent = highScore;

    showScreen(gameOverScreen);
}


playAgainBtn.addEventListener("click", () => {
    startGame(false);
});


gameOverMenuBtn.addEventListener("click", () => {

    menuHighScore.textContent = highScore;

    showScreen(menuScreen);
});


// ===============================
// COLLISION
// ===============================

function isColliding(a, b) {

    return !(
        a.right < b.left ||
        a.left > b.right ||
        a.bottom < b.top ||
        a.top > b.bottom
    );
}


// ===============================
// RANDOM
// ===============================

function randomNumber(min, max) {

    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
}