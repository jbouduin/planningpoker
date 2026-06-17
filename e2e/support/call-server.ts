import * as  http from 'http';

class CallServer {
  public deleteTeam(teamName: string): void {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `/82b52f20-24e6-44c0-a87d-701c150858a0/team/${teamName}`,
      method: 'DELETE',
    };
    const req = http.request(options, (_res) => {
      // ...
    });
    req.end();
  }

  public reset() {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/82b52f20-24e6-44c0-a87d-701c150858a0/reset',
      method: 'POST',
    };
    const req = http.request(options, (_res) => {
      // ...
    });
    req.end();
  }
}

export default new CallServer();
