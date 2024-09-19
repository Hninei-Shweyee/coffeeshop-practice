const axios = require('axios');

const customer = {
customer_name: 'Mike',
        contact: '66775597',
        membership: true,
};

axios
.post('http://localhost:3000/customer',customer)
.then(response=>console.log(response))
.catch(err=> console.log(err));