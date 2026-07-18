const products={
travertine:{id:"travertine",code:"HT-TRV-6012-WG",title:"Warm Travertine",image:"assets/tile-travertine.jpg",color:"Warm Greige",size:"600 × 1200 mm",thickness:"9 mm",finish:"Textured / Low Sheen",use:["Floor","Wall","Interior"],description:"自然な層と穏やかな石目を表現した、大判のトラバーチン調タイル。光をやわらかく受け止め、空間に静かな奥行きをつくります。",spaceId:"quiet"},
deepstone:{id:"deepstone",code:"HT-DST-6060-CH",title:"Deep Stone",image:"assets/tile-deep-stone.jpg",color:"Charcoal",size:"600 × 600 mm",thickness:"10 mm",finish:"Rough / Matt",use:["Floor","Wall","Interior"],description:"細かな粒子と低彩度の濃淡を重ねた、チャコールの石目調タイル。落ち着いた陰影でラウンジやホテル空間を引き締めます。",spaceId:"stillness"},
clay:{id:"clay",code:"HT-CCL-0730-SB",title:"Craft Clay",image:"assets/tile-craft-clay.jpg",color:"Sand Beige",size:"75 × 300 mm",thickness:"8.5 mm",finish:"Handcrafted / Soft Glaze",use:["Wall","Interior"],description:"手仕事の揺らぎと土の粒子感を残した、サンドベージュのクラフトタイル。穏やかな艶が壁面に繊細な表情を与えます。",spaceId:"earthen"},
limestone:{id:"limestone",code:"HT-LST-1212-PG",title:"Soft Limestone",image:"assets/tile-soft-limestone.jpg",color:"Pale Greige",size:"1200 × 1200 mm",thickness:"9 mm",finish:"Fine Textured / Matt",use:["Floor","Wall","Interior"],description:"微細な化石の気配と石灰岩の粒子を静かに再現した、淡いグレージュの大判タイル。素材同士を自然につなぎます。",spaceId:"focus"}
};

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
dialog.dataset.productId=p.id;
dialog.querySelector('img').src=p.image;
dialog.querySelector('img').alt=p.title;
dialog.querySelector('#dialog-title').textContent=p.title;
dialog.querySelector('.product-code').textContent=p.code;
dialog.querySelector('.dialog-subtitle').textContent=p.description;
dialog.querySelector('.product-size').textContent=p.size;
dialog.querySelector('.product-thickness').textContent=p.thickness;
dialog.querySelector('.product-finish').textContent=p.finish;
dialog.querySelector('.product-color').textContent=p.color;
dialog.querySelector('.product-use').textContent=p.use.join(' / ');
updateFavoriteButton(p.id);
dialog.showModal()}document.querySelectorAll('[data-product]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();
openProduct(el.dataset.product)}));
dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.querySelector('.dialog-sample').addEventListener('click',()=>{
  document.querySelector('input[name="consultation"][value="商品・サンプル"]').checked=true;
  dialog.close();
  document.dispatchEvent(new CustomEvent('close-project'));
});
dialog.querySelector('.dialog-space-link').addEventListener('click',()=>{
  const product=products[dialog.dataset.productId]||products.travertine;
  dialog.close();
  document.dispatchEvent(new CustomEvent('open-project',{detail:{projectId:product.spaceId}}));
});
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});

const FAVORITES_STORAGE_KEY="tiles-space-favorites";
function readFavorites(){
  try{
    const stored=JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)||'[]');
    return new Set(Array.isArray(stored)?stored.filter(productId=>products[productId]):[]);
  }catch(error){
    console.warn('お気に入りデータを初期化しました。',error);
    return new Set();
  }
}
function updateFavoriteButton(productId){
  const favoriteButton=dialog.querySelector('.product-favorite');
  const isFavorite=readFavorites().has(productId);
  favoriteButton.setAttribute('aria-pressed',String(isFavorite));
  favoriteButton.innerHTML=isFavorite?'お気に入り済み <span>★</span>':'お気に入りに追加 <span>☆</span>';
}
function updateFavoriteCounts(favorites=readFavorites()){
  const count=favorites.size;
  document.querySelectorAll('.favorite-nav-count').forEach(element=>{
    element.textContent=String(count);
    element.setAttribute('aria-label',`お気に入り${count}件`);
  });
  document.querySelector('.favorites-count').textContent=String(count);
  document.querySelector('.favorites-count-copy').textContent=`${count}件のお気に入り`;
}
function writeFavorites(favorites){
  try{
    localStorage.setItem(FAVORITES_STORAGE_KEY,JSON.stringify([...favorites]));
    updateFavoriteCounts(favorites);
    renderFavorites(favorites);
  }catch(error){
    console.warn('お気に入りを保存できませんでした。',error);
  }
}
dialog.querySelector('.product-favorite').addEventListener('click',()=>{
  const productId=dialog.dataset.productId;
  const favorites=readFavorites();
  if(favorites.has(productId))favorites.delete(productId);else favorites.add(productId);
  writeFavorites(favorites);
  updateFavoriteButton(productId);
});

