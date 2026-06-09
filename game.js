// ==================== 全局变量 ====================
let scene, camera, renderer, clock;
let player, enemies = [], allies = [];
let gameState = 'login';
let selectedHero = null, selectedMap = null, selectedDifficulty = 'normal', selectedMode = '3v3';
let cameraLocked = false, cameraDistance = 20, cameraAngle = 0, cameraHeight = 12;
let mousePos = {x:0,y:0}, isDragging = false, dragStart = {x:0,y:0};
let keys = {}, particles = [], particlePool = [];
let lastTime = 0, frameCount = 0, fps = 60, gameTime = 0;
let showScoreboard = false, showBigMap = false, hintTimer = null, showKeyHintPanel = true;
let audioCtx = null, currentMap = 0;
let ws = null, wsReconnectTimer = null, roomId = null, isHost = false, isReady = false, playerId = null;
let tutorialStep = 0, tutorialActive = false;
let towers = [], crystals = [], minions = [], jungleCamps = [], enemyHeroes = [];
let minionSpawnTimer = 0, gameWon = false, gameLost = false;
let recallTimer = 0, isRecalling = false;
let shopOpen = false;
let playerGold = 0;
let playerEquip = [];
let respawnTimer = 0, isDead = false;
let skillEffects = [];

const DIFFICULTY = {
easy: {reactionDelay:1.0, atkMult:0.5, skillChance:0, dodgeChance:0, enemyCount:3, minionInterval:30},
normal: {reactionDelay:0.5, atkMult:0.8, skillChance:0.3, dodgeChance:0, enemyCount:5, minionInterval:30},
hard: {reactionDelay:0.2, atkMult:1.0, skillChance:0.6, dodgeChance:0.3, enemyCount:7, minionInterval:30},
nightmare: {reactionDelay:0.1, atkMult:1.3, skillChance:0.9, dodgeChance:0.5, enemyCount:10, minionInterval:30}
};

const MAP_SIZE = 350;
const MAP_HALF = 175;
const SCALE_FACTOR = 1.25;

const LANES = {
top: [{x:-MAP_HALF,z:-MAP_HALF},{x:-MAP_HALF,z:-MAP_HALF+42},{x:-MAP_HALF,z:-MAP_HALF+84},{x:-MAP_HALF,z:-MAP_HALF+126},{x:-MAP_HALF+42,z:-MAP_HALF+126},{x:-MAP_HALF+84,z:-MAP_HALF+126},{x:0,z:0},{x:0,z:-42},{x:0,z:-84},{x:0,z:-MAP_HALF+42},{x:42,z:-MAP_HALF+42},{x:84,z:-MAP_HALF+42},{x:MAP_HALF,z:-MAP_HALF+42}],
mid: [{x:-MAP_HALF,z:-MAP_HALF},{x:-MAP_HALF+28,z:-MAP_HALF+28},{x:-MAP_HALF+56,z:-MAP_HALF+56},{x:-MAP_HALF+84,z:-MAP_HALF+84},{x:-MAP_HALF+112,z:-MAP_HALF+112},{x:MAP_HALF-112,z:MAP_HALF-112},{x:MAP_HALF-84,z:MAP_HALF-84},{x:MAP_HALF-56,z:MAP_HALF-56},{x:MAP_HALF-28,z:MAP_HALF-28},{x:MAP_HALF,z:MAP_HALF}],
bot: [{x:-MAP_HALF,z:-MAP_HALF},{x:-MAP_HALF+42,z:-MAP_HALF},{x:-MAP_HALF+84,z:-MAP_HALF},{x:0,z:-MAP_HALF},{x:0,z:-MAP_HALF+42},{x:0,z:-MAP_HALF+84},{x:0,z:0},{x:0,z:42},{x:0,z:84},{x:0,z:MAP_HALF-42},{x:42,z:MAP_HALF-42},{x:84,z:MAP_HALF-42},{x:MAP_HALF,z:MAP_HALF-42}]
};

const MAPS = [
{name:'古战场',groundColor:0x2d4a1e,fogColor:0x1a1a2e,fogNear:20,fogFar:100,lightColor:0xffffff,lightIntensity:0.8,ambientColor:0x404040,ambientIntensity:0.6,treeColor:0x2d5a1e,rockColor:0x666666,decoration:'trees',desc:'黄沙百战穿金甲'},
{name:'江南水乡',groundColor:0x3a5a3a,fogColor:0x2a3a3a,fogNear:15,fogFar:80,lightColor:0xcceeff,lightIntensity:0.6,ambientColor:0x304050,ambientIntensity:0.7,treeColor:0x1a4a2a,rockColor:0x4a5a6a,decoration:'willows',desc:'小桥流水人家'},
{name:'雪域高原',groundColor:0xe0e8f0,fogColor:0xc0d0e0,fogNear:30,fogFar:120,lightColor:0xffffee,lightIntensity:1.0,ambientColor:0x607080,ambientIntensity:0.5,treeColor:0x1a2a3a,rockColor:0x8899aa,decoration:'pines',desc:'千里冰封万里雪飘'},
{name:'赤壁之战',groundColor:0x3a2a1a,fogColor:0x2a1a0a,fogNear:15,fogFar:70,lightColor:0xff8844,lightIntensity:1.0,ambientColor:0x604020,ambientIntensity:0.5,treeColor:0x2a4a1a,rockColor:0x5a4a3a,decoration:'burning',desc:'烈火焚天，赤壁鏖战'},
{name:'官渡之战',groundColor:0x4a4a3a,fogColor:0x3a3a2a,fogNear:20,fogFar:90,lightColor:0xffeedd,lightIntensity:0.7,ambientColor:0x505040,ambientIntensity:0.6,treeColor:0x3a5a2a,rockColor:0x7a7a6a,decoration:'fortress',desc:'以少胜多，官渡奇袭'}
];

const SHOP_ITEMS = [
{name:'铁剑',price:300,type:'atk',value:15,desc:'攻击力+15'},
{name:'布甲',price:300,type:'def',value:10,desc:'防御力+10'},
{name:'草鞋',price:300,type:'spd',value:5,desc:'移动速度+5'},
{name:'长枪',price:800,type:'atk',value:35,desc:'攻击力+35'},
{name:'铁甲',price:800,type:'def',value:25,desc:'防御力+25'},
{name:'战靴',price:800,type:'spd',value:12,desc:'移动速度+12'},
{name:'方天画戟',price:1500,type:'atk',value:60,desc:'攻击力+60'},
{name:'龙鳞甲',price:1500,type:'def',value:45,desc:'防御力+45'},
{name:'追风靴',price:1500,type:'spd',value:20,desc:'移动速度+20'},
{name:'血瓶',price:100,type:'heal',value:200,desc:'恢复200生命'},
{name:'蓝瓶',price:100,type:'mana',value:150,desc:'恢复150内力'}
];

const HEROES = [
{id:1,name:'秦始皇',type:'皇帝',hp:1200,mp:400,atk:75,def:60,spd:45,color:'#1a1a2e',hair:'crown',weapon:'scepter',face:'beard',desc:'统一六国，建立大秦帝国',skills:['皇权震慑','焚书坑儒','万里长城','帝王之怒']},
{id:2,name:'汉武帝',type:'皇帝',hp:1100,mp:450,atk:70,def:55,spd:48,color:'#d4a843',hair:'crown',weapon:'sword',face:'beard',desc:'开疆拓土，威震匈奴',skills:['独尊儒术','丝绸之路','封狼居胥','天子之威']},
{id:3,name:'唐太宗',type:'皇帝',hp:1150,mp:420,atk:78,def:58,spd:50,color:'#c9a227',hair:'crown',weapon:'bow',face:'beard',desc:'贞观之治，天可汗',skills:['玄武门变','贞观之治','天可汗','龙威浩荡']},
{id:4,name:'武则天',type:'皇帝',hp:1000,mp:500,atk:65,def:50,spd:52,color:'#8b0046',hair:'crown_f',weapon:'scepter',face:'makeup',desc:'一代女皇，君临天下',skills:['女主天下','酷吏政治','无字碑','凤鸣九天']},
{id:5,name:'宋太祖',type:'皇帝',hp:1050,mp:430,atk:72,def:62,spd:46,color:'#daa520',hair:'crown',weapon:'staff',face:'beard',desc:'黄袍加身，杯酒释兵权',skills:['黄袍加身','杯酒释权','太祖长拳','龙吟虎啸']},
{id:6,name:'明成祖',type:'皇帝',hp:1100,mp:410,atk:74,def:56,spd:47,color:'#8b0000',hair:'crown',weapon:'sword',face:'beard',desc:'永乐大帝，郑和下西洋',skills:['靖难之役','永乐大典','郑和下西洋','天子守国门']},
{id:7,name:'关羽',type:'武将',hp:1300,mp:350,atk:90,def:70,spd:55,color:'#228b22',hair:'long',weapon:'guandao',face:'red_beard',desc:'武圣关云长，义薄云天',skills:['青龙斩','武圣之威','单刀赴会','春秋大义']},
{id:8,name:'张飞',type:'武将',hp:1350,mp:320,atk:88,def:72,spd:53,color:'#2f1810',hair:'bristle',weapon:'spear',face:'fierce',desc:'万人敌，当阳桥断喝',skills:['蛇矛突刺','燕人咆哮','当阳断喝','万夫莫敌']},
{id:9,name:'赵云',type:'武将',hp:1200,mp:380,atk:85,def:65,spd:65,color:'#c0c0c0',hair:'long',weapon:'spear',face:'young',desc:'常山赵子龙，一身是胆',skills:['七进七出','龙胆亮银','单骑救主','银龙破空']},
{id:10,name:'吕布',type:'武将',hp:1400,mp:300,atk:95,def:68,spd:58,color:'#d4a843',hair:'long',weapon:'halberd',face:'proud',desc:'人中吕布，马中赤兔',skills:['方天画戟','无双乱舞','三英战吕','战神降临']},
{id:11,name:'项羽',type:'武将',hp:1450,mp:280,atk:92,def:75,spd:50,color:'#4a0000',hair:'long',weapon:'greatsword',face:'fierce',desc:'西楚霸王，力能扛鼎',skills:['霸王举鼎','破釜沉舟','四面楚歌','乌江自刎']},
{id:12,name:'岳飞',type:'武将',hp:1250,mp:360,atk:86,def:66,spd:56,color:'#c0c0c0',hair:'long',weapon:'spear',face:'righteous',desc:'精忠报国，岳家军',skills:['精忠报国','岳家枪法','还我河山','满江红']},
{id:13,name:'韩信',type:'武将',hp:1100,mp:420,atk:80,def:55,spd:60,color:'#4169e1',hair:'topknot',weapon:'twin_sword',face:'wise',desc:'兵仙韩信，国士无双',skills:['暗度陈仓','背水一战','十面埋伏','兵仙之计']},
{id:14,name:'霍去病',type:'武将',hp:1150,mp:350,atk:84,def:60,spd:68,color:'#87ceeb',hair:'short',weapon:'bow',face:'young',desc:'封狼居胥，少年将军',skills:['闪电突袭','封狼居胥','匈奴未灭','少年英杰']},
{id:15,name:'诸葛亮',type:'谋士',hp:950,mp:550,atk:60,def:45,spd:48,color:'#f5f5dc',hair:'hat',weapon:'fan',face:'wise_beard',desc:'卧龙先生，鞠躬尽瘁',skills:['空城计','草船借箭','火烧赤壁','七星灯续命']},
{id:16,name:'张良',type:'谋士',hp:900,mp:520,atk:55,def:42,spd:50,color:'#2e8b57',hair:'hat',weapon:'scroll',face:'wise_beard',desc:'谋圣张良，运筹帷幄',skills:['圯上授书','明修栈道','运筹帷幄','决胜千里']},
{id:17,name:'范蠡',type:'谋士',hp:920,mp:480,atk:58,def:48,spd:52,color:'#708090',hair:'hat',weapon:'abacus',face:'wise',desc:'商圣范蠡，三聚三散',skills:['经商之道','卧薪尝胆','三聚三散','陶朱公术']},
{id:18,name:'刘伯温',type:'谋士',hp:930,mp:530,atk:56,def:44,spd:49,color:'#2f2f2f',hair:'hat',weapon:'compass',face:'mystic',desc:'神机妙算，一统江山',skills:['烧饼歌','神机妙算','一统江山','天机不可泄']},
{id:19,name:'司马懿',type:'谋士',hp:1000,mp:500,atk:62,def:58,spd:46,color:'#4b0082',hair:'hat',weapon:'fan',face:'cunning',desc:'冢虎司马懿，隐忍待发',skills:['隐忍不发','高平陵变','冢虎之谋','晋室奠基']},
{id:20,name:'周瑜',type:'谋士',hp:950,mp:510,atk:64,def:46,spd:54,color:'#b22222',hair:'hat',weapon:'qin',face:'handsome',desc:'美周郎，曲有误周郎顾',skills:['赤壁火攻','曲有误','赔了夫人','既生瑜']},
{id:21,name:'貂蝉',type:'美人',hp:800,mp:450,atk:70,def:35,spd:62,color:'#dc143c',hair:'long_f',weapon:'sleeve',face:'beautiful',desc:'闭月貂蝉，连环计',skills:['闭月羞花','连环计','离间之计','舞姿倾城']},
{id:22,name:'西施',type:'美人',hp:820,mp:430,atk:58,def:38,spd:58,color:'#228b22',hair:'long_f',weapon:'cloth',face:'gentle',desc:'沉鱼西施，浣纱女',skills:['沉鱼落雁','浣纱曲','美人计','西子捧心']},
{id:23,name:'王昭君',type:'美人',hp:850,mp:440,atk:60,def:40,spd:55,color:'#f0f8ff',hair:'long_f',weapon:'pipa',face:'sad',desc:'落雁昭君，出塞和亲',skills:['落雁之姿','出塞曲','和亲之策','青冢留名']},
{id:24,name:'杨贵妃',type:'美人',hp:880,mp:420,atk:55,def:42,spd:50,color:'#ff69b4',hair:'bun_f',weapon:'pipa',face:'plump',desc:'羞花贵妃，一骑红尘',skills:['羞花之貌','霓裳羽衣','一骑红尘','马嵬坡下']},
{id:25,name:'荆轲',type:'刺客',hp:900,mp:380,atk:88,def:38,spd:70,color:'#1a1a1a',hair:'short',weapon:'dagger',face:'cold',desc:'风萧萧兮易水寒',skills:['图穷匕见','易水寒','刺秦','壮士一去']},
{id:26,name:'扁鹊',type:'名医',hp:850,mp:500,atk:45,def:40,spd:48,color:'#f5f5dc',hair:'hat',weapon:'medicine',face:'kind',desc:'神医扁鹊，望闻问切',skills:['望闻问切','起死回生','针灸之术','医者仁心']},
{id:27,name:'华佗',type:'名医',hp:830,mp:520,atk:48,def:38,spd:50,color:'#2e8b57',hair:'hat',weapon:'scalpel',face:'focused',desc:'外科圣手，麻沸散',skills:['麻沸散','五禽戏','刮骨疗毒','外科圣手']},
{id:28,name:'鲁班',type:'工匠',hp:950,mp:460,atk:65,def:55,spd:45,color:'#8b4513',hair:'hat',weapon:'tool',face:'wise',desc:'工匠祖师，巧夺天工',skills:['鲁班锁','云梯','锯子发明','工匠之神']},
{id:29,name:'墨子',type:'工匠',hp:920,mp:480,atk:60,def:60,spd:47,color:'#2f2f2f',hair:'hat',weapon:'device',face:'serious',desc:'墨家巨子，兼爱非攻',skills:['兼爱非攻','机关术','墨守成规','止楚攻宋']},
{id:30,name:'李白',type:'诗人',hp:880,mp:480,atk:75,def:40,spd:58,color:'#f0f8ff',hair:'long',weapon:'sword_wine',face:'drunk',desc:'诗仙李白，斗酒诗百篇',skills:['将进酒','飞流直下','蜀道难','诗剑双绝']},
{id:31,name:'曹操',type:'皇帝',hp:1150,mp:430,atk:76,def:58,spd:48,color:'#1a1a4e',hair:'crown',weapon:'sword',face:'beard',desc:'一代枭雄，挟天子以令诸侯',skills:['挟天子','奸雄之谋','望梅止渴','魏武挥鞭']},
{id:32,name:'孙权',type:'皇帝',hp:1050,mp:440,atk:68,def:56,spd:50,color:'#8b4513',hair:'crown',weapon:'sword',face:'young',desc:'紫髯碧眼，江东之主',skills:['制衡','苦肉计','火烧赤壁','大帝之威']},
{id:33,name:'刘备',type:'皇帝',hp:1080,mp:460,atk:65,def:55,spd:46,color:'#2e8b57',hair:'hat',weapon:'twin_sword',face:'kind',desc:'仁德之君，三顾茅庐',skills:['仁德','桃园结义','三顾茅庐','蜀汉昭烈']},
{id:34,name:'康熙',type:'皇帝',hp:1120,mp:440,atk:72,def:62,spd:44,color:'#daa520',hair:'crown',weapon:'sword',face:'beard',desc:'千古一帝，康熙大帝',skills:['擒鳌拜','平三藩','康熙字典','天子守国']},
{id:35,name:'成吉思汗',type:'武将',hp:1350,mp:320,atk:92,def:65,spd:60,color:'#4a3728',hair:'long',weapon:'bow',face:'fierce',desc:'一代天骄，成吉思汗',skills:['弯弓射雕','铁骑突袭','蒙古铁骑','上帝之鞭']},
{id:36,name:'戚继光',type:'武将',hp:1200,mp:380,atk:82,def:68,spd:52,color:'#556b2f',hair:'hat',weapon:'spear',face:'righteous',desc:'抗倭名将，鸳鸯阵',skills:['鸳鸯阵','戚家军','封狼居胥','练兵之法']},
{id:37,name:'花木兰',type:'武将',hp:1100,mp:400,atk:80,def:55,spd:62,color:'#c71585',hair:'long_f',weapon:'sword',face:'beautiful',desc:'替父从军，巾帼英雄',skills:['木兰辞','双剑合璧','女将之威','谁说女子不如男']},
{id:38,name:'穆桂英',type:'武将',hp:1150,mp:390,atk:84,def:60,spd:58,color:'#dc143c',hair:'long_f',weapon:'spear',face:'fierce',desc:'穆柯寨主，大破天门阵',skills:['挂帅出征','天门阵','穆桂英挂帅','杨门女将']},
{id:39,name:'郑成功',type:'武将',hp:1180,mp:370,atk:83,def:64,spd:55,color:'#1a3a5e',hair:'hat',weapon:'sword',face:'righteous',desc:'收复台湾，民族英雄',skills:['海上霸主','国姓爷','收复台湾','驱逐红夷']},
{id:40,name:'孙武',type:'谋士',hp:900,mp:550,atk:58,def:42,spd:50,color:'#4a6741',hair:'hat',weapon:'scroll',face:'wise_beard',desc:'兵圣孙武，孙子兵法',skills:['孙子兵法','知己知彼','不战而屈人之兵','兵者诡道']},
{id:41,name:'吴起',type:'谋士',hp:920,mp:520,atk:62,def:48,spd:52,color:'#3a3a5a',hair:'hat',weapon:'sword',face:'cold',desc:'兵家亚圣，吴子兵法',skills:['吴子兵法','用兵之道','治军严明','兵家亚圣']},
{id:42,name:'商鞅',type:'谋士',hp:880,mp:500,atk:55,def:40,spd:48,color:'#2a2a3a',hair:'hat',weapon:'scroll',face:'serious',desc:'变法强秦，商鞅变法',skills:['商鞅变法','徙木立信','严刑峻法','法治天下']},
{id:43,name:'鬼谷子',type:'谋士',hp:850,mp:580,atk:52,def:38,spd:46,color:'#2a1a3a',hair:'hat',weapon:'fan',face:'mystic',desc:'纵横家鼻祖，鬼谷神算',skills:['纵横捭阖','鬼谷神算','揣摩之术','捭阖之道']},
{id:44,name:'班超',type:'武将',hp:1120,mp:380,atk:80,def:58,spd:56,color:'#5a3a2a',hair:'hat',weapon:'spear',face:'righteous',desc:'投笔从戎，班超定西域',skills:['投笔从戎','不入虎穴','西域都护','定远侯']},
{id:45,name:'卫青',type:'武将',hp:1250,mp:360,atk:85,def:66,spd:55,color:'#3a5a3a',hair:'hat',weapon:'spear',face:'young',desc:'不败将军，龙城飞将',skills:['龙城飞将','漠北之战','封狼居胥','大将军']},
{id:46,name:'赵匡胤',type:'皇帝',hp:1100,mp:420,atk:74,def:58,spd:47,color:'#8b0000',hair:'crown',weapon:'staff',face:'beard',desc:'陈桥兵变，杯酒释兵权',skills:['陈桥兵变','杯酒释权','太祖长拳','黄袍加身']},
{id:47,name:'嬴政',type:'皇帝',hp:1180,mp:440,atk:78,def:62,spd:46,color:'#1a0a2e',hair:'crown',weapon:'scepter',face:'cold',desc:'千古一帝，书同文车同轨',skills:['书同文','车同轨','统一度量衡','焚书坑儒']},
{id:48,name:'屈原',type:'诗人',hp:860,mp:520,atk:58,def:38,spd:50,color:'#2e8b57',hair:'long',weapon:'scroll',face:'sad',desc:'楚辞之祖，端午之祭',skills:['离骚','九歌','天问','投江殉国']},
{id:49,name:'苏轼',type:'诗人',hp:900,mp:490,atk:62,def:42,spd:52,color:'#708090',hair:'hat',weapon:'fan',face:'drunk',desc:'东坡居士，大江东去',skills:['大江东去','水调歌头','念奴娇','东坡肉']},
{id:50,name:'杜甫',type:'诗人',hp:850,mp:510,atk:55,def:40,spd:48,color:'#6a5a4a',hair:'hat',weapon:'scroll',face:'sad',desc:'诗圣杜甫，忧国忧民',skills:['茅屋为秋风所破','春望','三吏三别','诗史']}
];

