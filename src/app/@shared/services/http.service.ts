import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

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
  // TODO handle this different as sending a 404
  // TODO check for uuid and nick also
  public checkTeamExists(teamName: string): Observable<boolean> {
    return this.httpClient
      .get(`/api/team/${teamName}`, { observe: 'response', responseType: 'text' })
      .pipe(
        catchError((error: HttpResponse<unknown>) => of(error)),
        map((response: HttpResponse<unknown>) => {
          return response.status == 200 ? true : false
        })
      );
  }
  //#endregion
}
