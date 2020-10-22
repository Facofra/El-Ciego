const fs = require('fs')
const path = require('path')

module.exports={
    index: function(res,res){
        const imagenesPath = path.join(__dirname,'..','public','images','cartas')
        let cartas =fs.readdirSync(imagenesPath)
        cartas.splice(cartas.indexOf('Back-of-card.png'),1)

        res.render('sala',{cartas});
    }
}