function clamp(v,mn,mx){return Math.max(mn,Math.min(mx,v));}
function lerp(a,b,t){return a+(b-a)*t;}
function dist(a,b){return Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2+(a.z-b.z)**2);}
function dist2D(x1,z1,x2,z2){return Math.sqrt((x1-x2)**2+(z1-z2)**2);}

// ==================== 音效系统 ====================
function initAudio(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();}
function playSound(type){
if(!audioCtx)return;
try{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.connect(g);g.connect(audioCtx.destination);
switch(type){
case'hover':o.frequency.setValueAtTime(400,audioCtx.currentTime);o.frequency.exponentialRampToValueAtTime(600,audioCtx.currentTime+0.05);g.gain.setValueAtTime(0.05,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.05);o.start();o.stop(audioCtx.currentTime+0.05);break;
case'click':o.frequency.setValueAtTime(800,audioCtx.currentTime);g.gain.setValueAtTime(0.1,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.1);o.start();o.stop(audioCtx.currentTime+0.1);break;
case'skill':o.frequency.setValueAtTime(200,audioCtx.currentTime);o.frequency.exponentialRampToValueAtTime(800,audioCtx.currentTime+0.2);g.gain.setValueAtTime(0.15,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.3);o.start();o.stop(audioCtx.currentTime+0.3);break;
case'levelup':o.frequency.setValueAtTime(400,audioCtx.currentTime);o.frequency.exponentialRampToValueAtTime(1200,audioCtx.currentTime+0.4);g.gain.setValueAtTime(0.15,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.5);o.start();o.stop(audioCtx.currentTime+0.5);break;
case'success':[523,659,784].forEach((f,i)=>{const oo=audioCtx.createOscillator(),gg=audioCtx.createGain();oo.connect(gg);gg.connect(audioCtx.destination);oo.frequency.value=f;gg.gain.setValueAtTime(0.1,audioCtx.currentTime+i*0.1);gg.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+i*0.1+0.2);oo.start(audioCtx.currentTime+i*0.1);oo.stop(audioCtx.currentTime+i*0.1+0.2);});break;
case'fail':o.frequency.setValueAtTime(300,audioCtx.currentTime);o.frequency.exponentialRampToValueAtTime(100,audioCtx.currentTime+0.3);g.gain.setValueAtTime(0.1,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.3);o.start();o.stop(audioCtx.currentTime+0.3);break;
}}catch(e){}
}

// ==================== 设置 ====================
function loadSettings(){try{const s=localStorage.getItem('hxSettings');if(s){const st=JSON.parse(s);if(st.sfxVolume!==undefined)document.getElementById('sfxVolume').value=st.sfxVolume;if(st.bgmVolume!==undefined)document.getElementById('bgmVolume').value=st.bgmVolume;if(st.quality)document.getElementById('qualitySetting').value=st.quality;if(st.sensitivity!==undefined)document.getElementById('sensitivity').value=st.sensitivity;if(st.showKeyHints!==undefined)document.getElementById('showKeyHints').checked=st.showKeyHints;if(st.showMinimap!==undefined)document.getElementById('showMinimap').checked=st.showMinimap;if(st.playerName)document.getElementById('username').value=st.playerName;if(st.playerLevel)document.getElementById('playerLevel').textContent=st.playerLevel;if(st.playerWins)document.getElementById('playerWins').textContent=st.playerWins;}}catch(e){}}
function saveSettings(){try{localStorage.setItem('hxSettings',JSON.stringify({sfxVolume:document.getElementById('sfxVolume').value,bgmVolume:document.getElementById('bgmVolume').value,quality:document.getElementById('qualitySetting').value,sensitivity:document.getElementById('sensitivity').value,showKeyHints:document.getElementById('showKeyHints').checked,showMinimap:document.getElementById('showMinimap').checked,playerName:document.getElementById('playerName').textContent,playerLevel:document.getElementById('playerLevel').textContent,playerWins:document.getElementById('playerWins').textContent}));}catch(e){}}
function savePlayerData(){try{localStorage.setItem('hxPlayer',JSON.stringify({name:document.getElementById('playerName').textContent,level:document.getElementById('playerLevel').textContent,wins:document.getElementById('playerWins').textContent}));}catch(e){}}
function loadPlayerData(){try{const s=localStorage.getItem('hxPlayer');if(s){const d=JSON.parse(s);if(d.name)document.getElementById('playerName').textContent=d.name;if(d.level)document.getElementById('playerLevel').textContent=d.level;if(d.wins)document.getElementById('playerWins').textContent=d.wins;}}catch(e){}}

function showLoading(text,callback){const s=document.getElementById('loadingScreen'),b=document.getElementById('loadingBar'),t=document.getElementById('loadingText');s.style.display='flex';t.textContent=text||'加载中...';let p=0;const iv=setInterval(()=>{p+=Math.random()*15+5;if(p>=100){p=100;clearInterval(iv);setTimeout(()=>{s.style.display='none';b.style.width='0%';if(callback)callback();},300);}b.style.width=p+'%';},100);}

function startTutorial(){try{if(localStorage.getItem('hxTutorial'))return;}catch(e){}tutorialStep=0;tutorialActive=true;document.getElementById('tutorialOverlay').style.display='block';showTutorialStep();}
function showTutorialStep(){const steps=[{title:'欢迎来到华夏英杰传 MOBA',content:'三路MOBA战场！沿上路/中路/下路推进，摧毁敌方防御塔和水晶获胜。',highlight:null},{title:'技能释放',content:'按鼠标左键普通攻击，1/2/3/4释放技能。',highlight:'.skillBar'},{title:'血条与内力',content:'左下角显示生命值和内力值。',highlight:'.hpMpBars'},{title:'小地图',content:'右下角小地图显示三路路线、防御塔、水晶和所有单位。',highlight:'.minimap'},{title:'祝您武运昌隆',content:'击败敌方英雄，推进兵线，摧毁水晶！',highlight:null}];if(tutorialStep>=steps.length){document.getElementById('tutorialOverlay').style.display='none';document.getElementById('tutorialHighlight').style.display='none';tutorialActive=false;try{localStorage.setItem('hxTutorial','done');}catch(e){}return;}const st=steps[tutorialStep];document.getElementById('tutorialTitle').textContent=st.title;document.getElementById('tutorialContent').textContent=st.content;document.getElementById('tutorialBtn').textContent=tutorialStep<steps.length-1?'下一步':'开始战斗';const hl=document.getElementById('tutorialHighlight');if(st.highlight){const el=document.querySelector(st.highlight);if(el){const r=el.getBoundingClientRect();hl.style.display='block';hl.style.left=r.left-5+'px';hl.style.top=r.top-5+'px';hl.style.width=r.width+10+'px';hl.style.height=r.height+10+'px';}}else hl.style.display='none';}
document.getElementById('tutorialBtn').addEventListener('click',()=>{tutorialStep++;showTutorialStep();});
function toggleKeyHints(){showKeyHintPanel=!showKeyHintPanel;const p=document.getElementById('keyHintPanel');if(p)p.classList.toggle('hidden',!showKeyHintPanel);saveSettings();playSound('click');}

// ==================== Canvas绘制 ====================
function drawHeroIcon(canvas,hero,size=48){const ctx=canvas.getContext('2d');canvas.width=size;canvas.height=size;ctx.clearRect(0,0,size,size);ctx.fillStyle=hero.color;ctx.fillRect(0,0,size,size);ctx.fillStyle='#fdbf60';ctx.beginPath();ctx.arc(size/2,size*0.35,size*0.22,0,Math.PI*2);ctx.fill();ctx.fillStyle='#1a1a1a';if(hero.hair.includes('crown')){ctx.fillRect(size*0.3,size*0.08,size*0.4,size*0.12);ctx.fillStyle='#d4a843';ctx.fillRect(size*0.35,size*0.05,size*0.3,size*0.08);}else if(hero.hair.includes('long')){ctx.fillRect(size*0.25,size*0.1,size*0.5,size*0.3);}else if(hero.hair.includes('hat')){ctx.fillStyle='#2f1810';ctx.fillRect(size*0.2,size*0.08,size*0.6,size*0.15);ctx.fillStyle='#1a1a1a';ctx.fillRect(size*0.25,size*0.18,size*0.5,size*0.08);}if(hero.face.includes('beard')){ctx.fillStyle='#1a1a1a';ctx.fillRect(size*0.35,size*0.42,size*0.3,size*0.12);}ctx.fillStyle=hero.color;ctx.fillRect(size*0.25,size*0.55,size*0.5,size*0.35);ctx.strokeStyle='#d4a843';ctx.lineWidth=2;ctx.strokeRect(0,0,size,size);}

