const products={travertine:{title:"Warm Travertine",subtitle:"自然の層を感じる、穏やかな石目。",size:"600 × 1200 mm",finish:"Textured / Low sheen",color:"Warm greige",image:"https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=90"},deepstone:{title:"Deep Stone",subtitle:"光を静かに受け止める、深い陰影。",size:"600 × 600 mm",finish:"Rough / Matt",color:"Charcoal",image:"https://images.unsplash.com/photo-1595514535116-de546c6f2f7f?auto=format&fit=crop&w=1200&q=90"},clay:{title:"Craft Clay",subtitle:"手仕事の揺らぎを残した土の表情。",size:"75 × 300 mm",finish:"Handcrafted / Glazed",color:"Sand beige",image:"https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=90"},limestone:{title:"Soft Limestone",subtitle:"空間に溶け込む、静かなグレージュ。",size:"1200 × 1200 mm",finish:"Fine textured / Matt",color:"Pale greige",image:"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=90"}};

const header=document.querySelector('.site-header');
addEventListener('scroll',()=>header.classList.toggle('scrolled',scrollY>30),{passive:true});

const menuBtn=document.querySelector('.menu-button'),mobileMenu=document.querySelector('.mobile-menu');
menuBtn.addEventListener('click',()=>{const open=mobileMenu.classList.toggle('open');
menuBtn.setAttribute('aria-expanded',open);
mobileMenu.setAttribute('aria-hidden',!open)});
mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mobileMenu.classList.remove('open');
menuBtn.setAttribute('aria-expanded','false');
mobileMenu.setAttribute('aria-hidden','true')}));

document.querySelectorAll('.filters button').forEach(btn=>btn.addEventListener('click',()=>{document.querySelector('.filters .active').classList.remove('active');
btn.classList.add('active');
const filter=btn.dataset.filter;
document.querySelectorAll('.space-card').forEach(card=>card.classList.toggle('hidden',filter!=='all'&&card.dataset.category!==filter))}));

const dialog=document.querySelector('.product-dialog');
function openProduct(id){const p=products[id]||products.travertine;
dialog.querySelector('img').src=p.image;
dialog.querySelector('img').alt=p.title;
dialog.querySelector('#dialog-title').textContent=p.title;
dialog.querySelector('.dialog-subtitle').textContent=p.subtitle;
dialog.querySelector('.product-size').textContent=p.size;
dialog.querySelector('.product-finish').textContent=p.finish;
dialog.querySelector('.product-color').textContent=p.color;
dialog.showModal()}document.querySelectorAll('[data-product]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();
openProduct(el.dataset.product)}));
dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.querySelector('.dialog-consult').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});

const searchPanel=document.querySelector('.search-panel'),searchInput=searchPanel.querySelector('input');
document.querySelector('.search-button').addEventListener('click',()=>{searchPanel.classList.add('open');
searchPanel.setAttribute('aria-hidden','false');
setTimeout(()=>searchInput.focus(),450)});
document.querySelector('.search-close').addEventListener('click',()=>{searchPanel.classList.remove('open');
searchPanel.setAttribute('aria-hidden','true')});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&searchPanel.classList.contains('open')){searchPanel.classList.remove('open');
searchPanel.setAttribute('aria-hidden','true')}});
document.querySelectorAll('.search-suggestions button').forEach(b=>b.addEventListener('click',()=>searchInput.value=b.textContent));

const consultForm=document.querySelector('.consult-form');
const formReview=document.querySelector('.form-review');
const formError=consultForm.querySelector('.form-error');

function appendReviewItem(list,label,value){
  const wrapper=document.createElement('div');
  const term=document.createElement('dt');
  const description=document.createElement('dd');
  term.textContent=label;
  description.textContent=value;
  wrapper.append(term,description);
  list.append(wrapper);
}

function showFormReview(){
  if(!consultForm.checkValidity()){
    formError.textContent='必須項目とメールアドレスをご確認ください。';
    const invalidField=consultForm.querySelector(':invalid');
    if(invalidField)invalidField.focus();
    return false;
  }

  formError.textContent='';
  const reviewList=formReview.querySelector('dl');
  reviewList.replaceChildren();
  appendReviewItem(reviewList,'ご相談内容',consultForm.elements.consultation.value);
  appendReviewItem(reviewList,'お名前',consultForm.elements.name.value.trim());
  appendReviewItem(reviewList,'メールアドレス',consultForm.elements.email.value.trim());
  appendReviewItem(reviewList,'ご相談内容・用途',consultForm.elements.message.value.trim());
  consultForm.hidden=true;
  formReview.hidden=false;
  formReview.querySelector('.form-back').focus();
  return true;
}

consultForm.addEventListener('submit',event=>{
  event.preventDefault();
  showFormReview();
});

consultForm.querySelector('.form-confirm').addEventListener('click',event=>{
  event.preventDefault();
  showFormReview();
});

formReview.querySelector('.form-back').addEventListener('click',()=>{
  formReview.hidden=true;
  consultForm.hidden=false;
  consultForm.querySelector('[name="name"]').focus();
});
