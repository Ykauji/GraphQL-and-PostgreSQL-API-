// I should hide this later! PostgreSQL connection. 
const connectionString = "postgres://yohjikusakabe:potato123@localhost:5432/hairdb";
const cors = require('cors')
const initOptions = {
    // global event notification;
    error(error, e) {
        if (e.cn) {
            // A connection-related error;
            //
            // Connections are reported back with the password hashed,
            // for safe errors logging, without exposing passwords.
            console.log('CN:', e.cn);
            console.log('EVENT:', error.message || error);
        }
    }
};

const pgp = require('pg-promise')(initOptions);
const db = pgp(connectionString);

db.connect()
    .then(obj => {
    	console.log("success!")
        obj.done(); // success, release the connection;
    })
    .catch(error => {
        console.log('ERROR:', error.message || error);
    });

// Setting up express and graphQL dependencies
const express = require('express')
const expressGraphQL = require('express-graphql')
const app = express()
const {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLInt,
	GraphQLNonNull,
	QueryArguments,
} = require('graphql')

// Allow cross-origin
app.use(cors())

// Helper function to see if obj is empty.
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
// Kinda hacky? Look into sequelize if you're not lazy! Concat SQL query. 
function buildHairstyleSQLQuery(table,arguments) {
	console.log("building!");
	if (isEmpty(arguments)) {
		return "SELECT * FROM " + table;
	}

	let query = "SELECT * FROM " + table + " WHERE";
	for (var key in arguments) {
		if (arguments.hasOwnProperty) {
			query += (" " + key + "=")
			const value = (typeof(arguments[key] === "string")) ? ("'" + arguments[key] + "'") : String(arguments[key])
			query += (value + " AND")
		}
	}
	return query.substring(0,query.length-4);
}

// Salon object, add later. {1,'bob salon','picture.jpg','good salon'}
const SalonType = new GraphQLObjectType({
	name: 'salon',
	description: 'This is the salon object',
	fields: () => ({
		id: {type: GraphQLNonNull(GraphQLInt)},
		name: { type: GraphQLNonNull(GraphQLString)},
		image: { type: GraphQLNonNull(GraphQLString)},
		description: { type: GraphQLString}, 
		stylists: { 
			type: GraphQLList(StylistType),
			resolve: (parent,args) => {
				const query = `SELECT * FROM hair_stylists WHERE salon_id=${parent.id}`
				return db.any(query)
					.then(data => {
						return data;
					})
					.catch(err => {
						return 'The error is',err;
					});	
			}
		}
	})
}) 

// Stylist object with hairstyles as "ref"
const StylistType = new GraphQLObjectType({
	name: 'stylist',
	description: 'This is the hair stylist object', 
	fields: () => ({
		id: { type: GraphQLNonNull(GraphQLInt)},
		name: { type: GraphQLNonNull(GraphQLString)},
		image: { type: GraphQLNonNull(GraphQLString)},
		description: { type: GraphQLString}, 
		location: { type: GraphQLString },
		phone: { type: GraphQLString }, 
		email: { type: GraphQLString },
		hairstyles: {
			type: GraphQLList(HairType),
			// parent = currentObj, args is the graphql parameters. should return list. 
			resolve: (parent,args) => {
				const query = `SELECT * FROM hair_styles WHERE stylist_id=${parent.id}`
				return db.any(query)
					.then(data => {
						return data;
					})
					.catch(err => {
						return 'The error is',err;
					});
			}
		}
	})
})

const HairType = new GraphQLObjectType({
	name: 'hairstyles',
	description: 'This is a hairstyle!',
	fields: () => ({
		id: { type: GraphQLNonNull(GraphQLInt)},
		name: { type: GraphQLNonNull(GraphQLString)},
		image: { type: GraphQLNonNull(GraphQLString)},
		description: { type: GraphQLString}, 
		stylistId: { type: GraphQLNonNull(GraphQLInt)},
		likes: {type: GraphQLInt},
		length: {type: GraphQLString},
		gender: {type: GraphQLString}, 
		thickness: {type: GraphQLString},
		color: {type: GraphQLString},
		perm: {type: GraphQLString},
		stylist: {
			type: StylistType,
			resolve: (parentVal,args) => {
				const query = `SELECT * FROM hair_stylists WHERE id=${parentVal.stylist_id}`
				// should return one value. 
				return db.one(query)
					.then(data => {
						return data;
					})
					.catch(err => {
						return 'The error is',err;
					});
			}
		}
	})
})

// Our root query! should refactor into multiple functions. 
const RootQueryType = new GraphQLObjectType({
	// Start queries with Query { x...}
	name: 'Query',
	description: 'Root Query',
	// Each field is a nested query. Query { hairstyles..{name id ...}}
	fields: () => ({
		hairstyles: {
			type: new GraphQLList(HairType),
			description: 'Query all hairstyles, parameters={name,length,gender,thickness,color,perm}',
			args: {
				id: {type: GraphQLInt},
				name: {type: GraphQLString},
				length: {type: GraphQLString},
				gender: {type: GraphQLString}, 
				thickness: {type: GraphQLString}, 
				color: {type: GraphQLString}, 
				perm: {type: GraphQLString}, 
			},
			resolve(parent,args) {
				console.log(args)
				if (isEmpty(args)) {
					const query = `SELECT * FROM hair_styles`
					return db.any(query)
						.then(data => {
							return data;
						})
						.catch(err => {
							return 'The error is',err;
						});
				} else {
					const query = `SELECT * FROM hair_styles WHERE (IS NULL ${args.id} OR id=${args.id}) AND 
					(IS NULL ${args.name} OR name=${args.name})
					`;

					const test = buildHairstyleSQLQuery("hair_styles",args);
					console.log(test)
					return db.any(test)
						.then(data => {
							return data;
						})
						.catch(err => {
							return 'The error is',err;
						});
				}

				
			}
		},
		hairstyle: {
			type: HairType,
			description: 'Get hairstyle by Id',
			args: {
				id: {type: GraphQLInt}
				
			},
			resolve(parent, args) {
				const query = `SELECT * FROM hair_styles WHERE id=${args.id}`;
				return db.one(query)
					.then(data => {
						return data;
					})
					.catch(err => {
						return 'The error is',err;
					});
			}
		},
		stylists: {
			type: new GraphQLList(StylistType),
			description: 'List of hair stylists',
			resolve() {
				const query = `SELECT * FROM hair_stylists`
				return db.any(query)
					.then(data => {
						return data;
					})
					.catch(err => {
						return 'The error is',err;
					});
			}
		},
		stylist: {
			type: StylistType,
			description: 'Find hair stylist by Id',
			args: {
				id: {type: GraphQLInt},
			},
			resolve(parent, args) {
				const query = `SELECT * FROM hair_stylists WHERE id=${args.id}`;
				return db.one(query)
					.then(data => {
						return data;
					})
					.catch(err => {
						return 'The error is',err;
					});
			}
		},
		salons : {
			type: new GraphQLList(SalonType), 
			description: 'List of all salons',
			resolve() {
				const query = `SELECT * FROM hair_salons`
				return db.any(query)
					.then(data => {
						return data;
					})
					.catch(err => {
						return 'The error is',err;
					});
			}
		}
	})
})

// Set our schema to be our RootQuery.
const schema = new GraphQLSchema({
	query: RootQueryType,
})
// Set up express w/ our schema and graphiql which is a visual framework for graphQL.
app.use('/graphql', expressGraphQL({
	schema: schema,
	graphiql: true,
}))
app.listen(5000., () => console.log('server running!'))