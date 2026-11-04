//* CARRUSEL DE CATEGORÍAS
const categoriasCarousel = document.querySelector('.categorias-carousel');

if (categoriasCarousel) {
    const lista = categoriasCarousel.querySelector('.lista-categorias');
    const btnPrev = categoriasCarousel.querySelector('.carousel-btn-prev');
    const btnNext = categoriasCarousel.querySelector('.carousel-btn-next');

    btnPrev?.addEventListener('click', () => {
        lista.scrollBy({
            left: -300,
            behavior: 'smooth'
        });
    });

    btnNext?.addEventListener('click', () => {
        lista.scrollBy({
            left: 300,
            behavior: 'smooth'
        });
    });
}


//* CARRUSEL DE PRODUCTOS MÁS VENDIDOS
document.addEventListener('DOMContentLoaded', async () => {
    const carousel = document.querySelector('.productos-destacados');

    if (!carousel) return;

    const lista = carousel.querySelector('[data-best-sellers]');
    const btnPrev = carousel.querySelector('[data-carousel-prev]');
    const btnNext = carousel.querySelector('[data-carousel-next]');
    const mensajeVacio = carousel.querySelector('[data-carousel-empty]');

    if (!lista) return;

    try {
        // Verificar que los datos y la función estén disponibles
        if (!window.catalogProducts || !window.createProductCard) {
            throw new Error('No se encontraron los datos o la función de tarjetas.');
        }

        // Cargar la plantilla de tarjetas
        const componentUrl = new URL(
            '../components/product-card.html',
            window.location.href
        );

        const response = await fetch(componentUrl);

        if (!response.ok) {
            throw new Error('No se pudo cargar la plantilla de productos.');
        }

        const componentHTML = await response.text();

        const componentDocument = new DOMParser().parseFromString(
            componentHTML,
            'text/html'
        );

        const productTemplate = componentDocument.querySelector(
            '#tcno-product-card-template'
        );

        if (!productTemplate) {
            throw new Error('No se encontró la plantilla de tarjetas.');
        }

        // Ordenar los productos por cantidad de ventas y seleccionar los cinco primeros
        const bestSellers = [...window.catalogProducts]
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 10);

        // Crear las tarjetas utilizando la función del catálogo
        const productCards = bestSellers.map(product =>
            window.createProductCard(product, productTemplate)
        );

        // Mostrar las tarjetas
        lista.replaceChildren(...productCards);

        if (mensajeVacio) {
            mensajeVacio.hidden = bestSellers.length > 0;
        }

    } catch (error) {
        console.error('Error al cargar los productos destacados:', error);

        if (mensajeVacio) {
            mensajeVacio.hidden = false;
        }
    }

    // Botón para avanzar
    btnNext?.addEventListener('click', () => {
        lista.scrollBy({
            left: 300,
            behavior: 'smooth'
        });
    });

    // Botón para retroceder
    btnPrev?.addEventListener('click', () => {
        lista.scrollBy({
            left: -300,
            behavior: 'smooth'
        });
    });
});