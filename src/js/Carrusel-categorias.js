const carousel = document.querySelector('.categorias-carousel');

if (carousel) {
    const lista = carousel.querySelector('.lista-categorias');
    const btnPrev = carousel.querySelector('.carousel-btn-prev');
    const btnNext = carousel.querySelector('.carousel-btn-next');

    // Desplazamiento hacia la izquierda
    btnPrev.addEventListener('click', () => {
        lista.scrollBy({
            left: -300,
            behavior: 'smooth'
        });
    });

    // Desplazamiento hacia la derecha
    btnNext.addEventListener('click', () => {
        lista.scrollBy({
            left: 300,
            behavior: 'smooth'
        });
    });
}