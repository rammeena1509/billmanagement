const Counter = require('./../Modules/counter')
const User = require('./../Models/user')
const Validation=require('./../Modules/validation')
const jwt = require('jsonwebtoken')
const config = require('./../config/config')
const Auth=require('./../Modules/authorization')
const BillEntry = require('./../Models/billing_entry')
const async = require("async")
var colors = require('colors/safe');
const moment =require('moment')
// moment.updateLocale('en', null);

module.exports=(router)=>{

    router.post("/login",(request,response)=>{
        if(!request.body.username){
            response.json({success:false,message:"Email/Mobile is required"})
        }
        else if(!request.body.password){
            response.json({success:false,message:"Password is required"})
        }
        else{
            User.findOne({ $or:[{email: request.body.username},{mobile: request.body.username}] }, (error, user) => {   
                if (error) {
                  response.json({ success: false, message: error.err });
                } 
                else{  
                  if (!user) 
                  {
                    response.json({ success: false, message: 'Mobile/Email is not registered.' });
                  } 
                  else{
                    const validPassword = user.comparePassword(request.body.password); 
                    if (!validPassword) 
                    {
                        response.json({ success: false, message: 'Provided password is not valid.' }); 
                    } 
                    else{
                        if(user.isApproved){
                            const token = jwt.sign(
                                { 
                                    userId: user._id,
                                    usercode:user.usercode,
                                    name:user.name,
                                    email:user.email,
                                    role:user.role,
                                    mobile:user.mobile
                                },
                                    config.secret
                                ); 
                            response.json({ success: true, message: 'Logged In Successfully', token:token}); 
                        }
                        else{
                            response.json({ success: false, message: 'Your account approval is under process , we will notify when your account will get approved.'}); 
                        }
                    }
                  }
                }
              });
        }
    })

    router.post("/register",(request,response)=>{
        if(!request.body.name || !Validation.nameValidity(request.body.name)){
            response.json({success:false,message:"Either name is not provided or invalid."})
        }
        else if(!request.body.email || !Validation.emailValidity(request.body.email)){
            response.json({success:false,message:"Either email is not provided or invalid."})
        }
        else if(!request.body.mobile || !Validation.mobileValidity(request.body.mobile)){
            response.json({success:false,message:"Either mobile is not provided or invalid."})
        }
        else if(!request.body.password){
            response.json({success:false,message:"Password is not provided."})
        }
        else if(!request.body.role){
            response.json({success:false,message:"Provide the user role."})
        }
        else{
            Counter.sequenceCounter('user',(id)=>{
                if(id){
                    let usercode=request.body.email
                    usercode=usercode.substr(0,4)
                    if(usercode.includes('@')){
                        usercode=usercode.split('@')[0]
                        usercode=usercode.length==4?usercode:usercode.length<4?usercode+"9999".substr(0,4-usercode.length):usercode.substr(0,4)
                    }
                    usercode=usercode.toUpperCase()+id
                    let user=new User({
                        role:request.body.role,
                        name:request.body.name,
                        email: request.body.email.trim().toLowerCase(),
                        password: request.body.password,
                        usercode:usercode,
                        mobile:request.body.mobile.trim()
                    })
                    user.save().then(result=>{
                        if(result){
                            response.json({success:true,message:"Account registered successfully.We will notify you when your account is active.",usercode:usercode}) 
                        }
                        else{
                            response.json({success:false,message:"Failed to register account. Please try again later."}) 
                        }
                    })
                    .catch(error=>{
                        if(error.code==11000){
                            if(error.message.includes('mobile')){
                                response.json({success:false,message:"Mobile number already registered."}) 
                            }
                            else if(error.message.includes('email')){
                                response.json({success:false,message:"Email already registered."}) 
                            }
                            else if(error.message.includes('usercode')){
                                response.json({success:false,message:"Some error in generating usercode.Please try again later."}) 
                            }
                            else{
                                console.log("Error 1 : "+error.message)
                                response.json({success:false,message:"Some error occured.Please try again later."}) 
                            }
                        }
                        else{
                            console.log("Error 1 : "+error.message)
                            response.json({success:false,message:"Some error occured.Please try again later."}) 
                        }
                    })
                }
                else{
                    response.json({success:false,message:"Some error occured.Please try again later."}) 
                }
            })
        }
    })

    router.post("/userList",Auth.check_auth,(request,response)=>{
        let projection="name usercode"
        if(request.decoded.role=='admin'){
            projection+="email mobile creationDate isApproved role"
        }
        User.find({role:'user'},{_id:false}).select(projection).exec().then((users)=>{
            if(users.length>0){
                response.json({success:true,message:"User list fetched successfully.",data:users})
            }
            else{
                response.json({success:false,message:"No user found."})
            }
        })
        .catch((error)=>{
            console.log("Error /userList 01 "+error.message)
            response.json({success:false,message:"Some error ocuured.Please try again later."})
        })
    })

    router.post("/billList",Auth.check_auth,(request,response)=>{
        let query={}
        let month=new Date().getMonth()+1
        let year=new Date().getFullYear()
        if(request.body.year){
            year=parseInt(request.body.year)
        }
        if(request.body.month){
            month=parseInt(request.body.month)
        }
        // let date=month+"/01/"+year
        // let startDate=moment(date,'MM/DD/YYYY').subtract(5.5, 'hours')
        var firstDay = new Date(year, month-1, 1);
        var lastDay = new Date(year, month, 1);
        // firstDay = moment(firstDay).subtract(5.5, 'hours');
        firstDay = moment(firstDay);
        // lastDay = moment(lastDay).subtract(5.5, 'hours');
        lastDay = moment(lastDay);
        query['paidOn']={$lt:lastDay,$gte:firstDay}
        // query["$expr"]={ "$and": [{ $eq:[{"$month": "$paidOn" }, month] },{ $eq: [ {"$year": "$paidOn" }, year ] }]}
        if(request.decoded.role!='administrator'){
            if(request.body.group && typeof request.body.group=='object'){
                if(!request.body.group.includes(request.decoded.usercode)){
                    request.body.group.push(request.decoded.usercode)
                }
                query["participant.usercode"]={$all:request.body.group}
            }
            else{
                query["participant.usercode"]=request.decoded.usercode
            }
        }
        else{
            if(request.body.group && typeof request.body.group=='object'){
                query["participant.usercode"]={$all:request.body.group}
            }
        }
        if(request.body.payee){
            query["paidBy.usercode"]=request.body.payee
        }
        //console.log(JSON.stringify(query))
        BillEntry.countDocuments(query).exec().then(count=>{
            if(count){
                let limit=5
                let skip=0
                if(request.body.limit){
                    limit=parseInt(request.body.limit)
                }
                if(request.body.pageNo){
                    skip=(parseInt(request.body.pageNo)-1)*limit
                }
                BillEntry.find(query).sort({paidOn:-1}).skip(skip).limit(limit).exec().then(result=>{
                    if(result){
                        response.json({success:true,message:"List fetched successfully",data:result,count:count})
                    }
                    else{
                        response.json({success:false,message:"No bill entry available."})
                    }
                })
                .catch(error=>{
                    console.log("Error /billList 0: "+error.message)
                    response.json({success:false,message:"Some error occured.Please try again later."})
                })
            }
            else{
                response.json({success:false,message:"No bill entry available."})
            }
        })
        .catch(error=>{
            console.log("Error /billList 1: "+error.message)
            response.json({success:false,message:"Some error occured.Please try again later."})
        })
    })

    router.post("/amountEntry",Auth.check_auth,(request,response)=>{
        if(!request.body.amount){
            response.json({success:false,message:"Amount is required"})
        }
        else if(!request.body.remark){
            response.json({success:false,message:"Remark is required"})
        }
        else if(!request.body.users || typeof request.body.users!='object'){
            response.json({success:false,message:"Provide the list of members involved."})
        }
        else if(request.body.paidBy && typeof request.body.paidBy!='object'){
            response.json({success:false,message:"Who have paid the bill?"})
        }
        else{
            let newentry=new BillEntry({
                addedBy:{
                    name:request.decoded.name,
                    usercode:request.decoded.usercode,
                },
                paidBy:request.body.paidBy?request.body.paidBy:{
                    name:request.decoded.name,
                    usercode:request.decoded.usercode,
                },
                amount:Number(request.body.amount),
                comment:request.body.remark,
                participant:request.body.users,
                entryOn:new Date(),
                paidOn:new Date(request.body.paidOn)?request.body.paidOn:new Date()
            })
            newentry.save().then(result=>{
                if(result){
                    response.json({success:true,message:"Amount added successfully."})
                }
                else{
                    response.json({success:false,message:"Error ocuured during entry."})
                }
            })
            .catch(error=>{
                console.log("Error /amountEntry 01 "+error.message)
                response.json({success:false,message:"Some error ocuured.Please try again later."})
            })
        }
    })

    router.post("/calculateAmout",Auth.check_auth,(request,response)=>{
        calculation(request,response)
    })

    return router
}