const favoritesView=document.querySelector('.favorites-view');
const favoritesGrid=favoritesView.querySelector('.favorites-grid');
const favoritesEmpty=favoritesView.querySelector('.favorites-empty');

function createFavoriteCard(product){
  const card=document.createElement('article');
  card.className='favorite-card';
  card.dataset.favoriteProduct=product.id;
  card.innerHTML=`<div class="favorite-card-image"><img src="${product.image}" alt="${product.title}の表面"></div><div class="favorite-card-content"><p class="favorite-card-label">SAVED MATERIAL</p><h2>${product.title}</h2><p class="favorite-card-code">${product.code}</p><dl><div><dt>COLOR</dt><dd>${product.color}</dd></div><div><dt>SIZE</dt><dd>${product.size}</dd></div><div><dt>FINISH</dt><dd>${product.finish}</dd></div><div><dt>USE</dt><dd>${product.use.join(' / ')}</dd></div></dl><div class="favorite-card-actions"><button type="button" data-favorite-action="detail">製品詳細を見る <span>→</span></button><button type="button" data-favorite-action="sample">サンプルを請求する <span>→</span></button><button type="button" data-favorite-action="remove">お気に入りを解除 <span>×</span></button></div></div>`;
  return card;
}

function renderFavorites(favorites=readFavorites()){
  const favoriteProducts=[...favorites].map(productId=>products[productId]).filter(Boolean);
  favoritesGrid.replaceChildren(...favoriteProducts.map(createFavoriteCard));
  favoritesGrid.hidden=favoriteProducts.length===0;
  favoritesEmpty.hidden=favoriteProducts.length!==0;
  updateFavoriteCounts(new Set(favoriteProducts.map(product=>product.id)));
}

function openFavorites(){
  document.dispatchEvent(new CustomEvent('close-project'));
  mobileMenu.classList.remove('open');
  menuBtn.setAttribute('aria-expanded','false');
  mobileMenu.setAttribute('aria-hidden','true');
  renderFavorites();
  favoritesView.classList.add('open');
  favoritesView.setAttribute('aria-hidden','false');
  document.body.classList.add('favorites-open');
  favoritesView.querySelector('.favorites-back').focus();
}

function closeFavorites({restoreUrl=true}={}){
  favoritesView.classList.remove('open');
  favoritesView.setAttribute('aria-hidden','true');
  document.body.classList.remove('favorites-open');
  if(restoreUrl&&location.hash==='#favorites')history.pushState(null,'',location.pathname+location.search);
}

function openSampleRequest(product){
  document.querySelector('input[name="consultation"][value="商品・サンプル"]').checked=true;
  const messageField=consultForm.elements.message;
  if(!messageField.value.trim())messageField.value=`${product.title}（${product.code}）のサンプルを希望します。`;
  closeFavorites({restoreUrl:false});
  history.pushState(null,'','#contact');
  document.querySelector('#contact').scrollIntoView({behavior:'smooth'});
}

document.querySelectorAll('[data-open-favorites]').forEach(link=>link.addEventListener('click',event=>{
  event.preventDefault();
  if(location.hash!=='#favorites')history.pushState(null,'','#favorites');
  openFavorites();
}));
favoritesView.querySelector('.favorites-back').addEventListener('click',()=>closeFavorites());
favoritesView.querySelector('.favorites-browse').addEventListener('click',()=>{
  closeFavorites({restoreUrl:false});
  history.pushState(null,'','#tiles');
  document.querySelector('#tiles').scrollIntoView({behavior:'smooth'});
});
favoritesView.querySelector('.favorites-consult').addEventListener('click',()=>closeFavorites({restoreUrl:false}));
favoritesGrid.addEventListener('click',event=>{
  const actionButton=event.target.closest('[data-favorite-action]');
  const card=event.target.closest('[data-favorite-product]');
  if(!actionButton||!card)return;
  const product=products[card.dataset.favoriteProduct];
  if(!product)return;
  if(actionButton.dataset.favoriteAction==='detail')openProduct(product.id);
  if(actionButton.dataset.favoriteAction==='sample')openSampleRequest(product);
  if(actionButton.dataset.favoriteAction==='remove'){
    const favorites=readFavorites();
    favorites.delete(product.id);
    writeFavorites(favorites);
    if(dialog.dataset.productId===product.id)updateFavoriteButton(product.id);
  }
});
addEventListener('popstate',()=>location.hash==='#favorites'?openFavorites():closeFavorites({restoreUrl:false}));
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&favoritesView.classList.contains('open')&&!dialog.open)closeFavorites();
});
renderFavorites();
if(location.hash==='#favorites')openFavorites();

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
