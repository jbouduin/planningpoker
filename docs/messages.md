## Server => Client
| Reason    | Type        | Meaning |
| --------- | ----------- | ------- |
| Error     | Error       | Error message |
| Init      | Self        | First message going to the client. This combination may only be send on connection. |
| Init      | Game        | Send after creating or (re-)joining a game |
| Init      | Participant | Send after (re-)joining a game |
| Change    | Self        | Send after change to self (role) |
| Change    | Participant | Send after any change in participant |
| Change    | Game        |
| Refresh   | *all*       | Send after a client asked to refresh |
| *all*     | Ping        | Just keeping the sockets busy |

**Other combinations should not occur.**
