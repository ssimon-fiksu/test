import { Directive, ElementRef, Output, EventEmitter, HostListener  } from '@angular/core';

@Directive({
  selector: '[appBlur]'
})
export class BlurDirective {

  constructor(private elementRef: ElementRef) { }

  @Output()
  public appBlur = new EventEmitter();

  // watch for click events
  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement) {
    if (this.elementRef) {
      // see if clicked element is the target element OR the button
      const clickedInside = this.elementRef.nativeElement.contains(targetElement) || 
                            targetElement.classList.contains('open-button');
      if (!clickedInside) {
        this.appBlur.emit(true);
      }
    }
  }

}