function drawHeroFull(canvas,hero,w=350,h=450){const ctx=canvas.getContext('2d');canvas.width=w;canvas.height=h;ctx.clearRect(0,0,w,h);const cx=w/2,cy=h*0.4;const grad=ctx.createRadialGradient(cx,cy,20,cx,cy,150);grad.addColorStop(0,hero.color+'40');grad.addColorStop(1,'transparent');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);const headR=35,bodyW=60,bodyH=90,legW=20,legH=70;ctx.fillStyle='#3a2818';ctx.fillRect(cx-legW-5,cy+bodyH/2,legW,legH);ctx.fillRect(cx+5,cy+bodyH/2,legW,legH);ctx.fillStyle=hero.color;ctx.fillRect(cx-bodyW/2,cy-bodyH/2+headR,bodyW,bodyH);ctx.strokeStyle='#d4a843';ctx.lineWidth=1;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(cx-bodyW/2+5,cy-bodyH/2+headR+15+i*20);ctx.lineTo(cx+bodyW/2-5,cy-bodyH/2+headR+15+i*20);ctx.stroke();}ctx.fillStyle='#fdbf60';ctx.beginPath();ctx.arc(cx,cy-headR,headR,0,Math.PI*2);ctx.fill();ctx.fillStyle='#1a1a1a';if(hero.hair.includes('crown')){ctx.fillRect(cx-30,cy-headR*2.2,60,15);ctx.fillStyle='#d4a843';ctx.fillRect(cx-25,cy-headR*2.4,50,10);}else if(hero.hair.includes('long')||hero.hair.includes('long_f')){ctx.fillStyle='#1a1a1a';ctx.fillRect(cx-35,cy-headR*2,70,headR*1.5);}else if(hero.hair.includes('hat')){ctx.fillStyle='#2f1810';ctx.fillRect(cx-38,cy-headR*2.2,76,20);ctx.fillStyle='#1a1a1a';ctx.fillRect(cx-30,cy-headR*1.8,60,12);}if(hero.face.includes('beard')){ctx.fillStyle='#1a1a1a';ctx.fillRect(cx-20,cy-5,40,20);}ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.arc(cx-12,cy-headR*0.5,4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(cx+12,cy-headR*0.5,4,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#d4a843';ctx.lineWidth=3;ctx.fillStyle='#8b6914';if(hero.weapon.includes('sword')||hero.weapon.includes('sword_wine')){ctx.fillRect(cx+35,cy-20,8,100);ctx.fillStyle='#c0c0c0';ctx.fillRect(cx+33,cy-30,12,50);ctx.fillStyle='#d4a843';ctx.fillRect(cx+28,cy+20,22,6);}else if(hero.weapon.includes('spear')||hero.weapon.includes('guandao')||hero.weapon.includes('halberd')){ctx.fillStyle='#8b4513';ctx.fillRect(cx+40,cy-60,6,140);ctx.fillStyle='#c0c0c0';if(hero.weapon.includes('guandao')){ctx.fillRect(cx+32,cy-50,22,8);ctx.fillRect(cx+36,cy-60,14,15);}else if(hero.weapon.includes('halberd')){ctx.fillRect(cx+30,cy-55,26,6);ctx.beginPath();ctx.moveTo(cx+30,cy-55);ctx.lineTo(cx+20,cy-75);ctx.lineTo(cx+43,cy-55);ctx.fill();}else{ctx.fillRect(cx+34,cy-50,18,6);}}else if(hero.weapon.includes('bow')){ctx.strokeStyle='#8b4513';ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx+50,cy-10,25,Math.PI*0.8,Math.PI*1.2);ctx.stroke();ctx.fillStyle='#c0c0c0';ctx.fillRect(cx+48,cy-35,4,50);}else if(hero.weapon.includes('fan')){ctx.fillStyle='#8b4513';ctx.fillRect(cx+35,cy-30,6,60);ctx.fillStyle='#f5f5dc';ctx.beginPath();ctx.moveTo(cx+38,cy-30);ctx.quadraticCurveTo(cx+60,cy-10,cx+38,cy+10);ctx.quadraticCurveTo(cx+16,cy-10,cx+38,cy-30);ctx.fill();}else if(hero.weapon.includes('scepter')){ctx.fillStyle='#d4a843';ctx.fillRect(cx+38,cy-50,6,80);ctx.fillStyle='#ffd700';ctx.beginPath();ctx.arc(cx+41,cy-55,10,0,Math.PI*2);ctx.fill();}else if(hero.weapon.includes('dagger')){ctx.fillStyle='#c0c0c0';ctx.fillRect(cx+35,cy-10,5,30);ctx.fillRect(cx+33,cy+20,9,4);}else if(hero.weapon.includes('pipa')){ctx.fillStyle='#8b4513';ctx.beginPath();ctx.ellipse(cx+45,cy-10,20,12,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#d4a843';ctx.lineWidth=1;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(cx+30+i*8,cy-20);ctx.lineTo(cx+30+i*8,cy);ctx.stroke();}}}

function drawSkillIcon(canvas,skillName){const ctx=canvas.getContext('2d');const s=50;canvas.width=s;canvas.height=s;ctx.clearRect(0,0,s,s);const grad=ctx.createRadialGradient(s/2,s/2,5,s/2,s/2,s/2);grad.addColorStop(0,'#2a1a0a');grad.addColorStop(1,'#0a0500');ctx.fillStyle=grad;ctx.beginPath();ctx.arc(s/2,s/2,s/2-2,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#d4a843';ctx.lineWidth=2;ctx.fillStyle='#d4a843';if(skillName.includes('斩')||skillName.includes('击')||skillName.includes('刺')||skillName.includes('杀')||skillName.includes('破')||skillName.includes('突')){ctx.beginPath();ctx.moveTo(s*0.3,s*0.2);ctx.lineTo(s*0.7,s*0.5);ctx.lineTo(s*0.3,s*0.8);ctx.stroke();}else if(skillName.includes('火')||skillName.includes('烧')||skillName.includes('焚')||skillName.includes('赤')||skillName.includes('焰')){ctx.beginPath();ctx.moveTo(s*0.5,s*0.7);ctx.quadraticCurveTo(s*0.3,s*0.5,s*0.5,s*0.2);ctx.quadraticCurveTo(s*0.7,s*0.5,s*0.5,s*0.7);ctx.fill();}else if(skillName.includes('冰')||skillName.includes('雪')||skillName.includes('寒')||skillName.includes('霜')||skillName.includes('冻')){ctx.fillStyle='#00a8cc';ctx.beginPath();ctx.moveTo(s*0.5,s*0.2);ctx.lineTo(s*0.7,s*0.5);ctx.lineTo(s*0.5,s*0.8);ctx.lineTo(s*0.3,s*0.5);ctx.closePath();ctx.fill();}else if(skillName.includes('雷')||skillName.includes('电')||skillName.includes('闪')||skillName.includes('霆')){ctx.strokeStyle='#ffd700';ctx.beginPath();ctx.moveTo(s*0.4,s*0.2);ctx.lineTo(s*0.5,s*0.5);ctx.lineTo(s*0.35,s*0.5);ctx.lineTo(s*0.5,s*0.8);ctx.stroke();}else if(skillName.includes('毒')||skillName.includes('蛊')||skillName.includes('瘴')){ctx.fillStyle='#4a9b5e';ctx.beginPath();ctx.arc(s*0.5,s*0.5,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2e8b57';for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(s*0.5+Math.cos(i*2.1)*8,s*0.5+Math.sin(i*2.1)*8,4,0,Math.PI*2);ctx.fill();}}else if(skillName.includes('医')||skillName.includes('治')||skillName.includes('愈')||skillName.includes('疗')||skillName.includes('生')){ctx.strokeStyle='#4a9b5e';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(s*0.5,s*0.25);ctx.lineTo(s*0.5,s*0.75);ctx.stroke();ctx.beginPath();ctx.moveTo(s*0.25,s*0.5);ctx.lineTo(s*0.75,s*0.5);ctx.stroke();}else if(skillName.includes('盾')||skillName.includes('防')||skillName.includes('护')||skillName.includes('甲')){ctx.strokeStyle='#c0c0c0';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(s*0.5,s*0.2);ctx.lineTo(s*0.2,s*0.4);ctx.lineTo(s*0.2,s*0.7);ctx.lineTo(s*0.5,s*0.85);ctx.lineTo(s*0.8,s*0.7);ctx.lineTo(s*0.8,s*0.4);ctx.closePath();ctx.stroke();}else if(skillName.includes('酒')||skillName.includes('醉')||skillName.includes('饮')){ctx.fillStyle='#8b4513';ctx.beginPath();ctx.arc(s*0.5,s*0.6,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#c0c0c0';ctx.fillRect(s*0.45,s*0.2,10,20);}else{ctx.fillStyle='#d4a843';ctx.beginPath();ctx.arc(s*0.5,s*0.5,8,0,Math.PI*2);ctx.fill();}}

function drawMapPreview(canvasId,mapIndex){const canvas=document.getElementById(canvasId);if(!canvas)return;const ctx=canvas.getContext('2d');canvas.width=220;canvas.height=170;const map=MAPS[mapIndex];ctx.fillStyle='#'+map.groundColor.toString(16).padStart(6,'0');ctx.fillRect(0,0,220,170);ctx.strokeStyle='rgba(212,168,67,0.5)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(15,155);ctx.lineTo(15,85);ctx.lineTo(110,85);ctx.lineTo(110,15);ctx.stroke();ctx.beginPath();ctx.moveTo(15,155);ctx.lineTo(205,15);ctx.stroke();ctx.beginPath();ctx.moveTo(15,155);ctx.lineTo(110,155);ctx.lineTo(110,85);ctx.lineTo(205,15);ctx.stroke();ctx.fillStyle='#d4a843';ctx.fillRect(10,145,12,12);ctx.fillStyle='#c41e3a';ctx.fillRect(198,8,12,12);}

function initLoginBg(){const c=document.getElementById('loginCanvas'),ctx=c.getContext('2d');c.width=window.innerWidth;c.height=window.innerHeight;ctx.fillStyle='#1a1a1a';ctx.fillRect(0,0,c.width,c.height);for(let i=0;i<3;i++){ctx.fillStyle=`rgba(${40+i*20},${40+i*20},${40+i*20},1)`;ctx.beginPath();ctx.moveTo(0,c.height*(0.5+i*0.15));for(let x=0;x<=c.width;x+=40)ctx.lineTo(x,c.height*(0.5+i*0.15)-Math.sin(x*0.005+i)*60-Math.random()*20);ctx.lineTo(c.width,c.height);ctx.lineTo(0,c.height);ctx.fill();}}

// ==================== Three.js 初始化 (MOBA三路地图) ====================
function isOnLane(x,z){for(const ln of['top','mid','bot']){for(const p of LANES[ln]){if(dist2D(x,z,p.x,p.z)<6)return true;}}return false;}

function initThree(){
const canvas=document.getElementById('canvas3d');
scene=new THREE.Scene();
const map=MAPS[currentMap]||MAPS[0];
scene.fog=new THREE.Fog(map.fogColor,map.fogNear,map.fogFar);
scene.background=new THREE.Color(map.fogColor);
camera=new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,0.1,1000);
camera.position.set(0,15,20);
renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
clock=new THREE.Clock();
scene.add(new THREE.AmbientLight(map.ambientColor,map.ambientIntensity));
const dl=new THREE.DirectionalLight(map.lightColor,map.lightIntensity);dl.position.set(50,100,50);dl.castShadow=true;dl.shadow.mapSize.width=2048;dl.shadow.mapSize.height=2048;scene.add(dl);
scene.add(new THREE.PointLight(0xd4a843,0.5,50));
const pl=new THREE.PointLight(0xd4a843,0.5,50);pl.position.set(0,10,0);scene.add(pl);
const gnd=new THREE.Mesh(new THREE.PlaneGeometry(MAP_SIZE,MAP_SIZE),new THREE.MeshStandardMaterial({color:map.groundColor,roughness:0.9}));gnd.rotation.x=-Math.PI/2;gnd.receiveShadow=true;scene.add(gnd);
scene.add(new THREE.GridHelper(MAP_SIZE,50,currentMap===2?0x8899aa:0x5a4014,currentMap===2?0x8899aa:0x5a4014));

// 三路路面
const roadColor=0x5a4a2a;
for(const ln of['top','mid','bot']){const lane=LANES[ln];for(let i=0;i<lane.length-1;i++){const p1=lane[i],p2=lane[i+1];const dx=p2.x-p1.x,dz=p2.z-p1.z,len=Math.sqrt(dx*dx+dz*dz),angle=Math.atan2(dx,dz);const road=new THREE.Mesh(new THREE.PlaneGeometry(8,len),new THREE.MeshStandardMaterial({color:roadColor,roughness:0.8}));road.rotation.x=-Math.PI/2;road.rotation.z=-angle;road.position.set((p1.x+p2.x)/2,0.05,(p1.z+p2.z)/2);road.receiveShadow=true;scene.add(road);}}

// 河道
const river=new THREE.Mesh(new THREE.PlaneGeometry(10,80),new THREE.MeshStandardMaterial({color:0x2266aa,transparent:true,opacity:0.6,roughness:0.3}));river.rotation.x=-Math.PI/2;river.rotation.z=Math.PI/4;river.position.set(0,0.08,0);scene.add(river);

// 防御塔
towers=[];
const allyTP=[{x:-MAP_HALF+24,z:-42},{x:-42,z:0},{x:-MAP_HALF+56,z:-MAP_HALF+56},{x:-28,z:-28},{x:-42,z:-MAP_HALF+24},{x:0,z:-42}];
const enemyTP=[{x:42,z:0},{x:MAP_HALF-24,z:-84},{x:28,z:28},{x:MAP_HALF-56,z:MAP_HALF-56},{x:0,z:42},{x:MAP_HALF-24,z:MAP_HALF-24}];
allyTP.forEach(p=>{const t=createTowerMesh(p.x,p.z,0xd4a843,'ally');towers.push(t);});
enemyTP.forEach(p=>{const t=createTowerMesh(p.x,p.z,0xc41e3a,'enemy');towers.push(t);});

// 水晶
crystals=[];
crystals.push(createCrystalMesh(-MAP_HALF,-MAP_HALF,0xd4a843,'ally'));
crystals.push(createCrystalMesh(MAP_HALF,MAP_HALF,0xc41e3a,'enemy'));

// 野怪营地
jungleCamps=[];
[{x:-MAP_HALF+56,z:-MAP_HALF+56},{x:MAP_HALF-56,z:-MAP_HALF+56},{x:-MAP_HALF+56,z:MAP_HALF-56},{x:MAP_HALF-56,z:MAP_HALF-56}].forEach(pos=>{
const g=new THREE.Group();
const base=new THREE.Mesh(new THREE.CylinderGeometry(1.5,2,0.5,6),new THREE.MeshStandardMaterial({color:0x8b4513}));base.position.y=0.25;g.add(base);
for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(1,1.5,1),new THREE.MeshStandardMaterial({color:0x4a2a1a}));m.position.set((Math.random()-0.5)*4,1,(Math.random()-0.5)*4);m.castShadow=true;g.add(m);}
g.position.set(pos.x,0,pos.z);
g.userData={type:'jungleCamp',alive:true,respawnTimer:0,respawnTime:60,goldReward:100,xpReward:80};
scene.add(g);jungleCamps.push(g);
});

// 装饰
for(let i=0;i<15;i++){const x=(Math.random()-0.5)*(MAP_SIZE-40),z=(Math.random()-0.5)*(MAP_SIZE-40);if(Math.abs(x)<15&&Math.abs(z)<15)continue;if(isOnLane(x,z))continue;
if(map.decoration==='trees'){const tk=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.8,4,6),new THREE.MeshStandardMaterial({color:0x4a3728}));tk.position.set(x,2,z);scene.add(tk);const lv=new THREE.Mesh(new THREE.ConeGeometry(3,6,6),new THREE.MeshStandardMaterial({color:map.treeColor}));lv.position.set(x,6,z);scene.add(lv);}
else if(map.decoration==='pines'){const tk=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.6,5,6),new THREE.MeshStandardMaterial({color:0x3a2818}));tk.position.set(x,2.5,z);scene.add(tk);const lv=new THREE.Mesh(new THREE.ConeGeometry(2.5,7,6),new THREE.MeshStandardMaterial({color:map.treeColor}));lv.position.set(x,7,z);scene.add(lv);}
else{const r=new THREE.Mesh(new THREE.DodecahedronGeometry(Math.random()*2+1),new THREE.MeshStandardMaterial({color:map.rockColor,roughness:0.8}));r.position.set(x,1,z);scene.add(r);}}
if(map.decoration==='burning'){for(let i=0;i<10;i++){const f=new THREE.Mesh(new THREE.SphereGeometry(0.5+Math.random()*0.5,6,6),new THREE.MeshBasicMaterial({color:0xff4400,transparent:true,opacity:0.7}));f.position.set((Math.random()-0.5)*120,1+Math.random(),(Math.random()-0.5)*120);scene.add(f);}}
}

