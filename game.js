const $ = id => document.getElementById(id);
const screens=["startScreen","assumptionsScreen","gameScreen","operationsScreen","boardroomScreen","endScreen"];
let state={};

const MODEL={
  budget:250000,sellPrice:245,expectedDemand:1000,benchmark:84,
  global:{cost:42,capacity:900,reliability:.88,emission:1.00},
  regional:{cost:49,capacity:700,reliability:.97,emission:.45},
  regularConversion:55,overtimeConversion:78,baseCapacity:1000,maxOvertime:300,
  standard:{cost:9,reliability:.92,emission:.55},
  expedited:{cost:24,reliability:.99,emission:1.25},
  holdingCost:12
};


const PHOTO = {
  port:"Shipping_containers_in_a_port_(Unsplash).jpg",
  warehouse:"Warehouse_goods.jpg",
  warehousePeople:"Someone_in_the_goods_warehouse.jpg",
  dock:"Warehouse_in_New_Jersey_where_trucks_deliver_granite_slabs.jpg",
  factory:"Assembly_line_at_Orbbec's_Intelligent_Manufacturing_Base.png",
  truck:"Delivery_truck_at_sunrise_(Unsplash).jpg",
  road:"The_Road_(Unsplash).jpg",
  hospital:"Santa_Cabrini_Hospital_Exterior.jpg",
  medical:"Image_of_hospital_equipment.jpg",
  meeting:"Plenary_and_Interactive_session_-_Engagement_&_WLUG_Business_meeting.jpg",
  warehouse2:"Warehouse_(Unsplash).jpg"
};
function photoUrl(name,width=1100){
  return "https://commons.wikimedia.org/wiki/Special:Redirect/file/"+encodeURIComponent(name)+"?width="+width;
}
const ROUND_VISUALS = {
  PLAN:[
    [PHOTO.warehouse,"Inventory is the physical consequence of a forecast"],
    [PHOTO.warehousePeople,"Planning decisions guide real warehouse work"],
    [PHOTO.medical,"Demand ultimately begins with the customer"]
  ],
  SOURCE:[
    [PHOTO.port,"Global sourcing moves through real ports and terminals"],
    [PHOTO.dock,"Regional sourcing shortens the physical lane"],
    [PHOTO.warehouse2,"Inbound material must arrive before production can start"]
  ],
  MAKE:[
    [PHOTO.factory,"Capacity decisions become real production constraints"],
    [PHOTO.warehouse,"Finished goods require physical storage"],
    [PHOTO.medical,"Every completed unit exists to serve the customer"]
  ],
  DELIVER:[
    [PHOTO.truck,"Transportation turns inventory into customer service"],
    [PHOTO.road,"Road conditions can change a delivery plan quickly"],
    [PHOTO.dock,"Loading and handling are part of the delivery process"]
  ],
  ADAPT:[
    [PHOTO.road,"Disruptions change the best plan after decisions are locked"],
    [PHOTO.port,"Inbound disruptions can reduce available supply"],
    [PHOTO.truck,"Emergency logistics can protect service at a premium"]
  ]
};
const EVENT_PHOTO = {
  discount:PHOTO.port,
  analytics:PHOTO.warehousePeople,
  green:PHOTO.truck,
  quality:PHOTO.factory
};

const careers={
  planning:{icon:"📊",title:"Supply Chain Planner",text:"You emphasize demand, buffers, and balancing uncertainty before execution.",tags:["Forecasting","Inventory","Analytics"]},
  sourcing:{icon:"🤝",title:"Strategic Sourcing Manager",text:"You emphasize supplier economics, capacity, reliability, and diversification.",tags:["Suppliers","Cost","Risk"]},
  operations:{icon:"🏭",title:"Operations Manager",text:"You emphasize throughput, production capacity, overtime, and resource utilization.",tags:["Production","Capacity","Process"]},
  logistics:{icon:"🚚",title:"Logistics Manager",text:"You emphasize transportation mix, delivery reliability, speed, and landed cost.",tags:["Transportation","Service","Execution"]},
  resilience:{icon:"🛡️",title:"Resilience Strategist",text:"You emphasize protecting flow when demand, suppliers, or transportation conditions change.",tags:["Continuity","Risk","Response"]},
  balanced:{icon:"⚖️",title:"End-to-End Supply Chain Manager",text:"Your decisions balance customer service, cost, resilience, and sustainability across the whole network.",tags:["Systems Thinking","Tradeoffs","Leadership"]}
};

const miniEvents=[
  {id:"discount",after:1,title:"Supplier Flash Offer",text:"The global supplier offers an 8% discount on its current order if you pay a $1,500 reservation fee now.",accept:"Take the deal",decline:"Pass",apply:()=>{const s=state.decisions.source;if(!s)return;const savings=s.global*MODEL.global.cost*.08-1500;if(savings>0){state.eventEffects.procurementCredit=(state.eventEffects.procurementCredit||0)+savings;state.eventNotes.push(`Accepted supplier flash offer; net savings ${money(savings)}.`);state.career.sourcing++}else{state.eventNotes.push("Accepted supplier flash offer, but order volume was too small to create net savings.")}}},
  {id:"analytics",after:0,title:"Buy Better Demand Intelligence?",text:"A data provider offers an upgraded market signal for $2,500. It will narrow demand uncertainty before operations begin.",accept:"Buy insight",decline:"Use current forecast",apply:()=>{if(state.budgetRemaining>=2500){spend(2500);state.eventEffects.demandInsight=true;state.eventNotes.push("Purchased enhanced demand intelligence for $2,500.");state.career.planning++}}},
  {id:"green",after:3,title:"Hospital Sustainability Request",text:"The hospital asks whether you can reduce premium freight. Meeting the request may improve sustainability, but could reduce delivery protection.",accept:"Commit greener plan",decline:"Keep current freight plan",apply:()=>{state.eventEffects.greenCommitment=true;state.eventNotes.push("Accepted the hospital sustainability request.");state.sustainability=clamp(state.sustainability+6);state.resilience=clamp(state.resilience-2)}},
  {id:"quality",after:1,title:"Optional Incoming Inspection",text:"For $1,800 you can add accelerated incoming inspection. It reduces the chance that bad components enter production.",accept:"Add inspection",decline:"Skip inspection",apply:()=>{if(state.budgetRemaining>=1800){spend(1800);state.eventEffects.inspection=true;state.eventNotes.push("Added accelerated incoming inspection for $1,800.");state.resilience=clamp(state.resilience+4)}}}
];

