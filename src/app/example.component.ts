import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CircleToogle, SearchOption } from './example.model';
// declare var $localize: any;

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss']
})
export class ExampleComponent implements OnInit, AfterViewInit {
  form: FormGroup;

  channel = 'retail';

  circlesToogle: CircleToogle[] = [
    {
      value: SearchOption.BY_PLATE,
      label: 'By Plate',
      // label: $localize`:@@nb-vehicle-search-method.search-option.plate:Vehicle plate number`,
      icon: 'product-car-front'
    },
    {
      value: SearchOption.BY_DETAILS,
      label: 'By Details',
      // label: $localize`:@@nb-vehicle-search-method.search-option.detail:Vehicle details`,
      icon: 'product-paper-document'
    },
    {
      value: SearchOption.BY_SMART,
      label: 'Smart Search',
      // label: $localize`:@@nb-vehicle-search-method.search-option.smart:Smart search`,
      icon: 'product-light-bulb-idea'
    }
  ];

  constructor(private ref: ChangeDetectorRef) {
    // @ts-ignore
    window['a'] = this;
  }

  ngOnInit() {
    this.form = this.createForm();
  }

  ngAfterViewInit() {}

  private createForm(): FormGroup {
    return new FormGroup({
      searchType: new FormControl(SearchOption.BY_PLATE)
    });
  }

  setSearchType(searchOption: SearchOption) {
    if (this.form.get(['searchType']).value !== searchOption)
      this.form.get(['searchType']).setValue(searchOption ? searchOption : SearchOption.BY_PLATE);
  }

  getSearchType(): string {
    return this.form.get(['searchType']).value;
  }
}
