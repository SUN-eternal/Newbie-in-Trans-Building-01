(function () {
    'use strict';

    // ==================== CONFIGURATION ====================

    const CONFIG = {
        W: 800,
        H: 600,
        PLAYER_SPEED: 160,
        NPC_RANGE: 50,
        TILE: 32,
    };

    const SCENE_KEYS = ['schoolgate', 'maosquare', 'entrance', 'classroom', 'studyroom', 'garden', 'graduation'];

    var exitRX = 60;
    var exitRY = 160;

    const SCENE_CONFIG = {
        schoolgate: {
            bg: '4d1195cfd520b572a3703e5d981be649.png',
            name: '同济大学校门',
            spawn: { x: 120, y: 500 },
            exit: { x: 760, y: 300, rx: exitRX, ry: exitRY },
            npc: {
                x: 400, y: 510,
                name: '保安',
                dialogue: '同学你好，进入校门请出示校园卡。\n没有带？请登记姓名和学号。',
                interactType: 'gateEntry'
            }
        },
        maosquare: {
            bg: '335db259586560d41306533ede9735d9.png',
            name: '毛主席像广场',
            spawn: { x: 120, y: 500 },
            exit: { x: 760, y: 300, rx: exitRX, ry: exitRY },
            npc: {
                x: 400, y: 460,
                name: '同学',
                dialogue: '——你在做什么？\n——正在给毛主席像献花。',
                interactType: 'dialogueOnly'
            },
            clickables: [
                {
                    x: 400, y: 350,
                    name: '毛主席像',
                    range: 50,
                    action: 'flowerOffering'
                }
            ]
        },
        entrance: {
            bg: 'entance.png.png',
            name: '外语楼正门',
            spawn: { x: 120, y: 500 },
            exit: { x: 760, y: 300, rx: exitRX, ry: exitRY },
            npc: {
                x: 400, y: 510,
                name: '辅导员',
                dialogue: '欢迎来到同济大学外国语学院。\n想成为知识达人，请完成第一场挑战。',
                reward: '学生证'
            }
        },
        classroom: {
            bg: 'classroom.png.png',
            name: '智慧教室',
            spawn: { x: 120, y: 500 },
            exit: { x: 760, y: 300, rx: exitRX, ry: exitRY },
            npc: {
                x: 400, y: 460,
                name: '授课教师',
                dialogue: '知识是成长的基础。\n完成课堂测试吧。',
                reward: '阅读徽章'
            }
        },
        studyroom: {
            bg: 'studyroom.png.png',
            name: '自习室',
            spawn: { x: 120, y: 500 },
            exit: { x: 760, y: 300, rx: exitRX, ry: exitRY },
            npc: {
                x: 267, y: 460,
                name: '学长',
                dialogue: '坚持学习的人，\n才能获得真正的成长。',
                reward: '知识徽章'
            }
        },
        garden: {
            bg: 'garden.png.png',
            name: '杨咏曼楼花园',
            spawn: { x: 120, y: 500 },
            exit: { x: 760, y: 300, rx: exitRX, ry: exitRY },
            npc: {
                x: 400, y: 510,
                name: '院长',
                dialogue: '恭喜来到最终试炼！\n完成最后挑战。',
                reward: '外语楼传奇称号'
            }
        },
        graduation: {
            bg: '6833c311debca4ca57054a23fe3b9bd2.jpg',
            name: '毕业典礼',
            spawn: { x: 400, y: 540 },
            exit: null,
            npc: {
                x: 400, y: 440,
                name: '郭老师',
                dialogue: '恭喜你同学，你已经顺利通过了本地化这门课程，你们小组的分数是——100分！\n恭喜你从【译界菜鸟】晋升【翻译新星】！',
                interactType: 'graduationEnding'
            }
        }
    };

    const SCENE_QUESTIONS = {
        schoolgate: [],
        maosquare: [],
        entrance: [0, 1],
        classroom: [2, 3, 4],
        studyroom: [5, 6, 7],
        garden: [8, 9],
        graduation: []
    };

    const NPC_IMAGE_FILES = {
        entrance: 'assets/characters/辅导员.png',
        classroom: 'assets/characters/校长.png',
        studyroom: 'assets/characters/学长.png',
        garden: 'assets/characters/院长.png',
        graduation: 'assets/characters/郭老师.jpg'
    };

    const LEVELS = [
        { level: 1, name: '译界菜鸟', exp: 0 },
        { level: 2, name: '学习者', exp: 20 },
        { level: 3, name: '阅读达人', exp: 50 },
        { level: 4, name: '知识学者', exp: 80 },
        { level: 5, name: '外语楼传奇', exp: 100 }
    ];

    const ACHIEVEMENT_DEFS = {
        flowerOffering: { name: '致敬伟人', description: '向毛主席像献花', hidden: true }
    };

    // ==================== SOUND MANAGER ====================

    function SoundManager() {
        this.ctx = null;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {}
    }

    SoundManager.prototype.play = function (type) {
        if (!this.ctx) return;
        try {
            var osc = this.ctx.createOscillator();
            var gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            var t = this.ctx.currentTime;
            switch (type) {
                case 'dialogue':
                    osc.frequency.value = 660;
                    gain.gain.setValueAtTime(0.18, t);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
                    osc.start(t); osc.stop(t + 0.15);
                    break;
                case 'success':
                    osc.frequency.setValueAtTime(523, t);
                    osc.frequency.setValueAtTime(659, t + 0.1);
                    osc.frequency.setValueAtTime(784, t + 0.2);
                    gain.gain.setValueAtTime(0.25, t);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
                    osc.start(t); osc.stop(t + 0.4);
                    break;
                case 'correct':
                    osc.frequency.setValueAtTime(440, t);
                    osc.frequency.setValueAtTime(554, t + 0.08);
                    osc.frequency.setValueAtTime(659, t + 0.16);
                    gain.gain.setValueAtTime(0.2, t);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
                    osc.start(t); osc.stop(t + 0.35);
                    break;
                case 'wrong':
                    osc.type = 'sawtooth';
                    osc.frequency.value = 180;
                    gain.gain.setValueAtTime(0.14, t);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
                    osc.start(t); osc.stop(t + 0.3);
                    break;
                case 'levelup':
                    osc.frequency.setValueAtTime(523, t);
                    osc.frequency.setValueAtTime(659, t + 0.12);
                    osc.frequency.setValueAtTime(784, t + 0.24);
                    osc.frequency.setValueAtTime(1047, t + 0.36);
                    gain.gain.setValueAtTime(0.22, t);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
                    osc.start(t); osc.stop(t + 0.6);
                    break;
                case 'achievement':
                    osc.frequency.setValueAtTime(659, t);
                    osc.frequency.setValueAtTime(784, t + 0.15);
                    osc.frequency.setValueAtTime(988, t + 0.3);
                    osc.frequency.setValueAtTime(1319, t + 0.45);
                    gain.gain.setValueAtTime(0.22, t);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);
                    osc.start(t); osc.stop(t + 0.75);
                    break;
                case 'transition':
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(300, t);
                    osc.frequency.exponentialRampToValueAtTime(800, t + 0.3);
                    gain.gain.setValueAtTime(0.16, t);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
                    osc.start(t); osc.stop(t + 0.4);
                    break;
                case 'celebration':
                    var o2 = this.ctx.createOscillator();
                    var g2 = this.ctx.createGain();
                    o2.connect(g2); g2.connect(this.ctx.destination);
                    var o3 = this.ctx.createOscillator();
                    var g3 = this.ctx.createGain();
                    o3.connect(g3); g3.connect(this.ctx.destination);
                    var o4 = this.ctx.createOscillator();
                    var g4 = this.ctx.createGain();
                    o4.connect(g4); g4.connect(this.ctx.destination);
                    o2.type = 'triangle'; o3.type = 'sawtooth'; o4.type = 'square';
                    var v1 = 0.16, v2 = 0.1, v3 = 0.05, v4 = 0.03;
                    gain.gain.setValueAtTime(v1, t);
                    g2.gain.setValueAtTime(v2, t);
                    g3.gain.setValueAtTime(v3, t);
                    g4.gain.setValueAtTime(v4, t);
                    osc.frequency.setValueAtTime(523, t);
                    osc.frequency.setValueAtTime(659, t + 0.12);
                    osc.frequency.setValueAtTime(784, t + 0.24);
                    osc.frequency.setValueAtTime(1047, t + 0.36);
                    osc.frequency.setValueAtTime(1319, t + 0.48);
                    osc.frequency.setValueAtTime(1568, t + 0.6);
                    osc.frequency.setValueAtTime(2093, t + 0.72);
                    o2.frequency.setValueAtTime(262, t);
                    o2.frequency.setValueAtTime(330, t + 0.12);
                    o2.frequency.setValueAtTime(392, t + 0.24);
                    o2.frequency.setValueAtTime(523, t + 0.36);
                    o2.frequency.setValueAtTime(659, t + 0.48);
                    o2.frequency.setValueAtTime(784, t + 0.6);
                    o2.frequency.setValueAtTime(1047, t + 0.72);
                    o3.frequency.setValueAtTime(392, t);
                    o3.frequency.setValueAtTime(494, t + 0.12);
                    o3.frequency.setValueAtTime(587, t + 0.24);
                    o3.frequency.setValueAtTime(784, t + 0.36);
                    o3.frequency.setValueAtTime(988, t + 0.48);
                    o3.frequency.setValueAtTime(1175, t + 0.6);
                    o3.frequency.setValueAtTime(1568, t + 0.72);
                    o4.frequency.setValueAtTime(659, t);
                    o4.frequency.setValueAtTime(784, t + 0.12);
                    o4.frequency.setValueAtTime(988, t + 0.24);
                    o4.frequency.setValueAtTime(1175, t + 0.36);
                    o4.frequency.setValueAtTime(1568, t + 0.48);
                    o4.frequency.setValueAtTime(1760, t + 0.6);
                    o4.frequency.setValueAtTime(2637, t + 0.72);
                    var endV = 0.001;
                    gain.gain.exponentialRampToValueAtTime(endV, t + 1.0);
                    g2.gain.exponentialRampToValueAtTime(endV, t + 1.05);
                    g3.gain.exponentialRampToValueAtTime(endV, t + 1.0);
                    g4.gain.exponentialRampToValueAtTime(endV, t + 0.9);
                    osc.start(t); osc.stop(t + 1.0);
                    o2.start(t); o2.stop(t + 1.05);
                    o3.start(t); o3.stop(t + 1.0);
                    o4.start(t); o4.stop(t + 0.9);
                    break;
            }
        } catch (e) {}
    };

    SoundManager.prototype.bgmPlaying = false;
    SoundManager.prototype.bgmTimer = null;

    SoundManager.prototype.startBGM = function () {
        if (!this.ctx || this.bgmPlaying) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        this.bgmPlaying = true;
        this._scheduleBGM();
    };

    SoundManager.prototype.stopBGM = function () {
        this.bgmPlaying = false;
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    };

    SoundManager.prototype._bgmTone = function (freq, dur, type, vol, st) {
        try {
            var osc = this.ctx.createOscillator();
            var gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.type = type;
            osc.frequency.setValueAtTime(freq, st);
            gain.gain.setValueAtTime(vol, st);
            gain.gain.exponentialRampToValueAtTime(0.001, st + dur);
            osc.start(st);
            osc.stop(st + dur);
        } catch (e) {}
    };

    SoundManager.prototype._bgmNoise = function (dur, vol, st) {
        try {
            var buf = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
            var d = buf.getChannelData(0);
            for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
            var src = this.ctx.createBufferSource();
            src.buffer = buf;
            var g = this.ctx.createGain();
            src.connect(g);
            g.connect(this.ctx.destination);
            g.gain.setValueAtTime(vol, st);
            g.gain.exponentialRampToValueAtTime(0.001, st + dur);
            src.start(st);
        } catch (e) {}
    };

    SoundManager.prototype._scheduleBGM = function () {
        if (!this.bgmPlaying || !this.ctx) return;
        var bpm = 128;
        var beat = 60 / bpm;
        var t = this.ctx.currentTime + 0.03;
        var self = this;
        var chords = [[262,330,392],[294,349,440],[349,440,523],[392,494,587]];
        var bassN = [262, 294, 349, 392];
        for (var b = 0; b < 16; b++) {
            var ci = Math.floor(b / 4);
            var ni = b % 4;
            var st = t + b * beat;
            if (ni === 0 || ni === 2) this._bgmTone(bassN[ci], beat * 0.7, 'triangle', 0.055, st);
            var arp = chords[ci];
            var pat = [arp[0], arp[2], arp[1], arp[2]];
            this._bgmTone(pat[ni], beat * 0.25, 'square', 0.025, st);
            this._bgmNoise(beat * 0.04, 0.014, st);
        }
        this.bgmTimer = setTimeout(function () { self._scheduleBGM(); }, 16 * beat * 1000 - 40);
    };

    SoundManager.prototype.resume = function () {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    };

    const SAVE_KEY = 'tongji_adventure_save';

    // ==================== EMBEDDED QUESTIONS (fallback) ====================

    var FALLBACK_QUESTIONS = [
        { "question": "世界上最长的河流是？", "options": ["长江", "尼罗河", "亚马逊河", "密西西比河"], "answer": "尼罗河" },
        { "question": "联合国官方语言中不包括以下哪种？", "options": ["阿拉伯语", "葡萄牙语", "西班牙语", "俄语"], "answer": "葡萄牙语" },
        { "question": "「Château」在法语中是什么意思？", "options": ["教堂", "城堡", "花园", "图书馆"], "answer": "城堡" },
        { "question": "以下哪部作品不是莎士比亚所著？", "options": ["《哈姆雷特》", "《李尔王》", "《浮士德》", "《麦克白》"], "answer": "《浮士德》" },
        { "question": "语言学中，研究语言意义的学科是？", "options": ["语音学", "句法学", "语义学", "语用学"], "answer": "语义学" },
        { "question": "同济大学的校训是？", "options": ["自强不息，厚德载物", "同舟共济", "博学而笃志，切问而近思", "实事求是"], "answer": "同舟共济" },
        { "question": "以下哪种语言不属于印欧语系？", "options": ["英语", "法语", "芬兰语", "波斯语"], "answer": "芬兰语" },
        { "question": "翻译理论中，「动态对等」是由谁提出的？", "options": ["尤金·奈达", "彼得·纽马克", "雅各布森", "韦努蒂"], "answer": "尤金·奈达" },
        { "question": "日语中的「勉強」（benkyou）是什么意思？", "options": ["勉强", "学习", "努力", "考试"], "answer": "学习" },
        { "question": "世界上使用人数最多的语言是？", "options": ["英语", "西班牙语", "汉语", "印地语"], "answer": "汉语" }
    ];

    // ==================== QUESTIONS ====================

    var QUESTIONS = [];

    async function loadQuestions() {
        try {
            var resp = await fetch('questions.json');
            if (resp.ok) {
                QUESTIONS = await resp.json();
                console.log('[游戏] 已从 questions.json 加载题库');
                return;
            }
        } catch (e) {
            console.warn('[游戏] fetch 加载 questions.json 失败，使用内嵌题库', e);
        }
        QUESTIONS = FALLBACK_QUESTIONS.slice();
        console.log('[游戏] 使用内嵌题库（共' + QUESTIONS.length + '题）');
    }

    // ==================== GAME STATE ====================

    function createGameState() {
        return {
            level: 1,
            exp: 0,
            currentScene: 'schoolgate',
            completedQuestions: [],
            playerName: '',
            studentId: '',
            achievements: [],
            sceneFlags: {},
            save: function () {
                try {
                    localStorage.setItem(SAVE_KEY, JSON.stringify({
                        level: this.level,
                        exp: this.exp,
                        currentScene: this.currentScene,
                        completedQuestions: this.completedQuestions,
                        playerName: this.playerName,
                        studentId: this.studentId,
                        achievements: this.achievements,
                        sceneFlags: this.sceneFlags
                    }));
                } catch (e) { /* ignore */ }
            },
            load: function () {
                try {
                    var data = localStorage.getItem(SAVE_KEY);
                    if (!data) return false;
                    var d = JSON.parse(data);
                    this.level = d.level || 1;
                    this.exp = d.exp || 0;
                    this.currentScene = d.currentScene || 'schoolgate';
                    this.completedQuestions = d.completedQuestions || [];
                    this.playerName = d.playerName || '';
                    this.studentId = d.studentId || '';
                    this.achievements = d.achievements || [];
                    this.sceneFlags = d.sceneFlags || {};
                    return true;
                } catch (e) { return false; }
            },
            clear: function () {
                try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
            },
            getLevelInfo: function () {
                var info = LEVELS[0];
                for (var i = LEVELS.length - 1; i >= 0; i--) {
                    if (this.exp >= LEVELS[i].exp) { info = LEVELS[i]; break; }
                }
                this.level = info.level;
                return info;
            },
            getExpProgress: function () {
                var cur = this.getLevelInfo();
                var idx = LEVELS.findIndex(function (l) { return l.level === cur.level; });
                if (idx >= LEVELS.length - 1) return 1;
                var next = LEVELS[idx + 1];
                return Math.min((this.exp - cur.exp) / (next.exp - cur.exp), 1);
            },
            addExp: function (amount) {
                this.exp += amount;
                var oldLevel = this.level;
                this.getLevelInfo();
                return this.level > oldLevel;
            },
            isQuestionCompleted: function (qid) {
                return this.completedQuestions.indexOf(qid) !== -1;
            },
            completeQuestion: function (qid) {
                if (this.completedQuestions.indexOf(qid) === -1) {
                    this.completedQuestions.push(qid);
                }
            },
            getSceneQuestions: function (key) {
                return SCENE_QUESTIONS[key] || [];
            },
            areSceneQuestionsComplete: function (key) {
                var qs = this.getSceneQuestions(key);
                for (var i = 0; i < qs.length; i++) {
                    if (!this.isQuestionCompleted(qs[i])) return false;
                }
                return true;
            },
            getNextScene: function () {
                var idx = SCENE_KEYS.indexOf(this.currentScene);
                if (idx >= 0 && idx < SCENE_KEYS.length - 1) return SCENE_KEYS[idx + 1];
                return null;
            },
            getTotalQuestions: function () {
                return QUESTIONS.length;
            },
            getCorrectCount: function () {
                return this.completedQuestions.length;
            },
            getAccuracy: function () {
                var total = this.getTotalQuestions();
                return total === 0 ? 0 : Math.round(this.getCorrectCount() / total * 100);
            },
            isAllComplete: function () {
                return this.completedQuestions.length >= this.getTotalQuestions();
            }
        };
    }

    // ==================== SPRITE LOADING & GENERATION ====================

    function createCharacterSprite(w, h, pixels) {
        var c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        var ctx = c.getContext('2d');
        for (var i = 0; i < pixels.length; i++) {
            var p = pixels[i];
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.w || 1, p.h || 1);
        }
        return c;
    }

    function generatePlayerSprite(frame) {
        var p = [];
        var legOffset = (frame === 1) ? 1 : 0;
        p.push({ x: 10, y: 0, w: 12, h: 6, color: '#5c3317' });
        p.push({ x: 8, y: 3, w: 16, h: 4, color: '#5c3317' });
        p.push({ x: 10, y: 7, w: 12, h: 10, color: '#ffd5b4' });
        p.push({ x: 12, y: 10, w: 3, h: 2, color: '#000' });
        p.push({ x: 19, y: 10, w: 3, h: 2, color: '#000' });
        p.push({ x: 14, y: 14, w: 4, h: 1, color: '#c4876a' });
        p.push({ x: 8, y: 17, w: 16, h: 12, color: '#3a6ea5' });
        p.push({ x: 4, y: 18, w: 5, h: 8, color: '#ffd5b4' });
        p.push({ x: 23, y: 18, w: 5, h: 8, color: '#ffd5b4' });
        p.push({ x: 9, y: 29, w: 6, h: 8, color: '#2c4a6e' });
        p.push({ x: 17 + legOffset, y: 29, w: 6, h: 8, color: '#2c4a6e' });
        p.push({ x: 8, y: 37, w: 7, h: 4, color: '#4a3728' });
        p.push({ x: 17 + legOffset, y: 37, w: 7, h: 4, color: '#4a3728' });
        return createCharacterSprite(32, 42, p);
    }

    function generateNPCSprite(color) {
        var p = [];
        p.push({ x: 9, y: 0, w: 14, h: 6, color: '#4a4a4a' });
        p.push({ x: 7, y: 3, w: 18, h: 4, color: '#4a4a4a' });
        p.push({ x: 10, y: 7, w: 12, h: 10, color: '#ffd5b4' });
        p.push({ x: 12, y: 10, w: 3, h: 2, color: '#000' });
        p.push({ x: 19, y: 10, w: 3, h: 2, color: '#000' });
        p.push({ x: 14, y: 14, w: 4, h: 1, color: '#c4876a' });
        p.push({ x: 8, y: 17, w: 16, h: 12, color: color || '#6688aa' });
        p.push({ x: 4, y: 18, w: 5, h: 8, color: '#ffd5b4' });
        p.push({ x: 23, y: 18, w: 5, h: 8, color: '#ffd5b4' });
        p.push({ x: 9, y: 29, w: 6, h: 8, color: '#444' });
        p.push({ x: 17, y: 29, w: 6, h: 8, color: '#444' });
        p.push({ x: 8, y: 37, w: 7, h: 4, color: '#333' });
        p.push({ x: 17, y: 37, w: 7, h: 4, color: '#333' });
        return createCharacterSprite(32, 42, p);
    }

    function generatePlayerSprites() {
        return {
            stand: generatePlayerSprite(0),
            walk1: generatePlayerSprite(0),
            walk2: generatePlayerSprite(1)
        };
    }

    function loadImage(src) {
        return new Promise(function (resolve) {
            var img = new Image();
            img.onload = function () { resolve(img); };
            img.onerror = function () { resolve(null); };
            img.src = src;
        });
    }

    function chromaKeyImage(img, threshold) {
        threshold = threshold || 85;
        var c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        var ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        var imageData = ctx.getImageData(0, 0, c.width, c.height);
        var data = imageData.data;
        function sampleColor(x, y) {
            var idx = (y * c.width + x) * 4;
            return { r: data[idx], g: data[idx + 1], b: data[idx + 2] };
        }
        var corners = [
            sampleColor(0, 0),
            sampleColor(c.width - 1, 0),
            sampleColor(0, c.height - 1),
            sampleColor(c.width - 1, c.height - 1)
        ];
        var bgR = 0, bgG = 0, bgB = 0;
        for (var i = 0; i < corners.length; i++) {
            bgR += corners[i].r;
            bgG += corners[i].g;
            bgB += corners[i].b;
        }
        bgR = Math.round(bgR / 4);
        bgG = Math.round(bgG / 4);
        bgB = Math.round(bgB / 4);
        for (var i = 0; i < data.length; i += 4) {
            var dr = data[i] - bgR;
            var dg = data[i + 1] - bgG;
            var db = data[i + 2] - bgB;
            var dist = Math.sqrt(dr * dr + dg * dg + db * db);
            if (dist < threshold) {
                data[i + 3] = 0;
            }
            if (data[i] > 190 && data[i + 1] > 190 && data[i + 2] > 190) {
                data[i + 3] = 0;
            }
        }
        ctx.putImageData(imageData, 0, 0);
        return c;
    }

    function loadCharacterImage(src) {
        return loadImage(src).then(function (img) {
            if (!img) return null;
            try {
                return chromaKeyImage(img);
            } catch (e) {
                console.warn('[游戏] 抠图失败，使用原图', e);
                return img;
            }
        });
    }

    // ==================== GAME ENGINE ====================

    function GameEngine() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.state = createGameState();
        this.backgrounds = {};
        this.playerSprites = null;
        this.npcSprite = null;
        this.sceneKey = 'schoolgate';
        this.player = { x: 0, y: 0 };
        this.keys = {};
        this.animFrame = 0;
        this.animTimer = 0;
        this.running = false;
        this.quizActive = false;
        this.dialogueActive = false;
        this.gateFormActive = false;
        this.lastTime = 0;
        this.bgLoaded = {};
        this.transitioning = false;
        this.endingShown = false;
        this.particles = [];
        this.fireworksActive = false;
        this.fireworkTimer = 0;
        this.externalPlayerImg = null;
        this.externalNpcImg = null;
        this.npcSceneImages = {};
        this.sound = new SoundManager();

        this.el = {
            loading: document.getElementById('loading-screen'),
            level: document.getElementById('level-display'),
            expBar: document.getElementById('exp-bar-fill'),
            expText: document.getElementById('exp-text'),
            taskTitle: document.getElementById('task-title'),
            taskText: document.getElementById('task-text'),
            interactHint: document.getElementById('interact-hint'),
            quizOverlay: document.getElementById('quiz-overlay'),
            quizProgress: document.getElementById('quiz-progress'),
            quizQuestion: document.getElementById('quiz-question'),
            quizOptions: document.getElementById('quiz-options'),
            quizFeedback: document.getElementById('quiz-feedback'),
            dialogueOverlay: document.getElementById('dialogue-overlay'),
            dialogueName: document.getElementById('dialogue-npc-name'),
            dialogueText: document.getElementById('dialogue-text'),
            dialogueContinue: document.getElementById('dialogue-continue'),
            notification: document.getElementById('notification'),
            levelupOverlay: document.getElementById('levelup-overlay'),
            levelupText: document.getElementById('levelup-text'),
            levelupDetail: document.getElementById('levelup-detail'),
            endingOverlay: document.getElementById('ending-overlay'),
            endingStats: document.getElementById('ending-stats'),
            endingTitle: document.getElementById('ending-title-final'),
            restartBtn: document.getElementById('restart-btn'),
            gateFormOverlay: document.getElementById('gate-form-overlay'),
            gateFormName: document.getElementById('gate-form-name'),
            gateFormId: document.getElementById('gate-form-id'),
            gateFormSubmit: document.getElementById('gate-form-submit'),
            gateFormError: document.getElementById('gate-form-error')
        };
    }

    GameEngine.prototype.loadCharacterImages = async function () {
        var self = this;
        var playerImg = await loadCharacterImage('assets/characters/player.png');
        if (playerImg) {
            this.externalPlayerImg = playerImg;
            console.log('[游戏] 已加载外部玩家图片');
        }
        for (var key in NPC_IMAGE_FILES) {
            if (NPC_IMAGE_FILES.hasOwnProperty(key)) {
                var npcImg = await loadCharacterImage(NPC_IMAGE_FILES[key]);
                if (npcImg) {
                    self.npcSceneImages[key] = npcImg;
                    console.log('[游戏] 已加载NPC图片: ' + NPC_IMAGE_FILES[key]);
                }
            }
        }
    };

    GameEngine.prototype.init = async function () {
        await loadQuestions();
        this.playerSprites = generatePlayerSprites();
        this.npcSprite = generateNPCSprite('#6688aa');
        this.initNPCSprites();
        await this.loadCharacterImages();
        var hasSave = this.state.load();
        if (hasSave && this.state.isAllComplete()) {
            this.sceneKey = this.state.currentScene;
        } else if (hasSave) {
            this.sceneKey = this.state.currentScene;
        } else {
            this.sceneKey = 'schoolgate';
        }
        this.player.x = SCENE_CONFIG[this.sceneKey].spawn.x;
        this.player.y = SCENE_CONFIG[this.sceneKey].spawn.y;
        var self = this;
        document.addEventListener('keydown', function (e) {
            self.sound.resume();
            self.sound.startBGM();
            var key = e.key.toLowerCase();
            self.keys[key] = true;
            if (['w', 'a', 's', 'd', 'e'].indexOf(key) !== -1) e.preventDefault();
            if (key === 'e') {
                if (self.dialogueActive) {
                    self.onDialogueContinue();
                } else if (self.gateFormActive) {
                    // let form handle keys
                } else {
                    self.onInteractKey();
                }
            }
            if (key === 'r' && !self.quizActive && !self.gateFormActive) {
                self.restartGame();
            }
        });
        document.addEventListener('keyup', function (e) {
            self.keys[e.key.toLowerCase()] = false;
        });

        this.canvas.addEventListener('click', function (e) {
            self.sound.resume();
            self.sound.startBGM();
            self.handleCanvasClick(e);
        });

        this.el.gateFormSubmit.addEventListener('click', function () {
            self.sound.resume();
            self.sound.startBGM();
            self.handleGateSubmit();
        });
        this.el.gateFormName.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                self.el.gateFormId.focus();
            }
        });
        this.el.gateFormId.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                self.handleGateSubmit();
            }
        });

        var restartHudBtn = document.getElementById('restart-hud-btn');
        if (restartHudBtn) {
            restartHudBtn.addEventListener('click', function () {
                self.sound.resume();
                self.restartGame();
            });
        }

        this.running = true;
        this.lastTime = performance.now();
        await this.loadSceneBackgrounds();
        this.hideLoading();
        this.gameLoop(performance.now());
    };

    GameEngine.prototype.hideLoading = function () {
        var el = this.el.loading;
        el.classList.add('hidden');
        setTimeout(function () { el.style.display = 'none'; }, 600);
    };

    GameEngine.prototype.loadSceneBackgrounds = function () {
        var self = this;
        var promises = SCENE_KEYS.map(function (key) {
            var bgFile = SCENE_CONFIG[key].bg;
            if (!bgFile) { self.bgLoaded[key] = true; return Promise.resolve(); }
            return new Promise(function (resolve) {
                var img = new Image();
                img.onload = function () {
                    self.backgrounds[key] = img;
                    self.bgLoaded[key] = true;
                    resolve();
                };
                img.onerror = function () {
                    console.warn('[游戏] 无法加载背景: ' + bgFile);
                    self.bgLoaded[key] = false;
                    resolve();
                };
                img.src = 'assets/backgrounds/' + bgFile;
            });
        });
        return Promise.all(promises);
    };

    GameEngine.prototype.gameLoop = function (now) {
        if (!this.running) return;
        var dt = Math.min((now - this.lastTime) / 1000, 0.05);
        this.lastTime = now;
        this.update(dt);
        this.render();
        var self = this;
        requestAnimationFrame(function (t) { self.gameLoop(t); });
    };

    GameEngine.prototype.update = function (dt) {
        if (this.quizActive || this.dialogueActive || this.gateFormActive) return;
        var speed = CONFIG.PLAYER_SPEED;
        var vx = 0, vy = 0;
        if (this.keys['a']) vx -= 1;
        if (this.keys['d']) vx += 1;
        if (this.keys['w']) vy -= 1;
        if (this.keys['s']) vy += 1;
        if (vx !== 0 && vy !== 0) {
            vx *= 0.707;
            vy *= 0.707;
        }
        this.player.x += vx * speed * dt;
        this.player.y += vy * speed * dt;
        this.player.x = Math.max(16, Math.min(CONFIG.W - 16, this.player.x));
        this.player.y = Math.max(16, Math.min(CONFIG.H - 16, this.player.y));
        if (vx !== 0 || vy !== 0) {
            this.animTimer += dt;
            if (this.animTimer > 0.2) {
                this.animTimer = 0;
                this.animFrame = this.animFrame === 0 ? 1 : 0;
            }
        } else {
            this.animFrame = 0;
            this.animTimer = 0;
        }
        var cfg = SCENE_CONFIG[this.sceneKey];
        var nearNpc = false;
        if (cfg && cfg.npc) {
            var dx = this.player.x - cfg.npc.x;
            var dy = this.player.y - cfg.npc.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            nearNpc = dist < CONFIG.NPC_RANGE;
        }
        var nearClickable = false;
        var clickableHint = '';
        if (cfg && cfg.clickables) {
            for (var ci = 0; ci < cfg.clickables.length; ci++) {
                var cl = cfg.clickables[ci];
                var cdx = this.player.x - cl.x;
                var cdy = this.player.y - cl.y;
                var cdist = Math.sqrt(cdx * cdx + cdy * cdy);
                if (cdist < (cl.range || 50)) {
                    nearClickable = true;
                    if (cl.action === 'flowerOffering' && this.state.achievements.indexOf('flowerOffering') === -1) {
                        clickableHint = '点击' + cl.name + '献花';
                    } else if (cl.action === 'flowerOffering') {
                        clickableHint = '已献花';
                    }
                    break;
                }
            }
        }
        if (nearClickable && clickableHint) {
            this.el.interactHint.textContent = clickableHint;
            this.el.interactHint.classList.add('visible');
        } else if (nearNpc) {
            this.el.interactHint.innerHTML = '按 <span>E</span> 与NPC交谈';
            this.el.interactHint.classList.add('visible');
        } else {
            this.el.interactHint.classList.remove('visible');
        }
        if (cfg && cfg.exit) {
            var ex = cfg.exit.x, ey = cfg.exit.y;
            var rx = cfg.exit.rx || 60, ry = cfg.exit.ry || 160;
            var pdx = (this.player.x - ex) / rx;
            var pdy = (this.player.y - ey) / ry;
            if (pdx * pdx + pdy * pdy <= 1) {
                this.handleExit();
            }
        }
        this.updateHUD();
        if (this.fireworksActive) {
            this.fireworkTimer += dt;
            if (this.fireworkTimer > 0.4) {
                this.fireworkTimer = 0;
                this.addFireworkBurst();
            }
            for (var pi = this.particles.length - 1; pi >= 0; pi--) {
                var pp = this.particles[pi];
                pp.x += pp.vx * dt;
                pp.y += pp.vy * dt;
                pp.vy += 120 * dt;
                pp.life -= pp.decay * dt;
                if (pp.life <= 0) this.particles.splice(pi, 1);
            }
        }
    };

    GameEngine.prototype.initNPCSprites = function () {
        this.npcSprites = {};
        var colors = {
            schoolgate: '#445566',
            maosquare: '#6688aa',
            entrance: '#5588aa',
            classroom: '#6688aa',
            studyroom: '#668855',
            garden: '#8866aa',
            graduation: '#cc8844'
        };
        for (var key in colors) {
            if (colors.hasOwnProperty(key)) {
                this.npcSprites[key] = generateNPCSprite(colors[key]);
            }
        }
    };

    GameEngine.prototype.render = function () {
        var ctx = this.ctx;
        var W = CONFIG.W, H = CONFIG.H;
        ctx.clearRect(0, 0, W, H);
        var bg = this.backgrounds[this.sceneKey];
        if (bg) {
            var scale = Math.max(W / bg.width, H / bg.height);
            var bw = bg.width * scale;
            var bh = bg.height * scale;
            var bx = (W - bw) / 2;
            var by = (H - bh) / 2;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(bg, bx, by, bw, bh);
        } else if (this.sceneKey === 'graduation') {
            var grad = ctx.createLinearGradient(0, 0, 0, H);
            grad.addColorStop(0, '#1a0533');
            grad.addColorStop(0.4, '#2d1b4e');
            grad.addColorStop(0.7, '#1a1a2e');
            grad.addColorStop(1, '#0d0d1a');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);
            if (!this.endingShown) {
                ctx.fillStyle = 'rgba(255, 215, 0, 0.03)';
                for (var si = 0; si < 40; si++) {
                    var sx = (si * 137 + 50) % W;
                    var sy = (si * 97 + 20) % (H * 0.6);
                    ctx.beginPath();
                    ctx.arc(sx, sy, 1 + (si % 3), 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        } else {
            ctx.fillStyle = '#222';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = '#666';
            ctx.font = '16px "Microsoft YaHei", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('加载背景中...', W / 2, H / 2);
        }
        var nearNpc = false;
        var cfg = SCENE_CONFIG[this.sceneKey];
        if (cfg && cfg.npc) {
            var dx = this.player.x - cfg.npc.x;
            var dy = this.player.y - cfg.npc.y;
            nearNpc = Math.sqrt(dx * dx + dy * dy) < CONFIG.NPC_RANGE;
        }
        function drawCharacter(img, cx, groundY, targetH) {
            if (!img) return;
            var scale = targetH / img.height;
            var cw = Math.round(img.width * scale);
            var ch = Math.round(img.height * scale);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, Math.round(cx - cw / 2), groundY - ch, cw, ch);
        }
        if (cfg && cfg.npc) {
            ctx.fillStyle = 'rgba(0,0,0,0.25)';
            ctx.beginPath();
            ctx.ellipse(cfg.npc.x, cfg.npc.y + 8, 20, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            if (nearNpc) {
                ctx.shadowColor = '#ffee88';
                ctx.shadowBlur = 18;
            }
            var extNpcImg = this.npcSceneImages[this.sceneKey];
            if (extNpcImg) {
                drawCharacter(extNpcImg, cfg.npc.x, cfg.npc.y, 120);
            } else {
                var npcImg = this.npcSprites[this.sceneKey] || this.npcSprite;
                ctx.drawImage(npcImg, cfg.npc.x - 16, cfg.npc.y - 42);
            }
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(cfg.npc.x - 30, cfg.npc.y - 48, 60, 16);
            ctx.fillStyle = '#fff';
            ctx.font = '11px "Microsoft YaHei", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(cfg.npc.name, cfg.npc.x, cfg.npc.y - 36);
            ctx.fillStyle = nearNpc ? '#ffdd44' : '#ffee88';
            ctx.beginPath();
            ctx.arc(cfg.npc.x, cfg.npc.y - 4, nearNpc ? 5 : 3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(this.player.x, this.player.y + 8, 18, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        if (this.externalPlayerImg) {
            drawCharacter(this.externalPlayerImg, this.player.x, this.player.y, 120);
        } else {
            var sprite = this.animFrame === 0 ? this.playerSprites.stand : this.playerSprites.walk2;
            ctx.drawImage(sprite, this.player.x - 16, this.player.y - 42);
        }
        if (cfg && cfg.exit) {
            var canExit = true;
            if (this.sceneKey === 'schoolgate') {
                canExit = !!this.state.sceneFlags['schoolgateRegistered'];
            }
            var pulse = Math.sin(performance.now() / 300) * 0.2 + 0.8;
            var ex = cfg.exit.x, ey = cfg.exit.y;
            var rx = cfg.exit.rx || 60, ry = cfg.exit.ry || 160;
            ctx.fillStyle = canExit
                ? 'rgba(68, 255, 136, ' + (0.08 * pulse) + ')'
                : 'rgba(255, 100, 100, ' + (0.06 * pulse) + ')';
            ctx.beginPath();
            ctx.ellipse(ex, ey, rx, ry, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = canExit ? 'rgba(68, 255, 136, 0.3)' : 'rgba(255, 100, 100, 0.25)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 6]);
            ctx.beginPath();
            ctx.ellipse(ex, ey, rx, ry, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = canExit ? '#8f8' : '#f88';
            ctx.font = 'bold 13px "Microsoft YaHei", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('▶ 出口', ex, ey - ry - 16);
        }
        if (cfg && cfg.clickables) {
            for (var ci = 0; ci < cfg.clickables.length; ci++) {
                var cl = cfg.clickables[ci];
                var pulse2 = Math.sin(performance.now() / 400) * 0.3 + 0.7;
                ctx.fillStyle = 'rgba(218, 165, 32, ' + (0.1 * pulse2) + ')';
                ctx.beginPath();
                ctx.arc(cl.x, cl.y, (cl.range || 50), 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = 'rgba(218, 165, 32, 0.35)';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([4, 6]);
                ctx.beginPath();
                ctx.arc(cl.x, cl.y, (cl.range || 50), 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.fillStyle = 'rgba(218, 165, 32, 0.9)';
                ctx.font = 'bold 12px "Microsoft YaHei", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('✦ ' + cl.name, cl.x, cl.y - (cl.range || 50) - 10);
            }
        }
        if (this.fireworksActive) {
            for (var pi = 0; pi < this.particles.length; pi++) {
                var pp = this.particles[pi];
                ctx.globalAlpha = Math.max(0, pp.life);
                ctx.fillStyle = pp.color;
                ctx.fillRect(pp.x - pp.size / 2, pp.y - pp.size / 2, pp.size, pp.size);
            }
            ctx.globalAlpha = 1;
        }
    };

    GameEngine.prototype.updateHUD = function () {
        var info = this.state.getLevelInfo();
        this.el.level.textContent = 'Lv.' + info.level + ' ' + info.name;
        this.el.expBar.style.width = Math.round(this.state.getExpProgress() * 100) + '%';
        this.el.expText.textContent = 'EXP: ' + this.state.exp;
        var cfg = SCENE_CONFIG[this.sceneKey];
        var sceneName = cfg ? cfg.name : '未知';
        var qs = this.state.getSceneQuestions(this.sceneKey);
        var done = 0;
        for (var i = 0; i < qs.length; i++) {
            if (this.state.isQuestionCompleted(qs[i])) done++;
        }
        if (qs.length === 0) {
            if (this.sceneKey === 'schoolgate') {
                if (this.state.sceneFlags['schoolgateRegistered']) {
                    this.el.taskText.textContent = '已登记入校\n前往校门出口';
                } else {
                    this.el.taskText.textContent = '同济大学校门\n找保安登记入校';
                }
            } else if (this.sceneKey === 'maosquare') {
                var hasOffering = this.state.achievements.indexOf('flowerOffering') !== -1;
                this.el.taskText.textContent = '毛主席像广场\n' + (hasOffering ? '已向伟人献花' : '可向毛主席像献花');
            } else if (this.sceneKey === 'graduation') {
                this.el.taskText.textContent = this.endingShown ? '毕业典礼\n恭喜通关！' : '毕业典礼\n与郭老师对话';
            } else {
                this.el.taskText.textContent = sceneName;
            }
        } else if (this.state.isAllComplete()) {
            this.el.taskText.textContent = '所有挑战已完成！\n前往结局。';
        } else {
            this.el.taskText.textContent = sceneName + '\n(' + done + '/' + qs.length + ')';
        }
    };

    GameEngine.prototype.onInteractKey = function () {
        if (this.quizActive || this.dialogueActive || this.gateFormActive) return;
        var cfg = SCENE_CONFIG[this.sceneKey];
        if (!cfg || !cfg.npc) return;
        var dx = this.player.x - cfg.npc.x;
        var dy = this.player.y - cfg.npc.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= CONFIG.NPC_RANGE) return;

        var npc = cfg.npc;

        if (npc.interactType === 'gateEntry') {
            if (this.state.sceneFlags['schoolgateRegistered']) {
                this.showNotification('已登记入校，欢迎 ' + (this.state.playerName || '同学') + '！');
                return;
            }
            this.showDialogue(npc);
            return;
        }

        if (npc.interactType === 'dialogueOnly') {
            this.showDialogue(npc);
            return;
        }

        if (npc.interactType === 'graduationEnding') {
            this.showDialogue(npc);
            return;
        }

        if (this.state.areSceneQuestionsComplete(this.sceneKey)) {
            this.showNotification('已完成本区域所有挑战！');
            return;
        }
        this.showDialogue(npc);
    };

    GameEngine.prototype.showDialogue = function (npc) {
        this.dialogueActive = true;
        this.el.dialogueName.textContent = npc.name;
        this.el.dialogueText.textContent = npc.dialogue;
        this.el.dialogueOverlay.classList.add('active');
        this.sound.play('dialogue');
    };

    GameEngine.prototype.onDialogueContinue = function () {
        if (!this.dialogueActive) return;
        this.dialogueActive = false;
        this.el.dialogueOverlay.classList.remove('active');

        var cfg = SCENE_CONFIG[this.sceneKey];
        if (cfg && cfg.npc) {
            if (cfg.npc.interactType === 'gateEntry') {
                this.showGateInputForm();
                return;
            }
            if (cfg.npc.interactType === 'dialogueOnly') {
                return;
            }
            if (cfg.npc.interactType === 'graduationEnding') {
                this.showGraduationEnding();
                return;
            }
        }
        this.startQuiz();
    };

    // ==================== GATE INPUT FORM ====================

    GameEngine.prototype.showGateInputForm = function () {
        this.gateFormActive = true;
        this.el.gateFormName.value = '';
        this.el.gateFormId.value = '';
        this.el.gateFormError.textContent = '';
        this.el.gateFormError.style.display = 'none';
        this.el.gateFormOverlay.classList.add('active');
        this.sound.play('dialogue');
        var self = this;
        setTimeout(function () { self.el.gateFormName.focus(); }, 100);
    };

    GameEngine.prototype.handleGateSubmit = function () {
        var name = this.el.gateFormName.value.trim();
        var id = this.el.gateFormId.value.trim();
        if (!name || !id) {
            this.el.gateFormError.textContent = '请输入姓名和学号。';
            this.el.gateFormError.style.display = 'block';
            return;
        }
        this.state.playerName = name;
        this.state.studentId = id;
        this.state.sceneFlags['schoolgateRegistered'] = true;
        this.state.save();
        this.el.gateFormOverlay.classList.remove('active');
        this.gateFormActive = false;
        this.sound.play('success');
        this.showNotification('登记成功！欢迎 ' + name + ' 同学入校。');
        this.showExpFloat('+10 EXP');
        this.state.addExp(10);
        var leveledUp = this.state.getLevelInfo().level > 1;
        if (leveledUp) this.showLevelUp();
        this.updateHUD();
    };

    // ==================== FLOWER OFFERING ====================

    GameEngine.prototype.doFlowerOffering = function () {
        if (this.state.achievements.indexOf('flowerOffering') !== -1) {
            return;
        }
        this.state.achievements.push('flowerOffering');
        this.state.sceneFlags['flowerOfferingDone'] = true;
        this.state.save();
        this.sound.play('achievement');
        this.showAchievementNotification('致敬伟人');
        this.showExpFloat('+20 EXP');
        this.state.addExp(20);
        var leveledUp = this.state.getLevelInfo().level > 1;
        if (leveledUp) this.showLevelUp();
        this.updateHUD();
    };

    GameEngine.prototype.showAchievementNotification = function (name) {
        var el = this.el.notification;
        el.innerHTML = '<div class="notif-bg"><div class="notif-title">成就解锁！</div><div class="notif-sub">「' + name + '」</div></div>';
        el.classList.add('visible');
        var self = this;
        clearTimeout(this._notifTimer);
        this._notifTimer = setTimeout(function () {
            el.classList.remove('visible');
        }, 2200);
    };

    // ==================== CLICKABLE INTERACTION ====================

    GameEngine.prototype.handleCanvasClick = function (e) {
        if (this.quizActive || this.dialogueActive || this.gateFormActive) return;
        var cfg = SCENE_CONFIG[this.sceneKey];
        if (!cfg || !cfg.clickables) return;
        var rect = this.canvas.getBoundingClientRect();
        var scaleX = CONFIG.W / rect.width;
        var scaleY = CONFIG.H / rect.height;
        var mx = (e.clientX - rect.left) * scaleX;
        var my = (e.clientY - rect.top) * scaleY;
        for (var i = 0; i < cfg.clickables.length; i++) {
            var c = cfg.clickables[i];
            var dx = mx - c.x;
            var dy = my - c.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < (c.range || 50)) {
                if (c.action === 'flowerOffering') {
                    if (this.state.achievements.indexOf('flowerOffering') === -1) {
                        this.doFlowerOffering();
                    } else {
                        this.showNotification('已向毛主席像献过花。');
                    }
                }
                return;
            }
        }
    };

    // ==================== QUIZ ====================

    GameEngine.prototype.startQuiz = function () {
        var self = this;
        var qs = this.state.getSceneQuestions(this.sceneKey);
        var remaining = [];
        for (var i = 0; i < qs.length; i++) {
            if (!this.state.isQuestionCompleted(qs[i])) remaining.push(qs[i]);
        }
        if (remaining.length === 0) {
            this.showNotification('已完成本区域所有挑战！');
            return;
        }
        this.quizActive = true;
        this.quizQuestionQueue = remaining;
        this.quizIndex = 0;
        this.showQuestion();
    };

    GameEngine.prototype.showQuestion = function () {
        if (this.quizIndex >= this.quizQuestionQueue.length) {
            this.closeQuiz();
            return;
        }
        var qid = this.quizQuestionQueue[this.quizIndex];
        var q = QUESTIONS[qid];
        if (!q) { this.quizIndex++; this.showQuestion(); return; }
        this.el.quizProgress.textContent = '第 ' + (this.quizIndex + 1) + ' / ' + this.quizQuestionQueue.length + ' 题';
        this.el.quizQuestion.textContent = q.question;
        this.el.quizFeedback.textContent = '';
        this.el.quizFeedback.className = '';
        var opts = this.el.quizOptions;
        opts.innerHTML = '';
        var labels = ['A', 'B', 'C', 'D'];
        var self = this;
        for (var i = 0; i < 4; i++) {
            var btn = document.createElement('div');
            btn.className = 'quiz-option';
            btn.textContent = labels[i] + '. ' + (q.options[i] || '');
            btn.dataset.index = i;
            btn.addEventListener('click', function () { self.handleAnswer(parseInt(this.dataset.index)); });
            opts.appendChild(btn);
        }
        this.el.quizOverlay.classList.add('active');
        this.currentQid = qid;
        this.currentAnswer = q.answer;
        this.currentOptions = q.options;
    };

    GameEngine.prototype.handleAnswer = function (idx) {
        var opts = this.el.quizOptions.querySelectorAll('.quiz-option');
        for (var i = 0; i < opts.length; i++) {
            opts[i].classList.add('disabled');
        }
        var selected = this.currentOptions[idx];
        var correct = selected === this.currentAnswer;
        var correctIdx = this.currentOptions.indexOf(this.currentAnswer);
        if (correctIdx >= 0) opts[correctIdx].classList.add('correct');
        if (!correct) opts[idx].classList.add('wrong');
        var fb = this.el.quizFeedback;
        if (correct) {
            this.sound.play('correct');
            fb.textContent = '回答正确！获得 10 经验值。';
            fb.className = 'correct';
        } else {
            this.sound.play('wrong');
            fb.textContent = '回答错误。正确答案：' + this.currentAnswer;
            fb.className = 'wrong';
        }
        var self = this;
        setTimeout(function () {
            if (correct) {
                var leveledUp = self.state.addExp(10);
                self.state.completeQuestion(self.currentQid);
                self.showExpFloat('+10 EXP');
                if (leveledUp) self.showLevelUp();
            }
            self.state.save();
            self.updateHUD();
            self.quizIndex++;
            if (self.quizIndex >= self.quizQuestionQueue.length) {
                setTimeout(function () { self.closeQuiz(); }, 400);
            } else {
                setTimeout(function () { self.showQuestion(); }, 200);
            }
        }, 1200);
    };

    GameEngine.prototype.closeQuiz = function () {
        this.quizActive = false;
        this.el.quizOverlay.classList.remove('active');
        var cfg = SCENE_CONFIG[this.sceneKey];
        if (cfg && cfg.npc && this.state.areSceneQuestionsComplete(this.sceneKey)) {
            this.showNotification('获得 ' + cfg.npc.reward + '！');
            var nextKey = this.state.getNextScene();
            if (nextKey) {
                var self = this;
                setTimeout(function () {
                    self.showNewArea(SCENE_CONFIG[nextKey].name);
                }, 1200);
            }
        }
        this.updateHUD();
    };

    GameEngine.prototype.handleExit = function () {
        if (this.quizActive || this.dialogueActive) return;
        if (this.transitioning) return;
        var cfg = SCENE_CONFIG[this.sceneKey];
        if (!cfg) return;

        if (this.sceneKey === 'schoolgate') {
            if (!this.state.sceneFlags['schoolgateRegistered']) {
                var now = Date.now();
                if (this._exitNotifTime && now - this._exitNotifTime < 2000) return;
                this._exitNotifTime = now;
                this.showNotification('请先找保安登记入校。');
                return;
            }
        }

        if (!this.state.areSceneQuestionsComplete(this.sceneKey)) {
            var now = Date.now();
            if (this._exitNotifTime && now - this._exitNotifTime < 2000) return;
            this._exitNotifTime = now;
            this.showNotification('请先完成当前区域挑战。');
            return;
        }
        var nextKey = this.state.getNextScene();
        if (!nextKey) {
            if (this.sceneKey === 'garden' && !this.endingShown) {
                this.transitioning = true;
                this.endingShown = true;
                this.showEnding();
                var self = this;
                setTimeout(function () { self.transitioning = false; }, 500);
            }
            return;
        }
        this.transitioning = true;
        this.state.currentScene = nextKey;
        this.state.save();
        this.transitionTo(nextKey);
        var self = this;
        setTimeout(function () { self.transitioning = false; }, 500);
    };

    GameEngine.prototype.transitionTo = function (key) {
        this.sound.play('transition');
        this.sceneKey = key;
        var cfg = SCENE_CONFIG[key];
        if (cfg) {
            this.player.x = cfg.spawn.x;
            this.player.y = cfg.spawn.y;
        }
        this.el.interactHint.classList.remove('visible');
        this.updateHUD();
    };

    // ==================== UI EFFECTS ====================

    GameEngine.prototype.showNotification = function (text) {
        var el = this.el.notification;
        el.innerHTML = '<div class="notif-bg"><div class="notif-sub">' + text + '</div></div>';
        el.classList.add('visible');
        var self = this;
        clearTimeout(this._notifTimer);
        this._notifTimer = setTimeout(function () {
            el.classList.remove('visible');
        }, 1800);
    };

    GameEngine.prototype.showExpFloat = function (text) {
        var el = document.createElement('div');
        el.className = 'exp-float';
        el.textContent = text;
        el.style.left = '400px';
        el.style.top = '280px';
        document.getElementById('game-wrapper').appendChild(el);
        var self = this;
        setTimeout(function () {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 1000);
    };

    GameEngine.prototype.showLevelUp = function () {
        this.sound.play('levelup');
        var info = this.state.getLevelInfo();
        this.el.levelupText.textContent = 'LEVEL UP!';
        this.el.levelupDetail.textContent = 'Lv.' + info.level + ' ' + info.name;
        this.el.levelupOverlay.classList.add('active');
        var self = this;
        setTimeout(function () {
            self.el.levelupOverlay.classList.remove('active');
        }, 1800);
    };

    GameEngine.prototype.showNewArea = function (name) {
        var el = document.createElement('div');
        el.className = 'new-area';
        el.innerHTML = '<div style="font-size:20px;color:#ffdd88;font-weight:bold;">新区域已解锁</div><div style="font-size:16px;color:#fff;margin-top:6px;">' + name + '</div>';
        el.style.left = '50%';
        el.style.top = '40%';
        el.style.transform = 'translate(-50%, -50%)';
        document.getElementById('game-wrapper').appendChild(el);
        var self = this;
        setTimeout(function () {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 2200);
    };

    GameEngine.prototype.showEnding = function () {
        this.sound.stopBGM();
        this.sound.play('celebration');
        var stats = this.el.endingStats;
        stats.innerHTML = '';
        var items = [
            { label: '总经验值', value: this.state.exp + ' EXP' },
            { label: '正确题数', value: this.state.getCorrectCount() + ' / ' + this.state.getTotalQuestions() },
            { label: '正确率', value: this.state.getAccuracy() + '%' },
            { label: '最终等级', value: 'Lv.' + this.state.level + ' ' + this.state.getLevelInfo().name }
        ];
        var achParts = [];
        var achKeys = Object.keys(ACHIEVEMENT_DEFS);
        for (var ai = 0; ai < achKeys.length; ai++) {
            var def = ACHIEVEMENT_DEFS[achKeys[ai]];
            var unlocked = this.state.achievements.indexOf(achKeys[ai]) !== -1;
            if (unlocked) {
                achParts.push(def.name);
            } else if (!def.hidden) {
                achParts.push('???');
            }
        }
        if (achParts.length > 0) {
            items.push({ label: '成就', value: achParts.join(' / ') });
        }
        for (var i = 0; i < items.length; i++) {
            var row = document.createElement('div');
            row.className = 'ending-stat';
            row.innerHTML = '<span class="ending-stat-label">' + items[i].label + '</span><span class="ending-stat-value">' + items[i].value + '</span>';
            stats.appendChild(row);
        }
        this.el.endingTitle.textContent = '获得称号：「外语楼知识达人」';
        this.el.endingOverlay.classList.add('active');
        var self = this;
        this.el.restartBtn.onclick = function () {
            self.sound.stopBGM();
            self.state.clear();
            self.state.level = 1;
            self.state.exp = 0;
            self.state.currentScene = 'schoolgate';
            self.state.completedQuestions = [];
            self.state.playerName = '';
            self.state.studentId = '';
            self.state.achievements = [];
            self.state.sceneFlags = {};
            self.endingShown = false;
            self.transitioning = false;
            self.transitionTo('schoolgate');
            self.el.endingOverlay.classList.remove('active');
            self.updateHUD();
        };
    };

    // ==================== FIREWORK EFFECTS ====================

    GameEngine.prototype.addFireworkBurst = function () {
        var cx = Math.random() * CONFIG.W;
        var cy = 50 + Math.random() * CONFIG.H * 0.4;
        var colors = ['#ff0', '#f0f', '#0ff', '#f44', '#4f4', '#44f', '#ff8800', '#ff4488', '#88ff44', '#fff'];
        var count = 25 + Math.floor(Math.random() * 30);
        for (var fi = 0; fi < count; fi++) {
            var angle = Math.random() * Math.PI * 2;
            var speed = 50 + Math.random() * 140;
            this.particles.push({
                x: cx, y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: 0.3 + Math.random() * 0.6,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: 2 + Math.random() * 3
            });
        }
    };

    GameEngine.prototype.showGraduationEnding = function () {
        this.sound.stopBGM();
        this.sound.play('celebration');
        this.endingShown = true;
        this.fireworksActive = true;
        var stats = this.el.endingStats;
        stats.innerHTML = '';
        var items = [
            { label: '总经验值', value: this.state.exp + ' EXP' },
            { label: '正确题数', value: this.state.getCorrectCount() + ' / ' + this.state.getTotalQuestions() },
            { label: '正确率', value: this.state.getAccuracy() + '%' },
            { label: '最终等级', value: 'Lv.' + this.state.level + ' ' + this.state.getLevelInfo().name }
        ];
        var achParts = [];
        var achKeys = Object.keys(ACHIEVEMENT_DEFS);
        for (var ai = 0; ai < achKeys.length; ai++) {
            var def = ACHIEVEMENT_DEFS[achKeys[ai]];
            var unlocked = this.state.achievements.indexOf(achKeys[ai]) !== -1;
            if (unlocked) achParts.push(def.name);
            else if (!def.hidden) achParts.push('???');
        }
        if (achParts.length > 0) {
            items.push({ label: '成就', value: achParts.join(' / ') });
        }
        for (var i = 0; i < items.length; i++) {
            var row = document.createElement('div');
            row.className = 'ending-stat';
            row.innerHTML = '<span class="ending-stat-label">' + items[i].label + '</span><span class="ending-stat-value">' + items[i].value + '</span>';
            stats.appendChild(row);
        }
        this.el.endingTitle.textContent = '获得称号：【翻译新星】';
        this.el.endingOverlay.classList.add('active');
        this.el.endingOverlay.classList.add('settlement-mode');
        var self = this;
        this.el.restartBtn.onclick = function () {
            self.fireworksActive = false;
            self.particles = [];
            self.restartGame();
        };
    };

    // ==================== RESTART ====================

    GameEngine.prototype.restartGame = function () {
        if (this.quizActive) return;
        this.sound.stopBGM();
        this.state.clear();
        this.state.level = 1;
        this.state.exp = 0;
        this.state.currentScene = 'schoolgate';
        this.state.completedQuestions = [];
        this.state.playerName = '';
        this.state.studentId = '';
        this.state.achievements = [];
        this.state.sceneFlags = {};
        this.endingShown = false;
        this.fireworksActive = false;
        this.particles = [];
        this.transitioning = false;
        this.quizActive = false;
        this.dialogueActive = false;
        this.gateFormActive = false;
        this.el.quizOverlay.classList.remove('active');
        this.el.dialogueOverlay.classList.remove('active');
        this.el.gateFormOverlay.classList.remove('active');
        this.el.endingOverlay.classList.remove('active');
        this.el.endingOverlay.classList.remove('settlement-mode');
        this.transitionTo('schoolgate');
        this.updateHUD();
    };

    // ==================== INITIALIZATION ====================

    var engine = new GameEngine();
    engine.init();

})();
