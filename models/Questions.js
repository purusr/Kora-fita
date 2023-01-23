import mongoose from "mongoose";

const questionShema = mongoose.Schema({
    userId:Array,
    question: String,
    answers: Array,
    likes: Array,
})

const Question = mongoose.model('Question', questionShema)
export default Question
