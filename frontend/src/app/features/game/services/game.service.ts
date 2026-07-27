import { computed, inject, Service, Signal } from '@angular/core';
import { ParticipantDto } from 'shared-lib';
import { Member, SessionService } from '../../../core';
import { TeamService } from '../../team/services';

@Service()
export class GameService {
  // CONSIDER moving this to team service and move poker service implementation here
  //#region Signals -----------------------------------------------------------
  public allMembers: Signal<Array<Member>>;
  //#endregion

  //#region Constructor & C° -------------------------------------------------
  public constructor() {
    // --- Dependency injection ---
    const sessionSvc = inject(SessionService);
    const teamSvc = inject(TeamService);

    // --- Initialize ---
    this.allMembers = computed(() => {
      const me = sessionSvc.me();
      const others = teamSvc.participants().map((p: ParticipantDto) => new Member(p, false));
      return me ? [me, ...others] : others;
    });
  }
  //#endregion
}
