export function officerIconHtml(initials: string, status: 'online' | 'offline' = 'online'): string {
  return `<div class="officer-marker officer-marker--${status}">${initials}</div>`;
}

export function officerPopupHtml(name: string, entity: string, online: boolean): string {
  return `
    <div class="officer-popup">
      <strong>${name}</strong><br/>
      ${entity ? `<span class="officer-popup-entity">${entity}</span><br/>` : ''}
      <span class="officer-status ${online ? 'online' : 'offline'}">
        ${online ? '● En línea' : '● Sin conexión'}
      </span>
    </div>`;
}