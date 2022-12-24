import express from 'express';
import mongoose from 'mongoose';
import User from './models/User.js';
import Question from './models/Questions.js';
import Answer from './models/Answer.js';

mongoose.connect('mongodb+srv://krish-node:Krishna8686@cluster0.emvic.mongodb.net/?retryWrites=true&w=majority',{ useNewUrlParser: true, useUnifiedTopology: true})
.then(()=> console.log('DB connected'))
.catch((error)=> console.log('DB has connection error'));
const app = express();

app.use((express.json()))
app.use((express.urlencoded({extended: true})))

app.get('/', (req,res)=>{
  res.send('Server is live')
})


app.get('/getquestions', async(req, res) =>{
 const questions = await Question.find()
 res.json({data :questions})
})

app.post('/updateFollowing/:userId/:followingId', async(req, res) => {
  const {userId, followingId} = req.params
  const followingUser = User.findById(followingId)
  const currentUser = User.findById(userId)
  const updatecurrent = User.findByIdAndUpdate(userId, {following:[...currentUser.following,{id:followingUser._id, name:followingUser.username}]})
  const updatefollowinguser = User.findByIdAndUpdate(followingId,{followers:[...followingUser.followers,{id:currentUser._id, name:currentUser.username}]})
  try{
    const userdata = await updatecurrent.save()
    await updatefollowinguser.save()
    res.json({data: userdata})
  }catch(error){
    res.json({error: 'Something went wrong'})
  }

})

app.post('/createquestion/:userid', async(req,res) =>{
  const userid = req.params
  const questionstring = req.body
  const newquestion = new Question({userId: userid, question:questionstring, answers:[] })
})


app.listen(5000,()=>{
    console.log('Running on port 5000')
})
