export function officerIconHtml(initials: string): string {
    return `<div class="officer-marker">${initials}</div>`;
  }
  
  export function officerPopupHtml(name: string, entity: string, online: boolean): string {
    return `
      <strong>${name}</strong><br/>
      ${entity}<br/>
      <span class="officer-status ${online ? 'online' : 'offline'}">
        ${online ? '● En línea' : '● Desconectado'}
      </span>`;
  }