import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { ICanRejoinResponse, ICardSet } from 'shared-lib';

// TODO move to shared-lib
// interface LooseObject {
//   [key: string]: any; //eslint-disable-line
// }

@Service()
export class ApiService {
  //#region private readonly properties ---------------------------------------
  private readonly httpClient: HttpClient;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.httpClient = inject(HttpClient);
  }
  //#endregion

  //#region Public methods ----------------------------------------------------
  public checkCanRejoin(teamName: string, participantId: string): Observable<boolean> {
    return (
      this.httpClient
        // TODO .get<ICanRejoinResponse>(`/api/team/${teamName}/participant/${participantId}`, { observe: 'response', responseType: 'json' })
        .get<ICanRejoinResponse>(`/api/team/${teamName}/participant/${participantId}`, {
          observe: 'response',
          responseType: 'json'
        })
        .pipe(
          map((res: HttpResponse<ICanRejoinResponse>) => res.body?.canRejoin === true),
          catchError(() => of(false))
        )
    );
  }

  public getAllCardSets(): Observable<Array<ICardSet>> {
    return this.httpClient.get<Array<ICardSet>>('/api/cardsets', { observe: 'response', responseType: 'json' }).pipe(
      catchError((error: HttpResponse<Array<ICardSet>>) => of(error)),
      map((response: HttpResponse<Array<ICardSet>>) => {
        return response.body || new Array<ICardSet>();
      })
    );
  }
  //#endregion
}
