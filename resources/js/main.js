import Alpine from 'alpinejs'



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
                    displayOsaekomi.textContent = `${countUp < 10 ? '0' : ''}${countUp}`;
                    if (countUp == 10 || countUp == 20) {
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
            this.shidoCounter[color]++;
            let counter = this.shidoCounter[color];            
            elements.firstElementChild.textContent = counter;
            if (counter === 3) {
                elements.classList.remove('bg-yellow-500');
                elements.classList.add('bg-red-500');
                let winnerColor;
                color === 'black' ? winnerColor = 'blue' : winnerColor = 'black';
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
                color === 'black' ? winnerColor = 'blue' : winnerColor = 'black';
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
            this.gong.play();
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

        paramUpdate(event) {
            dialog.close();
            let seconds = parseInt(document.querySelector('#seconds').value, 10);
            let minutes = parseInt(document.querySelector('#minutes').value, 10);
            console.log(minutes);
            console.log(!!seconds);
            if(minutes >= 0 && seconds >= 0) {
                let newTime = ((minutes * 60) + seconds) * 10;
                console.log(newTime);
                this.fightDuration =  newTime;
                this.init();
            }
        }
    }))

})


Alpine.start()