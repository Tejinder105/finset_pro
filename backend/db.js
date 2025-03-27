const mongoose=require('mongoose')

const mongoURL='mongodb://127.0.0.1:27017/usersdatabase'

mongoose.connect(mongoURL);

const db=mongoose.connection;

db.on('connected',()=>{
    console.log('Mongodb connected')
})


module.export=mongoose;
