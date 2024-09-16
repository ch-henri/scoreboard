import Alpine from 'alpinejs'

import './modal.js'

  
window.Alpine = Alpine;


window.addEventListener('alpine:init', () => {
    Alpine.data('scoreboard', () => ({
        timer: document.querySelector('#timer'),
        fightDuration: 650, // 1/10 sec
        oseakomiWazaari: 10,
        oseakomiIppon: 20,
        timeLeft: null,
        timerInterval: 100, // milliseconds
        expectedTimerCb: null,
        spareSeconds: null,
        countdown: null,
        isRunning: false,
        goldenScore: false,
        shidoCounter: {
            white: 0,
            blue: 0,
        },
        wazaari: {
          white: 0,
          blue: 0,  
        },
        osaekomiCountdown: null,
        osaekomiActive: false,
        osaekomiIsPaused: false,
        osaekomiColor: false,
        winner: null,
        gong: new Audio('/gong.mp3'),


        init() {
            this.timeLeft = this.fightDuration;
            this.updateTimer();
        },

        ajime() {
            this.isRunning = true;
            this.expectedTimerCb = Date.now() + this.timerInterval;
            this.countdown = setTimeout(() => this.step(), this.timerInterval);
            this.osaekomiIsPaused = false;
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
                this.osaekomiActive || this.gong.play(); 
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
            let minutes = Math.floor(this.timeLeft / 600);
            let seconds = (this.timeLeft % 600) / 10;
            this.timer.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        },

        reset() {
            this.timeLeft = this.fightDuration;
            this.updateTimer();
            this.revertVictory();
            this.goldenScore = false;
            this.wazaari.white = 0;
            this.wazaari.blue = 0;
        },

        // ----------------

        osaekomi() {
            this.osaekomiActive = true;
            this.osaekomiIsPaused = !this.isRunning;
            clearInterval(this.osaekomiCountdown);
            this.timerOsaekomi();
        },

        timerOsaekomi() {
            let countUp = 0;
            let displayOsaekomi = document.querySelector('#osaekomiTimer');
            this.osaekomiCountdown = setInterval(() => {
                if (!this.osaekomiIsPaused) {
                    countUp++;
                    displayOsaekomi.textContent = `${countUp < '10' ? '0' : ''}${countUp}`;
                    if (countUp == this.oseakomiWazaari || countUp == this.oseakomiIppon) {
                        this.wazaari[this.osaekomiColor] === 1 && this.gong.play();
                        this.scoreWazaari(document.querySelector(`[data-wazaari="${this.osaekomiColor}"]`));
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

        scoreWazaari(elm) {
            let color = elm.dataset.wazaari;
            // si 0 ou 1 wazaari -> wazaari++
            if ([0,1].includes(this.wazaari[color])) this.wazaari[color]++;
            // si 1 wazaari -> victory
            if (this.wazaari[color] == 2) this.victory(color);
        },

        scoreIppon(elm) {
            let color = elm.dataset.ippon;
            // si 0 ippon -> victoire
            if (elm.textContent == 0) {
                this.victory(color);
            } else {
                this.revertVictory(color);
            }
            // si 2 wazaari -> wazaari--
            if (this.wazaari[color] == 2) this.wazaari[color]--;
        },

        addShido(elements) {
            let color = elements.dataset.shido;
            this.shidoCounter[color] < 3 && this.shidoCounter[color]++;
            let counter = this.shidoCounter[color];            
            elements.firstElementChild.textContent = counter;
            if (counter === 3) {
                elements.classList.remove('bg-yellow-500');
                elements.classList.add('bg-red-500');
                let winnerColor;
                color === 'white' ? winnerColor = 'blue' : winnerColor = 'white';
                this.victory(winnerColor);
            }
        },

        deleteShido(elements) {
            let color = elements.dataset.shido;
            this.shidoCounter[color]--;
            let counter = this.shidoCounter[color];
            if (counter === 2) {
                elements.classList.remove('bg-red-500');
                elements.classList.add('bg-yellow-500');
                let winnerColor;
                color === 'white' ? winnerColor = 'blue' : winnerColor = 'white';
                this.victory(winnerColor);
            }
            elements.firstElementChild.textContent = counter;
            this.revertVictory()
        },

        victory(color) {
            let ippon = document.querySelector(`[data-ippon="${color}"]`);
            ippon.textContent = "1";
            this.mate();
            this.winner = color;
            this.osaekomiIsPaused = true;
            console.log(this.shidoCounter[color]);
        },

        revertVictory() {
            if (this.winner) {
                let ippon = document.querySelector(`[data-ippon="${this.winner}"]`);
                ippon.textContent = "0";
            }
            this.winner = null;
            this.gong.pause();
            this.gong.currentTime = 0;
        },

        // ---------------------

        setFightTime(action) {
            switch(action) {
                case 'addMin': this.fightDuration += 600; break;
                case 'delMin': this.fightDuration -= 600; break;
                case 'addSec': this.fightDuration += 10; break;
                case 'delSec': this.fightDuration -= 10; break;
            }
            this.init();
        },

        setOsaekomiTime(action) {
            switch(action) {
                case 'addWazaari': this.oseakomiWazaari += 1; break;
                case 'delWazaari': this.oseakomiWazaari -= 1; break;
                case 'addIppon': this.oseakomiIppon += 1; break;
                case 'delIppon': this.oseakomiIppon -= 1; break;
            }
            this.init();
        },
        

        setAccentColor(color) {
            document.documentElement.style.setProperty('--accent-color', `var(--${color})`);
        },


    }))

})


Alpine.start()