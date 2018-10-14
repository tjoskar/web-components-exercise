const template = document.createElement('template')
template.innerHTML = `
  <li>
    <input type="checkbox">
    <label></label>
  </li>
`

export class TodoItem extends HTMLElement {
  constructor() {
    super()
    console.log('💽 A new item was created!')
    this.root = this.attachShadow({ mode: 'open' })
  }

  static get observedAttributes() {
    return ['checked']
  }

  connectedCallback() {
    this.root.appendChild(template.content.cloneNode(true))
    this.nameNode = this.root.querySelector('label')
    this.checkboxNode = this.root.querySelector('input')
    this.uid = Number(this.getAttribute('uid'))
    this.name = this.getAttribute('name')
    this.checkboxNode.addEventListener('click', () => {
      this.dispatchEvent(
        new CustomEvent('onCheckedChange', {
          detail: { uid: this.uid, checked: !this.checked }
        })
      )
    })
    this.render()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name == 'checked') {
      this.checked = Boolean(newValue)
    }
    if (this.nameNode) {
      this.render()
    }
  }

  render() {
    this.nameNode.textContent = this.name
    if (this.checked) {
      this.nameNode.classList.add('checked')
      this.checkboxNode.checked = true
    } else {
      this.nameNode.classList.remove('checked')
      this.checkboxNode.checked = false
    }
  }
}
