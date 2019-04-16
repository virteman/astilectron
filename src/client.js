'use strict'

const net = require('net');
const url = require('url');
const consts = require('./consts.js')
const EventEmitter = require('events').EventEmitter;

// Client can read/write messages from a TCP server
class Client {
    // init initializes the Client
    init() {
        let u = url.parse("tcp://" + process.argv[2], false, false)
        this.socket = new net.Socket()
        this.hsok = false
        //try handshake counts limit
        this.hsCounts = 10
        this.socket.connect(u.port, u.hostname, () => {
            this.handshake()
        });
        this.socket.on('close', function() {
            process.exit()
        })
        return this
    }
    handshake(d) {
        if( this.hsok || consts.handshake.nihaoAck == d){
            this.hsok = true
            // send appEventReady 
            this.emit(consts.eventNames.appEventReady, consts.targetIds.app)
            return
        }
        if (this.hsCounts-- > 0) {
            this.socket.write(consts.handshake.nihao)
        }
    }
    // write writes an event to the server
    write(targetID, eventName, payload) {
        let data = {name: eventName, targetID: targetID}
        if (typeof payload !== "undefined") Object.assign(data, payload)
        this.socket.write(JSON.stringify(data) + "\n")
    }
}

// inherits the event emitter
require('util').inherits(Client, EventEmitter);
module.exports = new Client()
