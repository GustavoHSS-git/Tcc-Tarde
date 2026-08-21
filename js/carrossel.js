document.addEventListener('DOMContentLoaded', function () {
  const carousels = document.querySelectorAll('.custom-carousel');

  carousels.forEach((carousel) => {
    const items = Array.from(carousel.querySelectorAll('.item'));

    if (!items.length) return;

    items.forEach((item, index) => {
      item.setAttribute('tabindex', '0');

      // Adicionar interatividade ao clique
      item.addEventListener('click', () => {
        // Pode adicionar navegação ou outra ação aqui
        console.log(`Card ${index} clicado:`, item.querySelector('h3')?.textContent);
      });

      item.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          console.log(`Card ${index} ativado por teclado:`, item.querySelector('h3')?.textContent);
        }
      });
    });
  });
});