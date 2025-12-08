/**
 * Sistema de modales elegantes
 * Uso:
 *   const modal = new Modal()
 *   modal.alert('Mensaje', 'success' | 'error' | 'info')
 *   modal.prompt('Título', 'Placeholder', (value) => { ... })
 *   modal.show('Contenido HTML', [{ label: 'Btn', handler: () => {}, variant: 'primary' }])
 */
export class Modal {
  private overlay: HTMLDivElement
  private modal: HTMLDivElement

  constructor() {
    this.overlay = document.createElement('div')
    this.overlay.className = 'modal-overlay'
    this.modal = document.createElement('div')
    this.modal.className = 'modal'
    this.overlay.appendChild(this.modal)
    
    // Agregar estilos si no existen
    if (!document.getElementById('modal-styles')) {
      this.injectStyles()
    }
  }

  private injectStyles() {
    const style = document.createElement('style')
    style.id = 'modal-styles'
    style.textContent = `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(4px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .modal-overlay.show {
        opacity: 1;
      }

      .modal {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        transform: scale(0.9);
        transition: transform 0.2s ease;
      }

      .modal-overlay.show .modal {
        transform: scale(1);
      }

      .modal__content {
        text-align: center;
        margin-bottom: 1.5rem;
      }

      .modal__content--success {
        color: #059669;
      }

      .modal__content--error {
        color: #dc2626;
      }

      .modal__content--info {
        color: #0284c7;
      }

      .modal__icon {
        font-size: 3rem;
        margin-bottom: 1rem;
      }

      .modal__content p, .modal__content h3 {
        font-size: 1.1rem;
        line-height: 1.6;
        color: #334155;
        margin: 0 0 0.5rem 0;
      }

      .modal__content h3 {
        font-weight: 600;
        font-size: 1.3rem;
        color: #0f172a;
        margin-bottom: 1rem;
      }

      .modal__content ul {
        text-align: left;
        margin: 0.5rem 0;
        padding-left: 1.5rem;
      }

      .modal__content li {
        margin: 0.25rem 0;
        color: #475569;
      }

      .modal__input {
        width: 100%;
        padding: 0.75rem;
        border: 1.5px solid #e2e8f0;
        border-radius: 8px;
        font-size: 1rem;
        font-family: inherit;
        margin-top: 0.5rem;
      }

      .modal__input:focus {
        outline: none;
        border-color: #0a4ba5;
        box-shadow: 0 0 0 3px rgba(10, 75, 165, 0.1);
      }

      .modal__actions {
        display: flex;
        gap: 0.75rem;
        justify-content: center;
        flex-wrap: wrap;
      }

      .modal__actions button {
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        font-weight: 600;
        font-size: 1rem;
        transition: all 0.2s ease;
        min-width: 100px;
      }

      .modal__actions button.btn.primary {
        background: #0a4ba5;
        color: white;
      }

      .modal__actions button.btn.primary:hover {
        background: #083a82;
      }

      .modal__actions button.btn.secondary {
        background: transparent;
        border: 1.5px solid #cbd5e1;
        color: #0f172a;
      }

      .modal__actions button.btn.secondary:hover {
        border-color: #0a4ba5;
        color: #0a4ba5;
        background: #f0f6ff;
      }

      .modal__actions button.btn.danger {
        background: #dc2626;
        color: white;
      }

      .modal__actions button.btn.danger:hover {
        background: #b91c1c;
      }
    `
    document.head.appendChild(style)
  }

  show(content: string, actions: { label: string; handler: () => void; variant?: 'primary' | 'danger' | 'secondary' }[] = []) {
    this.modal.innerHTML = `
      <div class="modal__content">${content}</div>
      <div class="modal__actions">
        ${actions.map(a => `<button class="btn ${a.variant || 'secondary'}" data-action="${a.label}">${a.label}</button>`).join('')}
      </div>
    `

    actions.forEach(action => {
      const btn = this.modal.querySelector(`[data-action="${action.label}"]`)
      btn?.addEventListener('click', () => {
        action.handler()
        this.close()
      })
    })

    document.body.appendChild(this.overlay)
    setTimeout(() => this.overlay.classList.add('show'), 10)
  }

  prompt(title: string, placeholder: string, callback: (value: string | null) => void) {
    this.modal.innerHTML = `
      <div class="modal__content">
        <h3>${title}</h3>
        <input type="text" class="modal__input" placeholder="${placeholder}" />
      </div>
      <div class="modal__actions">
        <button class="btn secondary" data-action="cancel">Cancelar</button>
        <button class="btn primary" data-action="confirm">Confirmar</button>
      </div>
    `

    const input = this.modal.querySelector('.modal__input') as HTMLInputElement
    const cancelBtn = this.modal.querySelector('[data-action="cancel"]')
    const confirmBtn = this.modal.querySelector('[data-action="confirm"]')

    cancelBtn?.addEventListener('click', () => {
      callback(null)
      this.close()
    })

    confirmBtn?.addEventListener('click', () => {
      callback(input.value)
      this.close()
    })

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        callback(input.value)
        this.close()
      }
    })

    document.body.appendChild(this.overlay)
    setTimeout(() => {
      this.overlay.classList.add('show')
      input.focus()
    }, 10)
  }

  alert(message: string, variant: 'success' | 'error' | 'info' = 'info') {
    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ'
    }
    
    this.modal.innerHTML = `
      <div class="modal__content modal__content--${variant}">
        <div class="modal__icon">${icons[variant]}</div>
        <p>${message}</p>
      </div>
      <div class="modal__actions">
        <button class="btn primary" data-action="ok">OK</button>
      </div>
    `

    const okBtn = this.modal.querySelector('[data-action="ok"]')
    okBtn?.addEventListener('click', () => this.close())

    document.body.appendChild(this.overlay)
    setTimeout(() => this.overlay.classList.add('show'), 10)
  }

  close() {
    this.overlay.classList.remove('show')
    setTimeout(() => {
      if (this.overlay.parentNode) {
        this.overlay.parentNode.removeChild(this.overlay)
      }
    }, 200)
  }
}
