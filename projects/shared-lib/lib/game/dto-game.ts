import { DtoCard } from './dto-card';

export interface DtoGame {
    team: string;
    cards: Array<DtoCard>;
}
