"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PgIPC = exports.CustomEventEmitter = void 0;
const events_1 = require("events");
const RESERVED_CHANNELS = ['newListener', 'removeListener', 'notify', 'unlisten', 'listen', 'error', 'end'];
class CustomEventEmitter extends events_1.EventEmitter {
}
exports.CustomEventEmitter = CustomEventEmitter;
const PgIPC = (pgClient) => {
    const emitter = new CustomEventEmitter();
    let stop = false;
    const _dispatchListen = (channel) => {
        pgClient.query(`LISTEN ${pgClient.escapeIdentifier(channel)}`, (err) => {
            if (err)
                return emitter.emit('error', err);
            emitter.emit('listen', channel);
        });
    };
    const _dispatchUnlisten = (channel) => {
        pgClient.query(`UNLISTEN ${pgClient.escapeIdentifier(channel)}`, function (err) {
            if (err)
                return emitter.emit('error', err);
            emitter.emit('unlisten', channel);
        });
    };
    emitter.on("newListener", (channel, fn) => {
        if (RESERVED_CHANNELS.indexOf(channel) < 0 && emitter.listenerCount(channel) === 0) {
            _dispatchListen(channel);
        }
    });
    emitter.on('removeListener', (channel, fn) => {
        if (RESERVED_CHANNELS.indexOf(channel) < 0 && emitter.listenerCount(channel) === 0) {
            _dispatchUnlisten(channel);
        }
    });
    pgClient.on('notification', (msg) => {
        if (msg.payload) {
            msg.payload = JSON.parse(msg.payload);
            emitter.emit(msg.channel, msg);
        }
    });
    emitter.notify = (channel, payload) => {
        const encodedPayload = typeof payload !== 'string' ? JSON.stringify(payload) : payload;
        pgClient.query(`NOTIFY ${pgClient.escapeIdentifier(channel)}, ${pgClient.escapeLiteral(encodedPayload)}`, (err) => {
            if (err)
                emitter.emit("error", err);
            else
                emitter.emit("notify", channel, payload);
        });
    };
    emitter.end = () => {
        if (stop)
            return;
        stop = true;
        try {
            pgClient.query(`UNLISTEN *`, _end);
        }
        catch (err) {
            _end();
        }
    };
    const _end = (err) => {
        if (err) {
            stop = false;
            return emitter.emit('error', err);
        }
        emitter.emit('end');
        emitter.removeAllListeners();
    };
    return emitter;
};
exports.PgIPC = PgIPC;
//# sourceMappingURL=pgIPC.js.map