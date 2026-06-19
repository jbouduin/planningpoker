import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class HttpService {
  //#region private readonly properties ---------------------------------------
  private readonly httpClient: HttpClient;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }
  //#endregion
}
