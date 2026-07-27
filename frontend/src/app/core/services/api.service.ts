import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { CanRejoinDto, CardSetDto } from 'shared-lib';
import { ENVIRONMENT } from '../../../environments/environment';

@Service()
export class ApiService {
  //#region private readonly properties ---------------------------------------
  private readonly httpClient: HttpClient;
  private readonly apiHost: string;
  private readonly apiRoot: string;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.httpClient = inject(HttpClient);
    this.apiHost = ENVIRONMENT.apiHost;
    this.apiRoot = ENVIRONMENT.apiRoot;
  }
  //#endregion

  //#region Public methods ----------------------------------------------------
  public checkCanRejoin(teamName: string, participantId: string): Observable<boolean> {
    return this.httpClient
      .get<CanRejoinDto>(`${this.apiHost}/${this.apiRoot}/team/${teamName}/participant/${participantId}`, {
        observe: 'response',
        responseType: 'json'
      })
      .pipe(
        map((res: HttpResponse<CanRejoinDto>) => res.body?.canRejoin === true),
        catchError(() => of(false))
      );
  }

  public getAllCardSets(): Observable<Array<CardSetDto>> {
    return this.httpClient
      .get<Array<CardSetDto>>(`${this.apiHost}/${this.apiRoot}/cardsets`, { observe: 'response', responseType: 'json' })
      .pipe(
        catchError((error: HttpResponse<Array<CardSetDto>>) => of(error)),
        map((response: HttpResponse<Array<CardSetDto>>) => {
          return response.body || new Array<CardSetDto>();
        })
      );
  }

  public loadContent(language: string, path: string): Observable<string> {
    const url = `/content/${language}/${path}`;
    return this.httpClient.get(url, { responseType: 'text' });
  }
  //#endregion
}
