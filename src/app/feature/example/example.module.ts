import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExampleRoutingModule } from './example-routing.module';
import { ExampleComponent } from '../example/example.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [ExampleComponent],
  imports: [
    CommonModule,
    ExampleRoutingModule,
    SharedModule
  ]
})
export class ExampleModule { }
