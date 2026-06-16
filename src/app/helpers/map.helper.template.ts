export function officerIconHtml(initials: string, status: 'online' | 'offline' = 'online'): string {
  return `<div class="officer-marker officer-marker--${status}">${escapeHtml(initials)}</div>`;
}

export function officerPopupHtml(name: string, entity: string, online: boolean): string {
  const safeName = escapeHtml(name);
  const safeEntity = escapeHtml(entity);

  return `
    <div class="officer-popup">
      <strong>${safeName}</strong><br/>
      ${safeEntity ? `<span class="officer-popup-entity">${safeEntity}</span><br/>` : ''}
      <span class="officer-status ${online ? 'online' : 'offline'}">
        ${online ? '● En línea' : '● Sin conexión'}
      </span>
    </div>`;
}

function escapeHtml(value: string): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
