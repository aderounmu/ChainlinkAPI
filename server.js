require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const qs = require('qs');


const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const port = process.env.PORT || 8000;

function btoa(data){
	return Buffer.from(data).toString('base64');
}

//simple route to access paypal 
app.get('/check/order/:orderID',async (req,res)=>{




	//1c. Get an access token from the PayPal API
	let basicAuth = btoa(`${ process.env.PAYPAL_CLIENT }:${ process.env.PAYPAL_SECRET }`);

	
	// // let authres = await axios.post(process.env.PAYPAL_OAUTH_API,
	// //  {grant_type='client_credentials'},
	// //   { 
	// //   	headers: {
	// // 	    Accept:        `application/json`,
	// // 	    Authorization: `Basic ${ basicAuth }`
	// //   	}
	// // });
	try{

	let authres = await axios({
		method: 'post',
		url: process.env.PAYPAL_OAUTH_API,
		data: qs.stringify({ grant_type : 'client_credentials'}),
	  	headers: {
		    'Accept':        `application/json`,
		    'Content-Type': 'application/x-www-form-urlencoded',
		    'Authorization': `Basic ${ basicAuth }`
	  	}
	
	});
	
	let auth = await authres.data//.json();

	// 2. Set up your server to receive a call from the client

	// 2a. Get the order ID from the request body
	let orderID = req.params.orderID;

	// 3. Call PayPal to get the transaction details
	let detailsres = await axios.get(process.env.PAYPAL_ORDER_API + orderID,
	    {
	    headers: {
	      Accept:        `application/json`,
	      Authorization: `Bearer ${ auth.access_token }`
	    }
	});
	let details = await detailsres.data;

	//getting the result 

	return res.json({
		status: details.status,
		value: details.purchase_units[0].amount.value,
		currency_code: details.purchase_units[0].amount.currency_code,
	});


	} catch(error){
		return res.send(error);
	}
	

})


app.listen(port,()=>{
	console.log()
})