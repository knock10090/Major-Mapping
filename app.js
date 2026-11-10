const STORAGE_KEY = 'majorMapping.v1';
const sampleColleges = [
  {id:'sample-cc',name:'Sample Community College',location:'Your local area',type:'Community college',gpa:'Open admission varies by program',sat:'Often not required',notes:'Illustrative sample record only. Community college admission policies, placement, and program prerequisites vary by institution.',url:'',demo:true},
  {id:'sample-state',name:'Sample State University',location:'Example City, USA',type:'Public university',gpa:'Illustrative range: 3.0–3.8',sat:'Illustrative range: 1050–1300',notes:'Illustrative sample record only. These ranges are not real admissions statistics.',url:'',demo:true},
  {id:'sample-private',name:'Sample Private University',location:'Example City, USA',type:'Private university',gpa:'Illustrative range: 3.4–4.0',sat:'Illustrative range: 1200–1450',notes:'Illustrative sample record only. These ranges are not real admissions statistics.',url:'',demo:true},
  {id:'sample-ivy',name:'Sample Ivy College',location:'Northeastern United States',type:'Ivy League',gpa:'No universal published cutoff',sat:'Illustrative range: 1480–1570',notes:'Illustrative sample record only. Highly selective admissions are holistic; no score guarantees admission.',url:'',demo:true},
  {id:'sample-academy',name:'Sample Service Academy',location:'United States',type:'Military academy',gpa:'Academic, leadership, medical, and fitness standards apply',sat:'Varies by academy and application year',notes:'Illustrative sample record only. Service academies have distinct nomination, medical, fitness, and eligibility requirements.',url:'',demo:true},
  {id:'sample-tech',name:'Sample Technical Institute',location:'Example Region, USA',type:'Trade / technical',gpa:'Program-specific',sat:'Often not required',notes:'Illustrative sample record only. Requirements differ by certificate and training program.',url:'',demo:true}
];
const defaultRoadmap = [
  {id:'research',title:'Research colleges and programs',desc:'Explore a range of schools and confirm that they offer programs you may want to study.'},
  {id:'courses',title:'Plan your high-school courses',desc:'Review graduation requirements and the recommended preparation for your intended programs.'},
  {id:'grades',title:'Set academic goals',desc:'Check your grades regularly and ask teachers for support when you need it.'},
  {id:'testing',title:'Understand testing policies',desc:'Check whether each college is test-required, test-optional, or test-free for your application year.'},
  {id:'activities',title:'Build meaningful involvement',desc:'Pursue activities, work, service, or responsibilities that matter to you.'},
  {id:'recommendations',title:'Plan recommendations and essays',desc:'Learn each college’s requirements and allow plenty of time to prepare.'},
  {id:'aid',title:'Explore financial aid',desc:'Review net price, scholarships, FAFSA information, and financial aid deadlines with a trusted adult.'},
  {id:'deadlines',title:'Create an application calendar',desc:'Record verified application, scholarship, housing, and financial aid deadlines.'}
];
let state = loadState();
let activePage = 'home';
let selectedCompare = [];
function loadState(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');return {profile:saved.profile||{},colleges:Array.isArray(saved.colleges)?saved.colleges:[],savedIds:Array.isArray(saved.savedIds)?saved.savedIds:[],roadmap:saved.roadmap||{},deadlines:Array.isArray(saved.deadlines)?saved.deadlines:[]};}catch(e){return {profile:{},colleges:[],savedIds:[],roadmap:{},deadlines:[]}}}
function persist(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));renderAll()}
let sheetColleges = [];
function parseCSV(text){
  const rows=[];
  let row=[],field='',quoted=false;

  for(let i=0;i<text.length;i++){
    const ch=text[i],next=text[i+1];

    if(ch==='"'&&quoted&&next==='"'){
      field+='"';i++;
    }else if(ch==='"'){
      quoted=!quoted;
    }else if(ch===','&&!quoted){
      row.push(field);field='';
    }else if((ch==='\n'||ch==='\r')&&!quoted){
      if(ch==='\r'&&next==='\n')i++;
      row.push(field);field='';
      if(row.some(v=>v.trim()!==''))rows.push(row);
      row=[];
    }else{
      field+=ch;
    }
  }

  row.push(field);
  if(row.some(v=>v.trim()!==''))rows.push(row);
  if(!rows.length)return [];

  const headers=rows.shift().map(h=>
    h.trim().replace(/^\uFEFF/,'').toLowerCase()
  );

  const get=(r,...names)=>{
    const index=headers.findIndex(h=>names.includes(h));
    return index<0?'':(r[index]||'');
  };

  return rows.map((r,i)=>{
    const name=get(r,'college name','institution_name');
    if(!name.trim())return null;

    const city=get(r,'city');
    const stateName=get(r,'state');

    return {
      id:get(r,'college id','ipeds_id')||'sheet-'+i,
      name:name.trim(),
      location:[city,stateName].filter(Boolean).join(', ')||'Location not entered',
      type:get(r,'college type','institution_type')||'Not specified',
      url:get(r,'website'),
      notes:get(r,'notes')||'Imported from your college spreadsheet.',
      gpa:'Not provided',
      sat:'Not provided',
      act:'Not provided',
      testing:'Not provided',
      deadline:'Not provided',
      tuition:'Not provided',
      courses:'Not provided',
      requirements:'Not provided',
      demo:false
    };
  }).filter(Boolean);
}
async function loadSheetColleges(){
  try{
    const response=await fetch('./colleges.csv',{cache:'no-store'});
    if(!response.ok) throw new Error('Could not load colleges.csv');
    const csv=await response.text();
    const imported=parseCSV(csv);
    if(!imported.length) throw new Error('No college rows found in colleges.csv');
    sheetColleges=imported;
    renderAll();
    showToast(`Loaded ${sheetColleges.length} colleges from your spreadsheet.`);
  }catch(error){
    console.warn('College spreadsheet could not be loaded:',error);
    showToast('Could not load colleges.csv. Showing sample colleges instead.');
  }
}
function allColleges(){return [...(sheetColleges.length?sheetColleges:sampleColleges),...state.colleges]}
function escapeHTML(value=''){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function initials(name){return (name||'MM').trim().split(/\s+/).slice(0,2).map(x=>x[0]?.toUpperCase()||'').join('')||'MM'}
function showToast(message){const t=document.getElementById('toast');t.textContent=message;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400)}
function go(page){activePage=page;document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===`page-${page}`));document.querySelectorAll('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.page===page));const names={home:'OVERVIEW',explore:'COLLEGE EXPLORER',profile:'MY STUDENT PROFILE',matches:'MY COLLEGE MATCHES',compare:'COMPARE COLLEGES',roadmap:'MY ROADMAP',tracker:'APPLICATION TRACKER'};document.getElementById('breadcrumbCurrent').textContent=names[page]||'OVERVIEW';document.getElementById('sidebar').classList.remove('open');window.scrollTo({top:0,behavior:'smooth'});if(page==='explore')renderColleges();if(page==='matches')renderMatches();if(page==='compare')renderCompare();if(page==='roadmap')renderRoadmap();if(page==='tracker')renderDeadlines()}
document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.page)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
document.getElementById('mobileMenu').addEventListener('click',()=>document.getElementById('sidebar').classList.toggle('open'));
function profileCompletion(){const p=state.profile;const fields=['firstName','grade','major','gpa','sat','act','activities'];return Math.round(fields.filter(k=>String(p[k]||'').trim()).length/fields.length*100)}
function renderHome(){const percent=profileCompletion();document.getElementById('homeCompletion').textContent=percent+'%';document.getElementById('homeProgress').style.width=percent+'%';document.getElementById('savedCount').textContent=state.savedIds.length;document.getElementById('profileStatus').textContent=percent===0?'Not started':percent<70?'In progress':'Profile started';document.getElementById('avatarInitials').textContent=initials(state.profile.firstName);const types=['Community college','Public university','Private university','Ivy League','Military academy','Trade / technical'];document.getElementById('homeTypes').innerHTML=types.map(t=>`<button class="type-tile" data-type="${escapeHTML(t)}">${escapeHTML(t)}<small>Explore schools →</small></button>`).join('');document.querySelectorAll('[data-type]').forEach(b=>b.addEventListener('click',()=>{go('explore');document.getElementById('typeFilter').value=b.dataset.type;renderColleges()}))}
function collegeCard(c){const saved=state.savedIds.includes(c.id);return `<article class="college-card"><div class="college-card-top"><div class="college-monogram">${escapeHTML(initials(c.name))}</div>${c.demo?'<span class="school-type">SAMPLE DATA</span>':''}</div><h3>${escapeHTML(c.name)}</h3><div class="college-location">${escapeHTML(c.location||'Location not entered')}</div><span class="school-type">${escapeHTML(c.type)}</span><p class="college-note">${c.demo?'Illustrative example — not actual college admissions data.':escapeHTML(c.notes||'Add verified admissions details to this college profile.')}</p><div class="card-actions"><button class="small-button" data-detail="${escapeHTML(c.id)}">View profile</button><button class="small-button ${saved?'saved':''}" data-save="${escapeHTML(c.id)}">${saved?'✓ Saved':'＋ Save'}</button></div></article>`}
function renderColleges(){const q=(document.getElementById('collegeSearch').value||'').toLowerCase();const type=document.getElementById('typeFilter').value;const list=allColleges().filter(c=>(type==='all'||c.type===type)&&[c.name,c.location,c.type].join(' ').toLowerCase().includes(q));document.getElementById('resultCount').textContent=`${list.length} ${list.length===1?'college':'colleges'}`;document.getElementById('collegeGrid').innerHTML=list.map(collegeCard).join('');document.getElementById('noResults').classList.toggle('hidden',list.length!==0);document.querySelectorAll('[data-save]').forEach(b=>b.addEventListener('click',()=>toggleSave(b.dataset.save)));document.querySelectorAll('[data-detail]').forEach(b=>b.addEventListener('click',()=>showDetail(b.dataset.detail)))}
document.getElementById('collegeSearch').addEventListener('input',renderColleges);document.getElementById('typeFilter').addEventListener('change',renderColleges);
function toggleSave(id){state.savedIds=state.savedIds.includes(id)?state.savedIds.filter(x=>x!==id):[...state.savedIds,id];persist();showToast(state.savedIds.includes(id)?'College added to your list.':'College removed from your list.')}
function showDetail(id){const c=allColleges().find(x=>x.id===id);if(!c)return;const p=state.profile;const saved=state.savedIds.includes(id);document.getElementById('detailContent').innerHTML=`<div class="detail-content-head"><div><p class="eyebrow">COLLEGE PROFILE</p><h2>${escapeHTML(c.name)}</h2><p>${escapeHTML(c.location||'Location not entered')} · ${escapeHTML(c.type)}</p></div><button class="close-button" id="closeDetail">×</button></div><div class="detail-stat-grid"><div class="detail-stat"><small>GPA INFORMATION</small><strong>${escapeHTML(c.gpa||'Not provided')}</strong></div><div class="detail-stat"><small>SAT INFORMATION</small><strong>${escapeHTML(c.sat||'Not provided')}</strong></div></div><div class="detail-block"><h3>Admissions information</h3><p>${escapeHTML(c.notes||'No admissions notes have been entered yet.')}</p></div><div class="detail-stat-grid"><div class="detail-stat"><small>ACT RANGE</small><strong>${escapeHTML(c.act||'Not provided')}</strong></div><div class="detail-stat"><small>TESTING POLICY</small><strong>${escapeHTML(c.testing||'Not provided')}</strong></div><div class="detail-stat"><small>APPLICATION DEADLINE</small><strong>${escapeHTML(c.deadline||'Not provided')}</strong></div><div class="detail-stat"><small>ESTIMATED TUITION</small><strong>${escapeHTML(c.tuition||'Not provided')}</strong></div></div><div class="detail-block"><h3>Academic / course requirements</h3><p>${escapeHTML(c.courses||'Not entered. Check the official admissions website.')}</p></div><div class="detail-block"><h3>Application requirements</h3><p>${escapeHTML(c.requirements||'Not entered. Check the official admissions website.')}</p></div><div class="detail-block"><h3>Information checked</h3><p>${escapeHTML(c.checked||'Date not entered')}</p></div><div class="detail-block"><h3>What to verify</h3><p>Check the college’s official admissions website for current application requirements, course expectations, testing policy, deadlines, costs, financial aid, and program-specific prerequisites. Confirm that the information applies to your intended entry year.</p></div>${c.url?`<div class="detail-block"><a href="${escapeHTML(c.url)}" target="_blank" rel="noopener noreferrer" class="text-button">Visit official admissions website ↗</a></div>`:''}<div class="modal-actions"><button class="outline-button" id="closeDetail2">Close</button><button class="primary-button" id="detailSave">${saved?'Remove from my list':'Save college →'}</button></div>`;const d=document.getElementById('detailDialog');d.showModal();['closeDetail','closeDetail2'].forEach(id=>document.getElementById(id).addEventListener('click',()=>d.close()));document.getElementById('detailSave').addEventListener('click',()=>{d.close();toggleSave(id)})}
function renderProfile(){const p=state.profile;['firstName','grade','major','location','gpa','weightedGpa','sat','act','rigor','activities','awards','context'].forEach(k=>{const el=document.getElementById(k);if(el)el.value=p[k]||''})}
document.getElementById('profileForm').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const p={};for(const [k,v] of fd.entries())p[k]=String(v).trim();for(const [field,min,max] of [['gpa',0,4],['weightedGpa',0,6],['sat',400,1600],['act',1,36]]){if(p[field]!==''&&(Number(p[field])<min||Number(p[field])>max)){showToast(`${field} must be between ${min} and ${max}.`);return}}state.profile=p;persist();showToast('Your profile has been saved on this device.')});
function parseRange(str){const nums=(str||'').match(/\d+(?:\.\d+)?/g);return nums?nums.map(Number):[]}
function assess(c){const p=state.profile;if(c.demo)return {label:'Sample comparison only',gpa:'Illustrative range',sat:'Illustrative range',act:'Illustrative range',note:'This sample college has fictional example ranges. It cannot produce a meaningful admissions assessment.'};const inputs=[['GPA',p.gpa,c.gpa],['SAT',p.sat,c.sat],['ACT',p.act,c.act]];let checks=0,meets=0,below=[];const details={};for(const [key,student,range] of inputs){const nums=parseRange(range);if(student!==undefined&&student!==''&&nums.length){checks++;const score=Number(student);const low=Math.min(...nums);const high=Math.max(...nums);details[key]=`${student} / ${range}`;if(score>=low)meets++;else below.push(key)}else{details[key]=student?`${student} / no range entered`:'Not entered'}}let label='Add academic details';if(checks===0)label='Insufficient comparison data';else if(below.length)label='Below one or more entered ranges';else label='Within or above entered ranges';return {label,gpa:details.GPA,sat:details.SAT,act:details.ACT,note:checks===0?'Enter your GPA and/or test scores, and add verified college ranges to see a basic comparison.':`Compared ${checks} available academic measure(s). ${below.length?`Your ${below.join(', ')} value(s) are below the entered lower range.`:'Your entered academic values meet or exceed the lower end of the ranges entered.'} This is not an acceptance probability. Activities, course selection, essays, recommendations, context, institutional priorities, and many other factors are not fully assessed.`}}
function renderMatches(){const list=allColleges().filter(c=>state.savedIds.includes(c.id));document.getElementById('matchIntro').textContent=list.length?`${list.length} saved ${list.length===1?'college':'colleges'} in your list.`:'Save colleges in College Explorer to see your comparisons here.';document.getElementById('matchList').innerHTML=list.map(c=>{const a=assess(c);return `<article class="match-card"><div><h3>${escapeHTML(c.name)}</h3><p>${escapeHTML(c.location||'')} · ${escapeHTML(c.type)}</p></div><span class="match-badge">${escapeHTML(a.label)}</span><div class="match-details"><div><span>YOUR GPA / COLLEGE RANGE</span><strong>${escapeHTML(a.gpa)}</strong></div><div><span>YOUR SAT / COLLEGE RANGE</span><strong>${escapeHTML(a.sat)}</strong></div><div><span>ACT / COLLEGE RANGE</span><strong>${escapeHTML(a.act)}</strong></div></div><p class="match-footnote">${escapeHTML(a.note)}</p><button class="small-button" data-match-detail="${escapeHTML(c.id)}">Review college profile</button></article>`}).join('');document.querySelectorAll('[data-match-detail]').forEach(b=>b.addEventListener('click',()=>showDetail(b.dataset.matchDetail)))}
function renderCompare(){const saved=allColleges().filter(c=>state.savedIds.includes(c.id));selectedCompare=selectedCompare.filter(id=>saved.some(c=>c.id===id));document.getElementById('comparePicker').innerHTML=saved.length?saved.map(c=>`<label class="compare-choice"><input type="checkbox" value="${escapeHTML(c.id)}" ${selectedCompare.includes(c.id)?'checked':''}>${escapeHTML(c.name)}</label>`).join(''):'<p class="intro">Save colleges in College Explorer before comparing them.</p>';document.querySelectorAll('#comparePicker input').forEach(ch=>ch.addEventListener('change',()=>{if(ch.checked&&selectedCompare.length>=3){ch.checked=false;showToast('You can compare up to three colleges.');return}selectedCompare=ch.checked?[...selectedCompare,ch.value]:selectedCompare.filter(x=>x!==ch.value);renderCompareTable()}));renderCompareTable()}
function renderCompareTable(){const chosen=allColleges().filter(c=>selectedCompare.includes(c.id));if(!chosen.length){document.getElementById('comparisonTable').innerHTML='<div class="empty-state"><span>⇄</span><h3>Select colleges to compare</h3><p>Choose up to three schools from your saved list.</p></div>';return}const rows=[['School type',c=>c.type],['Location',c=>c.location||'Not entered'],['GPA information',c=>c.gpa||'Not provided'],['SAT information',c=>c.sat||'Not provided'],['ACT information',c=>c.act||'Not provided'],['Testing policy',c=>c.testing||'Not provided'],['Application deadline',c=>c.deadline||'Not provided'],['Tuition',c=>c.tuition||'Not provided'],['Course requirements',c=>c.courses||'Not provided'],['Application requirements',c=>c.requirements||'Not provided'],['Admissions notes',c=>c.demo?'Illustrative sample only':c.notes||'Not provided'],['Official website',c=>c.url?'Available':'Not entered']];document.getElementById('comparisonTable').innerHTML=`<table class="comparison-table"><thead><tr><th>DETAIL</th>${chosen.map(c=>`<th>${escapeHTML(c.name)}</th>`).join('')}</tr></thead><tbody>${rows.map(([label,fn])=>`<tr><td>${label}</td>${chosen.map(c=>`<td>${escapeHTML(fn(c))}</td>`).join('')}</tr>`).join('')}</tbody></table>`}
function renderRoadmap(){const done=defaultRoadmap.filter(x=>state.roadmap[x.id]).length;const pct=Math.round(done/defaultRoadmap.length*100);document.getElementById('roadmapPercent').textContent=pct+'% complete';document.getElementById('roadmapBar').style.width=pct+'%';document.getElementById('roadmapList').innerHTML=defaultRoadmap.map(x=>`<label class="roadmap-item ${state.roadmap[x.id]?'done':''}"><input type="checkbox" data-roadmap="${x.id}" ${state.roadmap[x.id]?'checked':''}><span><strong>${x.title}</strong><p>${x.desc}</p></span></label>`).join('');document.querySelectorAll('[data-roadmap]').forEach(ch=>ch.addEventListener('change',()=>{state.roadmap[ch.dataset.roadmap]=ch.checked;persist()}))}
const collegeDialog=document.getElementById('collegeDialog');document.getElementById('addCollegeOpen').addEventListener('click',()=>collegeDialog.showModal());['closeCollegeDialog','cancelCollege'].forEach(id=>document.getElementById(id).addEventListener('click',()=>collegeDialog.close()));
document.getElementById('collegeForm').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const c={id:'custom-'+Date.now(),name:String(fd.get('name')).trim(),location:String(fd.get('location')).trim(),type:String(fd.get('type')),url:String(fd.get('url')).trim(),gpa:String(fd.get('gpa')).trim(),sat:String(fd.get('sat')).trim(),act:String(fd.get('act')).trim(),testing:String(fd.get('testing')).trim(),deadline:String(fd.get('deadline')).trim(),tuition:String(fd.get('tuition')).trim(),checked:String(fd.get('checked')).trim(),courses:String(fd.get('courses')).trim(),requirements:String(fd.get('requirements')).trim(),notes:String(fd.get('notes')).trim(),demo:false};if(c.url&&!/^https?:\/\//i.test(c.url)){showToast('Please enter a complete website address beginning with https://');return}state.colleges.push(c);e.currentTarget.reset();collegeDialog.close();persist();showToast('College added to your workspace.');});
function renderAll(){renderHome();renderProfile();if(activePage==='explore')renderColleges();if(activePage==='matches')renderMatches();if(activePage==='compare')renderCompare();if(activePage==='roadmap')renderRoadmap();if(activePage==='tracker')renderDeadlines()}
document.getElementById('deadlineForm').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const item={id:'deadline-'+Date.now(),title:String(fd.get('title')).trim(),date:String(fd.get('date')),kind:String(fd.get('kind')),url:String(fd.get('url')).trim()};if(item.url&&!/^https?:\/\//i.test(item.url)){showToast('Please enter a complete website address beginning with https://');return}state.deadlines.push(item);e.currentTarget.reset();persist();showToast('Deadline added to your tracker.')});
function renderDeadlines(){const sorted=[...state.deadlines].sort((a,b)=>a.date.localeCompare(b.date));const el=document.getElementById('deadlineList');if(!sorted.length){el.innerHTML='<div class="empty-state"><span>▣</span><h3>No deadlines added yet</h3><p>Add an application, scholarship, or financial-aid deadline above.</p></div>';return}el.innerHTML=sorted.map(d=>{const dt=new Date(d.date+'T12:00:00');const pretty=Number.isNaN(dt.getTime())?d.date:dt.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});return `<article class="deadline-item"><div class="deadline-date"><strong>${escapeHTML(pretty.split(' ')[1]||'')}</strong><span>${escapeHTML(pretty.split(' ')[0]||'')}</span></div><div class="deadline-info"><strong>${escapeHTML(d.title)}</strong><p>${escapeHTML(d.kind)}${d.url?' · <a href="'+escapeHTML(d.url)+'" target="_blank" rel="noopener noreferrer">Official source ↗</a>':''}</p></div><button class="small-button" data-delete-deadline="${escapeHTML(d.id)}">Remove</button></article>`}).join('');document.querySelectorAll('[data-delete-deadline]').forEach(b=>b.addEventListener('click',()=>{state.deadlines=state.deadlines.filter(x=>x.id!==b.dataset.deleteDeadline);persist()}))}
renderAll();
loadSheetColleges();
