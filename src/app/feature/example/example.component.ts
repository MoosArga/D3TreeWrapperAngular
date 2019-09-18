import { Component, OnInit } from '@angular/core';
import { ExampleService } from 'src/app/shared/service/example.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { ITreeModel } from 'src/app/shared/model/itree-model';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html'
})
export class ExampleComponent implements OnInit {

  example$: Observable<ITreeModel>;
  nbExample$: BehaviorSubject<string> = new BehaviorSubject<string>('1');

  constructor(private exampleService: ExampleService) { }

  ngOnInit() {
    this.example$ = this.nbExample$.pipe(
      switchMap(nb => this.exampleService.getExample(nb))
    );
  }

  switchExample(nb: string): void {
    this.nbExample$.next(nb);
  }

}
