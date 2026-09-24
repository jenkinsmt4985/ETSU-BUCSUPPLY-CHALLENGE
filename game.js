const $=id=>document.getElementById(id);
const screens=["welcome","tutorial","game","simulation","results","final"];
const PHOTOS={
  demand:"assets/photos/hospital.jpg",
  source:"assets/photos/port.jpg",
  make:"assets/photos/factory.png",
  warehouse:"assets/photos/warehouse.jpg"
};
const PHOTO_FALLBACKS={
  demand:"https://upload.wikimedia.org/wikipedia/commons/7/75/Santa_Cabrini_Hospital_Exterior.jpg",
  source:"https://upload.wikimedia.org/wikipedia/commons/c/c5/Shipping_containers_in_a_port_%28Unsplash%29.jpg",
  make:"https://upload.wikimedia.org/wikipedia/commons/9/9c/Assembly_line_at_Orbbec%27s_Intelligent_Manufacturing_Base.png",
  warehouse:"https://upload.wikimedia.org/wikipedia/commons/c/c7/Warehouse_goods.jpg"
};
let state={round:1,step:0,decisions:[],results:[],working:{}};

const lessons=[
  {
    key:"forecast",title:"How many monitors will customers want?",photo:PHOTOS.demand,
    heading:"Decision 1: Make a demand forecast",
    text:"The hospital told you it expects to need about 800 monitors. It could be a little higher or lower. Before you order parts or schedule the factory, you need your best estimate.",
    term:"A <b>forecast</b> is simply your best estimate of future customer demand. It will almost never be perfectly correct.",
    render:renderForecast
  },
  {
    key:"parts",title:"How many sensor kits should you order?",photo:PHOTOS.source,
    heading:"Decision 2: Order the parts",
    text:"Every finished monitor needs one sensor kit from the supplier. If you order too few parts, the factory cannot build enough monitors. If you order too many, you spend money on parts you may not use.",
    term:"This is a <b>purchasing decision</b>: deciding how much material to buy so the supply chain can meet customer demand.",
    render:renderParts
  },
  {
    key:"capacity",title:"How much should the factory be able to make?",photo:PHOTOS.make,
    heading:"Decision 3: Set daily factory capacity",
    text:"Your factory runs for 65 business days. Capacity is the maximum number of monitors you plan to be able to build each day.",
    term:"<b>Capacity</b> means how much your operation is able to produce. Too little capacity can cause shortages. Too much can cost money without helping customers.",
    render:renderCapacity
  },
  {
    key:"inventory",title:"When should the factory make more?",photo:PHOTOS.warehouse,
    heading:"Decision 4: Control warehouse inventory",
    text:"The factory does not need to make monitors every minute. You can tell it when inventory is getting low and when there is enough inventory in the warehouse.",
    term:"When inventory falls to the <b>replenishment point</b>, production starts again. When inventory reaches the <b>target</b>, production stops. Marketplace uses the same basic pull-system idea.",
    render:renderInventory
  }
];

