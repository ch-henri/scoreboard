import Alpine from 'alpinejs'
import persist from '@alpinejs/persist'
import './modal.js'
 
Alpine.plugin(persist);
  
window.Alpine = Alpine;


window.addEventListener('alpine:init', () => {
    Alpine.data('scoreboard', function() {
        return {
            timer: document.querySelector('#timer'),
            opponentOne: this.$persist('white'),
            opponentTwo: this.$persist('blue'),
            fightDuration: this.$persist(2400), // 1/10 sec
            osaekomiWazaari: this.$persist(10),
            osaekomiYuko: this.$persist(5),
            osaekomiIppon: this.$persist(20),
            timeLeft: this.$persist(null),
            timerInterval: 100, // milliseconds
            expectedTimerCb: null,
            spareSeconds: null,
            countdown: this.$persist(null),
            isRunning: false,
            goldenScore: this.$persist(false),
            shidoCounter: this.$persist({
                white: 0,
                blue: 0,
            }),
            wazaari: this.$persist({
                white: 0,
                blue: 0,  
            }),
            yuko: this.$persist({
                white: 0,
                blue: 0,  
            }),            
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
                this.yuko.white = 0;
                this.yuko.blue = 0;                
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
                        if (countUp == this.osaekomiYuko) {
                            this.scoreYuko(document.querySelector(`[data-yuko="${this.osaekomiColor}"]`));
                        }                        
                        if (countUp == this.osaekomiWazaari || countUp == this.osaekomiIppon) {
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
            scoreYuko(elm) {
                this.yuko[elm.dataset.yuko]++;
            },

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
                    console.log(color);
                    
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
                this.revertVictory();
            },
    
            victory(color) {
                let ippon = document.querySelector(`[data-ippon="${color}"]`);
                ippon.textContent = "1";
                this.mate();
                this.winner = color;
                this.osaekomiIsPaused = true;
                console.log(this.shidoCounter[color]);
            },
    
            revertVictory(color) {
                this.gong.pause();
                this.gong.currentTime = 0;                
                if(color) { // if both ippon are 1.
                    document.querySelector(`[data-ippon="${color}"]`).textContent = "0";
                }
                else if(this.winner) {
                    let ippon = document.querySelector(`[data-ippon="${this.winner}"]`);
                    ippon.textContent = "0";
                    this.winner = null;
                } 
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
                    case 'addYuko': this.osaekomiYuko++; break;
                    case 'delYuko': this.osaekomiYuko--; break;                    
                    case 'addWazaari': this.osaekomiWazaari++; break;
                    case 'delWazaari': this.osaekomiWazaari--; break;
                    case 'addIppon': this.osaekomiIppon++; break;
                    case 'delIppon': this.osaekomiIppon--; break;
                }
                this.init();
            },
            
            setAccentColor(color) {
                document.documentElement.style.setProperty('--accent-color', `var(--${color})`);
            },            
        }

    })

})


Alpine.start()