function createTowerMesh(x,z,color,team){
const g=new THREE.Group();
const base2=new THREE.Mesh(new THREE.CylinderGeometry(2,2.5,1,8),new THREE.MeshStandardMaterial({color:0x666666}));base2.position.y=0.5;g.add(base2);
const body=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.5,8,8),new THREE.MeshStandardMaterial({color}));body.position.y=5;body.castShadow=true;g.add(body);
const top=new THREE.Mesh(new THREE.SphereGeometry(1.5,8,8),new THREE.MeshStandardMaterial({color:0xffd700,emissive:color,emissiveIntensity:0.3}));top.position.y=10;g.add(top);
const rng=new THREE.Mesh(new THREE.RingGeometry(14,15,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.1,side:THREE.DoubleSide}));rng.rotation.x=-Math.PI/2;rng.position.y=0.1;g.add(rng);
g.position.set(x,0,z);g.userData={type:'tower',team,hp:2000,maxHp:2000,atk:80,range:15,attackCooldown:0,color};scene.add(g);return g;
}

function createCrystalMesh(x,z,color,team){
const g=new THREE.Group();
const cr=new THREE.Mesh(new THREE.OctahedronGeometry(3,0),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:0.5,transparent:true,opacity:0.85}));cr.position.y=5;cr.castShadow=true;g.add(cr);
const crBase=new THREE.Mesh(new THREE.CylinderGeometry(4,5,2,8),new THREE.MeshStandardMaterial({color:0x444444}));crBase.position.y=1;g.add(crBase);
const glow=new THREE.Mesh(new THREE.RingGeometry(5,6,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.3,side:THREE.DoubleSide}));glow.rotation.x=-Math.PI/2;glow.position.y=0.1;g.add(glow);
g.position.set(x,0,z);g.userData={type:'crystal',team,hp:5000,maxHp:5000,color};scene.add(g);return g;
}

// ==================== 创建英雄3D模型 ====================
function createHero3D(hero,isPlayer=false){
const g=new THREE.Group();
const body=new THREE.Mesh(new THREE.BoxGeometry(1,1.5,0.6),new THREE.MeshStandardMaterial({color:hero.color}));body.position.y=1.5;body.castShadow=true;g.add(body);
const head=new THREE.Mesh(new THREE.SphereGeometry(0.4,8,8),new THREE.MeshStandardMaterial({color:0xffdbac}));head.position.y=2.6;g.add(head);
const hair=new THREE.Mesh(new THREE.SphereGeometry(0.45,8,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0x1a1a1a}));hair.position.y=2.65;g.add(hair);
if(hero.weapon.includes('sword')||hero.weapon.includes('dagger')){const b=new THREE.Mesh(new THREE.BoxGeometry(0.1,1.2,0.05),new THREE.MeshStandardMaterial({color:0xc0c0c0}));b.position.set(0.7,2,0.3);g.add(b);}
else if(hero.weapon.includes('spear')||hero.weapon.includes('guandao')){const s=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,2.5),new THREE.MeshStandardMaterial({color:0x8b4513}));s.position.set(0.7,2.5,0.3);g.add(s);}
else if(hero.weapon.includes('bow')){const b=new THREE.Mesh(new THREE.TorusGeometry(0.5,0.05,6,12,Math.PI),new THREE.MeshStandardMaterial({color:0x8b4513}));b.position.set(0.6,2,0.4);b.rotation.z=Math.PI/2;g.add(b);}
const hpBg=new THREE.Mesh(new THREE.PlaneGeometry(1.5,0.2),new THREE.MeshBasicMaterial({color:0x000000}));hpBg.position.y=3.2;hpBg.userData={isHpBar:true};g.add(hpBg);
const hpFill=new THREE.Mesh(new THREE.PlaneGeometry(1.5,0.18),new THREE.MeshBasicMaterial({color:isPlayer?0x00ff00:0xff0000}));hpFill.position.set(0,3.2,0.01);hpFill.userData={isHpFill:true};g.add(hpFill);
if(isPlayer){const ring=new THREE.Mesh(new THREE.RingGeometry(0.8,1,16),new THREE.MeshBasicMaterial({color:0xd4a843,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=0.05;g.add(ring);}
g.userData={hero,hp:hero.hp,maxHp:hero.hp,mp:hero.mp,maxMp:hero.mp,atk:hero.atk,def:hero.def,spd:hero.spd,level:1,xp:0,maxXp:100,kills:0,deaths:0,gold:0,skills:hero.skills.map((n,i)=>({name:n,cooldown:0,maxCd:[3,5,8,12][i]||5,key:['1','2','3','4'][i]})),isPlayer,velocity:new THREE.Vector3(),jumping:false,grounded:true,aiLane:null,aiWaypointIdx:0,aiReactionTimer:0,aiSkillTimer:0,aiState:'patrol',equip:[],targetPos:null,moving:false};
return g;
}

// ==================== 粒子系统 ====================
function getParticle(){if(particlePool.length>0)return particlePool.pop();return new THREE.Mesh(new THREE.PlaneGeometry(0.3,0.3),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true}));}
function spawnParticles(pos,color,count=10,speed=5){for(let i=0;i<count;i++){const p=getParticle();p.material=p.material.clone();p.material.color.setHex(color);p.position.copy(pos);p.userData={vel:new THREE.Vector3((Math.random()-0.5)*speed,Math.random()*speed*0.5+2,(Math.random()-0.5)*speed),life:1,decay:Math.random()*0.03+0.02};scene.add(p);particles.push(p);}}
function updateParticles(dt){for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.userData.life-=p.userData.decay;p.position.addScaledVector(p.userData.vel,dt);p.userData.vel.y-=9.8*dt;p.material.opacity=p.userData.life;p.lookAt(camera.position);if(p.userData.life<=0){scene.remove(p);particlePool.push(p);particles.splice(i,1);}}}

// ==================== 技能特效系统 ====================
function getHeroTypeById(heroId) {
  const hero = HEROES.find(h => h.id === heroId);
  return hero ? hero.type : '皇帝';
}

