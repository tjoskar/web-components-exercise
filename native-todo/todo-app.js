const template = document.createElement('template')
template.innerHTML = `
    <h1>Todos</h1>
    <section>
        <todo-input></todo-input>
        <ul></ul>
    </section>
`

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
    this.root.appendChild(template.content.cloneNode(true))
    this.inputNode = this.root.querySelector('todo-input')
    this.todoListNode = this.root.querySelector('ul')
    this.inputNode.addEventListener('onNewTodo', e => this.addItem(e))
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

  render() {
    const todoItemNodes = Array.from(this.todoListNode.childNodes)
    this.items.forEach(item => {
      const itemNode = todoItemNodes.find(i => Number(i.uid) === item.uid)

      if (!itemNode) {
        const newItemNode = document.createElement('todo-item')
        newItemNode.setAttribute('name', item.name)
        newItemNode.setAttribute('uid', item.uid)
        if (item.checked) {
          newItemNode.setAttribute('checked', item.checked)
        }
        newItemNode.addEventListener('onCheckedChange', e => this.changeChecked(e))
        this.todoListNode.appendChild(newItemNode)
      } else if (item.checked !== Boolean(itemNode.checked)) {
        if (item.checked) {
          itemNode.setAttribute('checked', true)
        } else {
          itemNode.removeAttribute('checked')
        }
      }
    })
  }
}