async function calculation(request, response){
    let query={}
    let month=new Date().getMonth()+1
    let year=new Date().getFullYear()
    if(request.body.year){
        year=parseInt(request.body.year)
    }
    if(request.body.month){
        month=parseInt(request.body.month)
    }
    // let date=month+"/01/"+year
    // let startDate=moment(date,'MM/DD/YYYY').subtract(5.5, 'hours')
    var firstDay = new Date(year, month-1, 1);
    var lastDay = new Date(year, month, 1);
    // firstDay = moment(firstDay).subtract(5.5, 'hours');
    firstDay = moment(firstDay);
    // lastDay = moment(lastDay).subtract(5.5, 'hours');
    lastDay = moment(lastDay);
    query['paidOn']={$lt:lastDay,$gte:firstDay}
    // query['paidOn']={$lt:"2020-04-30T18:30:00.000Z",$gte:"2020-02-29T18:30:00.000Z"}
    // query["$expr"]={ "$and": [{ $eq:[{"$month": "$paidOn" }, month] },{ $eq: [ {"$year": "$paidOn" }, year ] }]}
    if(request.decoded.role!='administrator'){
        if(request.body.group && typeof request.body.group=='object'){
            if(!request.body.group.includes(request.decoded.usercode)){
                request.body.group.push(request.decoded.usercode)
            }
            query["participant.usercode"]={$all:request.body.group}
        }
        else{
            query["participant.usercode"]=request.decoded.usercode
        }
    }
    else{
        if(request.body.group && typeof request.body.group=='object'){
            query["participant.usercode"]={$all:request.body.group}
        }
    }
    if(request.body.payee){
        query["paidBy.usercode"]=request.body.payee
    }
    console.log(JSON.stringify(query))
    BillEntry.find(query).lean().exec().then(async (result)=>{
        if(result.length>0){
            let data = await groupingData(result)
            let finalArray=await processArray(data)
            let calculationArray=[]
            for(array of finalArray){
                // console.log("--------------for loop-------------")
                let tempArray=[]
                for(dataArray of array.data){
                    //console.log("--------------inner for loop-------------")
                    let dt=await calculateDistribution(dataArray)
                    tempArray.push(dt)
                }
                calculationArray.push({memberCount:array.memberCount,data:tempArray})
            }
            User.find({"role" : "user"}).select('name usercode').exec().then(async (result)=>{
                if(result){
                    let paymentArray=[]
                    let userArray=result.slice(0)
                    if(request.decoded.role!='administrator'){
                        userArray=result.filter((item1)=>{return item1.usercode==request.decoded.usercode})
                    }
                    for(item of calculationArray){
                        for(ndata of item.data){
                            for(user of userArray){
                                let isExists=ndata.participant.find((lin)=>{return lin.usercode==user.usercode})
                                if(isExists){
                                    let updatedUser=[]
                                    updatedUser=result.filter((item1)=>{return item1.usercode!=user.usercode})
                                    for(otherUser of updatedUser){
                                        await checkExistanceOfUser(user,otherUser,ndata,paymentArray)
                                    }
                                    let uInd=paymentArray.findIndex((el)=>{return el.user.usercode==user.usercode})
                                    if(uInd>-1){
                                       paymentArray[uInd].user.total+=isExists.amount
                                    }
                                }
                            }
                        }
                    }
                    response.json({success:true,data:calculationArray,payment:paymentArray})
                }
                else{
                    response.json({success:true,data:calculationArray,payment:false})
                }
            })
            .catch((error)=>{
                console.log("Error 102 :"+error.message)
                response.json({success:true,data:calculationArray,payment:false})
            })
        }
        else{
            response.json({success:false,message:"no data found"})
        }
    })
    .catch((error)=>{
        console.log("Error in /calculateAmount 1 :"+error.message )
        response.json({success:true,message:"Some error occured.Please try again later."})
    })
}