function createSkillEffect(heroId, skillIndex, startPos, targetPos) {
  if(!scene) return null;
  const heroType = getHeroTypeById(heroId);
  const effectGroup = new THREE.Group();
  effectGroup.position.copy(startPos);
  let duration = 2000;

  const typeColors = {
    '皇帝': 0xffd700,
    '武将': 0xff0000,
    '谋士': 0x00a8cc,
    '美人': 0xff69b4,
    '刺客': 0x1a1a1a,
    '名医': 0x4a9b5e,
    '工匠': 0xff8800,
    '诗人': 0x9370db
  };
  const baseColor = typeColors[heroType] || 0xffd700;

  if (heroType === '皇帝') {
    if (skillIndex === 0) {
      // 金色龙形光环
      for(let i=0;i<12;i++){
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.15,4,4), new THREE.MeshBasicMaterial({color:0xffd700,transparent:true}));
        const a = (i/12)*Math.PI*2;
        p.position.set(Math.cos(a)*2, Math.sin(a*2)*0.5+1, Math.sin(a)*2);
        effectGroup.add(p);
      }
    } else if (skillIndex === 1) {
      // 金色光柱
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,8,8), new THREE.MeshBasicMaterial({color:0xffd700,transparent:true,opacity:0.6}));
      pillar.position.y = 4;
      effectGroup.add(pillar);
      for(let i=0;i<8;i++){
        const ring = new THREE.Mesh(new THREE.RingGeometry(0.5+i*0.3,0.6+i*0.3,16), new THREE.MeshBasicMaterial({color:0xffd700,transparent:true,opacity:0.4,side:THREE.DoubleSide}));
        ring.rotation.x = -Math.PI/2;
        ring.position.y = 0.1 + i*0.5;
        effectGroup.add(ring);
      }
    } else if (skillIndex === 2) {
      // 金色冲击波
      const wave = new THREE.Mesh(new THREE.RingGeometry(0.5,1,32), new THREE.MeshBasicMaterial({color:0xffd700,transparent:true,opacity:0.6,side:THREE.DoubleSide}));
      wave.rotation.x = -Math.PI/2;
      wave.position.y = 0.5;
      effectGroup.add(wave);
      effectGroup.userData = {expand:true,maxScale:10};
    } else {
      // 金色龙形
      const dragon = new THREE.Mesh(new THREE.TorusKnotGeometry(0.8,0.2,64,8,2,3), new THREE.MeshBasicMaterial({color:0xffd700,transparent:true,opacity:0.8}));
      dragon.position.y = 2;
      effectGroup.add(dragon);
    }
  } else if (heroType === '武将') {
    if (skillIndex === 0) {
      // 红色刀光
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.2,0.1,4), new THREE.MeshBasicMaterial({color:0xff0000,transparent:true,opacity:0.8}));
      blade.position.y = 1.5;
      if(targetPos) blade.lookAt(targetPos);
      effectGroup.add(blade);
    } else if (skillIndex === 1) {
      // 红色旋风
      for(let i=0;i<6;i++){
        const arc = new THREE.Mesh(new THREE.TorusGeometry(1+i*0.3,0.05,8,16,Math.PI), new THREE.MeshBasicMaterial({color:0xff0000,transparent:true,opacity:0.6}));
        arc.rotation.x = Math.random()*Math.PI;
        arc.rotation.y = Math.random()*Math.PI;
        arc.position.y = 1 + i*0.3;
        effectGroup.add(arc);
      }
    } else if (skillIndex === 2) {
      // 红色突进轨迹
      const trail = new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.3,5,8), new THREE.MeshBasicMaterial({color:0xff0000,transparent:true,opacity:0.5}));
      trail.rotation.x = Math.PI/2;
      if(targetPos) trail.lookAt(targetPos);
      effectGroup.add(trail);
    } else {
      // 红色爆炸
      const explosion = new THREE.Mesh(new THREE.SphereGeometry(2,16,16), new THREE.MeshBasicMaterial({color:0xff4400,transparent:true,opacity:0.5}));
      explosion.position.y = 1;
      effectGroup.add(explosion);
      for(let i=0;i<12;i++){
        const spark = new THREE.Mesh(new THREE.SphereGeometry(0.1,4,4), new THREE.MeshBasicMaterial({color:0xff0000}));
        const a = (i/12)*Math.PI*2;
        spark.position.set(Math.cos(a)*2, Math.random()*2, Math.sin(a)*2);
        effectGroup.add(spark);
      }
    }
  } else if (heroType === '谋士') {
    if (skillIndex === 0) {
      // 蓝色法阵
      for(let i=0;i<6;i++){
        const rune = new THREE.Mesh(new THREE.PlaneGeometry(0.5,0.5), new THREE.MeshBasicMaterial({color:0x00a8cc,transparent:true,side:THREE.DoubleSide}));
        const a = (i/6)*Math.PI*2;
        rune.position.set(Math.cos(a)*1.5, 1+Math.sin(a), Math.sin(a)*1.5);
        rune.rotation.y = a;
        effectGroup.add(rune);
      }
    } else if (skillIndex === 1) {
      // 蓝色火球
      const fireball = new THREE.Mesh(new THREE.SphereGeometry(0.8,16,16), new THREE.MeshBasicMaterial({color:0x0088ff,transparent:true,opacity:0.8}));
      fireball.position.y = 1.5;
      effectGroup.add(fireball);
      const trail = new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.4,3,8), new THREE.MeshBasicMaterial({color:0x00a8cc,transparent:true,opacity:0.5}));
      trail.rotation.x = Math.PI/2;
      if(targetPos) trail.lookAt(targetPos);
      effectGroup.add(trail);
    } else if (skillIndex === 2) {
      // 蓝色冰锥
      for(let i=0;i<5;i++){
        const ice = new THREE.Mesh(new THREE.ConeGeometry(0.15,1.5,6), new THREE.MeshBasicMaterial({color:0x88ccff,transparent:true,opacity:0.8}));
        ice.position.set((Math.random()-0.5)*3, Math.random()*2+0.5, (Math.random()-0.5)*3);
        ice.rotation.x = Math.random()*0.5;
        ice.rotation.z = Math.random()*0.5;
        effectGroup.add(ice);
      }
    } else {
      // 蓝色风暴
      const storm = new THREE.Mesh(new THREE.CylinderGeometry(2,2,6,16,1,true), new THREE.MeshBasicMaterial({color:0x00a8cc,transparent:true,opacity:0.3,side:THREE.DoubleSide}));
      storm.position.y = 3;
      effectGroup.add(storm);
      for(let i=0;i<8;i++){
        const bolt = new THREE.Mesh(new THREE.BoxGeometry(0.05,2,0.05), new THREE.MeshBasicMaterial({color:0x00ffff}));
        const a = (i/8)*Math.PI*2;
        bolt.position.set(Math.cos(a)*1.5, Math.random()*3+1, Math.sin(a)*1.5);
        effectGroup.add(bolt);
      }
    }
  } else if (heroType === '美人') {
    if (skillIndex === 0) {
      // 粉色花瓣飘落
      for(let i=0;i<15;i++){
        const petal = new THREE.Mesh(new THREE.PlaneGeometry(0.2,0.2), new THREE.MeshBasicMaterial({color:0xff69b4,transparent:true,side:THREE.DoubleSide}));
        petal.position.set((Math.random()-0.5)*3, Math.random()*2+1, (Math.random()-0.5)*3);
        petal.userData = {velY:-Math.random()*2-1, rotSpeed:(Math.random()-0.5)*5};
        effectGroup.add(petal);
      }
    } else if (skillIndex === 1) {
      // 粉色光环
      for(let i=0;i<3;i++){
        const ring = new THREE.Mesh(new THREE.RingGeometry(1+i*0.8,1.2+i*0.8,32), new THREE.MeshBasicMaterial({color:0xff69b4,transparent:true,opacity:0.4,side:THREE.DoubleSide}));
        ring.rotation.x = -Math.PI/2;
        ring.position.y = 0.1 + i*0.3;
        effectGroup.add(ring);
      }
    } else if (skillIndex === 2) {
      // 粉色音波
      for(let i=0;i<4;i++){
        const wave = new THREE.Mesh(new THREE.RingGeometry(0.5+i*0.5,0.7+i*0.5,32), new THREE.MeshBasicMaterial({color:0xff69b4,transparent:true,opacity:0.5,side:THREE.DoubleSide}));
        wave.rotation.x = -Math.PI/2;
        wave.position.y = 1;
        effectGroup.add(wave);
      }
    } else {
      // 粉色迷雾
      const fog = new THREE.Mesh(new THREE.SphereGeometry(2.5,16,16), new THREE.MeshBasicMaterial({color:0xffc0cb,transparent:true,opacity:0.3}));
      fog.position.y = 1.5;
      effectGroup.add(fog);
    }
  } else if (heroType === '刺客') {
    if (skillIndex === 0) {
      // 黑色烟雾
      const shadow = new THREE.Mesh(new THREE.SphereGeometry(1.5,8,8), new THREE.MeshBasicMaterial({color:0x1a1a1a,transparent:true,opacity:0.5}));
      shadow.position.y = 0.5;
      effectGroup.add(shadow);
      for(let i=0;i<8;i++){
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.1,1,4), new THREE.MeshBasicMaterial({color:0x333333}));
        const a = (i/8)*Math.PI*2;
        spike.position.set(Math.cos(a)*1.2, 0.5, Math.sin(a)*1.2);
        spike.rotation.z = Math.PI/2;
        spike.rotation.y = a;
        effectGroup.add(spike);
      }
    } else if (skillIndex === 1) {
      // 黑色突刺
      const thrust = new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,4,8), new THREE.MeshBasicMaterial({color:0x1a1a1a}));
      thrust.rotation.x = Math.PI/2;
      if(targetPos) thrust.lookAt(targetPos);
      effectGroup.add(thrust);
    } else if (skillIndex === 2) {
      // 黑色飞镖
      for(let i=0;i<6;i++){
        const dart = new THREE.Mesh(new THREE.ConeGeometry(0.08,0.5,4), new THREE.MeshBasicMaterial({color:0x333333}));
        const a = (i/6)*Math.PI*2;
        dart.position.set(Math.cos(a)*1, Math.random()+0.5, Math.sin(a)*1);
        dart.rotation.z = Math.PI/2;
        dart.rotation.y = a;
        effectGroup.add(dart);
      }
    } else {
      // 黑色爆炸
      const exp = new THREE.Mesh(new THREE.SphereGeometry(1.5,16,16), new THREE.MeshBasicMaterial({color:0x1a1a1a,transparent:true,opacity:0.6}));
      exp.position.y = 1;
      effectGroup.add(exp);
      for(let i=0;i<10;i++){
        const shard = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.3), new THREE.MeshBasicMaterial({color:0x333333}));
        const a = (i/10)*Math.PI*2;
        shard.position.set(Math.cos(a)*1.5, Math.random()*2, Math.sin(a)*1.5);
        effectGroup.add(shard);
      }
    }
  } else if (heroType === '名医') {
    if (skillIndex === 0) {
      // 绿色光球
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.6,16,16), new THREE.MeshBasicMaterial({color:0x4a9b5e,transparent:true,opacity:0.8}));
      orb.position.y = 1.5;
      effectGroup.add(orb);
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.8,1,16), new THREE.MeshBasicMaterial({color:0x4a9b5e,transparent:true,opacity:0.5,side:THREE.DoubleSide}));
      ring.rotation.x = -Math.PI/2;
      ring.position.y = 1.5;
      effectGroup.add(ring);
    } else if (skillIndex === 1) {
      // 绿色光环治愈
      const glow = new THREE.Mesh(new THREE.SphereGeometry(2,8,8), new THREE.MeshBasicMaterial({color:0x4a9b5e,transparent:true,opacity:0.3}));
      glow.position.y = 1;
      effectGroup.add(glow);
      for(let i=0;i<8;i++){
        const cross = new THREE.Mesh(new THREE.BoxGeometry(0.3,0.08,0.08), new THREE.MeshBasicMaterial({color:0x00ff00}));
        cross.position.set((Math.random()-0.5)*3, Math.random()*2+0.5, (Math.random()-0.5)*3);
        effectGroup.add(cross);
        const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.08,0.3,0.08), new THREE.MeshBasicMaterial({color:0x00ff00}));
        crossV.position.copy(cross.position);
        effectGroup.add(crossV);
      }
    } else if (skillIndex === 2) {
      // 绿色解毒
      for(let i=0;i<10;i++){
        const drop = new THREE.Mesh(new THREE.SphereGeometry(0.08,4,4), new THREE.MeshBasicMaterial({color:0x00ff00,transparent:true}));
        drop.position.set((Math.random()-0.5)*2, Math.random()*3+1, (Math.random()-0.5)*2);
        effectGroup.add(drop);
      }
    } else {
      // 绿色复苏
      const revive = new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.3,5,8), new THREE.MeshBasicMaterial({color:0x4a9b5e,transparent:true,opacity:0.6}));
      revive.position.y = 2.5;
      effectGroup.add(revive);
      for(let i=0;i<6;i++){
        const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.3,0.15), new THREE.MeshBasicMaterial({color:0x4a9b5e,transparent:true,side:THREE.DoubleSide}));
        const a = (i/6)*Math.PI*2;
        leaf.position.set(Math.cos(a)*1.2, 1+Math.random(), Math.sin(a)*1.2);
        effectGroup.add(leaf);
      }
    }
  } else if (heroType === '工匠') {
    if (skillIndex === 0) {
      // 橙色齿轮
      for(let i=0;i<4;i++){
        const gear = new THREE.Mesh(new THREE.TorusGeometry(0.4,0.1,6,12), new THREE.MeshBasicMaterial({color:0xff8800}));
        gear.position.set((Math.random()-0.5)*2, Math.random()*1.5+0.5, (Math.random()-0.5)*2);
        gear.rotation.x = Math.random()*Math.PI;
        gear.userData = {rotSpeed:(Math.random()-0.5)*10};
        effectGroup.add(gear);
      }
    } else if (skillIndex === 1) {
      // 橙色陷阱
      const trap = new THREE.Mesh(new THREE.BoxGeometry(2,0.1,2), new THREE.MeshBasicMaterial({color:0xff8800,transparent:true,opacity:0.6}));
      trap.position.y = 0.05;
      effectGroup.add(trap);
      for(let i=0;i<4;i++){
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.1,0.5,4), new THREE.MeshBasicMaterial({color:0xff6600}));
        spike.position.set((Math.random()-0.5)*1.5, 0.3, (Math.random()-0.5)*1.5);
        effectGroup.add(spike);
      }
    } else if (skillIndex === 2) {
      // 橙色护盾
      const shield = new THREE.Mesh(new THREE.SphereGeometry(1.5,16,16,0,Math.PI*2,0,Math.PI/2), new THREE.MeshBasicMaterial({color:0xff8800,transparent:true,opacity:0.4,side:THREE.DoubleSide}));
      shield.position.y = 0;
      effectGroup.add(shield);
    } else {
      // 橙色机关
      for(let i=0;i<3;i++){
        const mechanism = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.5,0.5), new THREE.MeshBasicMaterial({color:0xff8800}));
        mechanism.position.set((Math.random()-0.5)*2, 0.5+i*0.6, (Math.random()-0.5)*2);
        effectGroup.add(mechanism);
      }
    }
  } else if (heroType === '诗人') {
    if (skillIndex === 0) {
      // 紫色诗句流光
      for(let i=0;i<10;i++){
        const word = new THREE.Mesh(new THREE.PlaneGeometry(0.3,0.3), new THREE.MeshBasicMaterial({color:0x9370db,transparent:true,side:THREE.DoubleSide}));
        word.position.set((Math.random()-0.5)*3, Math.random()*2+1, (Math.random()-0.5)*3);
        word.userData = {velY:Math.random()*1+0.5, life:1};
        effectGroup.add(word);
      }
    } else if (skillIndex === 1) {
      // 紫色酒壶
      const pot = new THREE.Mesh(new THREE.SphereGeometry(0.5,16,16), new THREE.MeshBasicMaterial({color:0x9370db,transparent:true,opacity:0.7}));
      pot.position.y = 1;
      effectGroup.add(pot);
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.2,0.4,8), new THREE.MeshBasicMaterial({color:0x9370db}));
      neck.position.y = 1.5;
      effectGroup.add(neck);
    } else if (skillIndex === 2) {
      // 紫色剑气
      for(let i=0;i<5;i++){
        const qi = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,2), new THREE.MeshBasicMaterial({color:0x9370db,transparent:true,opacity:0.7}));
        qi.position.set((Math.random()-0.5)*2, 1+Math.random(), (Math.random()-0.5)*2);
        if(targetPos) qi.lookAt(targetPos);
        effectGroup.add(qi);
      }
    } else {
      // 紫色意境
      const realm = new THREE.Mesh(new THREE.SphereGeometry(2,16,16), new THREE.MeshBasicMaterial({color:0x9370db,transparent:true,opacity:0.2}));
      realm.position.y = 1.5;
      effectGroup.add(realm);
      for(let i=0;i<6;i++){
        const star = new THREE.Mesh(new THREE.SphereGeometry(0.08,4,4), new THREE.MeshBasicMaterial({color:0xffffff}));
        star.position.set((Math.random()-0.5)*4, Math.random()*3+0.5, (Math.random()-0.5)*4);
        effectGroup.add(star);
      }
    }
  }

  scene.add(effectGroup);
  skillEffects.push({group:effectGroup,time:0,duration:duration/1000});
  setTimeout(()=>{scene.remove(effectGroup);skillEffects=skillEffects.filter(se=>se.group!==effectGroup);},duration);
  return effectGroup;
}

function updateSkillEffects(dt){
  for(let i=skillEffects.length-1;i>=0;i--){
    const se = skillEffects[i];
    se.time += dt;
    if(se.time >= se.duration){
      scene.remove(se.group);
      skillEffects.splice(i,1);
      continue;
    }
    // 更新特效动画
    se.group.children.forEach(child=>{
      if(child.userData && child.userData.rotSpeed){
        child.rotation.z += child.userData.rotSpeed * dt;
        child.rotation.x += child.userData.rotSpeed * dt * 0.5;
      }
      if(child.userData && child.userData.velY){
        child.position.y += child.userData.velY * dt;
      }
    });
    if(se.group.userData && se.group.userData.expand){
      const s = 1 + (se.time / se.duration) * se.group.userData.maxScale;
      se.group.scale.set(s,s,s);
    }
  }
}

function spawnSkillEffect(heroType, pos, targetPos){
  // 兼容旧版调用
  const hero = HEROES.find(h => h.type === heroType);
  if(hero){
    createSkillEffect(hero.id, 0, pos, targetPos);
  }
}

// ==================== 输入处理 ====================
function initInput(){
document.addEventListener('keydown',e=>{keys[e.code]=true;
if(gameState==='game'){
if(['Digit1','Digit2','Digit3','Digit4'].includes(e.code))useSkill(e.code);
if(e.code==='Space'){e.preventDefault();if(player&&player.userData.grounded){player.userData.velocity.y=8;player.userData.jumping=true;player.userData.grounded=false;}}
if(e.code==='KeyE'&&player){startRecall();}
if(e.code==='KeyB'){toggleShop();}
if(e.code==='KeyL'){cameraLocked=!cameraLocked;const h=document.getElementById('lockHint');h.textContent=cameraLocked?'视角已锁定':'视角已解锁';h.classList.add('show');setTimeout(()=>h.classList.remove('show'),1500);}
if(e.code==='KeyM'){showBigMap=!showBigMap;document.getElementById('bigMap').style.display=showBigMap?'block':'none';}
if(e.code==='Tab'){e.preventDefault();showScoreboard=!showScoreboard;document.getElementById('scoreboard').style.display=showScoreboard?'block':'none';}
if(e.code==='Escape'){if(shopOpen){closeShop();}else if(showBigMap){showBigMap=false;document.getElementById('bigMap').style.display='none';}else if(showScoreboard){showScoreboard=false;document.getElementById('scoreboard').style.display='none';}else togglePause();}
if(e.code==='KeyH')toggleKeyHints();
}});
document.addEventListener('keyup',e=>{keys[e.code]=false;});
document.addEventListener('mousemove',e=>{mousePos.x=(e.clientX/window.innerWidth)*2-1;mousePos.y=-(e.clientY/window.innerHeight)*2+1;if(isDragging&&!cameraLocked&&gameState==='game'){cameraAngle-=(e.clientX-dragStart.x)*0.003;dragStart.x=e.clientX;dragStart.y=e.clientY;}});
document.addEventListener('mousedown',e=>{if(e.button===2&&gameState==='game'){isDragging=true;dragStart.x=e.clientX;dragStart.y=e.clientY;}if(e.button===0&&gameState==='game'){raycastMoveOrAttack(e);}});
document.addEventListener('mouseup',()=>{isDragging=false;});
document.addEventListener('wheel',e=>{if(gameState==='game')cameraDistance=clamp(cameraDistance+e.deltaY*0.02,5,50);},{passive:true});
document.addEventListener('contextmenu',e=>e.preventDefault());
}

