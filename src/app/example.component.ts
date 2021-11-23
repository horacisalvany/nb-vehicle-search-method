import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  Dropdown,
  DropdownId,
  DropdownIdDependents,
  Dropdowns,
  DropdownTemplateConfig,
  InputResources
} from './example.model';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss']
})
export class ExampleComponent implements OnInit, AfterViewInit {
  dropdowns: Dropdowns;
  form: FormGroup;

  private count = 0; // TODO: remove.

  constructor(private ref: ChangeDetectorRef) {
    // @ts-ignore
    window['a'] = this;
  }

  ngOnInit() {
    this.dropdowns = this.createDefaultDropdownsConfig();

    this.form = this.createForm(this.dropdowns);
    this.subscribeForm();
    this.addValidators(); // TODO: remove.

    this.processDefaultConfig();
  }

  ngAfterViewInit() {
    // This should be done in 'setResources'.
    setTimeout(() => this.applyCustomConfig(this.customConfig2())); // TODO: remove setTimeout.
  }

  // Form.
  private createForm(dropdowns: Dropdowns): FormGroup {
    const formGroup = new FormGroup({});

    Object.values(dropdowns).forEach((v) => {
      formGroup.addControl(v.id, new FormControl());
    });

    return formGroup;
  }

  private subscribeForm() {
    Object.entries(this.form.controls).forEach(([k, v]) => {
      // TODO: add untilDestroyed.
      v.valueChanges.subscribe((value) => {
        console.log('Selected value: ', value, ', from control', k);
        this.processDropdownValueSelected(k as DropdownId);
      });
    });
  }

  private processDropdownValueSelected(id: DropdownId) {
    const dropdown = this.obtainDropdown(id);
    const recursivelyDropdownDependentIds = this.obtainDependentDropdownsRecursively(dropdown);

    console.log('Recursive dependents: ', recursivelyDropdownDependentIds);

    this.clearDropdownControls(recursivelyDropdownDependentIds);
    this.triggerDependentsBE(dropdown);

    this.resultsDependentsBE(dropdown); // TODO: remove.
  }

  private clearDropdownControls(dropdownIds: DropdownId[]) {
    dropdownIds.forEach((dropdownId) => {
      const control = this.form.get(dropdownId);
      if (control) {
        control.setValue(null, { emitEvent: false });
        control.disable({ emitEvent: false });
      }
    });
  }

  private triggerDependentsBE(dropdown: Dropdown) {
    dropdown.logic.dependents?.forEach((dependent) => {
      const item = this.obtainDropdown(dependent);
      console.log(`Calling BE: ${item.logic.triggerEvent}`);
    });
  }

  // TODO: remove
  private resultsDependentsBE(dropdown: Dropdown) {
    dropdown.logic.dependents?.forEach((dependent) => {
      const item = this.obtainDropdown(dependent);
      this.businessEventResponse(item);
    });
  }

  // TODO: remove.
  private addValidators() {
    this.form.get('d1')?.setValidators([Validators.required]);
    this.form.get('d2')?.setValidators([Validators.required]);

    this.form.updateValueAndValidity();
  }

  // Template.
  search() {
    this.form.updateValueAndValidity();
    this.markDropdownsWithErrorsAsTouched();
    // this.form.markAllAsTouched();
    if (this.form.valid) {
      console.log('Search vehicles...!');
    } else {
      console.log('Can not search: there are some errors in the form');
    }
  }

  // TODO: remove?
  private markDropdownsWithErrorsAsTouched() {
    Object.values(this.form.controls).forEach((v) => {
      if (v.errors) {
        v.markAsTouched();
      }
    });
  }

  // Configurations.
  private createDefaultDropdownsConfig(): Dropdowns {
    return {
      d1: {
        id: 'd1',
        logic: { triggerEvent: 'd1Data', dependents: ['d2'] },
        template: { elements: null, label: '33' }
      },
      d2: {
        id: 'd2',
        logic: { triggerEvent: 'd2Data', dependents: ['d3'] },
        template: { elements: null, label: 'Dropdown 2' }
      },
      d3: {
        id: 'd3',
        logic: { triggerEvent: 'd3Data', dependents: ['d4'] },
        template: { elements: null, label: 'Dropdown 3' }
      },
      d4: {
        id: 'd4',
        logic: { triggerEvent: 'd4Data', dependents: ['d5'] },
        template: { elements: null, label: 'Dropdown 4' }
      },
      d5: {
        id: 'd5',
        logic: { triggerEvent: 'd5Data' },
        template: { elements: null, label: 'Dropdown 5' }
      }
    };
  }

  private processDefaultConfig() {
    this.form.disable({ emitEvent: false });
    this.form.get('d1')?.enable({ emitEvent: false });
    this.businessEventResponse(this.dropdowns.d1); // TODO: remove.
  }

  private applyCustomConfig(inputResources: InputResources) {
    this.applyCustomDependentsConfig(inputResources.config?.dependants);
    this.processCustomConfig();
  }

