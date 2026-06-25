"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EServerMessageType = void 0;
var EServerMessageType;
(function (EServerMessageType) {
    EServerMessageType["CardSet"] = "card-lset";
    EServerMessageType["ClearEstimations"] = "clear-estimations";
    EServerMessageType["EndInit"] = "end-init";
    EServerMessageType["EndSession"] = "end-session";
    EServerMessageType["Error"] = "error";
    EServerMessageType["EstimationList"] = "estimation-list";
    EServerMessageType["GameStateChanged"] = "game-state-changed";
    EServerMessageType["Init"] = "init";
    EServerMessageType["MemberChanged"] = "member-changed";
    EServerMessageType["MemberList"] = "member-list";
    EServerMessageType["Ping"] = "ping";
    EServerMessageType["Self"] = "self";
    EServerMessageType["ServerReset"] = "server-reset";
    EServerMessageType["TeamIdle"] = "team-idle";
    EServerMessageType["TeamName"] = "team-name";
})(EServerMessageType || (exports.EServerMessageType = EServerMessageType = {}));
//# sourceMappingURL=server-message-type.enum.js.map