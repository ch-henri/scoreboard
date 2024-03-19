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
            blue: 0,
        },
        wazaariCounter: {
          black: 0,
          blue: 0,  
        },
        osaekomiColor: false,
        winner: null,
        gong: new Audio('/public/gong.mp3'),
        osaekomiActive: false,


        init() {
            this.timeLeft = this.fightDuration;
            this.updateTimer();
            this.$watch(this.test, value => console.log(value));
        },

        test() { },

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

        osaekomi() {
            this.osaekomiActive = true;
            this.timerOsaekomi();
        },

        timerOsaekomi() {
            let countUp = 0;
            let displayOsaekomi = document.querySelector('#osaekomiTimer');
            let hasWazaari;
            this.osaekomiCountdown = setInterval(() => {
                countUp++;
                displayOsaekomi.textContent = `${countUp < 10 ? '0' : ''}${countUp}`;
                if (this.osaekomiColor) {
                    hasWazaari = document.querySelector(`[data-wazaari="${this.osaekomiColor}"]`).textContent;
                    if (countUp == 10 && hasWazaari == 1) {
                        this.victory(this.osaekomiColor);
                        clearInterval(this.osaekomiCountdown);
                    }
                } else if (countUp == 20){
                    clearInterval(this.osaekomiCountdown);
                    this.gong.play();
                }

            }, 1000)
        },

        toketa() {
            clearInterval(this.osaekomiCountdown);
            this.osaekomiActive = false;
            document.querySelector(`[data-osaekomiColor="${this.osaekomiColor}"]`).checked = false;
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
                    this.wazaariCounter[elm.dataset.wazaari] = 1;
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