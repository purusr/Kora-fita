import express from 'express';
import mongoose from 'mongoose';
import User from './models/User.js';
import Question from './models/Questions.js';
import Answer from './models/Answer.js';

const SECRET = 'xyzxyzxyz';

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
  try{
    const upquestion = await newquestion.save()
    res.json({'data':upquestion})
  }catch(error){
    res.json({'data': error})
  }
})


app.post('/updateanswer/:questionId', async(req,res) =>{
  const questionId = req.params
  const answer = req.body
  const userId = req.body
  const currentuser = await User.findById(userId)
  const currentquestion = await Question.findById(questionId)
  const currentanswer = new Answer({username: currentuser.username, userbio: currentuser.bio, actualanswer: answer})
  try{
    const savedanswer = await currentanswer.save()
  const newanswer = await Question.findByIdAndUpdate(questionId, {answers:[...currentquestion.answers, savedanswer]})
  res.json({'data': newanswer})
  }catch(error){
    res.json({'data': 'failed'})
  }
})

app.post('/user/signup/', async(req, res)=> {
    const { email, password, confirmPassword, firstName, lastName } = req.body
    console.log(email)
    try {
        const existingUser = await User.findOne({ email })
        if(existingUser) return res.status(400).json({ message: "User already exist" }); 
        if(password !== confirmPassword) return res.status(400).json({ message: "Password don't match" })
        const hashedPassword = await bcrypt.hash(password, 12)
        const result = await User.create({ email, password: hashedPassword, name: `${firstName} ${lastName}`})
        const token = jwt.sign({ email: result.email, id: result._id }, SECRET, { expiresIn: "60s" })
        
        res.status(200).json({ result, token })

    } catch (error) {
        res.status(500).json({ message: "Something went wrong"}) 
    }
})



app.post('/user/signin', async (req, res)=> {
    const { email, password } = req.body //Coming from formData

    try {
        const existingUser = await User.findOne({ email })
        
        //get userprofile and append to login auth detail

        if(!existingUser) return res.status(404).json({ message: "User doesn't exist" })

        const isPasswordCorrect  = await bcrypt.compare(password, existingUser.password)

        if(!isPasswordCorrect) return res.status(400).json({message: "Invalid credentials"})

        //If crednetials are valid, create a token for the user
        const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, SECRET, { expiresIn: "1m" })
        
        //Then send the token to the client/frontend
        res.status(200).json({ result: existingUser, token })

    } catch (error) {
        res.status(500).json({ message: "Something went wrong"})
    }
})



app.listen(5000,()=>{
    console.log('Running on port 5000')
})