function clamp(v){return Math.max(0,Math.min(100,v))}
function money(v){return "$"+Math.round(v).toLocaleString()}
function score(){return Math.round(state.service*.34+state.profitScore*.28+state.resilience*.23+state.sustainability*.15)}

function resetState(){
  let demand=Math.round(920+Math.random()*260);
  const r=Math.random();
  let disruption;
  if(r<.34) disruption={type:"supplier",title:"Global Supplier Port Delay",detail:"A port delay reduces the global supplier's on-time availability by 30%.",emergencyUnitCost:16};
  else if(r<.67) disruption={type:"transport",title:"Highway Capacity Loss",detail:"A highway closure cuts standard truck reliability and capacity.",emergencyUnitCost:18};
  else disruption={type:"demand",title:"Hospital Demand Surge",detail:"The hospital expands the rollout by another 12% after your freight plan is set.",emergencyUnitCost:22};

  const eventCount=Math.random()<.55?1:(Math.random()<.3?2:0);
  const shuffled=[...miniEvents].sort(()=>Math.random()-.5).slice(0,eventCount);

  state={
    round:0,seconds:600,timerId:null,sound:true,
    service:70,profitScore:70,resilience:50,sustainability:50,
    budgetRemaining:MODEL.budget,spent:0,actualDemand:demand,disruption,
    decisions:{},career:{planning:0,sourcing:0,operations:0,logistics:0,resilience:0},
    result:null,eventQueue:shuffled,eventEffects:{},eventNotes:[],qualityErrors:0,perfect:{time:false,full:false,error:false,budget:false}
  };
}
resetState();

