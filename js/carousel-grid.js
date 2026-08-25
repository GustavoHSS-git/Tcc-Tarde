(function(){
  function initCarousel(grid){
    if(!grid || grid.dataset.carouselInitialized) return;
    const cards = Array.from(grid.querySelectorAll('.series-card'));
    if(cards.length === 0) return;

    // Cria a track (trilho horizontal) e insere os cards dentro dela
    const track = document.createElement('div');
    track.className = 'carousel-track';
    cards.forEach(c => track.appendChild(c));

    // Limpa o container original e adiciona a track
    grid.innerHTML = '';
    grid.appendChild(track);

    // Botões de navegação lateral (< e >)
    const prev = document.createElement('button');
    prev.className = 'carousel-control carousel-prev';
    prev.setAttribute('aria-label','Anterior');
    prev.innerHTML = '&#8249;';

    const next = document.createElement('button');
    next.className = 'carousel-control carousel-next';
    next.setAttribute('aria-label','Próximo');
    next.innerHTML = '&#8250;';

    grid.appendChild(prev);
    grid.appendChild(next);

    const intervalMs = parseInt(grid.dataset.interval) || 3500;
    let index = 0;

    const slideCount = () => track.children.length;

    function calcCardWidth(){
      const firstChild = track.children[0];
      if(!firstChild) return 0;
      const style = window.getComputedStyle(track);
      const gapVal = style.gap || style.gridColumnGap || '20px';
      const gap = parseFloat(gapVal) || 20;
      return firstChild.getBoundingClientRect().width + gap;
    }

    function update(){
      const cardW = calcCardWidth();
      track.style.transition = track.dataset.dragging ? 'none' : 'transform 0.6s ease-in-out';
      track.style.transform = `translateX(-${index * cardW}px)`;
    }

    // Avança para a DIREITA
    function nextSlide(){ 
      if (slideCount() === 0) return;
      index = (index + 1) % slideCount(); 
      update(); 
    }
    
    // Recua para a ESQUERDA
    function prevSlide(){ 
      if (slideCount() === 0) return;
      index = (index - 1 + slideCount()) % slideCount(); 
      update(); 
    }

    next.addEventListener('click', ()=>{ nextSlide(); resetAuto(); });
    prev.addEventListener('click', ()=>{ prevSlide(); resetAuto(); });

    // Rotação automática suave para a direita
    let auto = setInterval(nextSlide, intervalMs);
    
    function resetAuto(){ 
      clearInterval(auto); 
      auto = setInterval(nextSlide, intervalMs); 
    }

    // Pausa a animação automática ao passar o cursor por cima
    grid.addEventListener('mouseenter', ()=> clearInterval(auto));
    grid.addEventListener('mouseleave', ()=> resetAuto());

    // Suporte para touch / arrastar com rato
    let pointerDown = false;
    let startX = 0;
    let moved = 0;

    track.addEventListener('pointerdown', function(e){
      pointerDown = true;
      startX = e.clientX;
      moved = 0;
      track.dataset.dragging = '1';
      track.setPointerCapture(e.pointerId);
    });

    track.addEventListener('pointermove', function(e){
      if(!pointerDown) return;
      const dx = e.clientX - startX;
      moved = dx;
      const cardW = calcCardWidth();
      track.style.transition = 'none';
      track.style.transform = `translateX(-${index * cardW - dx}px)`;
    });

    track.addEventListener('pointerup', function(e){
      if(!pointerDown) return;
      pointerDown = false;
      track.dataset.dragging = '';
      const threshold = 40; // Limiar de movimento
      if(moved > threshold) { prevSlide(); }
      else if(moved < -threshold) { nextSlide(); }
      else { update(); }
      resetAuto();
    });

    track.addEventListener('pointercancel', function(){
      pointerDown = false;
      track.dataset.dragging = '';
      update();
      resetAuto();
    });

    window.addEventListener('resize', ()=> requestAnimationFrame(update));

    const mo = new MutationObserver(()=>{ update(); });
    mo.observe(track, { childList: true });

    grid.dataset.carouselInitialized = '1';
    requestAnimationFrame(update);
  }

  function observeGrid(grid){
    const mo = new MutationObserver(()=>{ initCarousel(grid); });
    mo.observe(grid, { childList: true, subtree: true });
    initCarousel(grid);
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const grids = Array.from(document.querySelectorAll('.carousel-grid'));
    grids.forEach(observeGrid);
  });
})();