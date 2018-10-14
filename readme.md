## Setup

Även om det räcker med att dubbelklicka på `index.html` för öppna sidan i din webbläsare så rekommenderar jag dig till att ha en lokal server.

I denna mapp så följer det med en enkel server (`server.js`) som du kan starta i terminalen med `node server.js` och sedan besöka `http://127.0.0.1:8080/`. Du borde nu kunna se texten "This is my web page" i din webbläsare.

På tal om webbläsare. Se till att du har Chrome installerad eller firefox version 63 eller högre (om du använder 62 kan du slå på flaggorna "dom.webcomponents.shadowdom.enabled" och "dom.webcomponents.customelements.enabled" i "about:config"). Om du vill använda en annan webbläsare så kan du lägga till ett polyfill: https://www.webcomponents.org/polyfills

Öppna nu upp denna mapp i din favorit editor. VScode, Sublime, vim, vilken som helst egentligen.

## Hello world.

Låt oss nu skapa vår första WebComponent. Vi gör det genom att skapa ett så kallat custom element.

Öppna först upp filen `hello-world.js`. Skapa sedan en klass som ärver från `HTMLElement`, lägger till en inre text och sedan registrera komponenten. Något i stil med:

```js
class HelloWorldComponent extends HTMLElement {
  constructor() {
    super()
    this.innerHTML = '<p>Hello world!</p>'
  }
}

customElements.define('hello-world', HelloWorldComponent)
```

Okej, så vad händer här? Låt oss gå igenom detta, steg för steg.

Först skapar vi en klass som heter `HelloWorldComponent` som ärver från `HTMLElement`:

```js
class HelloWorldComponent extends HTMLElement {
```

`HTMLElement` är en global klass i webbläsaren som vi kan ärva ifrån. Detta göra att vår klass `HelloWorldComponent` nu får alla propertys som vilket html element som helst (ex. `innerHTML`, `offsetWidth` osv.).

Sedan skapar vi upp en konstruktor som kommer exekveras när en instans skapas. Dvs. när vår komponent ska renderas, dvs. när vi använder den i webbläsaren. I konstruktorn anropar vi först `super`-funktionen (om du inte har arbetat med javascript klasser innan så är det denna funktion som anropar konstruktorn i basklassen (`HTMLElement` i detta fall). Detta måste vara det första som sker i konstruktorn om man ärver från en annan klass).

Eftersom `HelloWorldComponent` ärver från `HTMLElement` så kan man nu betrakta `HelloWorldComponent` som ett html element och vi har som sagt tillgång till exempelvis `innerHTML` som vi kan använda. Så låt oss sätta vår inre text till `'<p>Hello!</p>'` och det är precis vad vi gör med:

```js
this.innerHTML = '<p>Hello world!</p>'
```

Nu har vi alltså skapat en komponent som alltid har texten `Hello world!`. Nice! Ge dig själv en high five ✋

Men.. för att kunna använda denna komponent/element så behöver du berätta för webbläsaren att den finns och för vilken nod i webbläsaren som du vill använda den för. Detta gör vi med `customElements.define`:

```js
customElements.define('hello-world', HelloWorldComponent)
```

och vi kan nu använda taggen `<hello-world />` i vår html kod 🎉

Du borde nu se "Hello World" i webbläsaren.