function groupingData(bill){
    return new Promise((resolve)=>{
        let billSplit=[]
        for(item of bill){
            let index = billSplit.findIndex(item1=>{ return item1.memberCount==item.participant.length })
            if(index!=-1) {
                billSplit[index].data.push(item)
            }
            else{
                billSplit.push({data:[item],memberCount:item.participant.length})
            } 
        }
        resolve(billSplit)
    })
}

function subGroupingData(array,callRT){
    newArray=[]
    while(array.length>0){
        let temporary=[]
        temporary.push(array[0])
        let currentArray=array[0].participant
        array.shift()
        let tempArray=array.slice()
        sliceCount=0
        for(var i=0;i<tempArray.length;i++){
            notEqual(currentArray,tempArray[i].participant,(status)=>{
                if(status){
                    // continue;
                }
                else{
                    try{
                        temporary.push(tempArray[i]) 
                    }
                    catch(e){
                        console.error("------------********Error 123*********----------------")
                        console.log(e.message)
                    }
                    array.splice(i-sliceCount,1)
                    sliceCount++;
                }
            })
        }
        newArray.push(temporary)
    }
    callRT(newArray)
}

function calculateDistribution(array){
    return new Promise((resolve)=>{
        let totalAmount=0
        let participant=[]
        array[0].participant.map((item)=>{participant.push({name:item.name,usercode:item.usercode,amount:0})})
        async.forEach(array,(item,callback)=>{
            totalAmount=totalAmount+item.amount
            let paidBy=item.paidBy.usercode
            let index=participant.findIndex((item)=>{return item.usercode==paidBy})
            if(index!=-1){
                if(participant[index].amount){
                    participant[index].amount+=item.amount
                }
                else{
                    participant[index]['amount']=item.amount
                }
            }
            else{
                participant.push({
                    name:item.paidBy.name,
                    usercode:item.paidBy.usercode,
                    amount:item.amount
                })
            }
            callback()
        },(error)=>{
            if(error){
                resolve([])
            }
            else{
                perPerson=Math.round(totalAmount/participant.length)
                let newArray=[]
                participant.map((item)=>{
                    let obj={}
                    if(item.amount>perPerson){
                        obj['type']="receive"
                        obj['overflow']=item.amount-perPerson
                    }
                    else if(item.amount<perPerson){
                        obj['type']="pay"
                        obj['overflow']=perPerson-item.amount
                    }
                    else{
                        obj['type']="na"
                        obj['overflow']=0
                    }
                    newArray.push({name:item.name,amount:item.amount,usercode:item.usercode,type:obj.type,overflow:obj.overflow,nominee:[]})
                })
                let payeeArray=[]
                let creditArray=[]
                for(item of newArray){
                    let obj={}
                    if(item.type=='pay'){
                        Object.assign(obj, item)
                        payeeArray.push(obj)
                    }
                    else if(item.type=='receive'){
                        Object.assign(obj, item)
                        creditArray.push(obj)
                    }
                }
                for(bank of creditArray){
                    let overflow=bank.overflow
                    let adjust=false
                    while(!adjust){
                        try{
                            if(payeeArray.length>0){
                                let xx=payeeArray.sort((a, b) => Math.abs(bank.overflow - a.overflow) - Math.abs(bank.overflow - b.overflow))[0]
                                if(xx.overflow<=overflow){
                                    overflow=overflow-xx.overflow
                                    let index=payeeArray.findIndex((item)=>{return item.usercode==xx.usercode})
                                    payeeArray.splice(index,1)
                                    index=newArray.findIndex((item)=>{return item.usercode==bank.usercode})
                                    newArray[index].nominee.push({
                                        name:xx.name,
                                        amount:xx.overflow,
                                        usercode:xx.usercode,
                                        type:'receive'
                                    })
                                    index=newArray.findIndex((item)=>{return item.usercode==xx.usercode})
                                    newArray[index].nominee.push({
                                        name:bank.name,
                                        amount:xx.overflow,
                                        usercode:bank.usercode,
                                        type:'pay'
                                    })
                                }
                                else{
                                    let index=payeeArray.findIndex((item)=>{return item.usercode==xx.usercode})
                                    payeeArray[index].overflow=xx.overflow-overflow
                                    index=newArray.findIndex((item)=>{return item.usercode==bank.usercode})
                                    newArray[index].nominee.push({
                                        name:xx.name,
                                        amount:overflow,
                                        usercode:xx.usercode,
                                        type:'receive'
                                    })
                                    index=newArray.findIndex((item)=>{return item.usercode==xx.usercode})
                                    newArray[index].nominee.push({
                                        name:bank.name,
                                        amount:overflow,
                                        usercode:bank.usercode,
                                        type:'pay'
                                    })
                                    overflow=0
                                }
                                if(overflow==0 || payeeArray.length==0){
                                    adjust=true
                                }
                            }
                            else{
                                adjust=true
                            }
                        }
                        catch(e){
                            adjust=true
                        }
                    }
                }
                resolve({totalAmount:totalAmount,divide:perPerson,participant:newArray})
            }
        })
    })
}

