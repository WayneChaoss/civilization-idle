/**
 * 文明放置 - 核心游戏逻辑
 * Civilization Idle - Core Game Logic
 */

class CivilizationGame {
    constructor() {
        // 游戏状态
        this.state = {
            year: 1,
            lastTick: Date.now(),
            lastSave: Date.now(),
            resources: {},
            buildings: {},
            tech: {},
            exploredTiles: [],
            eventHistory: [],
            population: {
                total: 0,
                idle: 0,
                cap: 10,
                happiness: 100,
                jobs: {}
            }
        };

        // 初始化
        this.init();
    }

    init() {
        // 加载资源定义
        this.resourceDefs = ResourceDefinitions;
        // 加载建筑定义
        this.buildingDefs = BuildingDefinitions;
        // 加载科技定义
        this.techDefs = TechDefinitions;
        // 加载职业定义
        this.jobDefs = JobDefinitions;

        // 初始化资源
        for (let key in this.resourceDefs) {
            this.state.resources[key] = {
                amount: this.resourceDefs[key].initial || 0,
                max: this.resourceDefs[key].max || Infinity,
                rate: 0
            };
        }

        // 初始化建筑计数
        for (let key in this.buildingDefs) {
            this.state.buildings[key] = 0;
        }

        // 初始化科技状态
        for (let key in this.techDefs) {
            this.state.tech[key] = {
                unlocked: this.techDefs[key].startUnlocked || false,
                researched: false
            };
        }

        // 初始人口
        this.state.population.total = 0;
        this.state.population.idle = 0;
        for (let key in this.jobDefs) {
            this.state.population.jobs[key] = 0;
        }

        // 尝试加载存档
        SaveManager.load(this);

        // 处理离线收益
        this.processOfflineProgress();

        // 启动游戏循环
        this.startGameLoop();

        // 渲染初始界面
        this.render();

        // 启动新手教程
        setTimeout(() => TutorialSystem.start(), 500);

        // 定期显示快捷提示
        setInterval(() => QuickTips.show(), 60000);

        console.log('文明放置已初始化');
    }

    // 处理离线进度
    processOfflineProgress() {
        const now = Date.now();
        const offlineTime = (now - this.state.lastSave) / 1000; // 秒
        
        if (offlineTime > 60) { // 离线超过1分钟才计算
            const offlineHours = Math.floor(offlineTime / 3600);
            const offlineMinutes = Math.floor((offlineTime % 3600) / 60);
            
            // 计算离线收益（最多24小时全额收益，之后递减）
            const effectiveHours = Math.min(offlineHours, 24) + Math.max(0, offlineHours - 24) * 0.5;
            const effectiveSeconds = effectiveHours * 3600 + offlineMinutes * 60;
            
            // 计算生产速率
            this.calculateRates();
            
            // 应用离线收益（50%效率）
            let gains = [];
            for (let key in this.state.resources) {
                const rate = this.state.resources[key].rate;
                if (rate > 0) {
                    const gain = rate * effectiveSeconds * 0.5;
                    this.addResource(key, gain);
                    if (gain > 1) {
                        gains.push(`${Math.floor(gain)} ${this.resourceDefs[key].name}`);
                    }
                }
            }

            // 显示离线收益
            if (gains.length > 0) {
                const msg = `离线 ${offlineHours}小时${offlineMinutes}分钟，获得：${gains.join('、')}`;
                this.showOfflinePopup(msg);
            }
        }
    }

    showOfflinePopup(message) {
        const popup = document.getElementById('offline-popup');
        const msgEl = document.getElementById('offline-message');
        msgEl.textContent = message;
        popup.classList.remove('hidden');
    }

    // 游戏主循环
    startGameLoop() {
        // 每秒 tick 一次
        setInterval(() => this.tick(), 1000);
        // 每100ms更新一次UI
        setInterval(() => this.updateUI(), 100);
        // 每分钟保存
        setInterval(() => this.save(), 60000);
    }

    tick() {
        this.state.year += 0.01; // 每tick约3.65天
        this.state.lastTick = Date.now();

        // 计算生产速率
        this.calculateRates();

        // 应用资源变化
        for (let key in this.state.resources) {
            const rate = this.state.resources[key].rate;
            if (rate !== 0) {
                this.addResource(key, rate);
            }
        }

        // 人口自然增长
        this.handlePopulationGrowth();

        // 随机事件
        EventManager.checkEvents(this);

        // 更新UI
        this.render();
    }

