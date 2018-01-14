from flask import Flask, json, Response, request, render_template
from pymongo import MongoClient # Database connector
from bson.objectid import ObjectId # For ObjectId to work
from pprint import pprint

client = MongoClient('localhost', 27017)    #Configure the connection to the database
db = client.flying    #Select the database
routes = db.routes #Select the collection

app = Flask(__name__)

@app.route('/')
def index():
	origenes=db.airports.distinct("country")
	destinos=db.airports.distinct("country")

	return render_template('formulario.html',origenes=origenes, destinos=destinos)

@app.route('/find', methods = ['POST'])
def find():
	if request.method == 'POST':
		origenes=db.airports.distinct("country")
		destinos=db.airports.distinct("country")

		origen = request.form["origen"]
		destino = request.form["destino"]
		stops = int(request.form["tipo"])
		print(request.form)

		sAirports = db.airports.find({"country":origen}).distinct("airportID")
		dAirports = db.airports.find({"country":destino}).distinct("airportID")

		print(sAirports)
		print(dAirports)

		rutas_airl = db.routes.find({"sAirportID": { "$in": sAirports }, "dAirportID": { "$in": dAirports }, "stops":stops}).distinct("airlineID")
		rutas = db.airlines.find({"airlineID" : {"$in": rutas_airl}})
		return render_template('formulario.html',origenes=origenes, destinos=destinos,rutas=rutas)


if __name__ == '__main__':
    app.run(debug=True, port=5000)