function raycastMoveOrAttack(e){
if(!player || isDead)return;
const rc=new THREE.Raycaster(),ms=new THREE.Vector2((e.clientX/window.innerWidth)*2-1,-(e.clientY/window.innerHeight)*2+1);
rc.setFromCamera(ms,camera);
const hits=rc.intersectObjects(scene.children,true);
let attacked = false;
// 优先检测是否点击了敌人
for(const h of hits){
let obj = h.object;
while(obj.parent && obj.parent !== scene){obj = obj.parent;}
if(obj.userData && (obj.userData.type === 'hero' || obj.userData.type === 'minion') && obj.userData.team === 'enemy'){
// 普通攻击敌人
const distToEnemy = dist(player.position, obj.position);
if(distToEnemy <= 5){
const dmg = Math.max(1, player.userData.atk - (obj.userData.def||0)*0.3);
obj.userData.hp -= dmg;
spawnParticles(obj.position.clone().add(new THREE.Vector3(0,2,0)), 0xff4444, 5, 3);
if(obj.userData.hp <= 0){
if(obj.userData.type === 'minion'){
spawnParticles(obj.position, 0xffd700, 8, 3);
scene.remove(obj);
minions = minions.filter(m => m !== obj);
player.userData.xp += 15;
player.userData.gold += 10;
}else{
killEnemy(obj);
}
}
updateHUD();
attacked = true;
}
break;
}
}
if(!attacked){
for(const h of hits){
if(h.object.geometry && h.object.geometry.type==='PlaneGeometry'){
player.userData.targetPos=h.point;
player.userData.moving=true;
spawnParticles(new THREE.Vector3(h.point.x,0.5,h.point.z),0xd4a843,5,2);
break;
}
}
}
}

// ==================== 回城系统 ====================
function startRecall(){
if(!player || isRecalling || isDead)return;
if(dist2D(player.position.x, player.position.z, -MAP_HALF, -MAP_HALF) < 15){
showHint('已在基地附近');
return;
}
isRecalling = true;
recallTimer = 0;
document.getElementById('recallBarContainer').style.display = 'block';
showHint('开始回城...');
}

function updateRecall(dt){
if(!isRecalling || !player)return;
recallTimer += dt;
const progress = Math.min(recallTimer / 4, 1) * 100;
document.getElementById('recallBarFill').style.width = progress + '%';
// 移动打断回城
if(keys['KeyW'] || keys['KeyA'] || keys['KeyS'] || keys['KeyD'] || keys['ShiftLeft'] || keys['ShiftRight']){
isRecalling = false;
recallTimer = 0;
document.getElementById('recallBarContainer').style.display = 'none';
showHint('回城被打断');
return;
}
if(recallTimer >= 4){
isRecalling = false;
recallTimer = 0;
document.getElementById('recallBarContainer').style.display = 'none';
player.position.set(-MAP_HALF, 0, -MAP_HALF);
player.userData.hp = player.userData.maxHp;
player.userData.mp = player.userData.maxMp;
showHint('已返回基地');
updateHUD();
}
}

// ==================== 商店系统 ====================
function toggleShop(){
if(shopOpen){closeShop();}else{openShop();}
}

function openShop(){
if(!player || gameState !== 'game' || isDead)return;
shopOpen = true;
const panel = document.getElementById('shopPanel');
const container = document.getElementById('shopItemsContainer');
container.innerHTML = '';
document.getElementById('shopGold').textContent = '金币: ' + Math.floor(player.userData.gold);
SHOP_ITEMS.forEach((item, idx) =>{
const div = document.createElement('div');
div.className = 'shopItem';
div.innerHTML = `<span class="shopItemName">${item.name}</span><span class="shopItemStat">${item.desc}</span><span class="shopItemPrice">${item.price}G</span>`;
div.addEventListener('click', () => buyItem(idx));
container.appendChild(div);
});
panel.style.display = 'block';
}

function closeShop(){
shopOpen = false;
document.getElementById('shopPanel').style.display = 'none';
}

function buyItem(idx){
if(!player || isDead)return;
const item = SHOP_ITEMS[idx];
if(!item)return;
if(player.userData.gold < item.price){showHint('金币不足！');return;}
if(player.userData.equip.length >= 6){showHint('装备栏已满！');return;}
player.userData.gold -= item.price;
if(item.type === 'atk')player.userData.atk += item.value;
else if(item.type === 'def')player.userData.def += item.value;
else if(item.type === 'spd')player.userData.spd += item.value;
else if(item.type === 'heal'){player.userData.hp = Math.min(player.userData.maxHp, player.userData.hp + item.value);}
else if(item.type === 'mana'){player.userData.mp = Math.min(player.userData.maxMp, player.userData.mp + item.value);}
player.userData.equip.push(item);
showHint('购买成功: ' + item.name);
document.getElementById('shopGold').textContent = '金币: ' + Math.floor(player.userData.gold);
updateEquipBar();
updateHUD();
playSound('click');
}

document.getElementById('shopCloseBtn').addEventListener('click', closeShop);

// ==================== 装备栏显示 ====================
function updateEquipBar(){
  const bar = document.getElementById('equipBar');
  if(!bar || !player)return;
  const slots = bar.querySelectorAll('.equipSlot');
  slots.forEach((slot, i)=>{
    slot.innerHTML = '';
    slot.style.cssText = 'width:48px;height:48px;background:rgba(0,0,0,0.6);border:1px solid #5a4014;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#d4a843;font-size:14px;font-weight:bold;';
    if(player.userData.equip[i]){
      slot.textContent = player.userData.equip[i].name.charAt(0);
      slot.style.borderColor = '#d4a843';
      slot.title = player.userData.equip[i].name + ' - ' + player.userData.equip[i].desc;
    }
  });
}

// ==================== 技能系统 ====================
function useSkill(code){
  if(!player || isDead)return;
  const si=['Digit1','Digit2','Digit3','Digit4'].indexOf(code);
  if(si===-1)return;
  const sk=player.userData.skills[si];
  if(!sk||sk.cooldown>0){showHint('技能冷却中：'+Math.ceil(sk.cooldown)+'秒');return;}
  if(player.userData.mp<20+si*10){showHint('内力不足！');return;}
  sk.cooldown=sk.maxCd;
  player.userData.mp-=20+si*10;
  showHint(player.userData.hero.name+' 释放 '+sk.name);
  playSound('skill');
  const pos=player.position.clone();
  const heroId = player.userData.hero.id;
  createSkillEffect(heroId, si, pos, null);
  if(si===3){
    spawnParticles(pos,0xffd700,20,8);
    damageEnemiesInRange(pos,15,player.userData.atk*3);
  }else{
    spawnParticles(pos,0x00a8cc,12,5);
    damageEnemiesInRange(pos,8,player.userData.atk*(1+si*0.5));
  }
  updateHUD();
}

function damageEnemiesInRange(pos,range,damage){
// 伤害敌方英雄
enemies.forEach(e=>{if(dist(pos,e.position)<range){const d=Math.max(1,damage-e.userData.def*0.3);e.userData.hp-=d;spawnParticles(e.position.clone().add(new THREE.Vector3(0,2,0)),0xff0000,5,3);if(e.userData.hp<=0)killEnemy(e);}});
// 伤害小兵
minions.forEach(m=>{if(m.userData.team==='enemy'&&dist(pos,m.position)<range){m.userData.hp-=damage;if(m.userData.hp<=0){spawnParticles(m.position,0xffd700,8,3);scene.remove(m);minions=minions.filter(mm=>mm!==m);player.userData.xp+=15;player.userData.gold+=10;}}});
}

function killEnemy(enemy){
spawnParticles(enemy.position,0xffd700,30,6);scene.remove(enemy);enemies=enemies.filter(e=>e!==enemy);
player.userData.xp+=50;player.userData.gold+=100;player.userData.kills++;
if(player.userData.xp>=player.userData.maxXp){player.userData.level++;player.userData.xp=0;player.userData.maxXp*=1.5;player.userData.maxHp+=100;player.userData.hp=player.userData.maxHp;player.userData.maxMp+=50;player.userData.mp=player.userData.maxMp;player.userData.atk+=10;showHint('升级！等级 '+player.userData.level);playSound('levelup');}
addKillFeed(player.userData.hero.name+' 击败了 '+enemy.userData.hero.name);updateHUD();
}

// ==================== 相机 ====================
function updateCamera(dt){if(!player)return;const tp=player.position.clone();if(cameraLocked){const fw=new THREE.Vector3(Math.sin(player.rotation.y),0,Math.cos(player.rotation.y));cameraAngle=Math.atan2(fw.x,fw.z)+Math.PI;}camera.position.lerp(new THREE.Vector3(tp.x+Math.sin(cameraAngle)*cameraDistance,tp.y+cameraHeight,tp.z+Math.cos(cameraAngle)*cameraDistance),5*dt);camera.lookAt(tp.x,tp.y+2,tp.z);}

// ==================== 玩家移动 ====================
function updatePlayer(dt){
  if(!player || isDead)return;
  const d=player.userData;
  const ms=(keys['ShiftLeft']||keys['ShiftRight'])?d.spd*0.833:d.spd*0.5;
  let mx=0,mz=0;
  if(keys['KeyW'])mz-=1;if(keys['KeyS'])mz+=1;if(keys['KeyA'])mx-=1;if(keys['KeyD'])mx+=1;
  if(mx!==0||mz!==0){
    const len=Math.sqrt(mx*mx+mz*mz);
    mx/=len;mz/=len;
    const cy=cameraAngle;
    const rx=mx*Math.cos(cy)+mz*Math.sin(cy);
    const rz=-mx*Math.sin(cy)+mz*Math.cos(cy);
    player.position.x+=rx*ms*dt;
    player.position.z+=rz*ms*dt;
    player.rotation.y=Math.atan2(rx,rz);
    player.position.y=Math.abs(Math.sin(gameTime*10))*0.2;
  }
  if(d.moving&&d.targetPos){
    const dx=d.targetPos.x-player.position.x,dz=d.targetPos.z-player.position.z,dd=Math.sqrt(dx*dx+dz*dz);
    if(dd>0.5){player.position.x+=(dx/dd)*ms*dt;player.position.z+=(dz/dd)*ms*dt;player.rotation.y=Math.atan2(dx,dz);}else d.moving=false;
  }
  if(!d.grounded){
    d.velocity.y-=20*dt;
    player.position.y+=d.velocity.y*dt;
    if(player.position.y<=0){player.position.y=0;d.velocity.y=0;d.grounded=true;d.jumping=false;}
  }
  d.mp=Math.min(d.maxMp,d.mp+5*dt);
  if(d.skills)d.skills.forEach(s=>{if(s.cooldown>0)s.cooldown-=dt;});
  player.children.forEach(c=>{if(c.userData.isHpBar||c.userData.isHpFill)c.lookAt(camera.position);});
  const hpR=d.hp/d.maxHp;
  player.children.forEach(c=>{if(c.userData.isHpFill)c.scale.x=Math.max(0.01,hpR);});
}

// ==================== 复活系统 ====================
function updateRespawn(dt){
  if(!isDead || !player)return;
  respawnTimer -= dt;
  const countdownEl = document.getElementById('respawnCountdown');
  if(countdownEl){
    countdownEl.textContent = '复活倒计时: ' + Math.ceil(respawnTimer) + '秒';
  }
  if(respawnTimer <= 0){
    isDead = false;
    respawnTimer = 0;
    player.userData.hp = player.userData.maxHp;
    player.userData.mp = player.userData.maxMp;
    player.position.set(-MAP_HALF, 0, -MAP_HALF);
    const rc = document.getElementById('respawnCountdown');
    if(rc) rc.style.display = 'none';
    showHint('已复活！');
    updateHUD();
  }
}

function killPlayer(){
  if(isDead)return;
  isDead = true;
  respawnTimer = 5;
  player.userData.deaths++;
  const rc = document.getElementById('respawnCountdown');
  if(rc){
    rc.style.display = 'block';
    rc.textContent = '复活倒计时: 5秒';
  }
  showHint('您已阵亡，5秒后复活');
  playSound('fail');
  updateHUD();
}

// ==================== AI英雄系统 ====================
function updateAI(dt){
  const diff=DIFFICULTY[selectedDifficulty]||DIFFICULTY.normal;
  
  // 更新友方AI
  allies.forEach(ally=>{
    updateSingleAI(ally, dt, diff, 'ally');
  });
  
  // 更新敌方AI
  enemies.forEach(enemy=>{
    updateSingleAI(enemy, dt, diff, 'enemy');
  });
}

function updateSingleAI(unit, dt, diff, team){
  const d=unit.userData;
  d.aiReactionTimer-=dt;
  d.aiSkillTimer-=dt;
  
  const basePos = team==='ally'?{x:-MAP_HALF,z:-MAP_HALF}:{x:MAP_HALF,z:MAP_HALF};
  
  // 低血量回基地
  if(d.hp<d.maxHp*0.25){
    d.aiState='retreat';
    const dx=basePos.x-unit.position.x,dz=basePos.z-unit.position.z,dd=Math.sqrt(dx*dx+dz*dz);
    if(dd>5){unit.position.x+=(dx/dd)*d.spd*0.8*dt;unit.position.z+=(dz/dd)*d.spd*0.8*dt;unit.rotation.y=Math.atan2(dx,dz);}
    else{d.hp=d.maxHp;d.mp=d.maxMp;d.aiState='patrol';d.aiWaypointIdx=0;
      // AI回城后购买装备
      if(d.equip.length < 6 && d.gold >= 300){
        const affordable = SHOP_ITEMS.filter(item => item.price <= d.gold);
        if(affordable.length > 0){
          const item = affordable[Math.floor(Math.random()*affordable.length)];
          d.gold -= item.price;
          if(item.type === 'atk')d.atk += item.value;
          else if(item.type === 'def')d.def += item.value;
          else if(item.type === 'spd')d.spd += item.value;
          d.equip.push(item);
        }
      }
    }
    updateHpBar(unit);
    return;
  }
  
  // 寻找目标
  let target = null;
  let minDist = 9999;
  
  if(team==='enemy' && player && !isDead){
    const pd = dist(unit.position, player.position);
    if(pd < 20){target = player; minDist = pd;}
  }
  
  // 检测小兵
  minions.forEach(m=>{
    if(m.userData.team !== team){
      const md = dist(unit.position, m.position);
      if(md < 15 && md < minDist){target = m; minDist = md;}
    }
  });
  
  // 检测英雄
  const otherHeroes = team==='ally'?enemies:allies;
  otherHeroes.forEach(h=>{
    const hd = dist(unit.position, h.position);
    if(hd < 20 && hd < minDist){target = h; minDist = hd;}
  });
  
  if(target && minDist < 20 && d.aiReactionTimer<=0){
    d.aiReactionTimer=diff.reactionDelay;
    if(minDist > 3){
      // 追击
      d.aiState='chase';
      const dx=target.position.x-unit.position.x,dz=target.position.z-unit.position.z;
      unit.position.x+=(dx/minDist)*d.spd*0.6*dt;
      unit.position.z+=(dz/minDist)*d.spd*0.6*dt;
      unit.rotation.y=Math.atan2(dx,dz);
    }else{
      // 攻击
      d.aiState='fight';
      const targetDef = target.userData.def||0;
      const dmg=Math.max(1,d.atk*diff.atkMult-targetDef*0.3);
      target.userData.hp-=dmg;
      spawnParticles(target.position.clone().add(new THREE.Vector3(0,2,0)),0xff0000,3,2);
      if(target===player && target.userData.hp<=0){killPlayer();}
      else if(target.userData.hp<=0 && target.userData.type==='minion'){
        spawnParticles(target.position,0xffd700,8,3);
        scene.remove(target);
        minions=minions.filter(m=>m!==target);
        d.xp+=15;d.gold+=10;
      }
      else if(target.userData.hp<=0 && target.userData.type==='hero'){
        spawnParticles(target.position,0xffd700,30,6);
        scene.remove(target);
        if(team==='ally'){enemies=enemies.filter(e=>e!==target);}
        else{allies=allies.filter(a=>a!==target);}
        d.kills++;d.xp+=50;d.gold+=100;
      }
    }
    
    // AI使用技能
    if(d.aiSkillTimer<=0 && d.skills && Math.random()<diff.skillChance){
      const skIdx = Math.floor(Math.random()*4);
      const sk=d.skills[skIdx];
      if(sk.cooldown<=0 && d.mp>=20+skIdx*10){
        sk.cooldown=sk.maxCd;
        d.mp-=20+skIdx*10;
        createSkillEffect(d.hero.id, skIdx, unit.position.clone(), target?target.position.clone():null);
        spawnParticles(unit.position,0xff8800,8,4);
        const aoeDmg=Math.max(1,d.atk*diff.atkMult*0.5);
        if(target && dist(unit.position,target.position)<8){
          target.userData.hp-=aoeDmg;
          if(target===player && target.userData.hp<=0)killPlayer();
        }
      }
    }
  }else{
    // 沿路线巡逻
    d.aiState='patrol';
    if(!d.aiLane)d.aiLane=['top','mid','bot'][Math.floor(Math.random()*3)];
    const lane=LANES[d.aiLane];
    if(!d.aiWaypointIdx)d.aiWaypointIdx=0;
    const wp=lane[d.aiWaypointIdx];
    const dx=wp.x-unit.position.x,dz=wp.z-unit.position.z,wd=Math.sqrt(dx*dx+dz*dz);
    if(wd<3){d.aiWaypointIdx=(d.aiWaypointIdx+1)%lane.length;}
    else{unit.position.x+=(dx/wd)*d.spd*0.4*dt;unit.position.z+=(dz/wd)*d.spd*0.4*dt;unit.rotation.y=Math.atan2(dx,dz);}
  }
  updateHpBar(unit);
}

