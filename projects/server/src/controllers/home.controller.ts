import { Request, Response } from 'express';
import { injectable } from 'inversify';
import 'reflect-metadata';

export interface IHomeController {
  HelloWorld(_request: Request, response: Response): void;
}

@injectable()
export class HomeController implements IHomeController {
  HelloWorld(_request: Request, response: Response): void {
    response.send({message: 'Hello world'});
  }
}
