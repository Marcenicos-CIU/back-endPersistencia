const logRequest = (req, _, next) =>{
  console.log({method: req.method,url: req.url, fechaHora: new Date()})
  next()  
};

module.exports = {logRequest}