function updateHpBar(unit){
unit.children.forEach(c=>{if(c.userData.isHpBar||c.userData.isHpFill)c.lookAt(camera.position);});
const r=unit.userData.hp/unit.userData.maxHp;
unit.children.forEach(c=>{if(c.userData.isHpFill)c.scale.x=Math.max(0.01,r);});
}

// ==================== 小兵系统 ====================
function spawnMinions(){
['top','mid','bot'].forEach(laneName=>{
// 我方小兵: 2近战 + 2远程 + 2炮车
for(let i=0;i<2;i++){
const m=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.9,0.7),new THREE.MeshStandardMaterial({color:0x4488ff}));
m.position.set(LANES[laneName][0].x+(Math.random()-0.5)*3,0.45,LANES[laneName][0].z+(Math.random()-0.5)*3);
m.userData={type:'minion',team:'ally',lane:laneName,waypointIdx:0,hp:400,atk:25,def:8,spd:3,attackCd:0,minionType:'melee'};
scene.add(m);minions.push(m);
}
for(let i=0;i<2;i++){
const m=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.7,0.5),new THREE.MeshStandardMaterial({color:0x66aaff}));
m.position.set(LANES[laneName][0].x+(Math.random()-0.5)*3,0.35,LANES[laneName][0].z+(Math.random()-0.5)*3);
m.userData={type:'minion',team:'ally',lane:laneName,waypointIdx:0,hp:250,atk:35,def:5,spd:2.5,attackCd:0,minionType:'ranged'};
scene.add(m);minions.push(m);
}
for(let i=0;i<2;i++){
const m=new THREE.Mesh(new THREE.BoxGeometry(0.9,1.0,0.9),new THREE.MeshStandardMaterial({color:0x2266cc}));
m.position.set(LANES[laneName][0].x+(Math.random()-0.5)*3,0.5,LANES[laneName][0].z+(Math.random()-0.5)*3);
m.userData={type:'minion',team:'ally',lane:laneName,waypointIdx:0,hp:600,atk:45,def:12,spd:1.5,attackCd:0,minionType:'siege'};
scene.add(m);minions.push(m);
}
// 敌方小兵: 2近战 + 2远程 + 2炮车
for(let i=0;i<2;i++){
const m=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.9,0.7),new THREE.MeshStandardMaterial({color:0xff4444}));
m.position.set(LANES[laneName][LANES[laneName].length-1].x+(Math.random()-0.5)*3,0.45,LANES[laneName][LANES[laneName].length-1].z+(Math.random()-0.5)*3);
m.userData={type:'minion',team:'enemy',lane:laneName,waypointIdx:LANES[laneName].length-1,hp:400,atk:25,def:8,spd:3,attackCd:0,minionType:'melee'};
scene.add(m);minions.push(m);
}
for(let i=0;i<2;i++){
const m=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.7,0.5),new THREE.MeshStandardMaterial({color:0xff6666}));
m.position.set(LANES[laneName][LANES[laneName].length-1].x+(Math.random()-0.5)*3,0.35,LANES[laneName][LANES[laneName].length-1].z+(Math.random()-0.5)*3);
m.userData={type:'minion',team:'enemy',lane:laneName,waypointIdx:LANES[laneName].length-1,hp:250,atk:35,def:5,spd:2.5,attackCd:0,minionType:'ranged'};
scene.add(m);minions.push(m);
}
for(let i=0;i<2;i++){
const m=new THREE.Mesh(new THREE.BoxGeometry(0.9,1.0,0.9),new THREE.MeshStandardMaterial({color:0xcc2222}));
m.position.set(LANES[laneName][LANES[laneName].length-1].x+(Math.random()-0.5)*3,0.5,LANES[laneName][LANES[laneName].length-1].z+(Math.random()-0.5)*3);
m.userData={type:'minion',team:'enemy',lane:laneName,waypointIdx:LANES[laneName].length-1,hp:600,atk:45,def:12,spd:1.5,attackCd:0,minionType:'siege'};
scene.add(m);minions.push(m);
}
});
}

function updateMinions(dt){
minions.forEach(m=>{
const d=m.userData;
const lane=LANES[d.lane];
const dir=d.team==='ally'?1:-1;
const targetIdx=d.team==='ally'?d.waypointIdx:lane.length-1-d.waypointIdx;
if(targetIdx>=0&&targetIdx<lane.length){
const wp=lane[targetIdx];
const dx=wp.x-m.position.x,dz=wp.z-m.position.z,dd=Math.sqrt(dx*dx+dz*dz);
if(dd>2){m.position.x+=(dx/dd)*d.spd*dt;m.position.z+=(dz/dd)*d.spd*dt;}
else{d.waypointIdx=d.team==='ally'?Math.min(d.waypointIdx+1,lane.length-1):Math.max(d.waypointIdx-1,0);}
}

// 小兵攻击范围内敌人
d.attackCd-=dt;
if(d.attackCd<=0){
// 检测敌方小兵
let target=null;
minions.forEach(other=>{if(other!==m&&other.userData.team!==d.team&&dist(m.position,other.position)<3){if(!target)target=other;}});
// 检测英雄
if(!target&&d.team==='enemy'&&player&&dist(m.position,player.position)<3)target=player;
if(!target&&d.team==='ally'){enemies.forEach(e=>{if(dist(m.position,e.position)<3&&!target)target=e;});}
if(target){
const dmg=Math.max(1,d.atk-(target.userData.def||0)*0.2);
target.userData.hp-=dmg;
d.attackCd=1;
if(target.userData.hp<=0&&target.userData.type==='minion'){spawnParticles(target.position,0xffd700,5,2);scene.remove(target);minions=minions.filter(mm=>mm!==m&&mm!==target);}
}
}
});
}

// ==================== 防御塔AI ====================
function updateTowers(dt){
towers.forEach(t=>{
const d=t.userData;
if(d.hp<=0)return;
d.attackCd-=dt;
if(d.attackCd>0)return;

// 寻找范围内敌人
let target=null;
if(d.team==='ally'){
// 我方塔攻击敌方小兵和英雄
minions.forEach(m=>{if(m.userData.team==='enemy'&&dist2D(m.position.x,m.position.z,t.position.x,t.position.z)<d.range){if(!target)target=m;}});
enemies.forEach(e=>{if(dist2D(e.position.x,e.position.z,t.position.x,t.position.z)<d.range){target=e;}});
}else{
// 敌方塔攻击我方小兵和玩家
minions.forEach(m=>{if(m.userData.team==='ally'&&dist2D(m.position.x,m.position.z,t.position.x,t.position.z)<d.range){if(!target)target=m;}});
if(player&&dist2D(player.position.x,player.position.z,t.position.x,t.position.z)<d.range)target=player;
}

if(target){
const dmg=Math.max(1,d.atk);
target.userData.hp-=dmg;
d.attackCd=1.5;
spawnParticles(target.position.clone().add(new THREE.Vector3(0,2,0)),d.team==='ally'?0xffd700:0xff0000,5,3);
if(target.userData.hp<=0){
if(target.userData.type==='minion'){scene.remove(target);minions=minions.filter(m=>m!==target);}
else if(target===player){killPlayer();}
}
}
});
}

// ==================== 水晶检测 ====================
function updateCrystals(){
crystals.forEach(c=>{
const d=c.userData;
if(d.hp<=0){
if(d.team==='enemy'&&!gameWon){gameWon=true;showHint('胜利！摧毁敌方水晶！');playSound('success');document.getElementById('playerWins').textContent=parseInt(document.getElementById('playerWins').textContent||'0')+1;savePlayerData();}
if(d.team==='ally'&&!gameLost){gameLost=true;showHint('失败！己方水晶被摧毁！');playSound('fail');}
}
});
}

// ==================== 野怪营地 ====================
function updateJungleCamps(dt){
jungleCamps.forEach(c=>{
if(!c.userData.alive){c.userData.respawnTimer-=dt;if(c.userData.respawnTimer<=0){c.userData.alive=true;showHint('野怪营地已刷新！');}}});
}

// ==================== HUD ====================
function updateHUD(){
  if(!player)return;
  const d=player.userData;
  document.getElementById('hpFill').style.width=(d.hp/d.maxHp*100)+'%';
  document.getElementById('hpText').textContent=Math.ceil(d.hp)+'/'+d.maxHp;
  document.getElementById('mpFill').style.width=(d.mp/d.maxMp*100)+'%';
  document.getElementById('mpText').textContent=Math.ceil(d.mp)+'/'+d.maxMp;
  document.getElementById('xpFill').style.width=(d.xp/d.maxXp*100)+'%';
  if(d.skills)d.skills.forEach((sk,i)=>{const k=['1','2','3','4'][i];const el=document.getElementById('cd'+k);if(el){if(sk.cooldown>0){el.style.display='flex';el.textContent=Math.ceil(sk.cooldown);}else el.style.display='none';}});
  // 金币显示
  const goldEl = document.getElementById('playerGold');
  if(goldEl)goldEl.textContent = '金币: ' + Math.floor(d.gold);
}

// ==================== 小地图（增强版） ====================
function updateMinimap(){
const canvas=document.getElementById('minimapCanvas');const ctx=canvas.getContext('2d');
ctx.clearRect(0,0,200,200);
ctx.fillStyle='#0a1a0a';ctx.fillRect(0,0,200,200);
ctx.fillStyle='#1a3a1a';ctx.fillRect(10,10,180,180);
const scale=180/MAP_SIZE,ox=100,oz=100;

// 三路路线
ctx.strokeStyle='rgba(212,168,67,0.5)';ctx.lineWidth=2;
['top','mid','bot'].forEach(ln=>{const lane=LANES[ln];ctx.beginPath();ctx.moveTo(ox+lane[0].x*scale,oz+lane[0].z*scale);for(let i=1;i<lane.length;i++)ctx.lineTo(ox+lane[i].x*scale,oz+lane[i].z*scale);ctx.stroke();});

// 河道
ctx.strokeStyle='rgba(34,102,170,0.5)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(ox-40*scale,oz+40*scale);ctx.lineTo(ox+40*scale,oz-40*scale);ctx.stroke();

// 防御塔
towers.forEach(t=>{if(t.userData.hp>0){ctx.fillStyle=t.userData.team==='ally'?'#d4a843':'#c41e3a';ctx.beginPath();ctx.arc(ox+t.position.x*scale,oz+t.position.z*scale,4,0,Math.PI*2);ctx.fill();}});

// 水晶
crystals.forEach(c=>{if(c.userData.hp>0){ctx.fillStyle=c.userData.team==='ally'?'#ffd700':'#ff0000';ctx.beginPath();ctx.arc(ox+c.position.x*scale,oz+c.position.z*scale,6,0,Math.PI*2);ctx.fill();}});

// 野怪营地
jungleCamps.forEach(c=>{if(c.userData.alive){ctx.fillStyle='#8b4513';ctx.beginPath();ctx.arc(ox+c.position.x*scale,oz+c.position.z*scale,3,0,Math.PI*2);ctx.fill();}});

// 小兵
minions.forEach(m=>{ctx.fillStyle=m.userData.team==='ally'?'#4488ff':'#ff4444';ctx.fillRect(ox+m.position.x*scale-1,oz+m.position.z*scale-1,2,2);});

// 玩家
if(player){ctx.fillStyle='#00ff00';ctx.beginPath();ctx.arc(ox+player.position.x*scale,oz+player.position.z*scale,4,0,Math.PI*2);ctx.fill();}

// 敌方英雄
enemies.forEach(e=>{ctx.fillStyle='#ff0000';ctx.beginPath();ctx.arc(ox+e.position.x*scale,oz+e.position.z*scale,3,0,Math.PI*2);ctx.fill();});
}

// ==================== 击杀播报/提示/暂停 ====================
function addKillFeed(msg){const f=document.getElementById('killFeed'),d=document.createElement('div');d.className='killMsg';d.textContent=msg;f.appendChild(d);setTimeout(()=>d.remove(),3000);}
function showHint(text){const h=document.getElementById('hintText');h.textContent=text;h.style.display='block';if(hintTimer)clearTimeout(hintTimer);hintTimer=setTimeout(()=>{h.style.display='none';},2000);}
function togglePause(){if(gameState==='game'){gameState='pause';document.getElementById('pauseMenu').style.display='flex';}else if(gameState==='pause'){gameState='game';document.getElementById('pauseMenu').style.display='none';}}

// ==================== 游戏主循环 ====================
function gameLoop(){
requestAnimationFrame(gameLoop);
const now=performance.now();const dt=Math.min((now-lastTime)/1000,0.05);lastTime=now;

if(gameState==='game'&&!gameWon&&!gameLost){
gameTime+=dt;
updatePlayer(dt);
updateAI(dt);
updateCamera(dt);
updateParticles(dt);
updateSkillEffects(dt);
updateHUD();
updateMinimap();
updateMinions(dt);
updateTowers(dt);
updateCrystals();
updateJungleCamps(dt);
updateRecall(dt);
updateRespawn(dt);

// 小兵生成
minionSpawnTimer+=dt;
if(minionSpawnTimer>=30){minionSpawnTimer=0;spawnMinions();}

// 生成敌方英雄（根据难度和模式）
const diff=DIFFICULTY[selectedDifficulty]||DIFFICULTY.normal;
const maxEnemies = selectedMode === '5v5' ? diff.enemyCount : 3;
if(enemies.length<maxEnemies&&Math.random()<0.003){
const hero=HEROES[Math.floor(Math.random()*HEROES.length)];
const e=createHero3D(hero,false);
e.position.set(MAP_HALF+(Math.random()-0.5)*20,0,MAP_HALF+(Math.random()-0.5)*20);
e.userData.aiLane=['top','mid','bot'][Math.floor(Math.random()*3)];
e.userData.aiWaypointIdx=0;
scene.add(e);enemies.push(e);
}
}

// 始终渲染
if(renderer&&scene&&camera){renderer.render(scene,camera);}
frameCount++;if(frameCount%60===0)fps=Math.round(1/dt);
}

