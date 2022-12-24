import mongoose from "mongoose";

const questionShema = mongoose.Schema({
    userId: String,
    question: String,
    answers: Array,
})

const Question = mongoose.model('Question', questionShema)
export default Question