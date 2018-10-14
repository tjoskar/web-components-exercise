const template = document.createElement('template')
template.innerHTML = `
  <form>
    <input type="text" placeholder="Add a new todo" />
    <button>Create</button>
  </form>
`

export class TodoInput extends HTMLElement {
  constructor() {
    super()
    this.root = this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.root.appendChild(template.content.cloneNode(true))
    this.inputNode = this.root.querySelector('input')
    const formNode = this.root.querySelector('form')
    const buttonNode = this.root.querySelector('button')

    formNode.addEventListener('submit', e => this.emitTodoCreation(e))
    buttonNode.addEventListener('click', e => this.emitTodoCreation(e))
  }

  emitTodoCreation(event) {
    event.preventDefault()
    if (!this.inputNode.value) {
      return
    }
    this.dispatchEvent(
      new CustomEvent('onNewTodo', { detail: { name: this.inputNode.value } })
    )
    this.inputNode.value = ''
  }
}
