import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ITreeModel } from '../model/itree-model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ExampleService {

  constructor(private http: HttpClient) { }

  getExample(field: string): Observable<ITreeModel> {
    return this.http.get<ITreeModel>(`/assets/data/example${field}.json`);
  }
}