    calculateRates() {
        // 基础速率归零
        for (let key in this.state.resources) {
            this.state.resources[key].rate = 0;
        }

        // 建筑产出
        for (let buildingKey in this.state.buildings) {
            const count = this.state.buildings[buildingKey];
            const building = this.buildingDefs[buildingKey];
            if (count > 0 && building.production) {
                for (let res in building.production) {
                    this.state.resources[res].rate += building.production[res] * count;
                }
            }
        }

        // 人口生产
        for (let jobKey in this.state.population.jobs) {
            const count = this.state.population.jobs[jobKey];
            const job = this.jobDefs[jobKey];
            if (count > 0 && job.production) {
                for (let res in job.production) {
                    this.state.resources[res].rate += job.production[res] * count;
                }
            }
            // 人口消耗
            if (count > 0 && job.consumption) {
                for (let res in job.consumption) {
                    this.state.resources[res].rate -= job.consumption[res] * count;
                }
            }
        }

        // 科技加成
        this.applyTechBonuses();
    }

    applyTechBonuses() {
        // 已研究的科技提供的加成
        if (this.state.tech.tools?.researched) {
            this.state.resources.wood.rate *= 1.2;
            this.state.resources.stone.rate *= 1.2;
        }
        if (this.state.tech.agriculture?.researched) {
            this.state.resources.food.rate *= 1.3;
        }
        if (this.state.tech.mining?.researched) {
            this.state.resources.stone.rate *= 1.5;
            this.state.resources.metal.rate *= 1.3;
        }
    }

    handlePopulationGrowth() {
        // 人口增长逻辑
        const food = this.state.resources.food.amount;
        const pop = this.state.population.total;
        const cap = this.state.population.cap;

        // 食物不足导致人口下降
        if (food < 0) {
            if (pop > 0 && Math.random() < 0.1) {
                this.removePopulation(1);
                EventManager.logEvent(this, '人口因饥荒减少了1人');
            }
        }

        // 自然增长（需要充足食物且未达上限）
        if (food > pop * 2 && pop < cap && pop > 0) {
            const growthChance = 0.05 * (this.state.population.happiness / 100);
            if (Math.random() < growthChance) {
                this.addPopulation(1);
                this.consumeResource('food', 10);
                EventManager.logEvent(this, '人口自然增长1人');
            }
        }
    }

    addResource(key, amount) {
        if (!this.state.resources[key]) return;
        const res = this.state.resources[key];
        res.amount = Math.max(0, Math.min(res.amount + amount, res.max));
    }

    consumeResource(key, amount) {
        this.addResource(key, -amount);
    }

    hasResource(key, amount) {
        return this.state.resources[key]?.amount >= amount;
    }

    canAfford(costs) {
        for (let key in costs) {
            if (!this.hasResource(key, costs[key])) return false;
        }
        return true;
    }

    payCosts(costs) {
        for (let key in costs) {
            this.consumeResource(key, costs[key]);
        }
    }

    addPopulation(amount) {
        this.state.population.total += amount;
        this.state.population.idle += amount;
    }

    removePopulation(amount) {
        // 优先减少空闲人口
        const idleRemove = Math.min(this.state.population.idle, amount);
        this.state.population.idle -= idleRemove;
        amount -= idleRemove;

        // 然后从工作中移除
        for (let jobKey in this.state.population.jobs) {
            if (amount <= 0) break;
            const jobRemove = Math.min(this.state.population.jobs[jobKey], amount);
            this.state.population.jobs[jobKey] -= jobRemove;
            amount -= jobRemove;
        }

        this.state.population.total -= (idleRemove + amount);
    }

    assignJob(jobKey) {
        if (this.state.population.idle > 0) {
            this.state.population.jobs[jobKey]++;
            this.state.population.idle--;
            this.render();
        }
    }

    unassignJob(jobKey) {
        if (this.state.population.jobs[jobKey] > 0) {
            this.state.population.jobs[jobKey]--;
            this.state.population.idle++;
            this.render();
        }
    }

