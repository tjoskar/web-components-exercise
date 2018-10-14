import { Component, Prop } from '@stencil/core';

@Component({
  tag: 'my-number',
  styleUrl: 'my-number.css',
  shadow: true
})
export class MyNumber {
  @Prop({ mutable: true }) myNumber = 0;

  increase(): void {
    this.myNumber += 1
  }

  decrease(): void {
    this.myNumber -= 1
  }

  render() {
    const textStyle = {
      color: this.myNumber < 0 ? 'red' : 'black'
    }
    return (
      <div>
        <button onClick={() => this.decrease()}>-</button>
        <button onClick={() => this.increase()}>+</button>
        <span style={textStyle}>Number: {this.myNumber}</span>
      </div>
    )
  }
}