function show(id){screens.forEach(s=>$(s).classList.toggle("active",s===id));window.scrollTo({top:0,behavior:"smooth"})}
function money(x){return "$"+Math.round(x).toLocaleString()}
function currentDefaults(){
  if(state.round===1) return {forecast:800,parts:850,capacity:14,reorder:50,target:110};
  const p=state.decisions[0];
  return {...p};
}
function startRound(round){
  state.round=round;state.step=0;state.working=currentDefaults();
  $("roundLabel").textContent=`ROUND ${round} OF 2`;
  renderStep();show("game");
}
function setSide(){
  for(let i=1;i<=5;i++){
    const el=$("side"+i);el.classList.remove("active","done");
    if(i===state.step+1)el.classList.add("active");
    if(i<state.step+1)el.classList.add("done");
  }
}
function renderStep(){
  const l=lessons[state.step];setSide();
  $("stepEyebrow").textContent=`ROUND ${state.round} • SIMPLE DECISION ${state.step+1}`;
  $("stepTitle").textContent=l.title;$("stepCount").textContent=`${state.step+1} / 4`;
  $("lessonPhoto").src=l.photo;$("lessonPhoto").alt=l.heading;
  const fallbackKey=l.key==="forecast"?"demand":l.key==="parts"?"source":l.key==="capacity"?"make":"warehouse";
  $("lessonPhoto").onerror=()=>{$("lessonPhoto").onerror=null;$("lessonPhoto").src=PHOTO_FALLBACKS[fallbackKey]};$("lessonHeading").textContent=l.heading;$("lessonText").textContent=l.text;$("termBox").innerHTML=l.term;
  $("decisionFeedback").classList.add("hidden");$("backBtn").classList.toggle("hidden",state.step===0);
  $("continueBtn").textContent=state.step===3?"Run My Supply Chain →":"Continue →";
  l.render();syncFeedback();
}
function syncFeedback(){
  const w=state.working;let text="";
  if(state.step===0){
    text=`You are planning for ${w.forecast.toLocaleString()} customer orders.`;
  }else if(state.step===1){
    const gap=w.parts-w.forecast;
    text=gap>=0?`You are ordering ${gap} more parts than your forecast as a cushion.`:`You are ordering ${Math.abs(gap)} fewer parts than your forecast, so parts could limit production.`;
  }else if(state.step===2){
    const possible=w.capacity*65;
    text=`At ${w.capacity} per day, the factory could make at most ${possible.toLocaleString()} monitors during the 65-day quarter.`;
  }else{
    text=`When inventory falls to ${w.reorder}, production starts. When it reaches ${w.target}, production stops.`;
  }
  $("decisionFeedback").innerHTML=text;$("decisionFeedback").classList.remove("hidden");
}
function sliderMarkup(id,min,max,step,value,unit,left,right){
  return `<div class="slider-line"><div><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"><div class="slider-labels"><span>${left}</span><span>${right}</span></div></div><div class="value-card"><strong id="${id}Val">${value}</strong><small>${unit}</small></div></div>`;
}
function renderForecast(){
  $("decisionArea").innerHTML=`<div class="decision-box"><h3>Your forecast</h3><p>Move the slider to your best estimate. Customer research says about 800.</p>${sliderMarkup("forecastSlider",650,950,10,state.working.forecast,"MONITORS","650 — cautious","950 — optimistic")}</div>`;
  const s=$("forecastSlider");s.oninput=()=>{state.working.forecast=+s.value;$("forecastSliderVal").textContent=s.value;syncFeedback()}
}
function renderParts(){
  $("decisionArea").innerHTML=`<div class="decision-box"><h3>Sensor kits to order</h3><p>One sensor kit is needed for each monitor. Each kit costs $35.</p>${sliderMarkup("partsSlider",650,1050,10,state.working.parts,"SENSOR KITS","650 — low order","1,050 — larger buffer")}</div>`;
  const s=$("partsSlider");s.oninput=()=>{state.working.parts=+s.value;$("partsSliderVal").textContent=s.value;syncFeedback()}
}
function renderCapacity(){
  $("decisionArea").innerHTML=`<div class="decision-box"><h3>Factory capacity per day</h3><p>The quarter has 65 business days. Higher capacity gives you more flexibility, but planned capacity also costs money.</p>${sliderMarkup("capacitySlider",10,16,1,state.working.capacity,"MONITORS / DAY","10/day","16/day")}</div>`;
  const s=$("capacitySlider");s.oninput=()=>{state.working.capacity=+s.value;$("capacitySliderVal").textContent=s.value;syncFeedback()}
}
function renderInventory(){
  $("decisionArea").innerHTML=`<div class="decision-box">
    <div class="two-controls">
      <div class="micro-card"><h3>START making more when inventory falls to...</h3><p>This is the replenishment point.</p>${sliderMarkup("reorderSlider",20,90,5,state.working.reorder,"MONITORS","20","90")}</div>
      <div class="micro-card"><h3>STOP making when inventory reaches...</h3><p>This is the target inventory.</p>${sliderMarkup("targetSlider",80,180,5,state.working.target,"MONITORS","80","180")}</div>
    </div>
  </div>`;
  const r=$("reorderSlider"),t=$("targetSlider");
  const validate=()=>{
    state.working.reorder=+r.value;state.working.target=+t.value;
    $("reorderSliderVal").textContent=r.value;$("targetSliderVal").textContent=t.value;
    if(state.working.target<=state.working.reorder){state.working.target=state.working.reorder+30;t.value=state.working.target;$("targetSliderVal").textContent=t.value}
    syncFeedback()
  };
  r.oninput=validate;t.oninput=validate;validate()
}
function advance(){
  if(state.step<3){state.step++;renderStep();return}
  state.decisions[state.round-1]={...state.working};runQuarter()
}
function back(){if(state.step>0){state.step--;renderStep()}}

