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
        timeOver: null,
        goldenScore: false,
        countdown: null,
        osaekomiCountdown: null,
        isRunning: false,
        shidoCounter: {
            black: 0,
            white: 0,
        },
        shidoItemsBlack: document.querySelector('[data-shido="black"]'),
        shidoItemsWhite: document.querySelector('[data-shido="white"]'),
        winner: null,
        gong: new Audio('/public/gong.mp3'),
        osaekomiActive: {
            white: false,
            black: false,
        },

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
                this.goldenScore = true;
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

        osaekomi(elm) {
            let color = elm.dataset.osaekomi;
            let wazaari = document.querySelector(`[data-wazaari="${color}"]`);
            this.osaekomiActive[color] = true;
            // elm.style.display = 'none';
            // y'a t'il un wazaari ?
            if (wazaari.textContent == 1) {
                // lancer le timer pour 10sec
                this.timerOsaekomi(color, 10)
            } else {
                this.timerOsaekomi(color, 20)
            }
        },

        timerOsaekomi(color, duration) {
            let countUp = 0;
            let displayOsaekomi = document.querySelector(`[data-displayOsaekomi="${color}"]`);
            displayOsaekomi.textContent = 0;
            this.osaekomiCountdown = setInterval(() => {
                countUp++;
                displayOsaekomi.textContent = countUp;
                console.log(duration);
                if (countUp == duration) {
                    this.victory(color);
                    clearInterval(this.osaekomiCountdown);
                } else if (countUp == 10) {
                    this.score(document.querySelector(`[data-wazaari="${color}"]`))
                }
            }, 1000)
        },

        toketa(elm) {
            let color = elm.dataset.toketa;
            clearInterval(this.osaekomiCountdown);
            console.log();
            this.osaekomiActive[color] = false;
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
                    elm.textContent = 1;
                }
                else if (elm.textContent == 1) {
                    elm.textContent = 0;
                    this.victory(elm.dataset.wazaari);
                }
            }
        },
        addShido(elements) {
            let color = elements.dataset.shido;
            let counter = this.shidoCounter[color];
            console.log(counter);
            for (let i = 0; i <= counter; i++) {
                elements.children[i].classList.add('active');
            }
            if (counter === 2) {
                this.victory(color);
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