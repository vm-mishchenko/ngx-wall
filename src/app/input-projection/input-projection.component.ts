import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable, of, Subject} from 'rxjs';
import {startWith, switchMap} from 'rxjs/operators';

@Component({
    selector: 'input-projection',
    templateUrl: 'input-projection.component.html'
})
export class InputProjection implements OnInit {
  input = new FormControl();
  list1$ = this.transform1(this.input.valueChanges);
  list2$ = this.transform2(this.input.valueChanges);
  keyStream$ = new Subject();

  constructor() {
  }

  ngOnInit() {
    }

  onKeydown(event) {
    this.keyStream$.next(event);
  }

  onValue(value) {
    console.log(value);
  }

  transform1(input$: Observable<string>): Observable<any[]> {
    const items = [
      {
        'id': '5b902934d965e7501f4e1c6f',
        'name': 'Caroline Hodges'
      },
      {
        'id': '5b9029348f7eed8b6f5f02db',
        'name': 'Delores Rivas'
      },
      {
        'id': '5b9029346f48c8407c64d0d5',
        'name': 'Darlene Franklin'
      },
      {
        'id': '5b9029341eff315fa87f9e21',
        'name': 'Alfreda Love'
      },
      {
        'id': '5b9029342e8917c6ccdb9865',
        'name': 'Marcy Ratliff'
      }
    ];

    return input$.pipe(
      switchMap((value) => {
        if (!value) {
          return of([]);
        }

        return of(items.filter((item) => {
          return item.name.includes(value);
        }));
      })
    );
  }

  transform2(input$: Observable<string>): Observable<any[]> {
    const items = [
      {
        'id': '5b9029349dbb48013460e01f',
        'name': 'Beulah Nielsen'
      },
      {
        'id': '5b902934f4f1586e5e72d74a',
        'name': 'Morton Kerr'
      },
      {
        'id': '5b9029347918bb204bf7014e',
        'name': 'Autumn Tillman'
      },
      {
        'id': '5b902934b86f80e1fc60c626',
        'name': 'Diane Bennett'
      },
      {
        'id': '5b9029348999f59215020349',
        'name': 'June Eaton'
      }
    ];

    return input$.pipe(
      switchMap((value) => {
        return of(items.filter((item) => {
          return item.name.includes(value);
        }));
      }),
      startWith(items)
    );
  }
}
