## Server => Client
| Reason    | Type        | Meaning |
| --------- | ----------- | ------- |
| Error     | Error       | Error message |
| Init      | Self        | First message going to the client. This combination may only be send on connection. |
| Init      | Game        | Send after creating or (re-)joining a game |
| Init      | Participant | Send after (re-)joining a game |
| Change    | Cards       | Send the available cards |
| Change    | Estimation  | Sends current estimations to participant |
| Change    | Self        | Send after change to self (role) |
| Change    | Participant | Send after any change in participant |
| Change    | Game        |
| Refresh   | State       | Send after a participant asked to refresh, (re-)joined |
|           | EndOfGame   | Signals the fact that the scrum master has ended the game |
| *all*     | Ping        | Just keeping the sockets busy |

**Other combinations should not occur.**
