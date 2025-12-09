class DeragotchiConsole {
    constructor() {
        this.baseUrl = 'http://localhost:8080';
        this.updateInterval = 2000;
        this.commandHistory = [];
        this.isConnected = false;
        this.startTime = new Date();
        this.updateTimer = null;
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.addToHistory('system', 'system started...');
        
        await this.testConnection();
        
        this.startAutoUpdate();
        
        this.setupKeyboardShortcuts();
    }

    setupEventListeners() {
        const commandInput = document.getElementById('command-input');
        commandInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory(-1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory(1);
            }
        });
        commandInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.executeCommand();
            }
        });
    }

    async testConnection() {
        try {
            const response = await fetch(`${this.baseUrl}/status`);
            if (response.ok) {
                this.isConnected = true;
                this.updateConnectionStatus(true);
                this.addToHistory('system', 'conexion stablish :3');
                await this.updateStatus();
            }
        } catch (error) {
            this.isConnected = false;
            this.updateConnectionStatus(false);
            this.addToHistory('error', 'cant connect to server. see if backend is working');
        }
    }

    async updateStatus() {
        if (!this.isConnected) {
            await this.testConnection();
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}/status`);
            const data = await response.json();
            this.updateUI(data);
            
            this.updateUptime();
            
        } catch (error) {
            console.error('error updating status:', error);
            this.isConnected = false;
            this.updateConnectionStatus(false);
        }
    }

    updateUI(data) {
        document.getElementById('pet-name').textContent = data.name;
        document.getElementById('pet-status').textContent = data.mood.toUpperCase();
        document.getElementById('pet-status').className = `info-value status-${data.mood}`;
        document.getElementById('pet-age').textContent = `${data.age || 0} ciclos`;
        
        this.updateProgressBar('hunger', data.hunger);
        this.updateProgressBar('happiness', data.happiness);
        this.updateProgressBar('energy', data.energy);
        this.updateProgressBar('cleanliness', data.cleanliness);
        
        this.updatePetImage(data.mood, data.isAlive, data.isSleeping);
        
        this.updateIndicators(data.isAlive, data.isSleeping);
        
        document.getElementById('sleep-btn').style.display = 
            data.isSleeping ? 'none' : 'flex';
        document.getElementById('wake-btn').style.display = 
            data.isSleeping ? 'flex' : 'none';
        
        document.getElementById('health-status').textContent = 
            data.isAlive ? 'oki!' : 'critical D:';
        document.getElementById('health-status').style.color = 
            data.isAlive ? '#00ff00' : '#ff0000';
        
        if (!data.isAlive) {
            this.addToHistory('warning', 'your deragotchi is dead, please dont have kids');
            this.stopAutoUpdate();
        }
    }

    updateProgressBar(type, value) {
        const bar = document.getElementById(`${type}-bar`);
        const valueElement = document.getElementById(`${type}-value`);

        if (bar && valueElement) {
            bar.style.width = `${value}%`;
            valueElement.textContent = `${value}%`;

            let color;

            //diff logic for every bar
            switch(type) {
                case 'hunger': // high: bad, low: good :3
                    if (value >= 80) color = '#FF6B6B'; //red
                    else if (value >= 60) color = '#FF9966';//orange
                    else if (value >= 40) color = '#FFCC66';//yellow
                    else if (value >= 20) color = '#DFF0A0';//yellow - green
                    else color = '#A0D9A0'; //green
                    break;

                case 'happiness': // high: good, low: bad
                    if (value >= 80) color = '#A0F0A0'; //green
                    else if (value >= 60) color = '#DFF0A0'; //light green
                    else if (value >= 40) color = '#FFCC66'; //yellow
                    else if (value >= 20) color = '#FF9966'; //orange
                    else color = '#FF6B6B'; //red
                    break;

                case 'energy': // high: good, low: bad
                    if (value >= 80) color = '#A0F0C0'; //green
                    else if (value >= 60) color = '#C0F0D0'; //light green
                    else if (value >= 40) color = '#FFD700'; //yellow
                    else if (value >= 20) color = '#FF9966'; //orange
                    else color = '#FF6B6B'; //red
                    break;

                case 'cleanliness': // high: good, low: bad
                    if (value >= 80) color = '#A0E0F0'; //blue
                    else if (value >= 60) color = '#B0E8F8'; //light blue
                    else if (value >= 40) color = '#FFD700'; //yellow
                    else if (value >= 20) color = '#FF9966'; //orange
                    else color = '#FF6B6B'; //red
                    break;

                default:
                    color = '#DFF0A0'; //green
            }

            bar.style.background = color;
            bar.style.boxShadow = `0 0 10px ${color}`;

            if (value >= 60 && (type === 'happiness' || type === 'energy' || type === 'cleanliness')) {
                valueElement.style.color = '#267326'; //dark green
            } else if (value >= 60 && type === 'hunger') {
                valueElement.style.color = '#CC0000'; //dark red
            } else if (value >= 40) {
                valueElement.style.color = '#CC6600'; //dark orange
            } else {
                valueElement.style.color = '#CC0000'; //dark red
            }
        }
    }

    updatePetImage(mood, isAlive, isSleeping) {
        const img = document.getElementById('pet-image');
        
        const imageMap = {
            normal: 'pet-normal.png',
            'happy c:': 'pet-happy.png',
            'sad:(': 'pet-sad.png',
            hungy: 'pet-hungry.png',
            dirty: 'pet-dirty.png',
            sleeping: 'pet-sleeping.png',
            dead: 'pet-dead.png'
        };
        
        let imageName;
        if (!isAlive) {
            imageName = 'pet-dead.png';
        } else if (isSleeping) {
            imageName = 'pet-sleeping.png';
        } else {
            imageName = imageMap[mood] || 'pet-normal.png';
        }
        
        this.preloadImage(`assets/${imageName}`, (loaded) => {
            if (loaded) {
                img.src = `assets/${imageName}`;
            }
        });
        
        img.className = 'pet-image';
        if (!isAlive) {
            img.classList.add('dead');
        } else if (isSleeping) {
            img.classList.add('sleeping');
        } else if (mood === 'happy') {
            img.classList.add('happy');
        }
    }

    preloadImage(src, callback) {
        const img = new Image();
        img.onload = () => callback(true);
        img.onerror = () => {
            console.warn(`cant charge image: ${src}`);
            callback(false);
        };
        img.src = src;
    }

    updateIndicators(isAlive, isSleeping) {
        const aliveDot = document.querySelector('#alive-indicator .indicator-dot');
        const sleepDot = document.querySelector('#sleep-indicator .indicator-dot');
        const sleepText = document.querySelector('#sleep-indicator .indicator-text');
        
        if (isAlive) {
            aliveDot.classList.add('alive');
            aliveDot.classList.remove('dead');
        } else {
            aliveDot.classList.remove('alive');
            aliveDot.classList.add('dead');
        }
        
        if (isSleeping) {
            sleepDot.classList.add('sleeping');
            sleepText.textContent = 'eepy';
        } else {
            sleepDot.classList.remove('sleeping');
            sleepText.textContent = 'awake';
        }
    }

    async sendCommand(action) {
        if (!this.isConnected) {
            this.addToHistory('error', 'no conexion.');
            return;
        }

        try {
            this.addToHistory('command', action);
            
            const response = await fetch(`${this.baseUrl}/${action}`, {
                method: 'POST'
            });
            
            const result = await response.json();
            
            // Mensajes de retroalimentación
            const messages = {
                feed: 'ñomñom, deragotchi is eating',
                play: 'yippee!! deragotchi is playing',
                sleep: 'shhh! deragotchi is sleeping',
                wake: 'wakeywakey! its time for school',
                clean: 'deragotchi is taking a bath'
            };
            
            if (messages[action]) {
                this.addToHistory('success', messages[action]);
            }
            
            setTimeout(() => this.updateStatus(), 500);
            
        } catch (error) {
            console.error('error command executing:', error);
            this.addToHistory('error', 'error command executing');
        }
    }

    toggleSleep() {
        const sleepBtn = document.getElementById('sleep-btn');
        const wakeBtn = document.getElementById('wake-btn');
        
        if (sleepBtn.style.display !== 'none') {
            this.sendCommand('sleep');
        } else {
            this.sendCommand('wake');
        }
    }

    executeCommand() {
        const input = document.getElementById('command-input');
        const command = input.value.trim().toLowerCase();
        if (!command) return;
        this.addToHistory('user', command);
        switch(command) {
            case 'help':
            case 'ayuda':
                this.showHelp();
                break;
            case 'status':
            case 'estado':
                this.updateStatus();
                break;
            case 'feed':
            case 'alimentar':
                this.sendCommand('feed');
                break;
            case 'play':
            case 'jugar':
                this.sendCommand('play');
                break;
            case 'sleep':
            case 'dormir':
                this.sendCommand('sleep');
                break;
            case 'wake':
            case 'despertar':
                this.sendCommand('wake');
                break;
            case 'clean':
            case 'limpiar':
                this.sendCommand('clean');
                break;
            case 'clear':
            case 'limpiarhistorial':
                this.clearHistory();
                break;
            case 'exit':
            case 'salir':
                this.addToHistory('system', 'Sistema finalizado.');
                break;
            default:
                this.addToHistory('error', `Comando no reconocido: ${command}`);
                this.addToHistory('info', 'Escribe "help" para ver los comandos disponibles.');
        }
        
        input.value = '';
        this.currentHistoryIndex = -1;
    }

    showHelp() {
        this.addToHistory('help', '=== available commands ===');
        this.addToHistory('help', 'help/ayuda           - shows this helps');
        this.addToHistory('help', 'status/estado        - shows actual status');
        this.addToHistory('help', 'feed/alimentar       - feed deragotchi');
        this.addToHistory('help', 'play/jugar           - play with deragotchi');
        this.addToHistory('help', 'sleep/dormir         - put to sleep deragotchi');
        this.addToHistory('help', 'wake/despertar       - wake up deragotchi');
        this.addToHistory('help', 'clean/limpiar        - bath deragotchi');
        this.addToHistory('help', 'clear/limpiarhistorial - clean history');
    }

    addToHistory(type, message) {
        const historyDiv = document.getElementById('command-history');
        const item = document.createElement('div');
        item.className = `history-item history-${type}`;
        
        const time = new Date().toLocaleTimeString();
        
        switch(type) {
            case 'user':
                item.innerHTML = `
                    <span class="prompt">></span>
                    <span class="history-command">${message}</span>
                `;
                break;
            case 'system':
                item.innerHTML = `
                    <span class="prompt">[SYS]</span>
                    <span class="history-system">${message}</span>
                    <span class="history-time">${time}</span>
                `;
                break;
            case 'success':
                item.innerHTML = `
                    <span class="prompt">[OK]</span>
                    <span class="history-success">${message}</span>
                    <span class="history-time">${time}</span>
                `;
                break;
            case 'error':
                item.innerHTML = `
                    <span class="prompt">[ERR]</span>
                    <span class="history-error">${message}</span>
                    <span class="history-time">${time}</span>
                `;
                break;
            case 'warning':
                item.innerHTML = `
                    <span class="prompt">[!]</span>
                    <span class="history-warning">${message}</span>
                    <span class="history-time">${time}</span>
                `;
                break;
            case 'help':
                item.innerHTML = `
                    <span class="prompt">[HELP]</span>
                    <span class="history-help">${message}</span>
                `;
                break;
        }
        
        historyDiv.appendChild(item);
        historyDiv.scrollTop = historyDiv.scrollHeight;
        
        if (type === 'user') {
            this.commandHistory.push(message);
            this.currentHistoryIndex = this.commandHistory.length;
        }
    }

    clearHistory() {
        const historyDiv = document.getElementById('command-history');
        historyDiv.innerHTML = '';
        this.addToHistory('system', 'cleared records');
    }

    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;
        this.currentHistoryIndex += direction;
        if (this.currentHistoryIndex < 0) this.currentHistoryIndex = 0;
        if (this.currentHistoryIndex >= this.commandHistory.length) {
            this.currentHistoryIndex = this.commandHistory.length - 1;
        }
        
        const input = document.getElementById('command-input');
        if (this.currentHistoryIndex >= 0) {
            input.value = this.commandHistory[this.currentHistoryIndex];
        }
    }

    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('connection-status');
        this.isConnected = connected;
        
        if (connected) {
            statusElement.className = 'connected';
            statusElement.innerHTML = '<i class="fas fa-plug"></i> CONECTADO';
        } else {
            statusElement.className = 'disconnected';
            statusElement.innerHTML = '<i class="fas fa-unplug"></i> DESCONECTADO';
        }
    }

    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        document.getElementById('current-time').textContent = timeString;
        
        setTimeout(() => this.updateTime(), 1000);
    }

    updateUptime() {
        const now = new Date();
        const diff = Math.floor((now - this.startTime) / 1000);
        
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        
        const uptimeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('uptime').textContent = uptimeString;
    }

    startAutoUpdate() {
        if (this.updateTimer) clearInterval(this.updateTimer);
        
        this.updateTimer = setInterval(() => {
            this.updateStatus();
        }, this.updateInterval);
    }

    stopAutoUpdate() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.consoleApp = new DeragotchiConsole();
    window.sendCommand = (action) => {
        window.consoleApp.sendCommand(action);
    };
    
    window.executeCommand = () => {
        window.consoleApp.executeCommand();
    };
    
    window.handleCommandKey = (event) => {
        if (event.key === 'Enter') {
            window.consoleApp.executeCommand();
        }
    };
    
    window.showHelp = () => {
        window.consoleApp.showHelp();
    };
});