function notEqual(array1,array2,callRT){
    if(array1.length!=array2.length){
        callRT(true)
    }
    else{
        let array2Code=array2.map(item=>{return item.usercode})
        let status=array1.map((item)=>{
            return array2Code.includes(item.usercode)
        });
        if(status.find((it)=>{return it==false})==false) callRT(true)
        else callRT(false)
    }
}

function processArray(data){
    return new Promise((resolve)=>{
        let finalArray=[]
        async.forEach(data,(element,callback)=>{
            subGroupingData(element.data,(subdata)=>{
                finalArray.push({memberCount:element.memberCount,data:subdata})
                callback()
            })    
        },(error)=>{
            if(error){
                console.log("Errro 2312381298 "+error.message)
                resolve([])
            }
            else{
                resolve(finalArray)
            }
        })
    })
}

function checkExistanceOfUser(user,otherUser,ndata,paymentArray){
    return new Promise((resolve)=>{
        let existss = ndata.participant.filter( vendor => vendor.usercode === user.usercode || vendor.usercode=== otherUser.usercode)
        if(existss.length==2){
            let tempObj=existss.find((item)=>{return item.usercode==otherUser.usercode})
            let tempNominee=tempObj.nominee.find((item)=>{return item.usercode==user.usercode})
            if(tempNominee){
                let index=paymentArray.findIndex((el)=>{return el.user.usercode==user.usercode})
                if(index>-1){
                    let subindex=paymentArray[index].data.findIndex((ell)=>{return ell.user.usercode==otherUser.usercode})
                    if(subindex>-1){
                        if(tempNominee.type=='pay'){
                            paymentArray[index].user.receive+=tempNominee.amount
                            paymentArray[index].data[subindex].amount.receive+=tempNominee.amount
                        }
                        else{
                            paymentArray[index].user.pay+=tempNominee.amount
                            paymentArray[index].data[subindex].amount.pay+=tempNominee.amount
                        }
                    }
                    else{
                        if(tempNominee.type=='pay'){
                            paymentArray[index].user.receive+=tempNominee.amount
                            paymentArray[index].data.push({
                                user:otherUser,
                                amount:{receive:tempNominee.amount,pay:0}
                            })
                        }
                        else{
                            paymentArray[index].user.pay+=tempNominee.amount
                            paymentArray[index].data.push({
                                user:otherUser,
                                amount:{receive:0,pay:tempNominee.amount}
                            })
                        }
                    }
                }
                else{
                    if(tempNominee.type=='pay'){
                        paymentArray.push({
                            user:{_id:user._id,name:user.name,usercode:user.usercode,receive:tempNominee.amount,pay:0,total:0},
                            data:[{user:otherUser,amount:{receive:tempNominee.amount,pay:0}}]})
                    }
                    else{
                        paymentArray.push({
                            user:{_id:user._id,name:user.name,usercode:user.usercode,receive:0,pay:tempNominee.amount,total:0},
                            data:[{user:otherUser,amount:{receive:0,pay:tempNominee.amount}}]})
                    }                                           
                }
                resolve(true)
            }
            else{
                resolve(false)
            }
        }
        else{
            resolve(false)
        }
    })
}


function delay(){
    return new Promise((resolve)=>{
        setTimeout(() => {
            resolve(true)
        }, 1000);
    })
}