function showScreen(id){screens.forEach(s=>$(s).classList.toggle("active",s===id));window.scrollTo({top:0,behavior:"smooth"})}
function sound(freq=520,d=.06){if(!state.sound)return;try{const c=new(window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.frequency.value=freq;o.connect(g);g.connect(c.destination);g.gain.value=.035;o.start();g.gain.exponentialRampToValueAtTime(.001,c.currentTime+d);o.stop(c.currentTime+d)}catch(e){}}
function spend(amount){state.spent+=amount;state.budgetRemaining=Math.max(0,MODEL.budget-state.spent);updateDashboard()}
function applyQual(delta){state.service=clamp(state.service+(delta.service||0));state.profitScore=clamp(state.profitScore+(delta.profit||0));state.resilience=clamp(state.resilience+(delta.resilience||0));state.sustainability=clamp(state.sustainability+(delta.sustainability||0));updateDashboard()}

function updateDashboard(){
  $("budgetKpi").textContent=money(state.budgetRemaining);$("budgetBar").style.width=clamp(state.budgetRemaining/MODEL.budget*100)+"%";
  $("serviceKpi").textContent=Math.round(state.service);$("serviceBar").style.width=clamp(state.service)+"%";
  $("profitKpi").textContent=Math.round(state.profitScore);$("profitBar").style.width=clamp(state.profitScore)+"%";
  $("resilienceKpi").textContent=Math.round(state.resilience);$("resilienceBar").style.width=clamp(state.resilience)+"%";
  $("sustainabilityKpi").textContent=Math.round(state.sustainability);$("sustainabilityBar").style.width=clamp(state.sustainability)+"%";
  $("scoreKpi").textContent=score();$("statusDot").style.background=score()>=80?"#39b86a":score()>=65?"#FFC72C":"#b42318";
  updatePerfectMini();
}
function updatePerfectMini(){
  const map=[["poTime","time"],["poFull","full"],["poError","error"],["poBudget","budget"]];
  map.forEach(([id,k])=>{const el=$(id);if(!el)return;el.classList.remove("pass","fail");const known=state.result!==null;if(known){el.classList.add(state.perfect[k]?"pass":"fail");el.querySelector("span").textContent=state.perfect[k]?"✓":"✕"}else el.querySelector("span").textContent="○"})
}
function startTimer(){clearInterval(state.timerId);state.timerId=setInterval(()=>{state.seconds--;const m=Math.floor(state.seconds/60),s=state.seconds%60;$("timer").textContent=`${m}:${String(s).padStart(2,"0")}`;document.querySelector(".timer").classList.toggle("urgent",state.seconds<=60);if(state.seconds<=0){clearInterval(state.timerId);showScreen("startScreen")}},1000)}

function startGame(){
  const snd=state.sound;resetState();state.sound=snd;
  if(localStorage.getItem("bucsupplyBest")){const best=+localStorage.getItem("bucsupplyBest");$("previousScoreCard").classList.remove("hidden");$("previousScoreCard").innerHTML=`Your best score on this device: <strong>${best}</strong> • Benchmark: <strong>${MODEL.benchmark}</strong>`}
  updateDashboard();showScreen("gameScreen");startTimer();renderRound();sound(720,.1)
}

const roundData=[
  {stage:"PLAN",title:"Set the demand forecast",photo:PHOTO.warehouse,tip:"A forecast is a planning assumption, not a promise. Everything downstream reacts to it."},
  {stage:"SOURCE",title:"Buy sensor modules",photo:PHOTO.port,tip:"Purchasing quantity, reliability, price, and supplier concentration all affect the physical outcome."},
  {stage:"MAKE",title:"Configure production",photo:PHOTO.factory,tip:"Capacity and inventory are both buffers. They protect flow, but they consume cash."},
  {stage:"DELIVER",title:"Allocate transportation",photo:PHOTO.truck,tip:"Transportation changes cost, reliability, emissions, and customer service at the same time."},
  {stage:"ADAPT",title:"Manage the disruption",photo:PHOTO.road,tip:"The best response is not always the biggest response. Emergency protection also has a cost."}
];

function stageNode(round){const m=[0,0,1,2,3];["node1","node2","node3","node4"].forEach((n,i)=>{$(n).classList.toggle("complete",i<m[round]);$(n).classList.toggle("active-node",i===m[round])})}
function renderRound(){
  const r=roundData[state.round];
  $("roundLabel").textContent=`DECISION ${state.round+1} OF 5`;$("roundTitle").textContent=r.title;$("roundChip").textContent=r.stage;
  const visuals=ROUND_VISUALS[r.stage];
  $("sceneImage").src=photoUrl(r.photo,1200);$("sceneImage").alt=visuals[0][1];$("scenePhotoLabel").textContent="REAL PHOTO • "+r.stage;
  $("photoRail").innerHTML=visuals.slice(1).map(v=>`<figure><img src="${photoUrl(v[0],900)}" alt="${v[1]}" loading="lazy" referrerpolicy="no-referrer"><figcaption>${v[1]}</figcaption></figure>`).join("");
  $("tipText").textContent=r.tip;$("progressBar").style.width=((state.round+1)*20)+"%";
  $("feedback").className="feedback";$("feedback").innerHTML="";$("scoreChange").textContent="";$("nextBtn").classList.add("hidden");$("newsTicker").classList.add("hidden");$("miniEvent").classList.add("hidden");$("miniEvent").classList.remove("with-photo");stageNode(state.round);
  if(state.round===0)renderPlan();if(state.round===1)renderSource();if(state.round===2)renderMake();if(state.round===3)renderDeliver();if(state.round===4)renderAdapt();
}
function lockUI(){document.querySelectorAll("#decisionArea input,#decisionArea button").forEach(x=>x.disabled=true);$("nextBtn").classList.remove("hidden")}
function feedback(title,text){$("feedback").className="feedback show good";$("feedback").innerHTML=`<strong>${title}</strong>${text}`}

function maybeMiniEvent(afterRound){
  const idx=state.eventQueue.findIndex(e=>e.after===afterRound);
  if(idx<0)return false;
  const ev=state.eventQueue.splice(idx,1)[0];
  const box=$("miniEvent");box.classList.add("with-photo");
  box.innerHTML=`<img class="mini-event-photo" src="${photoUrl(EVENT_PHOTO[ev.id]||PHOTO.warehouse,800)}" alt="${ev.title}" referrerpolicy="no-referrer"><div><h3>⚡ MINI EVENT: ${ev.title}</h3><p>${ev.text}</p><div class="event-actions"><button class="event-accept">${ev.accept}</button><button class="event-decline">${ev.decline}</button></div></div>`;box.classList.remove("hidden");
  box.querySelector(".event-accept").onclick=()=>{ev.apply();box.innerHTML=`<h3>Decision recorded</h3><p>${state.eventNotes[state.eventNotes.length-1]||"You accepted the opportunity."}</p>`;updateDashboard();sound(780,.1)};
  box.querySelector(".event-decline").onclick=()=>{state.eventNotes.push(`Declined mini-event: ${ev.title}.`);box.innerHTML=`<h3>Decision recorded</h3><p>You declined: ${ev.title}.</p>`;sound(360,.06)};
  return true;
}

function renderPlan(){
  $("sceneText").innerHTML=`<h3>Expected demand is 1,000 kits.</h3><p>Actual hospital demand is hidden. Your forecast determines how much the rest of the chain prepares for.</p>`;
  $("decisionArea").innerHTML=`<div class="sim-control"><h3>Demand forecast</h3><p>Choose the planning quantity for the launch.</p><div class="unit-entry"><input id="forecast" type="range" min="850" max="1250" step="10" value="1000"><div class="unit-box"><strong id="forecastVal">1,000</strong><small>KITS</small></div></div><div class="range-scale"><span>850</span><span>1,000 expected</span><span>1,250</span></div><div class="cost-preview"><div><span>Expected revenue</span><b id="revPrev"></b></div><div><span>Forecast risk</span><b id="riskPrev"></b></div><div><span>Planned volume</span><b id="volPrev"></b></div><div><span>Budget used</span><b>$0</b></div></div><button id="lockDecision" class="lock-btn">Lock Forecast</button></div>`;
  const f=$("forecast");const upd=()=>{const q=+f.value;$("forecastVal").textContent=q.toLocaleString();$("revPrev").textContent=money(q*MODEL.sellPrice);$("riskPrev").textContent=Math.abs(q-1000)<=50?"Low":Math.abs(q-1000)<=120?"Moderate":"High";$("volPrev").textContent=q.toLocaleString()};f.oninput=upd;upd();
  $("lockDecision").onclick=()=>{const q=+f.value;state.decisions.plan={forecast:q};state.career.planning++;const dev=Math.abs(q-1000)/200;applyQual({service:5-5*dev,profit:4-4*dev,resilience:3-2*dev,sustainability:2-3*Math.max(0,(q-1000)/250)});feedback("Forecast locked",`Planning quantity: <strong>${q.toLocaleString()} kits</strong>.`);lockUI();maybeMiniEvent(0)}
}

function renderSource(){
  const forecast=state.decisions.plan.forecast;$("sceneText").innerHTML=`<h3>Buy the sensor modules needed for your plan.</h3><p>Buy from either or both suppliers. You may intentionally create a component buffer.</p>`;
  $("decisionArea").innerHTML=`<div class="input-grid"><div class="sim-control"><h3>Global supplier</h3><p>$42/unit • max 900 • reliability 88%</p><div class="unit-entry"><input id="gUnits" type="range" min="0" max="900" step="10" value="${Math.min(600,forecast)}"><div class="unit-box"><strong id="gVal"></strong><small>UNITS</small></div></div></div><div class="sim-control"><h3>Regional supplier</h3><p>$49/unit • max 700 • reliability 97%</p><div class="unit-entry"><input id="rUnits" type="range" min="0" max="700" step="10" value="${Math.max(0,forecast-Math.min(600,forecast))}"><div class="unit-box"><strong id="rVal"></strong><small>UNITS</small></div></div></div></div><div class="cost-preview"><div><span>Total purchased</span><b id="purchaseQty"></b></div><div><span>Purchase cost</span><b id="purchaseCost"></b></div><div><span>Forecast coverage</span><b id="coverage"></b></div><div><span>Supplier balance</span><b id="balance"></b></div></div><div class="constraint-box"><span>Constraint check</span><strong id="sourceConstraint"></strong></div><button id="lockDecision" class="lock-btn">Place Purchase Orders</button>`;
  const g=$("gUnits"),r=$("rUnits"),btn=$("lockDecision");const upd=()=>{const gu=+g.value,ru=+r.value,total=gu+ru,cost=gu*42+ru*49;$("gVal").textContent=gu.toLocaleString();$("rVal").textContent=ru.toLocaleString();$("purchaseQty").textContent=total.toLocaleString();$("purchaseCost").textContent=money(cost);$("coverage").textContent=Math.round(total/forecast*100)+"%";$("balance").textContent=(gu===0||ru===0)?"Single source":Math.abs(gu-ru)<=200?"Balanced":"Concentrated";const valid=total>=Math.round(forecast*.85)&&cost<=state.budgetRemaining;$("sourceConstraint").textContent=valid?"Ready to order":"Need ≥85% forecast coverage and sufficient cash";$("sourceConstraint").className=valid?"good":"bad";btn.disabled=!valid};g.oninput=upd;r.oninput=upd;upd();
  btn.onclick=()=>{const gu=+g.value,ru=+r.value,cost=gu*42+ru*49;state.decisions.source={global:gu,regional:ru,cost};spend(cost);state.career.sourcing++;const total=gu+ru,div=(gu>0&&ru>0)?1:0;applyQual({service:(ru/Math.max(1,total))*5,profit:6-(cost/(Math.max(1,total))-42)*.8,resilience:div?8:-6,sustainability:(ru/Math.max(1,total))*5-(gu/Math.max(1,total))*2});feedback("Purchase orders placed",`You bought <strong>${total.toLocaleString()} modules</strong> for <strong>${money(cost)}</strong>.`);lockUI();maybeMiniEvent(1)}
}

function renderMake(){
  const forecast=state.decisions.plan.forecast;$("sceneText").innerHTML=`<h3>Decide how many kits to schedule.</h3><p>Your factory can produce 1,000 kits at regular cost. Overtime can add up to 300 more units.</p>`;
  $("decisionArea").innerHTML=`<div class="input-grid"><div class="sim-control"><h3>Finished-goods safety stock</h3><p>Extra kits planned above forecast.</p><div class="unit-entry"><input id="safetyUnits" type="range" min="0" max="200" step="10" value="50"><div class="unit-box"><strong id="safetyVal"></strong><small>KITS</small></div></div></div><div class="sim-control"><h3>Overtime capacity authorized</h3><p>Maximum overtime units the factory may produce.</p><div class="unit-entry"><input id="otUnits" type="range" min="0" max="300" step="10" value="100"><div class="unit-box"><strong id="otVal"></strong><small>UNITS</small></div></div></div></div><div class="cost-preview"><div><span>Production target</span><b id="prodTarget"></b></div><div><span>Regular units</span><b id="regUnits"></b></div><div><span>Overtime units</span><b id="otPlan"></b></div><div><span>Projected conversion cost</span><b id="convCost"></b></div></div><div class="constraint-box"><span>Cash after projected production</span><strong id="makeConstraint"></strong></div><button id="lockDecision" class="lock-btn">Authorize Production Plan</button>`;
  const s=$("safetyUnits"),o=$("otUnits"),btn=$("lockDecision");const upd=()=>{const su=+s.value,ou=+o.value,target=Math.min(1300,forecast+su),regular=Math.min(target,1000),need=Math.max(0,target-1000),plannedOT=Math.min(need,ou),actual=regular+plannedOT,cost=regular*55+plannedOT*78;$("safetyVal").textContent=su;$("otVal").textContent=ou;$("prodTarget").textContent=actual.toLocaleString();$("regUnits").textContent=regular.toLocaleString();$("otPlan").textContent=plannedOT.toLocaleString();$("convCost").textContent=money(cost);const cash=state.budgetRemaining-cost;$("makeConstraint").textContent=cash>=0?money(cash)+" remaining":"Over budget";$("makeConstraint").className=cash>=0?"good":"bad";btn.disabled=cash<0};s.oninput=upd;o.oninput=upd;upd();
  btn.onclick=()=>{const su=+s.value,ou=+o.value,target=Math.min(1300,forecast+su),regular=Math.min(target,1000),need=Math.max(0,target-1000),plannedOT=Math.min(need,ou),prodTarget=regular+plannedOT,cost=regular*55+plannedOT*78;state.decisions.make={safety:su,overtimeAuth:ou,target:prodTarget,regular,plannedOT,cost};spend(cost);state.career.operations++;if(su>=30&&su<=100)state.career.planning++;applyQual({service:su/25+plannedOT/40,profit:5-su/35-plannedOT/45,resilience:su/30+plannedOT/35,sustainability:4-su/45-plannedOT/55});feedback("Production authorized",`Target: <strong>${prodTarget.toLocaleString()} kits</strong> • Conversion budget: <strong>${money(cost)}</strong>.`);lockUI()}
}

function renderDeliver(){
  const target=state.decisions.make.target;$("sceneText").innerHTML=`<h3>Allocate planned output between freight modes.</h3><p>Standard truck is economical but less reliable. Expedited team truck is more reliable but much more expensive.</p>`;
  $("decisionArea").innerHTML=`<div class="sim-control"><h3>Expedited freight allocation</h3><p>Select how many planned kits receive premium transportation.</p><div class="unit-entry"><input id="expUnits" type="range" min="0" max="${target}" step="10" value="${Math.round(target*.25/10)*10}"><div class="unit-box"><strong id="expVal"></strong><small>EXPEDITED</small></div></div><div class="cost-preview"><div><span>Standard units</span><b id="stdVal"></b></div><div><span>Expedited units</span><b id="expVal2"></b></div><div><span>Freight cost</span><b id="freightCost"></b></div><div><span>Weighted reliability</span><b id="freightRel"></b></div></div><div class="constraint-box"><span>Cash after planned freight</span><strong id="deliverConstraint"></strong></div><button id="lockDecision" class="lock-btn">Book Transportation</button></div>`;
  const e=$("expUnits"),btn=$("lockDecision");const upd=()=>{const exp=+e.value,std=target-exp,cost=std*9+exp*24,rel=(std*.92+exp*.99)/Math.max(1,target);$("expVal").textContent=exp.toLocaleString();$("stdVal").textContent=std.toLocaleString();$("expVal2").textContent=exp.toLocaleString();$("freightCost").textContent=money(cost);$("freightRel").textContent=(rel*100).toFixed(1)+"%";const cash=state.budgetRemaining-cost;$("deliverConstraint").textContent=cash>=0?money(cash)+" remaining":"Over budget";$("deliverConstraint").className=cash>=0?"good":"bad";btn.disabled=cash<0};e.oninput=upd;upd();
  btn.onclick=()=>{const exp=+e.value,std=target-exp,cost=std*9+exp*24;state.decisions.deliver={standard:std,expedited:exp,cost};spend(cost);state.career.logistics++;const share=exp/Math.max(1,target);applyQual({service:3+share*9,profit:5-share*10,resilience:2+share*7,sustainability:5-share*9});feedback("Transportation booked",`You booked <strong>${std.toLocaleString()} standard</strong> and <strong>${exp.toLocaleString()} expedited</strong> units for <strong>${money(cost)}</strong>.`);lockUI();maybeMiniEvent(3)}
}

function renderAdapt(){
  const d=state.disruption;$("sceneText").innerHTML=`<div class="scenario-box"><strong>BREAKING: ${d.title}</strong>${d.detail}</div><h3>Use your remaining cash strategically.</h3><p>Your earlier choices are locked. Decide how much emergency protection to purchase.</p>`;
  $("newsTicker").innerHTML=`<span><b>LIVE:</b> ${d.title.toUpperCase()} • Remaining cash ${money(state.budgetRemaining)} • Balance recovery cost against customer impact</span>`;$("newsTicker").classList.remove("hidden");
  const maxUnits=Math.floor(Math.min(300,state.budgetRemaining/d.emergencyUnitCost)/10)*10;let label,desc;
  if(d.type==="supplier"){label="Emergency backup modules";desc=`Buy replacement modules at a $${d.emergencyUnitCost} premium per unit.`}
  if(d.type==="transport"){label="Emergency freight upgrades";desc=`Upgrade disrupted standard shipments at $${d.emergencyUnitCost} additional cost per unit.`}
  if(d.type==="demand"){label="Emergency surge units";desc=`Fund extra overtime + premium material at $${d.emergencyUnitCost} incremental cost per unit.`}
  $("decisionArea").innerHTML=`<div class="response-budget"><strong>Emergency cash available: ${money(state.budgetRemaining)}</strong></div><div class="sim-control"><h3>${label}</h3><p>${desc}</p><div class="unit-entry"><input id="emUnits" type="range" min="0" max="${maxUnits}" step="10" value="${Math.min(100,maxUnits)}"><div class="unit-box"><strong id="emVal"></strong><small>UNITS</small></div></div><div class="cost-preview"><div><span>Emergency units</span><b id="emUnits2"></b></div><div><span>Emergency spend</span><b id="emCost"></b></div><div><span>Cash remaining</span><b id="cashAfter"></b></div><div><span>Response intensity</span><b id="responseLevel"></b></div></div><button id="lockDecision" class="lock-btn">Execute Emergency Response</button></div>`;
  const e=$("emUnits");const upd=()=>{const u=+e.value,c=u*d.emergencyUnitCost;$("emVal").textContent=u;$("emUnits2").textContent=u;$("emCost").textContent=money(c);$("cashAfter").textContent=money(state.budgetRemaining-c);$("responseLevel").textContent=u===0?"None":u<80?"Light":u<180?"Moderate":"Aggressive"};e.oninput=upd;upd();
  $("lockDecision").onclick=()=>{const u=+e.value,c=u*d.emergencyUnitCost;state.decisions.adapt={units:u,cost:c,scenario:d.title};spend(c);state.career.resilience++;resolveSimulation();feedback("Emergency response locked",`You committed <strong>${money(c)}</strong> to protect <strong>${u.toLocaleString()} units</strong>. The system is ready to run.`);$("nextBtn").textContent="Run the Supply Chain →";lockUI()}
}

function resolveSimulation(){
  const s=state.decisions.source,m=state.decisions.make,t=state.decisions.deliver,a=state.decisions.adapt,d=state.disruption;
  let demand=state.actualDemand;
  if(state.eventEffects.demandInsight){
    // Better information reduces realized gap around forecast
    demand=Math.round((demand+state.decisions.plan.forecast)/2);
  }
  if(d.type==="demand")demand=Math.round(demand*1.12);

  let gRel=MODEL.global.reliability,rRel=MODEL.regional.reliability;
  if(d.type==="supplier")gRel*=.70;

  // Quality error chance; inspection reduces it
  let errorRate=state.eventEffects.inspection ? .006 : .018;
  const gReceived=Math.round(s.global*gRel*(1-errorRate));
  const rReceived=Math.round(s.regional*rRel*(1-errorRate*.6));
  state.qualityErrors=Math.max(0,Math.round((s.global*gRel+s.regional*rRel)-(gReceived+rReceived)));

  let components=gReceived+rReceived;
  if(d.type==="supplier")components+=a.units;

  let prodCap=m.regular+m.plannedOT;
  if(d.type==="demand")prodCap=Math.min(1300,prodCap+a.units);
  const produced=Math.min(components,prodCap);

  let stdRel=MODEL.standard.reliability,expRel=MODEL.expedited.reliability;
  if(d.type==="transport")stdRel*=.65;
  if(state.eventEffects.greenCommitment) expRel*=.995;

  let stdUnits=Math.min(produced,t.standard),expUnits=Math.max(0,produced-stdUnits);
  let onTime=Math.round(stdUnits*stdRel+expUnits*expRel);
  if(d.type==="transport")onTime=Math.min(produced,onTime+a.units);
  onTime=Math.min(onTime,produced);

  const delivered=Math.min(onTime,demand);
  const fillRate=delivered/Math.max(1,demand);
  const endingInventory=Math.max(0,produced-delivered);

  const procurement=Math.max(0,s.cost-(state.eventEffects.procurementCredit||0));
  const production=m.cost,freight=t.cost,emergency=a.cost,holding=endingInventory*MODEL.holdingCost;
  const totalCost=procurement+production+freight+emergency+holding+(state.eventEffects.inspection?1800:0)+(state.eventEffects.demandInsight?2500:0);
  const revenue=delivered*MODEL.sellPrice,profit=revenue-totalCost,costPerKit=totalCost/Math.max(1,delivered);

  const sourceEm=(s.global*1.0+s.regional*.45)/Math.max(1,s.global+s.regional);
  const freightEm=(t.standard*.55+t.expedited*1.25)/Math.max(1,t.standard+t.expedited);
  const emissionIndex=sourceEm*.45+freightEm*.55;

  state.service=clamp(fillRate*100);
  state.profitScore=clamp(50+(profit/100000)*50);
  const div=(s.global>0&&s.regional>0)?12:-5;
  state.resilience=clamp(55+div+(fillRate-.90)*80+(a.units>0?6:0));
  state.sustainability=clamp(90-emissionIndex*45-(endingInventory/Math.max(1,demand))*60+(state.eventEffects.greenCommitment?5:0));

  state.perfect.time=onTime>=Math.min(produced,demand)*.98;
  state.perfect.full=delivered>=demand;
  state.perfect.error=state.qualityErrors<=Math.max(3,Math.round((s.global+s.regional)*.005));
  state.perfect.budget=state.spent<=MODEL.budget;

  state.result={demand,gReceived,rReceived,components,produced,stdUnits,expUnits,onTime,delivered,fillRate,endingInventory,procurement,production,freight,emergency,holding,totalCost,revenue,profit,costPerKit,emissionIndex};
  updateDashboard();
}

/* animated run */
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
function addFeed(text,cls=""){const line=document.createElement("div");line.className="feed-line "+cls;line.innerHTML=text;$("eventFeed").appendChild(line);$("eventFeed").scrollTop=$("eventFeed").scrollHeight}
function setNode(id,mode){["animSupplier","animFactory","animTransit","animHospital"].forEach(n=>$(n).classList.remove("active","problem","success"));if(id)$(id).classList.add(mode||"active")}
function animateCounter(id,to,duration=700,suffix=""){const el=$(id),begin=performance.now();return new Promise(resolve=>{function tick(now){const p=Math.min(1,(now-begin)/duration);el.textContent=Math.round(to*p).toLocaleString()+suffix;if(p<1)requestAnimationFrame(tick);else resolve()}requestAnimationFrame(tick)})}
function spawnFlow(kind,count,duration=1100){const box=$("flowObjects"),n=Math.max(2,Math.min(12,Math.round(count/100)));for(let i=0;i<n;i++){const o=document.createElement("div");o.className="flow-object "+kind;o.textContent=kind==="box"?"📦":"🚚";o.style.animationDuration=duration+"ms";o.style.animationDelay=(i*80)+"ms";box.appendChild(o);setTimeout(()=>o.remove(),duration+i*80+100)}}
function setExec(p,label){$("executionBar").style.width=p+"%";$("executionLabel").textContent=label}
function setMood(face,text){$("moodFace").textContent=face;$("moodText").textContent=text}
function addInventoryVisual(units){
  document.querySelectorAll(".warehouse-overflow,.empty-line").forEach(x=>x.remove());
  if(units>100){const w=document.createElement("div");w.className="warehouse-overflow";for(let i=0;i<Math.min(18,Math.ceil(units/20));i++){const b=document.createElement("span");b.textContent="📦";w.appendChild(b)}$("animatedNetwork").appendChild(w)}
  if(units===0&&state.result.produced<state.result.demand){const e=document.createElement("div");e.className="empty-line";e.textContent="EMPTY BUFFER";$("animatedNetwork").appendChild(e)}
}
async function runOperations(){
  clearInterval(state.timerId);showScreen("operationsScreen");const r=state.result,d=state.disruption;
  $("eventFeed").innerHTML="";$("flowObjects").innerHTML="";$("resultsBtn").classList.add("hidden");
  $("opsDemand").textContent=r.demand.toLocaleString();$("opsComponents").textContent="0";$("opsProduced").textContent="0";$("opsDelivered").textContent="0";$("opsInventory").textContent="0";$("opsFill").textContent="0%";
  $("animSupplierCount").textContent="0 received";$("animFactoryCount").textContent="0 produced";$("animTransitCount").textContent="0 shipped";$("animHospitalCount").textContent="0 delivered";
  setMood("🙂","Confident");$("simDay").textContent="1";setExec(5,"Receiving components...");
  addFeed(`<b>DAY 1:</b> Purchase orders released.`);setNode("animSupplier","active");await sleep(500);
  if(d.type==="supplier"){setMood("😟","Concerned");setNode("animSupplier","problem");addFeed(`⚠ ${d.title}: ${d.detail}`,"warn");await sleep(650);addFeed(`Emergency backup action protects ${state.decisions.adapt.units} units.`,"good");await sleep(350)}
  spawnFlow("box",r.components,1200);await animateCounter("opsComponents",r.components,900);await animateCounter("animSupplierCount",r.components,900," received");addFeed(`Received ${r.components.toLocaleString()} usable components.`,"good");if(state.qualityErrors>0)addFeed(`Quality controls removed ${state.qualityErrors} questionable components before production.`);setNode("animSupplier","success");setExec(30,"Components moving to factory...");await sleep(700);

  $("simDay").textContent="3";setNode("animFactory","active");addFeed(`<b>DAY 3:</b> Assembly starts. Planned capacity ${state.decisions.make.target.toLocaleString()} kits.`);await animateCounter("opsProduced",r.produced,1100);await animateCounter("animFactoryCount",r.produced,900," produced");addInventoryVisual(r.endingInventory);
  if(r.produced<r.demand){setMood("😟","Concerned");setNode("animFactory","problem");addFeed(`⚠ Production is below current customer demand.`,"warn")}else{setNode("animFactory","success");addFeed(`Factory completed ${r.produced.toLocaleString()} kits.`,"good")}
  setExec(55,"Finished goods staged...");await sleep(800);

  $("simDay").textContent="5";setNode("animTransit","active");spawnFlow("truck",r.produced,1400);addFeed(`<b>DAY 5:</b> ${r.stdUnits.toLocaleString()} standard + ${r.expUnits.toLocaleString()} expedited units depart.`);await animateCounter("animTransitCount",r.produced,800," shipped");
  if(d.type==="transport"){setMood("😨","Critical");setNode("animTransit","problem");addFeed(`⚠ ${d.title}: ${d.detail}`,"warn");await sleep(650);addFeed(`Emergency protection covers ${state.decisions.adapt.units} units.`,"good")}
  setExec(77,"Shipments moving...");await sleep(1000);setNode("animTransit","success");

  $("simDay").textContent="7";setNode("animHospital","active");addFeed(`<b>DAY 7:</b> Hospital receiving window opens.`);await animateCounter("opsDelivered",r.delivered,1100);await animateCounter("animHospitalCount",r.delivered,1000," delivered");
  $("opsInventory").textContent=r.endingInventory.toLocaleString();$("opsFill").textContent=(r.fillRate*100).toFixed(1)+"%";
  if(d.type==="demand")addFeed(`⚠ Demand surge raises final demand to ${r.demand.toLocaleString()} kits.`,"warn");
  if(r.fillRate>=.98){setMood("🤩","Delighted");setNode("animHospital","success");showNetworkBanner(`Customer filled at ${(r.fillRate*100).toFixed(1)}%`,"success");addFeed(`Hospital filled at ${(r.fillRate*100).toFixed(1)}%.`,"good");sound(940,.16)}
  else if(r.fillRate>=.90){setMood("😐","Concerned");setNode("animHospital","problem");showNetworkBanner(`${(r.fillRate*100).toFixed(1)}% fill rate`,"shortage");addFeed(`Customer service fell below target.`,"warn")}
  else{setMood("😠","Critical");setNode("animHospital","problem");const short=Math.max(0,r.demand-r.delivered);showNetworkBanner(`${short.toLocaleString()} kits short`,"shortage");addFeed(`SHORTAGE: ${short.toLocaleString()} kits not delivered on time.`,"warn");sound(220,.18)}
  setExec(100,"Simulation complete.");$("opsNarrative").textContent=`The chain executed. ${r.delivered.toLocaleString()} of ${r.demand.toLocaleString()} demanded kits arrived on time.`;await sleep(400);$("resultsBtn").classList.remove("hidden")
}
function showNetworkBanner(text,type){const old=document.querySelector(".shortage-banner,.success-banner");if(old)old.remove();const b=document.createElement("div");b.className=type==="success"?"success-banner":"shortage-banner";b.textContent=text;$("animatedNetwork").appendChild(b)}

function identifyConstraint(){
  const r=state.result,d=state.decisions;
  const gaps=[
    {key:"supplier",gap:Math.max(0,d.make.target-r.components),title:"Supplier Availability",icon:"📦",text:`You planned ${d.make.target.toLocaleString()} kits, but only ${r.components.toLocaleString()} usable components reached production.`},
    {key:"capacity",gap:Math.max(0,Math.min(r.components,r.demand)-r.produced),title:"Production Capacity",icon:"🏭",text:`Usable components were available, but the factory only produced ${r.produced.toLocaleString()} kits.`},
    {key:"transport",gap:Math.max(0,r.produced-r.onTime),title:"Transportation Reliability",icon:"🚚",text:`The factory produced ${r.produced.toLocaleString()} kits, but only ${r.onTime.toLocaleString()} arrived in the delivery window.`},
    {key:"forecast",gap:Math.max(0,r.demand-d.plan.forecast),title:"Forecast / Demand Gap",icon:"📊",text:`Actual demand reached ${r.demand.toLocaleString()} versus your forecast of ${d.plan.forecast.toLocaleString()}.`}
  ].sort((a,b)=>b.gap-a.gap);
  if(gaps[0].gap<=0)return {title:"No Major Physical Constraint",icon:"✅",text:"No single stage created a major physical shortage. Your main opportunity is fine-tuning cost, inventory, and risk."};
  return gaps[0];
}

function renderBoardroom(){
  const r=state.result,c=identifyConstraint();showScreen("boardroomScreen");
  $("boardDemand").textContent=r.demand.toLocaleString();$("boardDelivered").textContent=r.delivered.toLocaleString();$("boardFill").textContent=(r.fillRate*100).toFixed(1);
  $("boardRevenue").textContent=money(r.revenue);$("boardCost").textContent=money(r.totalCost);$("boardProfit").textContent=money(r.profit);
  $("constraintIcon").textContent=c.icon;$("constraintTitle").textContent=c.title;$("constraintText").textContent=c.text;
  const p=state.perfect,all=p.time&&p.full&&p.error&&p.budget;
  $("perfectOrderReveal").innerHTML=`<div class="po-title ${all?"success":"fail"}">${all?"🏆 PERFECT ORDER ACHIEVED":"Perfect Order Check"}</div><div class="po-grid">
    <div class="${p.time?"pass":"fail"}">${p.time?"✓":"✕"} On Time</div><div class="${p.full?"pass":"fail"}">${p.full?"✓":"✕"} In Full</div><div class="${p.error?"pass":"fail"}">${p.error?"✓":"✕"} Error Free</div><div class="${p.budget?"pass":"fail"}">${p.budget?"✓":"✕"} Within Budget</div></div>`;
}

function achievements(){
  const r=state.result,d=state.decisions,a=[];
  if(state.perfect.time&&state.perfect.full&&state.perfect.error&&state.perfect.budget)a.push(["🏆","Perfect Order","On time, in full, error free, and within budget.","gold"]);
  if(r.fillRate>=.98)a.push(["🎯","Customer Hero","Achieved at least 98% fill rate.",""]);
  if(r.profit>=75000)a.push(["💰","Profit Protector","Generated at least $75,000 operating profit.",""]);
  if(state.resilience>=80)a.push(["🛡️","Resilience Builder","Built a highly resilient network.",""]);
  if(state.sustainability>=70)a.push(["🌱","Green Chain","Finished with strong sustainability performance.",""]);
  if(Math.abs(d.plan.forecast-r.demand)<=50)a.push(["📊","Forecast Ace","Finished within 50 units of actual demand.",""]);
  if(d.source.global>0&&d.source.regional>0&&Math.abs(d.source.global-d.source.regional)<=250)a.push(["🤝","Supplier Strategist","Maintained a diversified supplier portfolio.",""]);
  if(r.endingInventory<=50&&r.fillRate>=.95)a.push(["📦","Inventory Ninja","Protected service without creating much excess inventory.",""]);
  if(score()>MODEL.benchmark)a.push(["🏁","Beat the Benchmark",`Scored above the ETSU benchmark of ${MODEL.benchmark}.`,"gold"]);
  return a.slice(0,6);
}
function topCareer(){const e=Object.entries(state.career).sort((a,b)=>b[1]-a[1]);if(e.length>1&&e[0][1]===e[1][1])return "balanced";return e[0][0]||"balanced"}

function finishGame(){
  const r=state.result,s=score();showScreen("endScreen");$("finalScore").textContent=s;
  let h=s>=88?"You ran a high-performing supply chain.":s>=75?"You delivered a solid supply chain result.":s>=60?"You kept the system moving—but paid for some tradeoffs.":"The numbers exposed weak links in the chain.";
  $("endHeadline").textContent=h;$("endSummary").textContent=`Demand was ${r.demand.toLocaleString()} kits. You delivered ${r.delivered.toLocaleString()} on time and generated ${money(r.profit)} in operating profit.`;
  $("benchmarkResult").className="benchmark-result "+(s>MODEL.benchmark?"win":"lose");$("benchmarkResult").textContent=s>MODEL.benchmark?`You beat the benchmark by ${s-MODEL.benchmark} points.`:`You are ${MODEL.benchmark-s} points from the benchmark. Replay and tune the system.`;

  $("actualDemand").textContent=r.demand.toLocaleString();$("componentsReceived").textContent=r.components.toLocaleString();$("kitsProduced").textContent=r.produced.toLocaleString();$("onTimeDelivered").textContent=r.delivered.toLocaleString();$("fillRate").textContent=(r.fillRate*100).toFixed(1);$("endingInventory").textContent=r.endingInventory.toLocaleString();$("totalRevenue").textContent=money(r.revenue);$("totalCost").textContent=money(r.totalCost);$("operatingProfit").textContent=money(r.profit);$("costPerKit").textContent=money(r.costPerKit);

  const c=careers[topCareer()];$("careerIcon").textContent=c.icon;$("careerTitle").textContent=c.title;$("careerText").textContent=c.text;$("careerTags").innerHTML=c.tags.map(x=>`<span>${x}</span>`).join("");
  for(const [n,v] of [["Service",state.service],["Profit",state.profitScore],["Resilience",state.resilience],["Sustainability",state.sustainability]]){$("end"+n).textContent=Math.round(v);setTimeout(()=>$("end"+n+"Bar").style.width=clamp(v)+"%",250)}

  const d=state.decisions;$("recapGrid").innerHTML=`<div><b>PLAN</b><span>Forecast ${d.plan.forecast.toLocaleString()} kits</span></div><div><b>SOURCE</b><span>${d.source.global} global + ${d.source.regional} regional</span></div><div><b>MAKE</b><span>${d.make.safety} safety-stock kits • ${d.make.overtimeAuth} overtime authorized</span></div><div><b>DELIVER</b><span>${d.deliver.standard} standard • ${d.deliver.expedited} expedited</span></div><div><b>ADAPT</b><span>${d.adapt.units} emergency units</span></div>`;

  const ach=achievements();$("achievementGrid").innerHTML=ach.length?ach.map(([i,t,x,cls])=>`<div class="achievement ${cls}"><div class="badge-icon">${i}</div><b>${t}</b><span>${x}</span></div>`).join(""):`<div class="achievement"><div class="badge-icon">🔁</div><b>Run It Again</b><span>Your first attempt established a baseline. Try a different strategy.</span></div>`;

  const best=Math.max(+localStorage.getItem("bucsupplyBest")||0,s);localStorage.setItem("bucsupplyBest",best);
  confetti()
}
function confetti(){const box=$("confetti");box.innerHTML="";const colors=["#041E42","#0033A0","#FFC72C","#A2AAAD"];for(let i=0;i<75;i++){const p=document.createElement("i");p.className="confetti-piece";p.style.left=Math.random()*100+"vw";p.style.background=colors[Math.floor(Math.random()*colors.length)];p.style.animationDuration=(2.6+Math.random()*2.2)+"s";box.appendChild(p)}setTimeout(()=>box.innerHTML="",5500)}

$("startBtn").onclick=startGame;
$("assumptionsBtn").onclick=()=>showScreen("assumptionsScreen");
$("assumptionStartBtn").onclick=startGame;
$("playAgainBtn").onclick=startGame;
$("nextBtn").onclick=()=>{state.round++;if(state.round>=5)runOperations();else renderRound()};
$("resultsBtn").onclick=renderBoardroom;
$("continueResultsBtn").onclick=finishGame;
$("restartBtn").onclick=()=>{clearInterval(state.timerId);showScreen("startScreen");$("timer").textContent="10:00"};
$("soundBtn").onclick=()=>{state.sound=!state.sound;$("soundBtn").textContent=state.sound?"🔊":"🔇"};

(function boot(){
  const best=+localStorage.getItem("bucsupplyBest")||0;
  if(best){$("previousScoreCard").classList.remove("hidden");$("previousScoreCard").innerHTML=`Your best score on this device: <strong>${best}</strong> • Benchmark: <strong>${MODEL.benchmark}</strong>`}
})();
