import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ICardSet } from '@shared-lib';
import { catchError, map, Observable, of } from 'rxjs';

interface LooseObject {
  [key: string]: any  //eslint-disable-line
}

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  //#region private readonly properties ---------------------------------------
  private readonly httpClient: HttpClient;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
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
  //#endregion
}
