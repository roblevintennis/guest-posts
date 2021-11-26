import { Component, Input } from '@angular/core';

@Component({
  selector: 'little-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css'],
})
export class ButtonComponent {
  @Input() mode: 'primary' | undefined = undefined;

  public get classes(): string {
    const modeClass = this.mode ? `btn-${this.mode}` : '';
    return [
      'btn',
      modeClass,
    ].filter(cl => cl.length).join(' ');
  }

}
