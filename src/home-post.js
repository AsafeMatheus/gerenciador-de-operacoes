const https = require('https')

module.exports = function(app, Operations){
    return(
        app.post('/', (req, res) => {
            let searchOperation = req.body.searchOperation
            
            Operations.find({"date": searchOperation},(err, docs) => {
                if (err){
                    console.log(err)
                } else{
                    if(docs.length == 0){
                        Operations.find({"name": searchOperation}, (err, docs) => {
                            if (err){
                                console.log(err)
                            } else{
                                Operations.find((err, allOperations) => {
                                    if (err){
                                        console.log(err)
                                    } else{
                                        var totalRate = 0
                            
                                        allOperations.forEach((element) => {
                                            totalRate += element.rate
                                        })
                                        res.render('home', {allOperations: docs, totalRate: totalRate})
                                    }
                                })
                            }
                        })
                    } else{
                        Operations.find((err, allOperations) => {
                            if (err){
                                console.log(err)
                            } else{
                                var totalRate = 0
                    
                                allOperations.forEach((element) => {
                                    totalRate += element.rate
                                })
                                res.render('home', {allOperations: docs, totalRate: totalRate})
                            }
                        })
                    }
                }
            })
        })
    )
}