    recruit() {
        console.log('招募按钮被点击');
        
        // 确保游戏已初始化
        if (!this.state || !this.state.resources || !this.state.resources.food) {
            console.error('游戏状态未初始化');
            alert('游戏加载中，请稍后再试');
            return;
        }
        
        const cost = 10 + Math.floor(this.state.population.total * 0.5);
        const currentFood = this.state.resources.food.amount;
        const currentPop = this.state.population.total;
        const popCap = this.state.population.cap;
        
        console.log('招募成本:', cost, '当前食物:', currentFood, '人口:', currentPop, '/', popCap);
        
        if (currentFood < cost) {
            alert(`食物不足！需要 ${cost} 食物，当前只有 ${Math.floor(currentFood)}`);
            return;
        }
        
        if (currentPop >= popCap) {
            alert(`人口已达上限！当前 ${currentPop}/${popCap}，请建造更多住所`);
            return;
        }
        
        // 执行招募
        this.state.resources.food.amount -= cost;
        this.state.population.total += 1;
        this.state.population.idle += 1;
        
        EventManager.logEvent(this, '招募了1名新村民');
        this.render();
        console.log('招募成功！');
    }

    build(buildingKey) {
        const building = this.buildingDefs[buildingKey];
        if (!building) return;

        // 检查前置条件
        if (building.requireTech && !this.state.tech[building.requireTech]?.researched) {
            return;
        }

        // 检查资源
        const costs = {};
        for (let res in building.cost) {
            costs[res] = Math.floor(building.cost[res] * Math.pow(1.1, this.state.buildings[buildingKey]));
        }

        if (this.canAfford(costs)) {
            this.payCosts(costs);
            this.state.buildings[buildingKey]++;
            
            // 应用建筑效果
            if (building.effects) {
                if (building.effects.popCap) {
                    this.state.population.cap += building.effects.popCap;
                }
                if (building.effects.resourceMax) {
                    for (let res in building.effects.resourceMax) {
                        this.state.resources[res].max += building.effects.resourceMax[res];
                    }
                }
            }

            EventManager.logEvent(this, `建造了 ${building.name}`);
            this.render();
        }
    }

    research(techKey) {
        const tech = this.techDefs[techKey];
        if (!tech) return;

        if (this.state.tech[techKey].researched) return;
        if (!this.state.tech[techKey].unlocked) return;

        // 检查前置科技
        if (tech.requires) {
            for (let req of tech.requires) {
                if (!this.state.tech[req]?.researched) return;
            }
        }

        if (this.canAfford(tech.cost)) {
            this.payCosts(tech.cost);
            this.state.tech[techKey].researched = true;

            // 解锁新科技
            for (let key in this.techDefs) {
                const t = this.techDefs[key];
                if (t.requires && t.requires.includes(techKey)) {
                    this.state.tech[key].unlocked = true;
                }
            }

            // 解锁新建筑
            for (let key in this.buildingDefs) {
                const b = this.buildingDefs[key];
                if (b.requireTech === techKey) {
                    EventManager.logEvent(this, `解锁新建筑：${b.name}`);
                }
            }

            EventManager.logEvent(this, `研究完成：${tech.name}`);
            this.render();
        }
    }

    explore() {
        // 探索新地块
        if (this.canAfford({ food: 50 })) {
            this.payCosts({ food: 50 });
            const tile = EventManager.generateTile(this);
            this.state.exploredTiles.push(tile);
            EventManager.logEvent(this, `探索发现：${tile.name} - ${tile.description}`);
            this.render();
        }
    }

    save() {
        SaveManager.save(this);
    }

    exportSave() {
        SaveManager.exportSave(this);
    }

    importSave() {
        SaveManager.importSave(this);
    }

    hardReset() {
        if (confirm('确定要重置所有进度吗？此操作不可恢复！')) {
            SaveManager.clear();
            location.reload();
        }
    }

    render() {
        // 更新年份
        document.getElementById('year').textContent = Math.floor(this.state.year);

        // 更新目标提示
        this.updateObjective();

        // 渲染资源
        this.renderResources();

        // 渲染人口
        this.renderPopulation();

        // 渲染建筑
        this.renderBuildings();

        // 渲染科技
        this.renderTech();

        // 渲染世界
        this.renderWorld();
    }

