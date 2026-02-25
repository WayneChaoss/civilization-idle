//**
 * 事件系统
 */
const EventManager = {
    // 随机事件池
    events: [
        {
            id: 'bountiful_harvest',
            name: '丰收',
            description: '今年庄稼长势喜人，获得大量食物！',
            icon: '🌾',
            chance: 0.05,
            condition: (game) => game.state.buildings.farm >= 2,
            effect: (game) => {
                game.addResource('food', 100);
                return '获得 100 食物';
            }
        },
        {
            id: 'forest_fire',
            name: '森林火灾',
            description: '一场火灾烧毁了一些木材储备',
            icon: '🔥',
            chance: 0.03,
            condition: (game) => game.state.resources.wood.amount > 50,
            effect: (game) => {
                const loss = Math.floor(game.state.resources.wood.amount * 0.2);
                game.consumeResource('wood', loss);
                return `损失 ${loss} 木材`;
            }
        },
        {
            id: 'wandering_trader',
            name: '流浪商人',
            description: '一位商人路过，用黄金交换你的资源',
            icon: '🧳',
            chance: 0.04,
            condition: (game) => game.state.resources.food.amount > 100,
            effect: (game) => {
                game.consumeResource('food', 50);
                game.addResource('gold', 10);
                return '用 50 食物交换 10 黄金';
            }
        },
        {
            id: 'inspiration',
            name: '灵光一现',
            description: '一位学者有了重大突破！',
            icon: '💡',
            chance: 0.03,
            condition: (game) => game.state.population.jobs.scholar >= 1,
            effect: (game) => {
                game.addResource('research', 50);
                return '获得 50 科研点';
            }
        },
        {
            id: 'new_settlers',
            name: '新移民',
            description: '一群旅行者希望加入你的文明',
            icon: '👥',
            chance: 0.02,
            condition: (game) => game.state.population.total < game.state.population.cap - 2,
            effect: (game) => {
                const newcomers = Math.floor(Math.random() * 3) + 1;
                game.addPopulation(newcomers);
                return `${newcomers} 名新移民加入`;
            }
        },
        {
            id: 'mineral_vein',
            name: '矿脉发现',
            description: '发现了丰富的矿藏！',
            icon: '💎',
            chance: 0.03,
            condition: (game) => game.state.buildings.mine >= 1,
            effect: (game) => {
                game.addResource('metal', 30);
                game.addResource('stone', 50);
                return '获得 30 金属和 50 石料';
            }
        },
        {
            id: 'plague',
            name: '瘟疫',
            description: '疾病在人口中蔓延...',
            icon: '😷',
            chance: 0.02,
            condition: (game) => game.state.population.total >= 10,
            effect: (game) => {
                const loss = Math.min(Math.floor(game.state.population.total * 0.1), 5);
                game.removePopulation(loss);
                return `${loss} 人因瘟疫死亡`;
            }
        },
        {
            id: 'religious_fervor',
            name: '宗教热情',
            description: '民众信仰高涨',
            icon: '✨',
            chance: 0.03,
            condition: (game) => game.state.buildings.temple >= 1,
            effect: (game) => {
                game.addResource('faith', 20);
                game.state.population.happiness = Math.min(100, game.state.population.happiness + 10);
                return '获得 20 信仰，幸福度 +10%';
            }
        }
    ],

    // 可探索的地块类型
    tileTypes: [
        { name: '茂密森林', icon: '🌲', description: '树木茂盛，木材产量丰富' },
        { name: '肥沃平原', icon: '🌾', description: '适合农耕的土地' },
        { name: '矿藏山脉', icon: '⛰️', description: '富含金属矿石' },
        { name: '古老遗迹', icon: '🏛️', description: '可能藏有古代知识' },
        { name: '贸易路线', icon: '🛤️', description: '商队经常经过此地' },
        { name: '神圣之地', icon: '✨', description: '充满神秘力量的地方' },
        { name: '渔获丰富的湖泊', icon: '🎣', description: '提供额外食物来源' },
        { name: '战略要塞', icon: '🏰', description: '易守难攻的地理位置' }
    ],

    // 检查并触发随机事件
    checkEvents(game) {
        this.events.forEach(event => {
            if (Math.random() < event.chance && event.condition(game)) {
                const result = event.effect(game);
                this.logEvent(game, `[事件] ${event.icon} ${event.name}: ${event.description} (${result})`);
            }
        });
    },

    // 生成探索地块
    generateTile(game) {
        const tileType = this.tileTypes[Math.floor(Math.random() * this.tileTypes.length)];
        const tile = {
            ...tileType,
            discovered: Date.now()
        };

        // 根据地块类型给予奖励
        switch(tile.name) {
            case '茂密森林':
                game.addResource('wood', 50 + Math.floor(Math.random() * 50));
                break;
            case '肥沃平原':
                game.addResource('food', 50 + Math.floor(Math.random() * 50));
                break;
            case '矿藏山脉':
                game.addResource('stone', 30 + Math.floor(Math.random() * 30));
                game.addResource('metal', 10 + Math.floor(Math.random() * 20));
                break;
            case '古老遗迹':
                game.addResource('research', 20 + Math.floor(Math.random() * 30));
                break;
            case '贸易路线':
                game.addResource('gold', 5 + Math.floor(Math.random() * 15));
                break;
            case '神圣之地':
                game.addResource('faith', 10 + Math.floor(Math.random() * 20));
                game.addResource('culture', 10 + Math.floor(Math.random() * 10));
                break;
            case '渔获丰富的湖泊':
                game.addResource('food', 30 + Math.floor(Math.random() * 40));
                break;
            case '战略要塞':
                game.addResource('stone', 40);
                game.state.population.cap += 2;
                break;
        }

        return tile;
    },

    // 记录事件到日志
    logEvent(game, message) {
        game.state.eventHistory.unshift({
            time: Date.now(),
            year: Math.floor(game.state.year),
            message: message
        });

        // 只保留最近50条
        if (game.state.eventHistory.length > 50) {
            game.state.eventHistory.pop();
        }

        // 更新UI
        const logEl = document.getElementById('event-log');
        if (logEl) {
            logEl.innerHTML = game.state.eventHistory
                .map(e => `<div class="log-entry">[第${e.year}年] ${e.message}</div>`)
                .join('');
        }
    }
};
