const mongoose = require('mongoose');
const { Schema } = mongoose;

const LiveGameSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    names: { type: Array, "default": [] },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
});

const LiveGame = mongoose.model('LiveGame', LiveGameSchema);
//LiveGame.collection.createIndex({createdAt: 1}, {expireAfterSeconds: 4500});
module.exports = LiveGame;