    renderResources() {
        const grid = document.getElementById('resources-grid');
        grid.innerHTML = '';

        for (let key in this.resourceDefs) {
            const def = this.resourceDefs[key];
            const res = this.state.resources[key];
            
            const card = document.createElement('div');
            card.className = 'resource-card';
            card.innerHTML = `
                <div class="resource-icon">${def.icon}</div>
                <div class="resource-name">${def.name}</div>
                <div class="resource-amount">${Math.floor(res.amount)}</div>
                <div class="resource-max">/${res.max === Infinity ? '∞' : Math.floor(res.max)}</div>
            `;
            grid.appendChild(card);
        }

        // 渲染生产效率
        const ratesDiv = document.getElementById('production-rates');
        ratesDiv.innerHTML = '';
        for (let key in this.resourceDefs) {
            const rate = this.state.resources[key].rate;
            if (rate !== 0) {
                const sign = rate > 0 ? '+' : '';
                ratesDiv.innerHTML += `
                    <span class="rate ${rate > 0 ? 'positive' : 'negative'}">
                        ${this.resourceDefs[key].icon} ${sign}${rate.toFixed(1)}/s
                    </span>
                `;
            }
        }
    }

    renderPopulation() {
        document.getElementById('total-pop').textContent = this.state.population.total;
        document.getElementById('idle-pop').textContent = this.state.population.idle;
        document.getElementById('pop-cap').textContent = this.state.population.cap;
        document.getElementById('happiness').textContent = this.state.population.happiness + '%';

        const recruitCost = 10 + Math.floor(this.state.population.total * 0.5);
        document.getElementById('recruit-cost').textContent = recruitCost;

        const jobsList = document.getElementById('jobs-list');
        jobsList.innerHTML = '';

        for (let key in this.jobDefs) {
            const job = this.jobDefs[key];
            const count = this.state.population.jobs[key];
            
            const jobDiv = document.createElement('div');
            jobDiv.className = 'job-item';
            jobDiv.innerHTML = `
                <div class="job-info">
                    <span class="job-icon">${job.icon}</span>
                    <span class="job-name">${job.name}</span>
                    <span class="job-desc">${job.description}</span>
                </div>
                <div class="job-controls">
                    <button onclick="game.unassignJob('${key}')" ${count === 0 ? 'disabled' : ''}>-</button>
                    <span>${count}</span>
                    <button onclick="game.assignJob('${key}')" ${this.state.population.idle === 0 ? 'disabled' : ''}>+</button>
                </div>
            `;
            jobsList.appendChild(jobDiv);
        }

        document.getElementById('recruit-btn').disabled = 
            !this.canAfford({ food: recruitCost }) || this.state.population.total >= this.state.population.cap;
    }

    renderBuildings() {
        const list = document.getElementById('buildings-list');
        list.innerHTML = '';

        for (let key in this.buildingDefs) {
            const building = this.buildingDefs[key];
            const count = this.state.buildings[key];
            const techReq = building.requireTech;
            
            // 检查是否解锁
            if (techReq && !this.state.tech[techReq]?.researched) {
                continue;
            }

            // 计算当前成本
            const costs = {};
            for (let res in building.cost) {
                costs[res] = Math.floor(building.cost[res] * Math.pow(1.1, count));
            }

            const canAfford = this.canAfford(costs);

            const buildingDiv = document.createElement('div');
            buildingDiv.className = `building-item ${canAfford ? '' : 'disabled'}`;
            buildingDiv.innerHTML = `
                <div class="building-info">
                    <span class="building-icon">${building.icon}</span>
                    <div>
                        <div class="building-name">${building.name} (${count})</div>
                        <div class="building-desc">${building.description}</div>
                        <div class="building-cost">${this.formatCosts(costs)}</div>
                    </div>
                </div>
                <button onclick="game.build('${key}')" ${canAfford ? '' : 'disabled'}>建造</button>
            `;
            list.appendChild(buildingDiv);
        }
    }

