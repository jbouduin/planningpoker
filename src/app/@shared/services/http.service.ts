import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, from, map, Observable, of, Subject } from 'rxjs';

import { ICardSet } from '@shared-lib';

interface LooseObject {
  [key: string]: any  //eslint-disable-line
}

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  //#region private readonly properties ---------------------------------------
  private readonly content: Subject<[number, string]>;
  private readonly httpClient: HttpClient;
  private _currentPath: [number, string] | undefined;
  //#endregion

  public getContent: Observable<[number, string]>;
  //#region Constructor & C° --------------------------------------------------
  public constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
    this._currentPath = undefined;
    this.content = new Subject<[number, string]>();
    this.getContent = from(this.content);
  }
  //#endregion

  //#region Public methods ----------------------------------------------------
  public checkCanRejoin(teamName: string, uuid: string): Observable<boolean> {
    return this.httpClient
      .get<LooseObject>(`/api/team/${teamName}/participant/${uuid}`, { observe: 'response', responseType: 'json' })
      .pipe(
        catchError((error: HttpResponse<LooseObject>) => of(error)),
        map((response: HttpResponse<LooseObject>) => {
          return response.status == 200 && response.body?.canRejoin == true ? true : false
        })
      );
  }

  public getAllCardSets(): Observable<Array<ICardSet>> {
    return this.httpClient
      .get<Array<ICardSet>>(`/api/cardsets`, { observe: 'response', responseType: 'json' })
      .pipe(
        catchError((error: HttpResponse<Array<ICardSet>>) => of(error)),
        map((response: HttpResponse<Array<ICardSet>>) => {
          return response.body || new Array<ICardSet>()
        })
      );
  }

  public set currentPath(value: [number, string]) {
    this._currentPath = value;
    this.loadContent(value);
  }


  //#endregion

  //#region public methods ----------------------------------------------------
  private loadContent(value: [number, string]): void {
    if (this._currentPath) {
      this.httpClient
        .get(`assets/${value[1]}`,{ responseType: 'text'})
        // .get<unknown>(`/api/site/page?content=${this._currentPath}`)
        .subscribe((content) => this.content.next([value[0], content]));
    }
  }
  //#endregion
}