Nu kanske du tänker "Får jag döpa mina element till vad jag vill?". Nej, du får exempelvis inte skapa en komponent som heter 'p' eller 'span' eftersom de redan finns och faktum är att namnet på ditt element måste innehålla ett `-`. (https://stackoverflow.com/questions/22545621/do-custom-elements-require-a-dash-in-their-name)

För den intresserade:

- Du måste alltid ange en avslutning tag (ex. `<hello-world></hello-world>`) eftersom det endast finns några få element som är tillåtna att lämnas öppna: https://html.spec.whatwg.org/multipage/syntax.html#void-elements

- När du skapar ett eget element så kan du även ärva från en mer specifik klass, exempelvis: `HTMLParagraphElement`. Men då måste du även säga det när vi definierar vår komponent: `customElements.define('hello-world', HelloWorldComponent, { extends: 'p' })` och för att sedan kunna använda komponenten så måste du använda en `p`-tag men lägga till `is` attributet: `<p is="hello-world"></p>`. Jag har dock ingen aning om när man skulle vilja göra detta.

- När du väl har definierat ett element så kan du även plocka ut klassen med `customElements.get`:

```js
customElements.define('hello-world', HelloWorldComponent)

const HelloWorld = customElements.get('hello-world')

console.log(HelloWorld === HelloWorldComponent) // true
```

- Ibland kanske man inte vill definiera alla sina element med en gång utan man vill vänta lite. Då kan vi använda: `customElements.whenDefined` som returnerar ett Promise:

```js
customElements.whenDefined('hello-world').then(() => console.log('Wii!')) // "Wii" after 1s

setTimeout(() => {
  customElements.define('hello-world', HelloWorldComponent)
}, 1000)
```

- Vi kan även använda css selectors för att hitta alla element som inte ännu är definierade (eller de som är definierade för den delen).

```css
:not(:defined) {
  width: 1000px;
  height: 1000px;
  background-color: brown;
}
```

eller så kan vi vara lite mer specifika om vi vill: `hello-world:not(:defined)`

## Shadow dom!

Personligen tycker jag att shadow dom låter som en spökliknande del av DOM-trädet, där de döda elementen lever men som tur är så är det inte riktigt så. Det är mycket bättre. Låt oss först prata om problemet.

I föra övningen skapa du ett element som såg ut något i stil med det här:

```js
class HelloWorldComponent extends HTMLElement {
  constructor() {
    super()
    this.innerHTML = '<p>Hello world!</p>'
  }
}
```

Och sedan använde du elemntet i din html med hjälp av följande tag: `<hello-world></hello-world>`. Detta gav en fin blå text på din skärm som sa "Hello world!". Jag skulle inte bli förvånad ifall du vill dela med dig av detta fina element så du paketerar det och skickar det till din kompis. När din kompis använder elementet så blir det inte alls lika fint. Texten blir svart och inte så fin blå som du har. Du går tillbaka till din kod och upptäcker att anledningen till att texten är blå är för att du har följande globala css kod i `index.html`:

```css
p {
  color: blue;
}
```

så du skickar över den koden till din kompis också och tänker att allt är bra. Din kompis svara dock att nu är all text på hens sida blå. Ni blir ovänner och slutar att prata med varandra. Det här är inte bra! Det finns dock en lösning. Nämligen `shadow dom`. En av idéerna bakom WebComponents är just att de inte ska läcka någon css. De ska helt enkelt vara isolerade DOM träd.

> Innan vi börjar så rekommenderar jag dig till att kolla i devtools i chrome för att se hur din komponent ser ut.

Låt oss nu skapa en en shadow dom. Detta kan vi göra med: `this.attachShadow({ mode: 'open' })`. Detta kommer skapa en shadow dom i öppet läge. Man kan skapa en shadow dom i öppet och stängt läge men vad det innebär kommer vi återkomma till snart.

Så låt oss nu skriva om vår komponent till:

```js
class HelloWorldComponent extends HTMLElement {
  constructor() {
    super()
    const shadowRoot = this.attachShadow({ mode: 'open' })
    shadowRoot.innerHTML = `<p>Hello World!</p>`
  }
}
```

Kolla nu i devtools i Chrome hur det ser ut. Ser du `#shadow-root`? Gött!

Ser du även att texten nu är svart! Gött! Detta betyder alltså att vårt element inte längre faller under de globala css reglerna 🎉

Men låt oss nu säga att vi vill att texten ska vara grön. Vi kan då lägga på lite styling:

```js
shadowRoot.innerHTML = `
  <style>
    <!-- look ma, scoped styling -->
    p {
      color: green;
    }
  </style>
  <p>Hello World!</p>
`
```

Låt oss nu prata om open/closed mode. Öppna upp devtools och kör följande kommando:

```js
document // Shadow host, dvs. det vanliga DOM trädet
  .querySelector('hello-world').shadowRoot.innerHTML = 'Hej' // Ditt element // Shadow root // Skriv över Shadow tree
```

Vad händer?

Ändra nu shadow trädet till `closed`:

```diff
- const shadowRoot = this.attachShadow({ mode: 'open' })
+ const shadowRoot = this.attachShadow({ mode: 'closed' })
```

Kör nu samma kommando igen i devtools. Vad händer? Är det förväntat beteende?

Vad `open/closed` innebär är helt enkelt huruvida "Shadow host" ska kunna komma åt och kunna manipulera "Shadow tree".

Webben är dock öppen och det kommer inte finnas någon möjlighet att helt skydda sig från att "Shadow host" manipulerar ett "Shadow tree". exempelvis kan man alltid skriva om `attachShadow` till att alltid skapa en "Shadow root" i open-mode:

```js
Element.prototype._attachShadow = Element.prototype.attachShadow
Element.prototype.attachShadow = () => this._attachShadow({ mode: 'open' })
```

För enkelhetens skull kommer jag fortsätta använda `open`-mode i denna labb.

För den intresserade kan man läsa mer om open/closed här: https://blog.revillweb.com/open-vs-closed-shadow-dom-9f3d7427d1af

## Knapp - alert

Låt oss nu kolla på något mer "användbart". Låt oss skapa en knapp som skapar en alert-ruta när man klickar på knappen.

Låt oss böra med att skapa en ny fil: `alert-button.js`. Skapa ett nytt element där som du definierar som `alert-button`.

Exempelkod:

```js
const shadowRoot = this.attachShadow({ mode: 'open' })
const button = document.createElement('button')
button.innerText = 'Click me'
button.onclick = () => alert('You clicked me')
shadowRoot.appendChild(button)
```

Testa knappen. Hur fungerar den?

### Attribute

Det är ju lite tråkigt att meddelandet i popup rutan är statiskt. Vi kan alltså inte åter använda detta element om vi vill få en annan text 😕

Det skulle vara trevligt om man kunde ange vad som ska stå i alert rutan när man använder elementet, typ:

```html
<alert-button alert-text="Hello"></alert-button>
<alert-button alert-text="Hi"></alert-button>
```

För det kan vi använda `getAttribute`:

```js
button.onclick = () => alert(this.getAttribute('alert-text'))
```

Fungerar det bra?

### Observed attributes

Låt oss nu lägga till ett attribut för texten på knappen:

```html
<alert-button alert-text="Hello" text="Click on me"></alert-button>
```

Ändra nu koden i elementet så att vi använder attributet `text` istället för den statiska strängen.

Nice!

Attribut kan man ändra under runtime. Testa exempelvis att köra följande kommando i devtools: `document.querySelector('alert-button').setAttribute('alert-text', 'Katten')` och klicka på knappen igen. Visst kommer 'Katten' upp istället för 'Hello' som vi först deklarerade?

Testa nu att istället ändra texten: `document.querySelector('alert-button').setAttribute('text', 'Click!')`. Ändrades texten på knappen? Antagligen inte. Varför inte det? Fundera lite innan du läser vidare.

Har du funderat? Bra! Jag antar att du satt texten på knappen i konstruktorn. Sen när vi ändrar attributet så vet inte webbläsaren vad som ska ändras och konstruktorn kommer ju endast exekveras en gång. Det finns dock en metod som kommer exekveras när att attribut ändras: `attributeChangedCallback`.

```js
attributeChangedCallback(name, oldValue, newValue) {
  console.log(name, oldValue, newValue)
}
```

Men för att `attributeChangedCallback` inte ska exekveras i onödan måste du säga vilka attribute som du vill få en uppdatering om så du måste tala om det för webbläsaren. Detta gör man genom att sätta en static property `observedAttributes` på klassen. Enklast gör du det genom att implementera en statisk get metod:

```js
static get observedAttributes() {
  return ['text'] // en array av attribut namn som du vill reagera på
}
```

Fixa nu koden att texten uppdateras när du kör följande kommando: `document.querySelector('alert-button').setAttribute('text', 'Click!')`.

### Callbacks

`attributeChangedCallback` var en callback som anropas när ett attribut ändras. Det finns dock några andra intressanta callbacks:

```js
connectedCallback() {
  // Denna metod anropas när elementet skapas
}

disconnectedCallback() {
  // Denna metod anropas när elementet tas bort
}

adoptedCallback() {
  // Denna metod anropas när ett element flyttas till ett annat dokument
}
```

## Todo

Surfa in på `http://localhost:8080/native-todo/index.html`, du borde nu se en helt tom sida och det är din uppgift att skapa en att göra lista, där man kan lägga till todos och markera dem som klara.

Det finns 1000 olika sätt att skapa en sån här app så om du känner dig redo att försöka själv kan göra det nu. Ni andra kan fortsätta läsa för att få lite hjälp på vägen.

I `TodoApp` kommer vi vilja ha en lista med todo items så vi börjar med att skapa en sådan lista. Strukturen kan se ut ur som helst men här väljer jag att ha följande struktur:

```ts
// todo-app.js
constructor() {
  super()
  console.log('🚀')

  this.items = [
    {
      uid: 1, // Unikt id, eftersom id är ett vedertaget attribut så väljer vi `uid` här
      name: 'Buy a cat', // Namnet på sin todo
      checked: true // Ifall den är klar eller inte
    },
    {
      uid: 2,
      name: 'Buy a dog',
      checked: false
    }
  ]
  this.root = this.attachShadow({ mode: 'open' }) // Skapa upp en shadow dom
}
```

Sedan kan vi passa på att skapa en template för vår app. Här väljer jag att använda `template` (https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template):

```js
// todo-app.js
const template = document.createElement('template')
template.innerHTML = `
    <h1>Todos</h1>
    <section>
        <todo-input></todo-input>
        <ul></ul>
    </section>
`
```

Eftersom vi kommer vilja rendera om vår lista med todos när en ny ska läggas till och när ett todo item markeras som klart så kan det vara fördelaktigt att skapa en funktion som renderar vår lista. Denna render funktion kan skrivas på många olika sätt. Låt oss först göra en naiv implementation:

```js
// todo-app.js
connectedCallback() {
  this.root.appendChild(template.content.cloneNode(true))
  this.inputNode = this.root.querySelector('todo-input')
  this.todoListNode = this.root.querySelector('ul')
  this.render()
}

render() {
  this.todoListNode.innerHTML = ''
  this.items.forEach(item => {
    const newItemNode = document.createElement('todo-item')
    newItemNode.setAttribute('name', item.name)
    newItemNode.setAttribute('uid', item.uid)
    if (item.checked) {
      newItemNode.setAttribute('checked', item.checked)
    }
    this.todoListNode.appendChild(newItemNode)
  })
}
```

Nice! Du borde nu kunna se i devtools att det har skapats två `todo-input` element. Men det syns inget på skärmen 😕 Det är ju såklart för att vi inte har implementerat `todo-item` än så låt oss gör det nu!

```js
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
    this.root = this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.root.appendChild(template.content.cloneNode(true))
    this.nameNode = this.root.querySelector('label')
    this.checkboxNode = this.root.querySelector('input')
    this.uid = Number(this.getAttribute('uid'))
    this.name = this.getAttribute('name')
    this.checkboxNode.addEventListener('click', () => {
      console.log('The user wants to mark the item as done, we should notify todo-app')
    })
    this.render()
  }

  render() {
    this.nameNode.textContent = this.name
    if (this.checked) {
      this.checkboxNode.checked = true
    } else {
      this.checkboxNode.checked = false
    }
  }
}
```

Du borde nu se två items på skärmen! Gött mos! Men... det finns två problem med koden. 

1. Både `Buy a cat` och `Buy a dog` har en checkbox som inte är i kryssad, även om `Buy a cat` är markerad som klar i den lista som vi skapa i `todo-app.js`.
2. Om användaren markerar `Buy a dog` så kommer inte listan i `todo-app.js` att uppdaterats så om `todo-app.js` renderas om så kommer den informationen försvinna.

Låt oss först kolla på problem 1.

Om vi först kollar i `todo-app.js` så kan vi se att att vi sätter ett attribute på `todo-item` om den ska markeras som klar:

```js
// i `render` i todo-app.js
if (item.checked) {
  newItemNode.setAttribute('checked', item.checked)
}
```

Det betyder att vi kan få tag i attributet i `todo-item.js` ex. genom `this.getAttribute('checked')` i `render`. Detta kan verka lockande men det kommer då innebära att vi inte kommer reagera på förändringar. Så istället borde vi implementera `observedAttributes` och `attributeChangedCallback`:

```js
// todo-item.js
static get observedAttributes() {
  return ['checked']
}

attributeChangedCallback(name, oldValue, newValue) {
  if (name == 'checked') {
    this.checked = Boolean(newValue)
  }
  // Denna funktion kommer anropas innan connectedCallback första gången så
  // var säker på att vi har någon plats att rendera till
  if (this.nameNode) {
    this.render() // Rerender the item
  }
}
```

Nice. Nu borde `Buy a cat` också vara ikryssad.

Nu över till problem 2. Vi borde tala om för `todo-app` när användaren försöker markera ett element som klart. Detta kan vi göra genom att dispatcha ett event.

```diff
// todo-item.js
this.checkboxNode.addEventListener('click', () => {
-   console.log('The user wants to mark the item as done, we should notify todo-app')
+   this.dispatchEvent(
+     new CustomEvent('onCheckedChange', {
+       detail: { uid: this.uid, checked: !this.checked }
+     })
+   )
})
```

Detta gör att vi kan lyssna på eventet i `todo-app.js` som vilket event som helst:

```js
newItemNode.addEventListener('onCheckedChange', e => this.changeChecked(e))
```

`changeChecked` kan exempelvis implementerats på följande sätt:

```js
changeChecked({ detail: { uid, checked } }) {
  this.items = this.items.map(item => {
    if (item.uid === uid) {
      return { ...item, checked }
    }
    return item
  })
  this.render()
}
```

Det som är kvar nu är att implementera `todo-input.js` och det lämnar jag som en övning men jag kan ge ett exempel på en template:

```js
template.innerHTML = `
  <form>
    <input type="text" placeholder="Add a new todo" />
    <button>Create</button>
  </form>
`
```

Tänk på att lyssna på `submit`-event på formuläret och `click`-event på knappen. Tänk också på att anropa `event.preventDefault()` för att sidan inte ska laddas om när du klickar på enter.

### Styling

Lägg på lite styling på den applikation. Använd inte global css, utan lägg den nära respektive komponent. Gör exempelvis att texten blir genomstruken (`line-through`) om man har markerat ett item som klart.

### Rerender

För den intresserade: 

Testa nu att lägga in en `console.log` i `connectedCallback` i `todo-item.js` så kommer du se att det skapas en helt ny lista varje gång vi lägger till en ny todo eller markerar en som klar. Det är inte bra. Skriv om render i `todo-app.js` så att den kollar på vad som finns i dom-trädet redan och uppdaterar noderna om det behövs annars skapa nya noder. 

Tips: Använd `this.todoListNode.childNodes` för att se vad som redan är renderat. `childNodes` är ett array-likt objekt så du kan använda `Array.from(this.todoListNode.childNodes)` för att skapa en array av det som är lättare att traversera.

## lit-html

Ibland kan det kännas jobbigt att programmatiskt skapa upp vyn. Så låt oss testa `lit-html` istället. `lit-html` är ett externt hjälp bibliotek som du kan importera genom:

```js
import { html, render } from 'https://unpkg.com/lit-html?module'
```

Vi kan nu använda `html` och `render` och skriva om `render` i `todo-app.js` till

```js
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
```

Skapandet av `generateTodoItem` låter jag vara en övning till dig. Du kan hitta dokumentation om `lit-html` här: https://polymer.github.io/lit-html/guide/writing-templates

Vidare kan vi nu låta `connectedCallback` endast kalla på render:

```diff
connectedCallback() {
- this.root.appendChild(template.content.cloneNode(true))
- this.inputNode = this.root.querySelector('todo-input')
- this.todoListNode = this.root.querySelector('ul')
- this.inputNode.addEventListener('onNewTodo', e => this.addItem(e))
  this.render()
}
```

Skriv även om `todo-item.js` till att använda `lit-html`.

Om man gillar jsx skulle man exempelvis kunna använda snabbdom (https://github.com/snabbdom/snabbdom) istället som är ett ganska litet bibliotek för att ge en Virtual DOM. 

## Andra bibliotek

Även om WebComponents är väldigt kraftfullt så kanske du märker att det är lite osmidigt ibland. Det har därför skapats hjälp bibliotek för att förenkla skapandet av WebComponents. Några av dem är:

- hybrids https://github.com/hybridsjs/hybrids#readme
- Stenciljs https://stenciljs.com/
- Polymer https://www.polymer-project.org/

### hybrids

`hybrids` ger möjlighet att kunna skapa web komponenter på ett funktionellt sätt. Här kan du se ett enkelt exempel: https://stackblitz.com/edit/ccfe-hybrids-number?file=my-number.js

`hybrids` har även fler exempel på sin readme sida: https://github.com/hybridsjs/hybrids#-live-examples-

### Stenciljs

Om du har använt Angular kommer du känna igen dig här. Många av koncepten är desamma förutom att Stenciljs använder jsx. 

Om du öppnar upp filen `stencil-demo/src/components/my-number/my-number.tsx` kan du se ett exempel på hur man kan skapa en komponent i Stenciljs. Som du ser använder Stenciljs typescript out of the box så om du använder vscode kan du enkelt inspektera de olika typerna. Du måste dock först installera alla dependencies:

```bash
cd stencil-demo
npm install
```

För att se hur komponenten ser ut kan du köra följande kommando: `npm start`.

För att sedan bygga den så att den kan användas på andra webbsidor kan du först köra: `npm run build`. Sedan kan du använda följande script-tag: `<script async type="module" src="./stencil-demo/my-number/dist/mycomponent.js"></script>` i `index.html` som ligger i root-mappen (den index.html som vi jobbade med först). Och sedan kan du använda din komponent:

```html
<my-number my-number="10"></my-number>
```

Skapa en todo app i Stenciljs, bygg den och använd den i `index.html` som ligger i root-mappen.