    renderTech() {
        const tree = document.getElementById('tech-tree');
        tree.innerHTML = '';

        for (let key in this.techDefs) {
            const tech = this.techDefs[key];
            const state = this.state.tech[key];

            if (!state.unlocked && !tech.startUnlocked) continue;

            const techDiv = document.createElement('div');
            techDiv.className = `tech-item ${state.researched ? 'researched' : ''} ${this.canAfford(tech.cost) ? '' : 'disabled'}`;
            techDiv.innerHTML = `
                <div class="tech-info">
                    <span class="tech-icon">${tech.icon}</span>
                    <div>
                        <div class="tech-name">${tech.name} ${state.researched ? '✓' : ''}</div>
                        <div class="tech-desc">${tech.description}</div>
                        <div class="tech-cost">${state.researched ? '已完成' : this.formatCosts(tech.cost)}</div>
                    </div>
                </div>
                <button onclick="game.research('${key}')" ${state.researched || !this.canAfford(tech.cost) ? 'disabled' : ''}>
                    ${state.researched ? '已完成' : '研究'}
                </button>
            `;
            tree.appendChild(techDiv);
        }
    }

    renderWorld() {
        const map = document.getElementById('world-map');
        map.innerHTML = '';

        // 探索按钮
        const exploreBtn = document.createElement('button');
        exploreBtn.className = 'explore-btn';
        exploreBtn.textContent = '🗺️ 探索周边 (-50 食物)';
        exploreBtn.disabled = !this.canAfford({ food: 50 });
        exploreBtn.onclick = () => this.explore();
        map.appendChild(exploreBtn);

        // 已探索地块
        this.state.exploredTiles.forEach(tile => {
            const tileDiv = document.createElement('div');
            tileDiv.className = 'tile';
            tileDiv.innerHTML = `
                <span class="tile-icon">${tile.icon}</span>
                <span class="tile-name">${tile.name}</span>
            `;
            map.appendChild(tileDiv);
        });
    }

    formatCosts(costs) {
        return Object.entries(costs)
            .map(([res, amount]) => {
                const has = this.state.resources[res]?.amount >= amount;
                return `<span class="${has ? 'can-afford' : 'cannot-afford'}">${Math.floor(amount)} ${this.resourceDefs[res]?.icon || res}</span>`;
            })
            .join(' ');
    }

    updateObjective() {
        const objectiveEl = document.getElementById('objective-text');
        if (!objectiveEl) return;

        let objective = '';
        
        // 根据游戏进度显示不同目标
        if (this.state.population.total === 0) {
            objective = '招募你的第一个村民（点击"人口"标签，然后点击"招募村民"）';
        } else if (this.state.population.idle > 0) {
            objective = `你有 ${this.state.population.idle} 个空闲村民！点击"人口"标签分配他们工作（推荐采集者）`;
        } else if (this.state.buildings.tent === 0 && this.state.resources.wood.amount >= 20) {
            objective = '资源充足！点击"建筑"标签建造帐篷，增加人口上限';
        } else if (!this.state.tech.tools.researched && this.state.resources.research.amount >= 20) {
            objective = '科研点足够！点击"科技"标签研究"工具制作"';
        } else if (this.state.population.jobs.scholar === 0 && this.state.tech.tools.researched) {
            objective = '工具研究完成！招募更多村民并分配学者，加速科研';
        } else if (this.state.buildings.farm === 0 && this.state.tech.agriculture?.researched) {
            objective = '农业已解锁！建造农场自动生产食物';
        } else if (this.state.exploredTiles.length === 0 && this.state.resources.food.amount >= 50) {
            objective = '食物充足！点击"世界"标签探索周边，发现资源';
        } else {
            objective = '继续发展：招募人口、建造建筑、研究科技、探索世界';
        }

        objectiveEl.textContent = objective;
    }

    updateUI() {
        // 实时更新资源数量（不重新渲染整个界面）
        // 这个函数每100ms调用，用于平滑显示
    }
}

// 全局游戏实例
let game;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    game = new CivilizationGame();

    // 标签页切换
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab + '-panel').classList.add('active');
        });
    });

    // 招募按钮
    document.getElementById('recruit-btn').addEventListener('click', () => game.recruit());
});

// 关闭离线提示
function dismissOffline() {
    document.getElementById('offline-popup').classList.add('hidden');
}
