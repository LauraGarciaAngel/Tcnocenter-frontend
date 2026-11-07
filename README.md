# Tcnocenter E-commerce

Sitio web de Tcnocenter, una tienda de tecnología orientada a ofrecer una experiencia de compra clara y accesible. El proyecto está construido con HTML, CSS y JavaScript, y se encuentra en desarrollo.

## Páginas

- **Inicio** — presentación y acceso a los productos.
- **Catálogo** — exploración de celulares.
- **Contáctanos** — información y formulario de contacto.
- **Acerca de nosotros** — información sobre Tcnocenter.
- **Garantía** — página informativa en construcción.
- **Admin Page** https://lauragarciaangel.github.io/Tcnocenter-frontend/admin_productos.html o Dandole click al icono de User de la navbar

## Tecnologías

- HTML5, CSS3 y JavaScript.
- Bootstrap y Bootstrap Icons.
- Lucide para iconografía.
- Google Fonts: Audiowide, Inter y Josefin Sans.

## Estructura del proyecto

```text
.
├── index.html                 # Redirige a la página de inicio
├── package.json               # Dependencias del proyecto
├── src/
│   ├── assets/images/          # Logos, imágenes y recursos gráficos
│   ├── components/             # Componentes reutilizables de navegación y pie
│   ├── css/                    # Hojas de estilo
│   ├── html/                   # Páginas del sitio
│   └── js/                     # Scripts e interacciones
└── .github/workflows/
    └── deploy.yml              # Despliegue automático en GitHub Pages
```

### Componentes y scripts

- `src/components/navbar.html` y `src/components/footer.html` contienen la navegación y el pie de página reutilizables.
- `src/js/navbar-footer.js` carga esos componentes en las páginas que contienen `data-component`.
- `src/js/catalogo.js`, `src/js/Carrusel-categorias.js` y `src/js/contacto.js` implementan interacciones específicas.
- `src/css/main.css` contiene los estilos generales; `src/css/catalogo.css` incluye estilos del catálogo.

## Despliegue

El flujo de GitHub Actions de `.github/workflows/deploy.yml` publica el contenido del repositorio en GitHub Pages al hacer push a la rama `main`. También se puede iniciar manualmente desde la pestaña **Actions**.

Sitio publicado: <https://lauragarciaangel.github.io/Tcnocenter-frontend/>

## Equipo de desarrollo

Integrantes organizados alfabéticamente por nombre:

- Ana Cristina Lizarazo Páez
- Camilo Andres Ospina
- Jhoiner Andretty
- Juan Andres Bohórquez Acevedo
- Laura García Ángel