// ==================== WebSocket 联机 ====================
function initWebSocket(){if(ws){ws.close();ws=null;}try{ws=new WebSocket('wss://echo.websocket.org/');ws.onopen=()=>{document.getElementById('connectionStatus').textContent='已连接';document.getElementById('connectionStatus').style.color='#4a9b5e';addChatMessage('系统','已连接到服务器');playSound('success');if(wsReconnectTimer){clearTimeout(wsReconnectTimer);wsReconnectTimer=null;}};ws.onmessage=e=>{try{const msg=JSON.parse(e.data);if(msg.type==='chat')addChatMessage(msg.name,msg.text);}catch(ex){addChatMessage('系统',e.data);}};ws.onclose=()=>{document.getElementById('connectionStatus').textContent='连接断开';document.getElementById('connectionStatus').style.color='#c41e3a';wsReconnectTimer=setTimeout(initWebSocket,5000);};ws.onerror=()=>{document.getElementById('connectionStatus').textContent='连接错误';};}catch(e){}}
function sendWsMessage(msg){if(ws&&ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(msg));}
function addChatMessage(name,text){const box=document.getElementById('chatBox'),msg=document.createElement('div');msg.className='chatMsg';msg.innerHTML=name==='系统'?`<span class="chatSystem">[${name}] ${text}</span>`:`<span class="chatName">${name}:</span> ${text}`;box.appendChild(msg);box.scrollTop=box.scrollHeight;}

// ==================== 登录逻辑 ====================
document.getElementById('loginBtn').addEventListener('click',()=>{const u=document.getElementById('username').value.trim();if(!u){alert('请输入您的名号！');return;}document.getElementById('playerName').textContent=u;document.getElementById('loginScreen').style.display='none';document.getElementById('mainMenu').style.display='block';gameState='menu';initMenuShowcase();initAudio();playSound('success');saveSettings();});

// ==================== 主菜单逻辑 ====================
document.querySelectorAll('.menuItem').forEach(item=>{item.addEventListener('click',()=>{const a=item.dataset.action;playSound('click');if(a==='play'){document.getElementById('mainMenu').style.display='none';document.getElementById('heroSelect').style.display='block';initHeroSelect();gameState='select';}else if(a==='online'){document.getElementById('mainMenu').style.display='none';document.getElementById('onlineLobby').style.display='flex';document.getElementById('playerNameInput').value=document.getElementById('playerName').textContent;gameState='online';initWebSocket();}else if(a==='hero'){document.getElementById('mainMenu').style.display='none';document.getElementById('heroGallery').style.display='block';initHeroGallery();}else if(a==='settings'){document.getElementById('mainMenu').style.display='none';document.getElementById('settingsPanel').style.display='flex';}else if(a==='help'){document.getElementById('mainMenu').style.display='none';document.getElementById('helpPanel').style.display='block';}else if(a==='exit'){if(confirm('确定要退出游戏吗？'))window.close();}});});
document.querySelectorAll('.menuItem').forEach(item=>{item.addEventListener('mouseenter',()=>playSound('hover'));});

// ==================== 英雄图鉴 ====================
function initHeroGallery(){const grid=document.getElementById('heroGalleryGrid');grid.innerHTML='';HEROES.forEach(hero=>{const card=document.createElement('div');card.style.cssText='background:rgba(60,40,20,0.6);border:1px solid #8b6914;border-radius:8px;padding:15px;text-align:center;cursor:pointer;transition:all 0.3s;';card.onmouseover=()=>{card.style.borderColor='#d4a843';playSound('hover');};card.onmouseout=()=>card.style.borderColor='#8b6914';const c=document.createElement('canvas');c.width=80;c.height=80;drawHeroIcon(c,hero,40);const n=document.createElement('div');n.textContent=hero.name;n.style.cssText='color:#d4a843;font-size:16px;margin:10px 0 5px;font-weight:bold;';const t=document.createElement('div');t.textContent=hero.type;t.style.cssText='color:#8899aa;font-size:12px;';const d=document.createElement('div');d.textContent=hero.desc||'';d.style.cssText='color:#f0e6d2;font-size:12px;margin-top:8px;line-height:1.4;';card.appendChild(c);card.appendChild(n);card.appendChild(t);card.appendChild(d);grid.appendChild(card);});}

function initMenuShowcase(){const c=document.getElementById('showcaseCanvas');let idx=0;function rotate(){if(gameState!=='menu')return;const h=HEROES[idx];drawHeroFull(c,h,300,400);document.getElementById('showcaseName').textContent=h.name;idx=(idx+1)%HEROES.length;setTimeout(rotate,3000);}rotate();}

// ==================== 英雄选择 ====================
function initHeroSelect(){const list=document.getElementById('heroList');list.innerHTML='';HEROES.forEach((hero,idx)=>{const card=document.createElement('div');card.className='heroCard';card.dataset.idx=idx;const icon=document.createElement('canvas');icon.className='heroCardIcon';drawHeroIcon(icon,hero,48);const info=document.createElement('div');info.innerHTML=`<div class="heroCardName">${hero.name}</div><div class="heroCardType">${hero.type}</div>`;card.appendChild(icon);card.appendChild(info);if(idx===0)card.classList.add('selected');card.addEventListener('click',()=>{document.querySelectorAll('.heroCard').forEach(c=>c.classList.remove('selected'));card.classList.add('selected');selectHero(idx);playSound('click');});card.addEventListener('mouseenter',()=>playSound('hover'));list.appendChild(card);});selectHero(0);}

function selectHero(idx){selectedHero=HEROES[idx];const c=document.getElementById('heroDisplayCanvas');drawHeroFull(c,selectedHero,350,450);document.getElementById('heroStats').innerHTML=`<div class="statRow"><span class="statName">生命</span><div class="statBar"><div class="statFill" style="width:${selectedHero.hp/15}%;background:#c41e3a"></div></div><span class="statValue">${selectedHero.hp}</span></div><div class="statRow"><span class="statName">内力</span><div class="statBar"><div class="statFill" style="width:${selectedHero.mp/6}%;background:#00a8cc"></div></div><span class="statValue">${selectedHero.mp}</span></div><div class="statRow"><span class="statName">攻击</span><div class="statBar"><div class="statFill" style="width:${selectedHero.atk}%;background:#d4a843"></div></div><span class="statValue">${selectedHero.atk}</span></div><div class="statRow"><span class="statName">防御</span><div class="statBar"><div class="statFill" style="width:${selectedHero.def}%;background:#4a9b5e"></div></div><span class="statValue">${selectedHero.def}</span></div><div class="statRow"><span class="statName">速度</span><div class="statBar"><div class="statFill" style="width:${selectedHero.spd}%;background:#8b6914"></div></div><span class="statValue">${selectedHero.spd}</span></div>`;const sp=document.getElementById('skillPanel');sp.innerHTML='<h3 style="color:#d4a843;text-align:center;font-family:SimSun;margin-bottom:20px;">技能介绍</h3>';selectedHero.skills.forEach((sk,i)=>{const k=['1','2','3','4'][i];const sc=document.createElement('div');sc.className='skillScroll';sc.innerHTML=`<h4>[${k}] ${sk}</h4><p>对敌人造成伤害或提供辅助效果。</p>`;sp.appendChild(sc);});selectedHero.skills.forEach((sk,i)=>{const k=['1','2','3','4'][i];const cv=document.getElementById('skill'+k);if(cv)drawSkillIcon(cv,sk);});}

// ==================== 地图选择 ====================
function initMapCards(){const container=document.getElementById('mapCardsContainer');container.innerHTML='';MAPS.forEach((map,idx)=>{const card=document.createElement('div');card.className='mapCard';card.dataset.map=idx;const preview=document.createElement('div');preview.className='mapCardPreview';const cv=document.createElement('canvas');cv.id='mapPreview'+idx;preview.appendChild(cv);const name=document.createElement('div');name.className='mapCardName';name.textContent=map.name;const desc=document.createElement('div');desc.className='mapCardDesc';desc.textContent=map.desc;const tag=document.createElement('span');tag.className='mapCardTag';tag.textContent=['经典','迷雾','极寒','烈焰','攻城'][idx];card.appendChild(preview);card.appendChild(name);card.appendChild(desc);card.appendChild(tag);card.addEventListener('click',()=>{document.querySelectorAll('.mapCard').forEach(c=>c.classList.remove('selected'));card.classList.add('selected');selectedMap=idx;document.getElementById('confirmMap').disabled=false;playSound('click');});card.addEventListener('mouseenter',()=>playSound('hover'));container.appendChild(card);});}

document.getElementById('confirmSelect').addEventListener('click',()=>{if(!selectedHero)return;playSound('click');document.getElementById('heroSelect').style.display='none';document.getElementById('mapSelect').style.display='flex';gameState='mapSelect';initMapCards();setTimeout(()=>{MAPS.forEach((m,i)=>drawMapPreview('mapPreview'+i,i));},50);});

// 难度选择
document.querySelectorAll('.diffBtn').forEach(btn=>{btn.addEventListener('click',()=>{
document.querySelectorAll('.diffBtn').forEach(b=>b.classList.remove('selected'));
btn.classList.add('selected');
selectedDifficulty=btn.dataset.diff;
playSound('click');
});});

// 模式选择
document.querySelectorAll('.modeBtn').forEach(btn=>{btn.addEventListener('click',()=>{
document.querySelectorAll('.modeBtn').forEach(b=>b.classList.remove('selected'));
btn.classList.add('selected');
selectedMode=btn.dataset.mode;
playSound('click');
});});

document.getElementById('confirmMap').addEventListener('click',()=>{if(selectedMap===null)return;currentMap=selectedMap;playSound('click');showLoading('正在加载 '+MAPS[currentMap].name+'...',()=>{document.getElementById('mapSelect').style.display='none';document.getElementById('gameHUD').style.display='block';startGame();});});

// ==================== 开始游戏 ====================
function startGame(){
gameState='game';gameWon=false;gameLost=false;
enemies=[];allies=[];minions=[];towers=[];crystals=[];jungleCamps=[];minionSpawnTimer=0;gameTime=0;
initThree();
player=createHero3D(selectedHero,true);player.position.set(-MAP_HALF,0,-MAP_HALF);scene.add(player);
const diff=DIFFICULTY[selectedDifficulty]||DIFFICULTY.normal;
const allyCount = selectedMode === '5v5' ? 4 : 2;
const enemyCount = selectedMode === '5v5' ? 4 : 2;
for(let i=0;i<allyCount;i++){const hero=HEROES[Math.floor(Math.random()*HEROES.length)];const ally=createHero3D(hero,false);ally.position.set(-MAP_HALF+(i+1)*10,0,-MAP_HALF);scene.add(ally);allies.push(ally);}
for(let i=0;i<enemyCount;i++){const hero=HEROES[Math.floor(Math.random()*HEROES.length)];const e=createHero3D(hero,false);e.position.set(MAP_HALF+(Math.random()-0.5)*20,0,MAP_HALF+(Math.random()-0.5)*20);e.userData.aiLane=['top','mid','bot'][i%3];e.userData.aiWaypointIdx=0;scene.add(e);enemies.push(e);}
spawnMinions();updateHUD();updateEquipBar();
setTimeout(()=>{startTutorial();},1000);
}

// ==================== 暂停菜单 ====================
document.getElementById('resumeBtn').addEventListener('click',()=>{playSound('click');togglePause();});
document.getElementById('settingsBtn2').addEventListener('click',()=>{playSound('click');document.getElementById('pauseMenu').style.display='none';document.getElementById('settingsPanel').style.display='flex';});
document.getElementById('quitBtn').addEventListener('click',()=>{playSound('click');if(confirm('确定要退出本局吗？'))location.reload();});

// ==================== 联机大厅 ====================
document.getElementById('lobbyBack').addEventListener('click',()=>{document.getElementById('onlineLobby').style.display='none';document.getElementById('mainMenu').style.display='block';if(ws){ws.close();ws=null;}gameState='menu';});
document.getElementById('createRoomBtn').addEventListener('click',()=>{const n=document.getElementById('roomNameInput').value.trim()||'未命名房间';const p=document.getElementById('playerNameInput').value.trim()||document.getElementById('playerName').textContent;sendWsMessage({type:'createRoom',roomName:n,playerName:p});playSound('click');});
document.getElementById('joinRoomBtn').addEventListener('click',()=>{const s=document.querySelector('.roomListItem.selected');if(!s){alert('请先选择一个房间');return;}sendWsMessage({type:'joinRoom',roomId:s.dataset.roomId,playerName:document.getElementById('playerNameInput').value.trim()||document.getElementById('playerName').textContent});playSound('click');});
document.getElementById('readyBtn').addEventListener('click',()=>{isReady=!isReady;sendWsMessage({type:'ready',roomId,ready:isReady});playSound('click');});
document.getElementById('startGameBtn').addEventListener('click',()=>{sendWsMessage({type:'startGame',roomId});playSound('click');});
document.getElementById('chatSend').addEventListener('click',sendChat);
document.getElementById('chatInput').addEventListener('keypress',e=>{if(e.key==='Enter')sendChat();});
function sendChat(){const input=document.getElementById('chatInput');const text=input.value.trim();if(!text)return;sendWsMessage({type:'chat',roomId,name:document.getElementById('playerNameInput').value.trim()||document.getElementById('playerName').textContent,text});input.value='';}

// ==================== 窗口调整 ====================
window.addEventListener('resize',()=>{if(camera&&renderer){camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);}});

// ==================== 设置保存 ====================
['sfxVolume','bgmVolume','sensitivity'].forEach(id=>{document.getElementById(id).addEventListener('change',saveSettings);});
document.getElementById('qualitySetting').addEventListener('change',saveSettings);
document.getElementById('showKeyHints').addEventListener('change',saveSettings);
document.getElementById('showMinimap').addEventListener('change',saveSettings);

// ==================== 初始化 ====================
document.getElementById('settingsPanel').style.display='none';
document.getElementById('helpPanel').style.display='none';
document.getElementById('heroGallery').style.display='none';
document.getElementById('heroSelect').style.display='none';
document.getElementById('mainMenu').style.display='none';
document.getElementById('gameHUD').style.display='none';
document.getElementById('pauseMenu').style.display='none';
document.getElementById('scoreboard').style.display='none';
document.getElementById('bigMap').style.display='none';
document.getElementById('mapSelect').style.display='none';
document.getElementById('onlineLobby').style.display='none';
document.getElementById('loadingScreen').style.display='none';
document.getElementById('loginScreen').style.display='flex';

loadSettings();loadPlayerData();initLoginBg();initInput();gameLoop();