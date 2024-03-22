import Alpine from 'alpinejs'
import { data } from 'autoprefixer';

window.Alpine = Alpine;


window.addEventListener('alpine:init', () => {
    Alpine.data('scoreboard', () => ({
        timer: document.querySelector('#timer'),
        fightDuration: 50, // 1/10 sec
        timeLeft: null,
        timerInterval: 100, // milliseconds
        expectedTimerCb: null,
        minutes: null,
        seconds: null,
        spareSeconds: null,
        countdown: null,
        isRunning: false,
        goldenScore: false,
        shidoCounter: {
            black: 0,
            blue: 0,
        },
        wazaari: {
          black: 0,
          blue: 0,  
        },
        osaekomiCountdown: null,
        osaekomiActive: false,
        osaekomiIsPaused: false,
        osaekomiColor: false,
        winner: null,
        gong: new Audio('/public/gong.mp3'),


        init() {
            this.timeLeft = this.fightDuration;
            this.updateTimer();
        },

        ajime() {
            this.isRunning = true;
            this.expectedTimerCb = Date.now() + this.timerInterval;
            this.countdown = setTimeout(() => this.step(), this.timerInterval);
        },

        step() {
            let diff = Date.now() - this.expectedTimerCb; // the difference betwween each callback
            if (diff > this.timerInterval) {
                this.mate();
            }
            this.goldenScore ? this.timeLeft++ : this.timeLeft--;
            if (this.timeLeft == 0) {
                this.updateTimer();
                this.mate();
                this.gong.play();
            }
            else {
                this.timeLeft % 10 == 0 && this.updateTimer();
                this.expectedTimerCb += this.timerInterval;
                this.countdown = setTimeout(() => this.step(), this.timerInterval - diff);
            }
        },

        mate() {
            clearInterval(this.countdown);
            this.isRunning = false;
            if(this.timeLeft !== 0) this.osaekomiIsPaused = true;
        },

        updateTimer() {
            this.minutes = Math.floor(this.timeLeft / 600);
            this.seconds = (this.timeLeft % 600) / 10;
            this.timer.textContent = `${this.minutes}:${this.seconds < 10 ? '0' : ''}${this.seconds}`;
        },

        reset() {
            this.timeLeft = this.fightDuration;
            this.updateTimer();
            this.revertVictory();
            this.goldenScore = false;
        },

        // ----------------

        osaekomi() {
            this.osaekomiActive = true;
            this.osaekomiIsRunning = true;
            this.timerOsaekomi();
        },

        timerOsaekomi() {
            let countUp = 0;
            let displayOsaekomi = document.querySelector('#osaekomiTimer');
            this.osaekomiCountdown = setInterval(() => {
                if (!this.osaekomiIsPaused) {
                    countUp++;
                    displayOsaekomi.textContent = `${countUp < 10 ? '0' : ''}${countUp}`;
                    if (this.wazaari[this.osaekomiColor] == 1) {
                        if (countUp == 10) {
                            this.score(document.querySelector(`[data-wazaari="${this.osaekomiColor}"]`));
                            clearInterval(this.osaekomiCountdown);
                        }
                    } else if (countUp == 20){
                        clearInterval(this.osaekomiCountdown);
                        this.gong.play();
                    }
                }
            }, 1000)
        },

        toketa() {
            clearInterval(this.osaekomiCountdown);
            document.querySelector('#osaekomiTimer').textContent = '00';
            this.osaekomiActive = false;
            this.osaekomiIsPaused = false;
            if (this.osaekomiColor) {
                document.querySelector(`[data-osaekomiColor="${this.osaekomiColor}"]`).checked = false;
                this.osaekomiColor = false;
            } 
        },


        // -----------------


        score(elm) {
            if (elm.dataset.ippon) {
                if (elm.textContent == 0) {
                    this.victory(elm.dataset.ippon)
                } else {
                    this.revertVictory(elm.dataset.ippon);
                }
            }
            if (elm.dataset.wazaari) {
                if (elm.textContent == 0) {
                    this.wazaari[elm.dataset.wazaari] = 1;
                }
                else if (elm.textContent == 1) {
                    this.victory(elm.dataset.wazaari);
                    this.wazaari[elm.dataset.wazaari] = 0;
                }
            }
        },

        addShido(elements) {
            let color = elements.dataset.shido;
            let counter = this.shidoCounter[color];
            for (let i = 0; i <= counter; i++) {
                elements.children[i].classList.add('active');
            }
            if (counter === 2) {
                let winnerColor;
                color === 'black' ? winnerColor = 'blue' : winnerColor = 'black';
                console.log(winnerColor);
                this.victory(winnerColor);
            }
            counter <= 2 && this.shidoCounter[color]++;
        },

        deleteShido(elements) {
            let color = elements.dataset.shido;
            let counter = this.shidoCounter[color];
            let lastShido = null;
            for (const item of elements.children) {
                if (item.matches('.active')) {
                    lastShido = item;
                }
            }
            lastShido.classList.remove('active');
            this.shidoCounter[color]--;
            this.revertVictory()
        },

        victory(color) {
            // Mettre 1 ippon
            let ippon = document.querySelector(`[data-ippon="${color}"]`);
            ippon.textContent = "1";
            // Stop le temps
            this.mate();
            // mettre le fond jaune
            this.winner = color;
            // ajime alarm
            this.gong.play();
        },

        revertVictory() {
            //enlever le ippon
            if (this.winner) {
                let ippon = document.querySelector(`[data-ippon="${this.winner}"]`);
                ippon.textContent = "0";
            }
            // enlever le fond jaune
            this.winner = null;
            // stop alarm
            this.gong.pause();
            this.gong.currentTime = 0;
        }
    }))

})


Alpine.start()