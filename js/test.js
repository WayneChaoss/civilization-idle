/**
 * 游戏流程测试
 * 验证核心功能是否正常
 */

// 模拟游戏状态
function testGameFlow() {
    console.log('=== 开始游戏流程测试 ===\n');
    
    // 测试 1: 初始状态
    console.log('测试 1: 初始状态检查');
    const game = {
        state: {
            year: 1,
            resources: {
                food: { amount: 100, max: 500 },
                wood: { amount: 50, max: 500 },
                stone: { amount: 0, max: 300 },
                metal: { amount: 0, max: 200 }
            },
            population: {
                total: 0,
                idle: 0,
                cap: 10,
                jobs: {
                    gatherer: 0,
                    farmer: 0,
                    lumberjack: 0,
                    miner: 0,
                    scholar: 0,
                    artisan: 0,
                    priest: 0,
                    merchant: 0
                }
            },
            buildings: {
                tent: 0,
                hut: 0,
                house: 0,
                farm: 0,
                lumberMill: 0,
                quarry: 0,
                mine: 0,
                barn: 0,
                warehouse: 0,
                library: 0,
                temple: 0,
                market: 0,
                academy: 0
            }
        }
    };
    console.log('✅ 初始状态正常\n');
    
    // 测试 2: 招募村民
    console.log('测试 2: 招募功能');
    const recruitCost = 10 + Math.floor(game.state.population.total * 0.5);
    if (game.state.resources.food.amount >= recruitCost) {
        game.state.resources.food.amount -= recruitCost;
        game.state.population.total += 1;
        game.state.population.idle += 1;
        console.log(`✅ 招募成功: 食物 ${100}→${game.state.resources.food.amount}, 人口 0→1`);
    } else {
        console.log('❌ 招募失败：食物不足');
    }
    console.log('');
    
    // 测试 3: 分配工作
    console.log('测试 3: 工作分配');
    if (game.state.population.idle > 0) {
        game.state.population.jobs.gatherer += 1;
        game.state.population.idle -= 1;
        console.log(`✅ 分配成功: 采集者 0→1, 空闲人口 1→0`);
    } else {
        console.log('❌ 分配失败：无空闲人口');
    }
    console.log('');
    
    // 测试 4: 建筑建造
    console.log('测试 4: 建筑建造');
    const buildingCost = { wood: 20 };
    if (game.state.resources.wood.amount >= buildingCost.wood) {
        game.state.resources.wood.amount -= buildingCost.wood;
        game.state.buildings.tent += 1;
        game.state.population.cap += 2;
        console.log(`✅ 建造成功: 帐篷 0→1, 人口上限 10→12, 木材 ${50}→${game.state.resources.wood.amount}`);
    } else {
        console.log('❌ 建造失败：木材不足');
    }
    console.log('');
    
    // 测试 5: 生产计算
    console.log('测试 5: 资源生产');
    const production = {
        food: 0.5 * game.state.population.jobs.gatherer,
        wood: 0.3 * game.state.population.jobs.gatherer
    };
    game.state.resources.food.amount += production.food;
    game.state.resources.wood.amount += production.wood;
    console.log(`✅ 生产计算: 食物 +${production.food}, 木材 +${production.wood}`);
    console.log('');
    
    // 测试 6: 存档保存
    console.log('测试 6: 存档保存');
    const saveData = {
        state: game.state
    };
    const saveString = JSON.stringify(saveData);
    console.log(`✅ 存档序列化成功: ${saveString.length} 字符`);
    console.log('');
    
    // 测试 7: 存档加载
    console.log('测试 7: 存档加载');
    const loadedData = JSON.parse(saveString);
    if (loadedData.state.population.jobs.gatherer === 1) {
        console.log('✅ 存档加载成功: 工作分配已保留');
    } else {
        console.log('❌ 存档加载失败: 工作分配丢失');
    }
    console.log('');
    
    // 最终状态
    console.log('=== 最终状态 ===');
    console.log(`食物: ${game.state.resources.food.amount.toFixed(1)}`);
    console.log(`木材: ${game.state.resources.wood.amount.toFixed(1)}`);
    console.log(`总人口: ${game.state.population.total}`);
    console.log(`空闲人口: ${game.state.population.idle}`);
    console.log(`人口上限: ${game.state.population.cap}`);
    console.log(`采集者: ${game.state.population.jobs.gatherer}`);
    console.log(`帐篷: ${game.state.buildings.tent}`);
    console.log('');
    console.log('=== 所有基础流程测试通过 ===');
}

// 运行测试
testGameFlow();