  private applyCustomDependentsConfig(dependants?: DropdownIdDependents) {
    if (dependants) {
      console.log('applyCustomDependentsConfig: ', dependants);
      Object.entries(dependants).forEach(([k, v]) => {
        const dropdown = this.obtainDropdown(k as DropdownId);
        dropdown.logic.dependents = v;
      });
    }
  }

  private processCustomConfig() {
    this.form.disable({ emitEvent: false });
    this.obtainDropdowns(this.obtainNotDependentDropdowns()).forEach((dropdown) => {
      this.form.get(dropdown.id)?.enable({ emitEvent: false });
      this.businessEventResponse(dropdown); // TODO: remove.
    });
  }

  // Traverse dependents.
  private obtainDependentDropdownsRecursively(root: Dropdown): DropdownId[] {
    const dependents = new Set<DropdownId>();

    root.logic.dependents?.forEach((dependent) =>
      this.traverseDependent(this.obtainDropdown(dependent), dependents)
    );

    return Array.from(dependents);
  }

  private traverseDependent(d: Dropdown, visited: Set<DropdownId>) {
    if (!visited.has(d.id)) {
      visited.add(d.id);
      d.logic.dependents
        ?.filter((dependent) => !visited.has(dependent))
        .forEach((dependent) => this.traverseDependent(this.obtainDropdown(dependent), visited));
    }
  }

  private obtainNotDependentDropdowns(): DropdownId[] {
    let dependentDropdownIds: DropdownId[] = [];

    Object.values(this.dropdowns).forEach((dropdown) => {
      const dependents = dropdown.logic.dependents;
      if (dependents != null && dependents.length > 0) {
        dependentDropdownIds = dependentDropdownIds.concat(dependents);
      }
    });

    const dropdownIds = new Set<DropdownId>(Object.keys(this.dropdowns) as DropdownId[]);

    return Array.from(this.difference<DropdownId>(dropdownIds, new Set(dependentDropdownIds)));
  }

  // Others.
  private obtainDropdowns(keys: DropdownId[]): Dropdown[] {
    return keys.map((v) => this.obtainDropdown(v));
  }

  private obtainDropdown(k: DropdownId): Dropdown {
    return this.dropdowns[k];
  }

  private difference<T>(a: Set<T>, b: Set<T>): Set<T> {
    return new Set([...a].filter((v) => !b.has(v)));
  }

  // Support methods to get type completion in HTML for ng-template.
  // TODO: remove when finish to avoid calling this for every change.
  typedDropdownTemplateConfig = (item: DropdownTemplateConfig) => item;

  // Validations.
  private validateResourcesConfiguration() {
    // One dropdown can be only dependent of one other dropdown.
    // Only next dropdowns are valid as dependents.
    // Dropdown can not depend on itself.
    return true;
  }

  // TODO: remove.
  private get d1Data() {
    return this.constructElements(5, 'a');
  }

  private get d2Data() {
    return this.constructElements(3, 'b');
  }

  private get d3Data() {
    return this.constructElements(7, 'c');
  }

  private get d4Data() {
    return this.constructElements(1, 'd');
  }

  private get d5Data() {
    return this.constructElements(2, 'e');
  }

  private constructElements(length: number, name: string) {
    const res: string[] = [];
    for (const [idx, _] of Array(length).entries()) {
      res.push(`${name}${idx + 1} - ${this.count}`);
    }
    return res;
  }

  private businessEventResponse(d: Dropdown) {
    this.count += 1;
    switch (d.id) {
      case 'd1':
        if (d.template) {
          d.template.elements = this.d1Data;
        }
        break;
      case 'd2':
        if (d.template) {
          d.template.elements = this.d2Data;
        }
        break;
      case 'd3':
        if (d.template) {
          d.template.elements = this.d3Data;
        }
        break;
      case 'd4':
        if (d.template) {
          d.template.elements = this.d4Data;
        }
        break;
      case 'd5':
        if (d.template) {
          d.template.elements = this.d5Data;
        }
        break;
      default:
        console.error('BOOM');
    }
    this.form.get(d.id)?.enable({ emitEvent: false });
    this.ref.detectChanges();
  }

  private customConfig1(): InputResources {
    return {
      config: {
        dependants: {
          d1: ['d2', 'd5'],
          d4: null
        }
      }
    };
  }

  private customConfig2(): InputResources {
    return {
      config: {
        dependants: {
          d4: null
        }
      }
    };
  }

  // Debug
  obtainDependents() {
    return {
      d1: this.dropdowns.d1.logic.dependents,
      d2: this.dropdowns.d2.logic.dependents,
      d3: this.dropdowns.d3.logic.dependents,
      d4: this.dropdowns.d4.logic.dependents,
      d5: this.dropdowns.d5.logic.dependents
    };
  }

  obtainErrors() {
    return Object.entries(this.form.controls).map(([k, v]) => {
      return { [k]: v.errors };
    });
  }
}
