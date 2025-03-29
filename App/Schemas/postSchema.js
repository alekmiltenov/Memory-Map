const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please enter a title"]
    },
    description: {
        type: String,
        required: false ,
        default: ''
       },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    date: {
        type: Date,
        required: [true, "Please enter a date"],
        default: Date.now
    },
    participants: [
        { type: String }
    ],
    accessGroups: [
        { type: String }
    ],
    picture: {
        type: String,
        default: ''
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

PostSchema.index({ location: "2dsphere" });

const Post = mongoose.model('Post', PostSchema);

module.exports = Post
