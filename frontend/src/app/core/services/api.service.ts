import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { CanRejoinDto, CardSetDto } from 'shared-lib';

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
    return this.httpClient
      .get<CanRejoinDto>(`/api/team/${teamName}/participant/${participantId}`, {
        observe: 'response',
        responseType: 'json'
      })
      .pipe(
        map((res: HttpResponse<CanRejoinDto>) => res.body?.canRejoin === true),
        catchError(() => of(false))
      );
  }

  public getAllCardSets(): Observable<Array<CardSetDto>> {
    return this.httpClient.get<Array<CardSetDto>>('/api/cardsets', { observe: 'response', responseType: 'json' }).pipe(
      catchError((error: HttpResponse<Array<CardSetDto>>) => of(error)),
      map((response: HttpResponse<Array<CardSetDto>>) => {
        return response.body || new Array<CardSetDto>();
      })
    );
  }
  //#endregion
}
