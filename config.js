/* All game balancing lives here. No persistent storage is used. */
globalThis.ORGAN_CONFIG = {
  width:480,height:720,floor:704,wall:12,dangerY:142,
  gravity:2400,restitution:.32,wallRestitution:.36,friction:.42,
  step:1/180,iterations:7,dropCooldown:.36,dangerSeconds:1.5,restSpeed:140,
  weights:[25,26,24,17,8],
  rewards:[{min:0,name:'见习解剖员'},{min:120,name:'人体探索者'},{min:400,name:'器官合成专家'},{min:900,name:'人体构造大师'}],
  organs:[
    {name:'阑尾',radius:40,color:'#e9a18c',points:1},
    {name:'胆囊',radius:43,color:'#b4d88a',points:3},
    {name:'甲状腺',radius:49,color:'#e2a2c7',points:6},
    {name:'脾脏',radius:57,color:'#bb8cbd',points:10},
    {name:'胰腺',radius:75,color:'#f2cb79',points:15},
    {name:'肾脏',radius:82,color:'#df888a',points:21},
    {name:'胃',radius:95,color:'#efac9c',points:28},
    {name:'肺',radius:103,color:'#e6aaa9',points:36},
    {name:'心脏',radius:112,color:'#df7e85',points:45},
    {name:'肝脏',radius:124,color:'#c78183',points:55},
    {name:'大脑',radius:135,color:'#deb3cd',points:500}
  ]
};
