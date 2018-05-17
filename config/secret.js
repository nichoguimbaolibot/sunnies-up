module.exports = {
	database: "mongodb://nicho:nicho@ds223760.mlab.com:23760/sunnies",
	// database: "mongodb://localhost/ecommerce",
	port: (process.env.PORT, process.env.IP || 3000),
	secretKey: "MAYKOLMANOK"
}

// "mongodb://nicho:nicho@ds113455.mlab.com:13455/hershoppe"