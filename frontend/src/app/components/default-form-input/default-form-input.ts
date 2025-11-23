import { Component, Input, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule} from '@angular/common';

@Component({
  selector: 'app-default-form-input',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './default-form-input.html',
  styleUrl: './default-form-input.scss',
})
export class DefaultFormInput implements ControlValueAccessor {
  @Input() label = '';
  @Input() type: 'text' | 'email' | 'password' | 'tel' | 'number' = 'text';
  @Input() placeholder = '';
  @Input() color = '';
  @Input() backgroundColor = '';


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

  setDisabledState?(isDisabled: boolean): void {
    // This method is called by the forms API to set the disabled state
  }

  // Helper to get the form control for easier access in the template
  get formControl(): FormControl {
    return this.ngControl.control as FormControl;
  }
}