function generateDemand(round,total){
  const days=65,weights=[];
  for(let d=0;d<days;d++){
    const weekly=1+0.13*Math.sin(d*2*Math.PI/7);
    const trend=round===2?(0.94+0.12*d/(days-1)):1;
    weights.push(Math.max(.65,weekly*trend*(.82+Math.random()*.36)));
  }
  const sum=weights.reduce((a,b)=>a+b,0);
  const vals=weights.map(w=>Math.floor(total*w/sum));
  let diff=total-vals.reduce((a,b)=>a+b,0),i=0;
  while(diff>0){vals[i%days]++;i++;diff--}
  return vals;
}
function simulate(dec,round){
  let actual;
  if(round===1) actual=Math.round(720+Math.random()*170);
  else{
    const q1=state.results[0].demand;
    actual=Math.round(Math.max(680,Math.min(960,q1*(.94+Math.random()*.16))));
  }
  const daily=generateDemand(round,actual);
  let parts=dec.parts,inventory=70,made=0,sold=0,lost=0;
  let active=true;
  const log=[];
  for(let day=0;day<65;day++){
    if(inventory<=dec.reorder)active=true;
    if(inventory>=dec.target)active=false;
    let canMake=active?Math.min(dec.capacity,parts,Math.max(0,dec.target-inventory)):0;
    parts-=canMake;inventory+=canMake;made+=canMake;
    const demand=daily[day],sales=Math.min(demand,inventory);
    sold+=sales;lost+=demand-sales;inventory-=sales;
    log.push({day:day+1,demand:daily.slice(0,day+1).reduce((a,b)=>a+b,0),parts,inventory,made,sold});
  }
  const revenue=sold*125;
  const partCost=dec.parts*35;
  const productionCost=made*32;
  const capacityCost=dec.capacity*65*2.5;
  const holdingCost=inventory*6;
  const profit=revenue-partCost-productionCost-capacityCost-holdingCost;
  const service=sold/Math.max(1,actual);
  const inventoryEff=Math.max(0,1-(inventory+parts)/(dec.parts+made+1));
  const profitScore=Math.max(0,Math.min(1,profit/42000));
  return {demand:actual,sold,lost,inventory,parts,made,profit,service,inventoryEff,profitScore,log}
}
async function runQuarter(){
  const result=simulate(state.decisions[state.round-1],state.round);state.results[state.round-1]=result;
  show("simulation");$("simRoundLabel").textContent=`ROUND ${state.round}`;$("simProgress").style.width="0%";
  const checkpoints=[0,9,19,29,39,49,64];
  for(const idx of checkpoints){
    const x=result.log[idx];$("simDay").textContent=x.day;$("simDemand").textContent=x.demand;$("simParts").textContent=`${x.parts} parts left`;$("simMade").textContent=`${x.made} made`;$("simInventory").textContent=`${x.inventory} in stock`;$("simSold").textContent=`${x.sold} delivered`;$("simService").textContent=(x.sold/Math.max(1,x.demand)*100).toFixed(0)+"%";$("simProgress").style.width=(x.day/65*100)+"%";
    if(x.inventory===0)$("simMessage").textContent="The warehouse is empty. If customers order now, you may lose sales.";
    else if(x.inventory>state.decisions[state.round-1].target*.85)$("simMessage").textContent="The warehouse is well stocked. Watch that you do not finish with too much inventory.";
    else $("simMessage").textContent="Products are moving from supplier to factory to warehouse to hospital.";
    await new Promise(r=>setTimeout(r,430));
  }
  setTimeout(()=>showResults(),450)
}
function showResults(){
  const r=state.results[state.round-1];show("results");$("resultRoundLabel").textContent=`ROUND ${state.round} RESULTS`;
  $("resDemand").textContent=r.demand;$("resSold").textContent=r.sold;$("resLost").textContent=r.lost;$("resInventory").textContent=r.inventory;$("resParts").textContent=r.parts;$("resProfit").textContent=money(r.profit);
  $("scoreService").textContent=(r.service*100).toFixed(0)+"%";$("scoreServiceBar").style.width=(r.service*100)+"%";
  $("scoreInventory").textContent=(r.inventoryEff*100).toFixed(0)+"%";$("scoreInventoryBar").style.width=(r.inventoryEff*100)+"%";
  $("scoreProfit").textContent=(r.profitScore*100).toFixed(0)+"%";$("scoreProfitBar").style.width=(r.profitScore*100)+"%";
  let lesson=[];
  if(r.lost>30)lesson.push(`You lost ${r.lost} sales. The supply chain did not have enough product available when customers wanted it.`);
  else lesson.push("You served most of the hospital's demand.");
  if(r.inventory>100)lesson.push(`You ended with ${r.inventory} unsold monitors, which means money was tied up in inventory.`);
  else if(r.inventory<20)lesson.push("You finished with very little inventory, which is efficient but leaves little protection if demand rises.");
  else lesson.push("Your ending finished-goods inventory was in a reasonable range.");
  if(r.parts>100)lesson.push(`You also had ${r.parts} unused supplier parts, so your purchasing decision was higher than production needed.`);
  $("learnText").textContent=lesson.join(" ");

  if(state.round===1){
    $("comparisonBox").classList.add("hidden");$("nextRoundBtn").textContent="Adjust Your Plan for Round 2";
  }else{
    const a=state.results[0],b=state.results[1];
    $("comparisonBox").classList.remove("hidden");
    const serviceChange=(b.service-a.service)*100,profitChange=b.profit-a.profit;
    $("comparisonBox").innerHTML=`<b>Round 1 vs. Round 2:</b> Customer service ${serviceChange>=0?"improved":"decreased"} by ${Math.abs(serviceChange).toFixed(1)} percentage points. Profit changed by ${money(profitChange)}.`;
    $("nextRoundBtn").textContent="Finish Game";
  }
}
function finishOrNext(){
  if(state.round===1){startRound(2)}
  else showFinal()
}
function showFinal(){
  const a=state.results[0],b=state.results[1];$("finalService1").textContent=(a.service*100).toFixed(0)+"%";$("finalService2").textContent=(b.service*100).toFixed(0)+"%";$("finalProfit1").textContent=money(a.profit);$("finalProfit2").textContent=money(b.profit);show("final")
}
function reset(){
  state={round:1,step:0,decisions:[],results:[],working:{}};show("welcome")
}
$("beginBtn").onclick=()=>show("tutorial");
$("startRoundBtn").onclick=()=>startRound(1);
$("continueBtn").onclick=advance;
$("backBtn").onclick=back;
$("nextRoundBtn").onclick=finishOrNext;
$("playAgainBtn").onclick=reset;
