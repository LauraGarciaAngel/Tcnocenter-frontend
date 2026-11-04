// Referencias al formulario y al contenedor donde se muestra el mensaje
  const form = document.querySelector('.form-card');
  const status = document.getElementById('form-status');

  // Guarda el temporizador que oculta el mensaje, para poder cancelarlo si hace falta
  let hideTimer;

  // Mensaje genérico en español
  const MENSAJE_GENERICO = 'No pudimos enviar tu mensaje. Inténtalo de nuevo o escríbenos por WhatsApp.';

  // Traducción de los códigos de error de Formspree (llegan en inglés)
  const ERRORES = {
    TYPE_EMAIL: 'El correo electrónico no es válido.',
    REQUIRED_FIELD_MISSING: 'Falta completar un campo obligatorio.',
    REQUIRED_FIELD_EMPTY: 'Hay un campo obligatorio vacío.',
    EMPTY: 'El formulario está vacío.',
    TYPE_NUMERIC: 'Un campo numérico tiene un valor no válido.',
    TYPE_TEXT: 'Un campo de texto tiene un valor no válido.',
    INACTIVE: 'El formulario no está disponible en este momento.',
    FORM_NOT_FOUND: 'El formulario no está disponible en este momento.',
    PAYLOAD_TOO_LARGE: 'El mensaje es demasiado largo.',
    BAD_METHOD: 'No se pudo enviar el formulario.'
  };

  // Nombres de los campos en español
  const CAMPOS = {
    nombre: 'Nombre completo',
    email: 'Correo electrónico',
    telefono: 'Teléfono',
    _subject: 'Asunto',
    mensaje: 'Mensaje'
  };

  // Convierte los errores de Formspree en un texto en español
  function traducirErrores(data) {
    if (!data.errors || !data.errors.length) return '';

    return data.errors
      .map((er) => {
        const texto = ERRORES[er.code];
        if (!texto) return '';
        const campo = CAMPOS[er.field];
        return campo ? `${campo}: ${texto}` : texto;
      })
      .filter(Boolean)
      .join(' ');
  }

  // Se ejecuta cuando el usuario envía el formulario
  form.addEventListener('submit', async (e) => {
    // Evita el envío normal, que redirigiría al usuario a otra página
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');

    // Cancela cualquier temporizador anterior y limpia el mensaje previo
    clearTimeout(hideTimer);
    status.textContent = '';
    status.className = '';

    // Deshabilita el botón mientras se envía, para evitar envíos duplicados
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
      // Envía los datos a Formspree sin salir de la página
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),                // Toma todos los campos del formulario
        headers: { Accept: 'application/json' }  // Pide respuesta JSON en vez de redirección
      });

      // Si Formspree responde con error, muestra el detalle en la consola y salta al catch
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error('Formspree respondió', res.status, JSON.stringify(data, null, 2));
        throw new Error(traducirErrores(data));
      }

      // Éxito: muestra la alerta verde
      status.className = 'is-success';
      status.textContent = '¡Gracias! Recibimos tu mensaje y te responderemos pronto.';

      // Limpia los campos del formulario
      form.reset();

      // Oculta el mensaje automáticamente a los 6 segundos
      hideTimer = setTimeout(() => {
        status.textContent = '';
        status.className = '';
      }, 6000);
    } catch (err) {
      // Error (de red o de Formspree): muestra la alerta roja
      // Los campos NO se limpian, para que el usuario pueda reintentar
      console.error('Error al enviar:', err);
      status.className = 'is-error';
      status.textContent = err.message
        ? `No pudimos enviar tu mensaje. ${err.message}`
        : MENSAJE_GENERICO;
    } finally {
      // Siempre, haya éxito o error, vuelve a habilitar el botón
      btn.disabled = false;
      btn.textContent = 'Enviar mensaje';
    }
  });


  
  // 2. Control interactivo de colapso para elementos con data-bs-toggle="collapse"
    const faqButtons = document.querySelectorAll(
    '#faqAccordion .accordion-button'
  );

  // 3. Control de colapso para el acordeón de preguntas frecuentes
  faqButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.querySelector(
        button.getAttribute("data-bs-target"),
      );

      const isOpen = target.classList.contains("show");

      document
        .querySelectorAll("#faqAccordion .accordion-collapse.show")
        .forEach((panel) => {
          panel.classList.remove("show");
        });

      document
        .querySelectorAll("#faqAccordion .accordion-button")
        .forEach((item) => {
          item.classList.add("collapsed");
          item.setAttribute("aria-expanded", "false");
        });

      if (!isOpen) {
        target.classList.add("show");
        button.classList.remove("collapsed");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });