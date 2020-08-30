const express = require('express')
const paypal = require('paypal-rest-sdk')
const ejs = require('ejs')
const config = require('./config')

const app = express()

const PORT = 3001

app.set('view engine', 'ejs')

app.get('/', (req, res) =>{
	res.render('index')
})
//client_id from PayPal apps, where client is business user 
paypal.configure({
	'mode' : 'sandbox',
	'client_id' : config.client_id,
	'client_secret' : config.client_secret
})

app.post('/payment', (req, res) =>{
	//creating paypal json object
	const paypal_payment = {
		"intent" : "sale",
		"payer" : {
			"payment_method" : "paypal"
		},
		"redirect_urls" : {
			"return_url" : "http://localhost:3001/success",
			"cancel_url" : "http://localhost:3001/cancel"
		},
		"transactions" : [{
			"item_list" : {
				"items" : [
				{
					"name" : "Subscription",
					"sku" : "sku01",
					"price" : "1.99",
					"currency" : "USD",
					"quantity" : "1"
				}]				
			},
			"amount": {
				"currency" : "USD",
				"total" : "1.99"
			},
			"description" : "Subscription for speciall content"
		}]
	}
paypal.payment.create(paypal_payment, (error, payment) =>{
	if(error){
		throw error;
	} else {
		console.log(payment)
		//while i less than payment links array , i+1
		for(var i = 0;i < payment.links.length; i++){
			//look for approval_url in payment object from paypal
			//if approval_url , redirect to success url
			if(payment.links[i].rel === 'approval_url'){
				res.redirect(payment.links[i].href)
			}
		}
	}
})

})

//after user post order, if no error redirect on this url
//here user put his credentials and after request , we take user and this payment id
//and send it to paypal
app.get('/success', (req, res) =>{
	const payerID = req.query.PayerID
	const paymentID = req.query.paymentId

	const execute_payment = {
		"payer_id" : payerID,
		"transactions" : [{
			"amount" : {
				"currency" : "USD",
				"total" : "1.99"
			}
		}]
	}

paypal.payment.execute(paymentID, execute_payment, (error, payment) =>{
	if(error){
		throw error;
	} else {
		res.send('success')
	}
})	
})
app.get('/cancel', (req, res) =>  res.send('Canceled'))

app.listen(PORT, console.log(`listen on port : ${PORT}`))