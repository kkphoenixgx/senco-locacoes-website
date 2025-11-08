import { Component, Input, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-default-form-text-area',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgClass],
  templateUrl: './default-form-text-area.html',
  styleUrl: './default-form-text-area.scss',
})
export class DefaultFormTextArea implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() rows = 4;

  constructor(@Self() public ngControl: NgControl) {
    this.ngControl.valueAccessor = this;
  }

  // --- Implementation of ControlValueAccessor ---

  writeValue(obj: any): void {
    // This method is called by the forms API to write to the view
  }

  registerOnChange(fn: any): void {
    // This method is called by the forms API to register a callback
  }

  registerOnTouched(fn: any): void {
    // This method is called by the forms API to register a callback
  }

  // Helper to get the form control for easier access in the template
  get formControl(): FormControl {
    return this.ngControl.control as FormControl;
  }
}
