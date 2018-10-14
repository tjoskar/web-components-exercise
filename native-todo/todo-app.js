import { html, render } from 'https://unpkg.com/lit-html?module'

export class TodoApp extends HTMLElement {
  constructor() {
    super()
    console.log('🚀')

    this.items = [
      {
        uid: 1,
        name: 'Buy a cat',
        checked: true
      },
      {
        uid: 2,
        name: 'Buy a dog',
        checked: false
      }
    ]
    this.root = this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.render()
  }

  addItem({ detail: { name } }) {
    const newItem = {
      uid: Math.random(),
      name,
      checked: false
    }
    this.items.push(newItem)
    this.render()
  }

  changeChecked({ detail: { uid, checked } }) {
    this.items = this.items.map(item => {
      if (item.uid === uid) {
        return { ...item, checked }
      }
      return item
    })
    this.render()
  }

  generateTodoItem({ uid, name, checked }) {
    return html`<todo-item name=${name} uid=${uid} ?checked=${checked} @onCheckedChange=${e => this.changeChecked(e)}></todo-item>`
  }

  render() {
    const doc = html`
      <h1>Todos</h1>
      <section>
        <todo-input @onNewTodo=${e => this.addItem(e)}></todo-input>
        <ul>
          ${this.items.map(item => this.generateTodoItem(item))}
        </ul>
      </section>
    `
    render(doc, this.root)
  }
}
