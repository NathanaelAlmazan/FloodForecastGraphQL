import { EventEmitter } from "events"
import { Client } from "pg"

const RESERVED_CHANNELS = ['newListener', 'removeListener', 'notify', 'unlisten', 'listen', 'error', 'end']

export class CustomEventEmitter extends EventEmitter {
    notify!: <T>(channel: string, payload: T) => void
    end!: () => void
}

export const PgIPC = (pgClient: Client) => {
    const emitter = new CustomEventEmitter()
    let stop = false

    const _dispatchListen = (channel: string) => {
        pgClient.query(`LISTEN ${pgClient.escapeIdentifier(channel)}`, (err) => {
          if (err) return emitter.emit('error', err)
          emitter.emit('listen', channel)
        })
    }

    const _dispatchUnlisten = (channel: string) => {
        pgClient.query(`UNLISTEN ${pgClient.escapeIdentifier(channel)}`, function (err) {
          if (err) return emitter.emit('error', err)
          emitter.emit('unlisten', channel)
        })
      }

    emitter.on("newListener", (channel: string, fn) => {
        if (RESERVED_CHANNELS.indexOf(channel) < 0 && emitter.listenerCount(channel) === 0) {
            _dispatchListen(channel)
          }
    })

    emitter.on('removeListener', (channel: string, fn) => {
        if (RESERVED_CHANNELS.indexOf(channel) < 0 && emitter.listenerCount(channel) === 0) {
          _dispatchUnlisten(channel)
        }
    })

    pgClient.on('notification', (msg) => {
        if (msg.payload) {
            msg.payload = JSON.parse(msg.payload)
            emitter.emit(msg.channel, msg)
        }
    })

    emitter.notify = <T>(channel: string, payload: T) => {
        const encodedPayload = typeof payload !== 'string' ? JSON.stringify(payload) : payload

        pgClient.query(`NOTIFY ${pgClient.escapeIdentifier(channel)}, ${pgClient.escapeLiteral(encodedPayload)}`, (err) => {
            if (err) emitter.emit("error", err)
            else emitter.emit("notify", channel, payload)
        })
    }

    emitter.end = () => {
        if (stop) return
        stop = true

        try {
            pgClient.query(`UNLISTEN *`, _end)
        } catch (err) {
            _end()
        }
    }

    const _end = (err?: Error) => {
        if (err) {
          stop = false
          return emitter.emit('error', err)
        }
        emitter.emit('end')
        emitter.removeAllListeners()
    }

    return emitter
}