// ============================================================================
// admin_dashboard.js — Vista Principal del Dashboard Administrativo TCNOCENTER
// Gestiona filtros rápidos de pedidos, actualización de métricas, exportación CSV
// y el resumen interactivo de detalle de pedido.
// ============================================================================

function initDashboardView() {
  const filterButtons = document.querySelectorAll('[data-order-filter]');
  const tableBody = document.getElementById('recentOrdersBody');
  const emptyRow = document.getElementById('ordersEmptyRow');
  const countBadge = document.getElementById('ordersCountBadge');
  const refreshBtn = document.getElementById('btnRefreshDash');
  const exportBtn = document.getElementById('btnExportCsv');
  const lastUpdatedEl = document.getElementById('dashLastUpdated');

  // Referencias del diálogo de detalle de pedido
  const orderDialog = document.getElementById('orderDetailDialog');
  const dialogTitle = document.getElementById('orderDialogTitle');
  const dialogName = document.getElementById('dialogCustomerName');
  const dialogEmail = document.getElementById('dialogCustomerEmail');
  const dialogDate = document.getElementById('dialogOrderDate');
  const dialogAmount = document.getElementById('dialogOrderAmount');
  const dialogStatus = document.getElementById('dialogOrderStatus');
  const closeDialogBtns = document.querySelectorAll('[data-close-dialog]');

  // 1. Inicializar Tooltips nativos de Bootstrap 5 (si el bundle JS está disponible)
  if (typeof window.bootstrap !== 'undefined' && window.bootstrap.Tooltip) {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((triggerEl) => {
      new window.bootstrap.Tooltip(triggerEl);
    });
  }

  // 2. Filtrado rápido de la tabla de Pedidos Recientes (Todos, Pendientes, Completados)
  if (tableBody && filterButtons.length > 0) {
    const orderRows = Array.from(tableBody.querySelectorAll('tr[data-status]'));

    const applyOrderFilter = (selectedStatus) => {
      let visibleCount = 0;

      orderRows.forEach((row) => {
        const matches = selectedStatus === 'all' || row.dataset.status === selectedStatus;
        row.hidden = !matches;
        if (matches) visibleCount += 1;
      });

      if (emptyRow) {
        emptyRow.hidden = visibleCount > 0;
      }

      if (countBadge) {
        countBadge.textContent = `${visibleCount} ${visibleCount === 1 ? 'pedido' : 'pedidos'}`;
      }
    };

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filterValue = btn.dataset.orderFilter;

        filterButtons.forEach((item) => {
          const isCurrent = item === btn;
          item.classList.toggle('is-active', isCurrent);
          item.setAttribute('aria-pressed', String(isCurrent));
        });

        applyOrderFilter(filterValue);
      });
    });
  }

  // 3. Botón "Actualizar datos": refresca marca de tiempo con feedback visual suave
  if (refreshBtn && lastUpdatedEl) {
    refreshBtn.addEventListener('click', () => {
      refreshBtn.classList.add('is-refreshing');
      refreshBtn.disabled = true;

      window.setTimeout(() => {
        const now = new Date();
        const formattedTime = new Intl.DateTimeFormat('es-CO', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }).format(now);

        lastUpdatedEl.setAttribute('datetime', now.toISOString());
        lastUpdatedEl.textContent = `Hoy, ${formattedTime}`;

        refreshBtn.classList.remove('is-refreshing');
        refreshBtn.disabled = false;
      }, 450);
    });
  }

  // 4. Botón "Descargar reporte": exporta los pedidos visibles a un CSV real
  if (exportBtn && tableBody) {
    exportBtn.addEventListener('click', () => {
      const visibleRows = Array.from(tableBody.querySelectorAll('tr[data-status]'))
        .filter((row) => !row.hidden);

      const headers = ['ID Pedido', 'Cliente', 'Correo', 'Fecha y hora', 'Total', 'Estado'];
      const csvLines = [headers.join(',')];

      visibleRows.forEach((row) => {
        const id = row.querySelector('.tc-orders-table__id')?.textContent.trim() || '';
        const name = row.querySelector('.tc-customer__name')?.textContent.trim() || '';
        const email = row.querySelector('.tc-customer__email')?.textContent.trim() || '';
        const date = row.querySelector('time')?.textContent.trim() || '';
        const total = row.querySelector('.tc-orders-table__amount')?.textContent.trim() || '';
        const status = row.querySelector('.tc-status-badge')?.textContent.trim() || '';

        const escaped = [id, name, email, date, total, status]
          .map((cell) => `"${cell.replace(/"/g, '""')}"`);
        csvLines.push(escaped.join(','));
      });

      const blob = new Blob(['\uFEFF' + csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'reporte-pedidos-tcnocenter.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    });
  }

  // 5. Acción "Ver detalle" en cada fila mediante elemento semántico <dialog>
  if (tableBody && orderDialog) {
    tableBody.addEventListener('click', (event) => {
      const detailBtn = event.target.closest('.tc-action-btn');
      if (!detailBtn) return;

      const row = detailBtn.closest('tr');
      if (!row) return;

      const id = row.querySelector('.tc-orders-table__id')?.textContent.trim() || '';
      const name = row.querySelector('.tc-customer__name')?.textContent.trim() || '';
      const email = row.querySelector('.tc-customer__email')?.textContent.trim() || '';
      const date = row.querySelector('time')?.textContent.trim() || '';
      const amount = row.querySelector('.tc-orders-table__amount')?.textContent.trim() || '';
      const badgeEl = row.querySelector('.tc-status-badge');

      if (dialogTitle) dialogTitle.textContent = id;
      if (dialogName) dialogName.textContent = name;
      if (dialogEmail) dialogEmail.textContent = email;
      if (dialogDate) dialogDate.textContent = date;
      if (dialogAmount) dialogAmount.textContent = amount;
      if (dialogStatus && badgeEl) {
        dialogStatus.innerHTML = badgeEl.outerHTML;
      }

      if (typeof orderDialog.showModal === 'function') {
        orderDialog.showModal();
      } else {
        orderDialog.setAttribute('open', '');
      }
    });

    closeDialogBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (typeof orderDialog.close === 'function') {
          orderDialog.close();
        } else {
          orderDialog.removeAttribute('open');
        }
      });
    });

    // Cerrar al hacer clic en el backdrop del <dialog>
    orderDialog.addEventListener('click', (event) => {
      const rect = orderDialog.getBoundingClientRect();
      const clickedOutside =
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom;

      if (clickedOutside && typeof orderDialog.close === 'function') {
        orderDialog.close();
      }
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboardView);
} else {
  initDashboardView();
}

