import { html, render } from 'https://unpkg.com/lit-html?module'

export class TodoItem extends HTMLElement {
  constructor() {
    super()
    console.log('💽')
    this.root = this.attachShadow({ mode: 'open' })
  }

  static get observedAttributes() {
    return ['checked']
  }

  connectedCallback() {
    this.render()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log('attributeChangedCallback!')
    if (name === 'checked') {
      this.render()
    }
  }

  dispatchCheckedChange() {
    this.dispatchEvent(
      new CustomEvent('onCheckedChange', {
        detail: {
          uid: Number(this.getAttribute('uid')),
          checked: !this.hasAttribute('checked')
        }
      })
    )
  }

  render() {
    console.log('Rerender!')
    const doc = html`
      <li>
        <input @click=${() => this.dispatchCheckedChange()} type="checkbox" ?checked=${this.hasAttribute('checked')}>
        <label>${this.getAttribute('name')}</label>
      </li>
    `
    render(doc, this.root)
  }
}
