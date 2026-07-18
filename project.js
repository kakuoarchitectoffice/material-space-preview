const projectData={quiet:{title:'Quiet Residence',type:'RESIDENCE / KYOTO',use:'住宅',place:'京都',image:'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1900&q=90'},stillness:{title:'Stillness Hotel',type:'HOSPITALITY / HAKONE',use:'ホテル',place:'箱根',image:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1900&q=90'},earthen:{title:'Earthen Gallery',type:'RETAIL / TOKYO',use:'店舗・ギャラリー',place:'東京',image:'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1900&q=90'},focus:{title:'Soft Focus Office',type:'WORKSPACE / OSAKA',use:'オフィス',place:'大阪',image:'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1900&q=90'}};

const projectView=document.querySelector('.project-view');

function openProject(projectId){const p=projectData[projectId]||projectData.quiet;
projectView.querySelector('.project-title').textContent=p.title;
projectView.querySelector('.project-type').textContent=p.type;
projectView.querySelector('.info-use').textContent=p.use;
projectView.querySelector('.info-place').textContent=p.place;
projectView.querySelector('.project-photo').src=p.image;
setProjectTab('photos');
projectView.classList.add('open');
projectView.setAttribute('aria-hidden','false');
document.body.classList.add('project-open')}

function setProjectTab(name){document.querySelectorAll('.project-tabs button').forEach(b=>{
const isActive=b.dataset.tab===name;
b.classList.toggle('active',isActive);
b.setAttribute('aria-selected',String(isActive))});
document.querySelectorAll('.project-panel').forEach(p=>p.classList.toggle('active',p.dataset.panel===name))}
document.querySelectorAll('[data-project]').forEach(button=>button.addEventListener('click',()=>openProject(button.dataset.project)));
document.addEventListener('open-project',event=>openProject(event.detail?.projectId));

projectView.querySelector('.project-back').addEventListener('click',()=>{projectView.classList.remove('open');
projectView.setAttribute('aria-hidden','true');
document.body.classList.remove('project-open')});

document.querySelectorAll('.project-tabs button').forEach(b=>b.addEventListener('click',()=>setProjectTab(b.dataset.tab)));

document.querySelectorAll('.thumbnail-rail button').forEach(button=>button.addEventListener('click',()=>{document.querySelector('.thumbnail-rail .active').classList.remove('active');
button.classList.add('active');
projectView.querySelector('.project-photo').src=button.dataset.src}));

const pinCard=projectView.querySelector('.pin-card');
document.querySelectorAll('.photo-pin').forEach(pin=>pin.addEventListener('click',e=>{e.stopPropagation();
pinCard.classList.toggle('show')}));
projectView.querySelector('.project-main-image').addEventListener('click',e=>{if(!e.target.closest('.pin-card')&&!e.target.closest('.photo-pin'))pinCard.classList.remove('show')});

function closeProject(){
  projectView.classList.remove('open');
  projectView.setAttribute('aria-hidden','true');
  document.body.classList.remove('project-open');
  pinCard.classList.remove('show');
}

document.addEventListener('close-project',closeProject);
projectView.querySelector('.project-consult').addEventListener('click',closeProject);
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&projectView.classList.contains('open'))closeProject();
});
